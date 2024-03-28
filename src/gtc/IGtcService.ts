import './lib/socketio';
import {JsonRpcRequest} from "./domain/JsonRpcRequest";
import {JsonRpcResponse} from "./domain/JsonRpcResponse";
import {NodeInfo} from "./domain/NodeInfo";

/**
 * 远程gtc服务接口
 */
interface IGtcService {
    init(url: string): Promise<boolean>;

    call(request: JsonRpcRequest<any>): Promise<any>;

    reply(response: JsonRpcResponse<any, any>);

    event(response: JsonRpcResponse<any, any>);

    dataGram(response: JsonRpcResponse<any, any>);

    fetchNodeInfo(): Promise<Array<NodeInfo>>;
}

export default IGtcService;