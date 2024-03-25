import {JsonRpcResponseCodeEnum} from "./enums/JsonRpcResponseCodeEnum";

export interface JsonRpcError<E> {
    code: JsonRpcResponseCodeEnum;
    message: string;
    data: E;
}