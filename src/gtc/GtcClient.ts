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

/**
 * 提供给前端接口调用
 */
export class GtcClient {

    private static generateRequest(method: JsonRpcMethodEnum): JsonRpcRequest<any> {
        return {
            id: IdGenerator.generate(),
            method: method,
            params: {},
            timestamp: Date.now(),
            event: JsonRpcEventEnum.CALL
        };
    }

    /**
     * 客户端初始化
     */
    public static async init(url: string): Promise<boolean> {
        return GtcServiceFactory.getGtcService().init(url);
    }

    /**
     * 监听事件
     *
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     * @param fn            回调函数
     */
    public static listenEventMsg(serviceType: ServiceTypeEnum, ctrlIndex: number, fn: (result: GtcCallBackMsg) => void): void {
        PubSubUtil.subscribe(SubKeyEnum.GTC_EVENT_KEY + ":" + serviceType + ":" + ctrlIndex, fn);
    }

    /**
     * 监听数据流
     *
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     * @param fn            回调函数
     */
    public static listenDataGram(serviceType: ServiceTypeEnum, ctrlIndex: number, fn: (result: ReadDataDO) => void): void {
        PubSubUtil.subscribe(SubKeyEnum.GTC_DATA_GRAM_KEY + ":" + serviceType + ":" + ctrlIndex, fn);
    }

