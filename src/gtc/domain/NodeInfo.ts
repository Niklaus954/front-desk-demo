import {ConnectStatusEnum} from "./enums/ConnectStatusEnum";

export interface NodeInfo {

    /**
     * 节点状态
     */
    nodeStatus: ConnectStatusEnum;

    /**
     * 节点id
     */
    instId: string | null;
}