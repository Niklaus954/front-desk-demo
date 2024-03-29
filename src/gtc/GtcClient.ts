import GtcServiceFactory from "./GtcServiceFactory";
import {JsonRpcRequest} from "./domain/JsonRpcRequest";
import {JsonRpcMethodEnum} from "./domain/enums/JsonRpcMethodEnum";
import {JsonRpcEventEnum} from "./domain/enums/JsonRpcEventEnum";
import {ServiceTypeEnum} from "./domain/enums/ServiceTypeEnum";
import {JsonRpcConstant} from "./domain/JsonRpcConstant";
import {IdGenerator} from "./utils/IdGenerator";
import {ProductInfo} from "./domain/ProductInfo";
import {GtcCallBackMsg} from "./domain/GtcCallBackMsg";
import {PubSubUtil} from "./utils/PubSubUtil";
import {SubKeyEnum} from "./utils/enums/SubKeyEnum";
import {ReadDataDO} from "./domain/ReadDataDO";
import {NodeInfo} from "./domain/NodeInfo";
import {VinChnl} from "./domain/VinChnl";
import {OutMsg} from "./domain/OutMsg";

/**
 * 提供给前端接口调用
 */
export class GtcClient {

    private static generateRequest(method: JsonRpcMethodEnum, slaveInstId: string | null): JsonRpcRequest<any> {
        return {
            id: IdGenerator.generate(),
            method: method,
            params: {},
            timestamp: Date.now(),
            event: JsonRpcEventEnum.CALL,
            slaveInstId,
        };
    }

    /**
     * 客户端初始化
     */
    public static async init(url: string): Promise<boolean> {
        return GtcServiceFactory.getGtcService().init(url);
    }

    /**
     * 监听节点状态
     *
     * @param fn    回调函数
     */
    public static listenNodeInfo(fn: (result: Array<NodeInfo>) => void): void {
        PubSubUtil.subscribe(SubKeyEnum.NODE_INFO_LIST_KEY, fn);
    }

    /**
     * 获取节点信息
     */
    public static fetchNodeInfo(): Promise<Array<NodeInfo>> {
        return GtcServiceFactory.getGtcService().fetchNodeInfo();
    }

    /**
     * 监听事件
     *
     * @param slaveInstId 从机id
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     * @param fn            回调函数
     */
    public static listenEventMsg(slaveInstId: string | null, serviceType: ServiceTypeEnum, ctrlIndex: number, fn: (result: GtcCallBackMsg) => void): void {
        PubSubUtil.subscribe(slaveInstId + ":" + SubKeyEnum.GTC_EVENT_KEY + ":" + serviceType + ":" + ctrlIndex, fn);
    }

    /**
     * 监听数据流
     *
     * @param slaveInstId 从机id
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     * @param fn            回调函数
     */
    public static listenDataGram(slaveInstId: string | null, serviceType: ServiceTypeEnum, ctrlIndex: number, fn: (result: OutMsg<ReadDataDO>) => void): void {
        PubSubUtil.subscribe(slaveInstId + ":" + SubKeyEnum.GTC_DATA_GRAM_KEY + ":" + serviceType + ":" + ctrlIndex, fn);
    }

