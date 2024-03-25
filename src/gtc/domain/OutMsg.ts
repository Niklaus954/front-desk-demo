import {MsgEventTypeEnum} from "./enums/MsgEventTypeEnum";
import {ServiceTypeEnum} from "./enums/ServiceTypeEnum";

export interface OutMsg<T> {
    serviceType: ServiceTypeEnum;
    ctrlIndex: number;
    msgEventType: MsgEventTypeEnum;
    data: T;
}