import {MsgEventTypeEnum} from "./enums/MsgEventTypeEnum";
import {ServiceTypeEnum} from "./enums/ServiceTypeEnum";

export interface OutMsg<T> {
    serviceType: ServiceTypeEnum;
    ctrlIndex: number;
    // 用于多轴对齐
    batchId: string;
    msgEventType: MsgEventTypeEnum;
    data: T;
}