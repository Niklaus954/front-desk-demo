import {JsonRpcMethodEnum} from "./enums/JsonRpcMethodEnum";
import {JsonRpcEventEnum} from "./enums/JsonRpcEventEnum";

/**
 * 请求对象
 */
export interface JsonRpcRequest<T> {
    id: string;
    method: JsonRpcMethodEnum;
    params: T;
    timestamp: number;
    event: JsonRpcEventEnum;
    slaveInstId: string | null;
}