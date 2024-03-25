import {MsgSourceEnum} from "./enums/MsgSourceEnum";
import {RunStateEnum} from "./enums/RunStateEnum";

export interface GtcCallBackMsg {
    hSrc: number;
    msgId: number;
    ms: number;
    msg: string;
    source: MsgSourceEnum;
    runState: RunStateEnum;
}