import IGtcService from "./IGtcService";
import {JsonRpcRequest} from "./domain/JsonRpcRequest";
import {JsonRpcEventEnum} from "./domain/enums/JsonRpcEventEnum";
import {JsonRpcResponse} from "./domain/JsonRpcResponse";
import {ConnectStatusEnum} from "./domain/enums/ConnectStatusEnum";
import {JsonRpcMethodEnum} from "./domain/enums/JsonRpcMethodEnum";
import {OutMsg} from "./domain/OutMsg";
import {GtcCallBackMsg} from "./domain/GtcCallBackMsg";
import {ReadDataDO} from "./domain/ReadDataDO";
import {PubSubUtil} from "./utils/PubSubUtil";
import {SubKeyEnum} from "./utils/enums/SubKeyEnum";

/**
 * 远程gtc服务socketIO实现
 */
class GtcServiceSocketIOImpl implements IGtcService {
    private socket;
    private connectStatus: ConnectStatusEnum = ConnectStatusEnum.DISCONNECT;

    private callbackMap = {};

    init(url: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            setTimeout(() => reject("服务器连接失败"), 5000);
            this.socket = io(url + '?clientId=operator'); // 设置服务器地址
            this.socket.on('connect', () => {
                this.connectStatus = ConnectStatusEnum.CONNECTED;
                console.log('socket链接成功！' + this.socket.id);
                resolve(true);
            });
            this.socket.on('disconnect', () => {
                this.connectStatus = ConnectStatusEnum.DISCONNECT;
                console.log('socket断线了！' + this.socket.id);
            });
            this.socket.on(JsonRpcEventEnum.REPLY, response => {
                this.reply(response);
            });
            this.socket.on(JsonRpcEventEnum.EVENT, response => {
                this.event(response);
            });
            this.socket.on(JsonRpcEventEnum.DATAGRAM, response => {
                this.dataGram(response);
            });
        });
    }

    call(request: JsonRpcRequest<any>): Promise<any> {
        const replyMethod = String(request.method).replace(JsonRpcEventEnum.CALL, JsonRpcEventEnum.REPLY);
        const id = request.id;
        let resolve, reject;
        const promise = new Promise((_resolve, _reject) => {
            resolve = _resolve;
            reject = _reject;
        });
        for (const replyMethodElement in JsonRpcMethodEnum) {
            if (JsonRpcMethodEnum[replyMethodElement] == replyMethod) {
                this.callbackMap[replyMethod + "::" + id] = [resolve, reject];
            }
        }
        // 往服务器发起请求
        this.socket.emit(JsonRpcEventEnum.CALL, request);

        return promise;
    }

    reply(response: JsonRpcResponse<any, any>) {
        // 收到服务器响应，做出对应页面响应
        const id = response.id;
        const method = response.method;
        const promise = this.callbackMap[method + "::" + id];
        if (promise) {
            if (response.error && !response.result) {
                promise[1](response.error);
            } else {
                promise[0](response.result);
            }
            delete this.callbackMap[method + "::" + id];
        }
    }

    event(response: JsonRpcResponse<OutMsg<GtcCallBackMsg>, any>) {
        // 处理事件
        PubSubUtil.publish(SubKeyEnum.GTC_EVENT_KEY + ":" + response.result.serviceType + ":" + response.result.ctrlIndex, response.result.data);
    }

    dataGram(response: JsonRpcResponse<OutMsg<ReadDataDO>, any>) {
        // 处理数据流
        PubSubUtil.publish(SubKeyEnum.GTC_DATA_GRAM_KEY + ":" + response.result.serviceType + ":" + response.result.ctrlIndex, response.result.data);
    }
}

export default GtcServiceSocketIOImpl;