    /**
     * 获取mgt或者vtc的版本
     *
     * @param serviceType 服务类型
     * @return 版本号
     */
    public static async getDllVer(serviceType: ServiceTypeEnum): Promise<string> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_GET_DLL_VER);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 获取卡的数量
     *
     * @param serviceType 服务类型
     * @return 卡数量
     */
    public static async getCardNumber(serviceType: ServiceTypeEnum): Promise<number> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_GET_CARD_NUMBER);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 启动
     *
     * @param serviceType 服务类型
     * @param ctrlIndex   卡索引
     */
    public static async launch(serviceType: ServiceTypeEnum, ctrlIndex: number): Promise<null> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_LAUNCH);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 关闭
     *
     * @param serviceType 服务类型
     * @param ctrlIndex   卡索引
     */
    public static async close(serviceType: ServiceTypeEnum, ctrlIndex: number): Promise<null> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_CLOSE);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 获取产品信息
     *
     * @param serviceType 服务类型
     * @param ctrlIndex  卡索引
     * @return 产品信息，主要是为了获取序列号
     */
    public static async getProductInfo(serviceType: ServiceTypeEnum, ctrlIndex: number): Promise<ProductInfo> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_GET_PRODUCT_INFO);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 获取di列表
     *
     * @param serviceType 服务类型
     * @param ctrlIndex   卡索引
     * @return di列表
     */
    public static async getDigitalList(serviceType: ServiceTypeEnum, ctrlIndex: number): Promise<string[]> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_GET_DIGITAL_LIST);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 获取do列表
     *
     * @param serviceType 服务类型
     * @param ctrlIndex   卡索引
     * @return do列表
     */
    public static async getSwitchList(serviceType: ServiceTypeEnum, ctrlIndex: number): Promise<string[]> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_GET_SWITCH_LIST);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 设置速度
     *
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     * @param channelHandle 通道句柄
     * @param speed         速度
     */
    public static async setRefGenSlope(serviceType: ServiceTypeEnum, ctrlIndex: number, channelHandle: number, speed: number): Promise<null> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_SET_REF_GEN_SLOPE);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        request.params[JsonRpcConstant.CHANNEL_HANDLE] = channelHandle;
        request.params[JsonRpcConstant.SPEED] = speed;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 开环停
     *
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     */
    public static async stopImmediately(serviceType: ServiceTypeEnum, ctrlIndex: number): Promise<null> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_OPEN_LOOP_STOP);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 闭环停
     *
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     */
    public static async stopAdjust(serviceType: ServiceTypeEnum, ctrlIndex: number): Promise<null> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_CLOSE_LOOP_STOP);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 清空波次
     *
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     */
    public static async resetWaveCount(serviceType: ServiceTypeEnum, ctrlIndex: number): Promise<null> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_RESET_WAVE_COUNT);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 获取通道最大量程
     *
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     * @param channelHandle 通道句柄
     * @return 最大量程
     */
    public static async getMaxScale(serviceType: ServiceTypeEnum, ctrlIndex: number, channelHandle: number): Promise<number> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_GET_MAX_SCALE);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        request.params[JsonRpcConstant.CHANNEL_HANDLE] = channelHandle;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 设置通道限位
     *
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     * @param channelHandle 通道句柄
     * @param lowLimit      下限位
     * @param upLimit       上限位
     */
    public static async setProtectLimit(serviceType: ServiceTypeEnum, ctrlIndex: number, channelHandle: number, lowLimit: number, upLimit: number): Promise<null> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_SET_PROTECTED_LIMIT);
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
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     * @param channelHandle 通道句柄
     * @param value         示值
     */
    public static async clearToZero(serviceType: ServiceTypeEnum, ctrlIndex: number, channelHandle: number, value: number): Promise<null> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_CLEAR_TO_ZERO);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        request.params[JsonRpcConstant.CHANNEL_HANDLE] = channelHandle;
        request.params[JsonRpcConstant.VALUE] = value;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 设置do开关
     *
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     * @param switchCode    通道句柄
     * @param switchStatus  示值
     */
    public static async setSwitchDigitalOut(serviceType: ServiceTypeEnum, ctrlIndex: number, switchCode: string, switchStatus: number): Promise<null> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_SWITCH_DIGITAL_OUT);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        request.params[JsonRpcConstant.SWITCH_CODE] = switchCode;
        request.params[JsonRpcConstant.OPEN_STATUS] = switchStatus;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 加载ats
     *
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     * @param script        ats脚本
     * @return ats句柄
     */
    public static async atsLoad(serviceType: ServiceTypeEnum, ctrlIndex: number, script: string): Promise<number> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_ATS_LOAD);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        request.params[JsonRpcConstant.ATS_SCRIPT] = script;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 启动ats
     *
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     * @param atsHandle     ats句柄
     * @param script        ats脚本
     */
    public static async atsStart(serviceType: ServiceTypeEnum, ctrlIndex: number, atsHandle: number, script: string): Promise<null> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_ATS_START);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        request.params[JsonRpcConstant.ATS_HANDLE] = atsHandle;
        request.params[JsonRpcConstant.ATS_SCRIPT] = script;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 停止ats
     *
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     * @param atsHandle     ats句柄
     */
    public static async astTerminate(serviceType: ServiceTypeEnum, ctrlIndex: number, atsHandle: number): Promise<null> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_ATS_TERMINATE);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        request.params[JsonRpcConstant.ATS_HANDLE] = atsHandle;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * ats触发按钮
     *
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     * @param atsHandle     ats句柄
     * @param buttonCode    按钮编码
     */
    public static async atsPushButton(serviceType: ServiceTypeEnum, ctrlIndex: number, atsHandle: number, buttonCode: number): Promise<null> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_ATS_PUSH_BUTTON);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        request.params[JsonRpcConstant.ATS_HANDLE] = atsHandle;
        request.params[JsonRpcConstant.ATS_BUTTON_CODE] = buttonCode;
        return GtcServiceFactory.getGtcService().call(request);
    }

    /**
     * 设置ats参数
     *
     * @param serviceType   服务类型
     * @param ctrlIndex     卡索引
     * @param atsHandle     ats句柄
     * @param keys          参数keys
     * @param values        参数values
     */
    public static async atsSetParam(serviceType: ServiceTypeEnum, ctrlIndex: number, atsHandle: number, keys: string[], values: Array<string | number>): Promise<null> {
        const request: JsonRpcRequest<any> = GtcClient.generateRequest(JsonRpcMethodEnum.CALL_ATS_SET_PARAM);
        request.params[JsonRpcConstant.SERVICE_TYPE] = serviceType;
        request.params[JsonRpcConstant.CTRL_INDEX] = ctrlIndex;
        request.params[JsonRpcConstant.ATS_HANDLE] = atsHandle;
        request.params[JsonRpcConstant.ATS_PARAM_KEYS] = keys;
        request.params[JsonRpcConstant.ATS_PARAM_VALUES] = values.map(item => String(item));
        return GtcServiceFactory.getGtcService().call(request);
    }
}