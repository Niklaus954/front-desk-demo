import {JsonRpcMethodEnum} from "./enums/JsonRpcMethodEnum";
import {JsonRpcEventEnum} from "./enums/JsonRpcEventEnum";
import {JsonRpcError} from "./JsonRpcError";

/**
 * 响应对象
 */
export interface JsonRpcResponse<T, E> {
    id: string;
    method: JsonRpcMethodEnum;
    result: T;
    error: JsonRpcError<E>,
    timestamp: number;
    event: JsonRpcEventEnum;
    slaveInstId: string;
}