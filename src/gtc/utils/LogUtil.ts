import {GtcCallBackMsg} from "../domain/GtcCallBackMsg";
import {PubSubUtil} from "./PubSubUtil";
import {SubKeyEnum} from "./enums/SubKeyEnum";

export class LogUtil {
    public static readonly LOG_SOURCE: Array<GtcCallBackMsg> = [];

    public static receive(instId: string | null, ctrlIndex: number, msg: GtcCallBackMsg): void {
        LogUtil.LOG_SOURCE.push(msg);
        // 订阅一些重要消息，统一发布
        console.log(msg);
        console.log(ctrlIndex + "<<>>" + msg.msgId.toString(16));
        if (msg.msgId === 0x2000) {
            PubSubUtil.publish(SubKeyEnum.LAUNCH_OK, { instId, ctrlIndex });
        } else if (msg.msgId >= 0x0620 && msg.msgId < 0x0630) {
            // ats加载成功
            console.log('ats加载成功');
            PubSubUtil.publish(SubKeyEnum.ATS_LOAD_OK, { instId, ctrlIndex });
        } else if (msg.msgId >= 0x0650 && msg.msgId < 0x0660) {
            // ats启动成功
            console.log('ats启动成功');
            PubSubUtil.publish(SubKeyEnum.ATS_START_OK, { instId, ctrlIndex });
        } else if (msg.msgId >= 0x0700 && msg.msgId < 0x0800) {
            // ats跳转到指定步骤
            console.log('ats跳转到指定步骤');
            PubSubUtil.publish(SubKeyEnum.ATS_JUMP_ACTION, { instId, ctrlIndex });
        } else if (msg.msgId >= 0x0800 && msg.msgId < 0x0900) {
            // ats异常停止
            console.log('ats异常停止');
            PubSubUtil.publish(SubKeyEnum.ATS_TERMINATE_ABNORMAL, { instId, ctrlIndex });
        } else if (msg.msgId >= 0x0900 && msg.msgId < 0x0910) {
            // ats正常停止
            console.log('ats正常停止');
            PubSubUtil.publish(SubKeyEnum.ATS_TERMINATE, { instId, ctrlIndex });
        }
    }
}