    /**
     * 获取mgt或者vtc的版本
     *
     * @param slaveInstId 从机id
     * @param serviceType 服务类型
     * @return 版本号
     */
    public static async getDllVer(slaveInstId: string | null, serviceType: ServiceTypeEnum): Promise<string> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_GET_DLL_VER, slaveInstId);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 获取卡的数量
     *
     * @param slaveInstId 从机id
     * @param serviceType 服务类型
     * @return 卡数量
     */
    public static async getCardNumber(slaveInstId: string | null, serviceType: ServiceTypeEnum): Promise<number> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_GET_CARD_NUMBER, slaveInstId);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 启动
     *
     * @param slaveInstId 从机id
     * @param serviceType 服务类型
     * @param ctrlIndex   卡索引
     */
    public static async launch(slaveInstId: string | null, serviceType: ServiceTypeEnum, ctrlIndex: number): Promise<boolean> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_LAUNCH, slaveInstId);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 关闭
     *
     * @param slaveInstId 从机id
     * @param serviceType 服务类型
     * @param ctrlIndex   卡索引
     */
    public static async close(slaveInstId: string | null, serviceType: ServiceTypeEnum, ctrlIndex: number): Promise<null> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_CLOSE, slaveInstId);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 获取产品信息
     *
     * @param slaveInstId 从机id
     * @param serviceType 服务类型
     * @param ctrlIndex  卡索引
     * @return 产品信息，主要是为了获取序列号
     */
    public static async getProductInfo(slaveInstId: string | null, serviceType: ServiceTypeEnum, ctrlIndex: number): Promise<ProductInfo> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_GET_PRODUCT_INFO, slaveInstId);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 获取di列表
     *
     * @param slaveInstId 从机id
     * @param serviceType 服务类型
     * @param ctrlIndex   卡索引
     * @return di列表
     */
    public static async getDigitalList(slaveInstId: string | null, serviceType: ServiceTypeEnum, ctrlIndex: number): Promise<string[]> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_GET_DIGITAL_LIST, slaveInstId);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 获取do列表
     *
     * @param slaveInstId 从机id
     * @param serviceType 服务类型
     * @param ctrlIndex   卡索引
     * @return do列表
     */
    public static async getSwitchList(slaveInstId: string | null, serviceType: ServiceTypeEnum, ctrlIndex: number): Promise<string[]> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_GET_SWITCH_LIST, slaveInstId);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 获取通道列表
     *
     * @param slaveInstId   从机id
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     */
    public static async getVinChannels(slaveInstId: string | null, serviceType: ServiceTypeEnum, ctrlIndex: number): Promise<Array<VinChnl>> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_GET_VIN_CHNLS, slaveInstId);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 设置速度
     *
     * @param slaveInstId   从机id
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     * @param channelHandle 通道句柄
     * @param speed         速度
     */
    public static async setRefGenSlope(slaveInstId: string | null, serviceType: ServiceTypeEnum, ctrlIndex: number, channelHandle: number, speed: number): Promise<null> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_SET_REF_GEN_SLOPE, slaveInstId);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        request.params[JsonRpcConstant.CHANNEL_HANDLE] = channelHandle;
        request.params[JsonRpcConstant.SPEED] = speed;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 开环停
     *
     * @param slaveInstId   从机id
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     */
    public static async stopImmediately(slaveInstId: string | null, serviceType: ServiceTypeEnum, ctrlIndex: number): Promise<null> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_OPEN_LOOP_STOP, slaveInstId);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 闭环停
     *
     * @param slaveInstId   从机id
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     */
    public static async stopAdjust(slaveInstId: string | null, serviceType: ServiceTypeEnum, ctrlIndex: number): Promise<null> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_CLOSE_LOOP_STOP, slaveInstId);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 清空波次
     *
     * @param slaveInstId   从机id
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     */
    public static async resetWaveCount(slaveInstId: string | null, serviceType: ServiceTypeEnum, ctrlIndex: number): Promise<null> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_RESET_WAVE_COUNT, slaveInstId);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 获取通道最大量程
     *
     * @param slaveInstId   从机id
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     * @param channelHandle 通道句柄
     * @return 最大量程
     */
    public static async getMaxScale(slaveInstId: string | null, serviceType: ServiceTypeEnum, ctrlIndex: number, channelHandle: number): Promise<number> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_GET_MAX_SCALE, slaveInstId);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        request.params[JsonRpcConstant.CHANNEL_HANDLE] = channelHandle;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 设置通道限位
     *
     * @param slaveInstId   从机id
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     * @param channelHandle 通道句柄
     * @param lowLimit      下限位
     * @param upLimit       上限位
     */
    public static async setProtectLimit(slaveInstId: string | null, serviceType: ServiceTypeEnum, ctrlIndex: number, channelHandle: number, lowLimit: number, upLimit: number): Promise<null> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_SET_PROTECTED_LIMIT, slaveInstId);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        request.params[JsonRpcConstant.CHANNEL_HANDLE] = channelHandle;
        request.params[JsonRpcConstant.LOW_LIMIT] = lowLimit;
        request.params[JsonRpcConstant.UP_LIMIT] = upLimit;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 通道示值清零
     *
     * @param slaveInstId   从机id
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     * @param channelHandle 通道句柄
     * @param value         示值
     */
    public static async clearToZero(slaveInstId: string | null, serviceType: ServiceTypeEnum, ctrlIndex: number, channelHandle: number, value: number): Promise<null> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_CLEAR_TO_ZERO, slaveInstId);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        request.params[JsonRpcConstant.CHANNEL_HANDLE] = channelHandle;
        request.params[JsonRpcConstant.VALUE] = value;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 设置do开关
     *
     * @param slaveInstId   从机id
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     * @param switchCode    通道句柄
     * @param switchStatus  示值
     */
    public static async setSwitchDigitalOut(slaveInstId: string | null, serviceType: ServiceTypeEnum, ctrlIndex: number, switchCode: string, switchStatus: number): Promise<null> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_SWITCH_DIGITAL_OUT, slaveInstId);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        request.params[JsonRpcConstant.SWITCH_CODE] = switchCode;
        request.params[JsonRpcConstant.OPEN_STATUS] = switchStatus;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 加载ats
     *
     * @param slaveInstId   从机id
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     * @param script        ats脚本
     * @return ats句柄
     */
    public static async atsLoad(slaveInstId: string | null, serviceType: ServiceTypeEnum, ctrlIndex: number, script: string): Promise<number> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_ATS_LOAD, slaveInstId);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        request.params[JsonRpcConstant.ATS_SCRIPT] = script;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 启动ats
     *
     * @param slaveInstId   从机id
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     * @param atsHandle     ats句柄
     * @param script        ats脚本
     */
    public static async atsStart(slaveInstId: string | null, serviceType: ServiceTypeEnum, ctrlIndex: number, atsHandle: number, script: string): Promise<null> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_ATS_START, slaveInstId);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        request.params[JsonRpcConstant.ATS_HANDLE] = atsHandle;
        request.params[JsonRpcConstant.ATS_SCRIPT] = script;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 停止ats
     *
     * @param slaveInstId   从机id
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     * @param atsHandle     ats句柄
     */
    public static async astTerminate(slaveInstId: string | null, serviceType: ServiceTypeEnum, ctrlIndex: number, atsHandle: number): Promise<null> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_ATS_TERMINATE, slaveInstId);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        request.params[JsonRpcConstant.ATS_HANDLE] = atsHandle;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * ats触发按钮
     *
     * @param slaveInstId   从机id
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     * @param atsHandle     ats句柄
     * @param buttonCode    按钮编码
     */
    public static async atsPushButton(slaveInstId: string | null, serviceType: ServiceTypeEnum, ctrlIndex: number, atsHandle: number, buttonCode: string): Promise<null> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_ATS_PUSH_BUTTON, slaveInstId);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        request.params[JsonRpcConstant.ATS_HANDLE] = atsHandle;
        request.params[JsonRpcConstant.ATS_BUTTON_CODE] = buttonCode;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 设置ats参数
     *
     * @param slaveInstId   从机id
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     * @param atsHandle     ats句柄
     * @param keys          参数keys
     * @param values        参数values
     */
    public static async atsSetParam(slaveInstId: string | null, serviceType: ServiceTypeEnum, ctrlIndex: number, atsHandle: number, keys: string[], values: Array<string | number>): Promise<null> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_ATS_SET_PARAM, slaveInstId);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        request.params[JsonRpcConstant.ATS_HANDLE] = atsHandle;
        request.params[JsonRpcConstant.ATS_PARAM_KEYS] = keys;
        request.params[JsonRpcConstant.ATS_PARAM_VALUES] = values.map(item => String(item));
        return GtcServiceFactory.getGtcService().call(request);
    }
}