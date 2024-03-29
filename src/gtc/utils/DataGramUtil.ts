import {ReadDataDO} from "../domain/ReadDataDO";
import {OutMsg} from "../domain/OutMsg";
import {PubSubUtil} from "./PubSubUtil";
import {SubKeyEnum} from "./enums/SubKeyEnum";

export class DataGramUtil {

    // instId: cardNum
    private static instAxiosSizeMap = {};

    // instId-batchId: [每个轴的数据]
    private static instDataMap = {};

    public static initSize(instId: string | null, cardNum: number): void {
        DataGramUtil.instAxiosSizeMap[instId] = cardNum;
    }

    public static receive(instId: string | null, result: OutMsg<ReadDataDO>): void {
        const batchKey = instId + '-' + result.batchId;
        if (!DataGramUtil.instDataMap[batchKey]) {
            DataGramUtil.instDataMap[batchKey] = [];
        }
        DataGramUtil.instDataMap[batchKey].push(result);
        if (DataGramUtil.instDataMap[batchKey].length === DataGramUtil.instAxiosSizeMap[instId]) {
            // 单机多轴数据收集完毕
            // 发布
            const channelListMap = {};
            const timeSnapshotMap = {};
            for (let i = 0; i < DataGramUtil.instDataMap[batchKey].length; i++) {
                const item = DataGramUtil.instDataMap[batchKey][i];
                const key = instId + '-' + item.ctrlIndex;
                channelListMap[key] = item.data.ChannelList;
                timeSnapshotMap[key] = item.data.TimeArr;
            }
            PubSubUtil.publish(SubKeyEnum.NEW_DATA_REFRESH, {
                channelListMap,
                timeSnapshotMap,
            });
            // 清空
            delete DataGramUtil.instDataMap[batchKey];
        }
    }
}