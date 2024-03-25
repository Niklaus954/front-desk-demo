/**
 * 错误码
 */
export enum JsonRpcResponseCodeEnum {
    CALL_OK = 0,
    CALL_CANCELLED = 1,
    CALL_UNKNOWN = 2,
    CALL_INVALID_ARGUMENT = 3,
    CALL_DEADLINE_EXCEEDED = 4,
    CALL_NOT_FOUND = 5,
    CALL_ALREADY_EXISTS = 6,
    CALL_PERMISSION_DENIED = 7,
    CALL_RESOURCE_EXHAUSTED = 8,
    CALL_FAILED_PRECONDITION = 9,
    CALL_ABORTED = 10,
    CALL_OUT_OF_RANGE = 11,
    CALL_UNIMPLEMENTED = 12,
    CALL_INTERNAL = 13,
    CALL_UNAVAILABLE = 14,
    CALL_DATA_LOSS = 15,
    CALL_UNAUTHENTICATED = 16,
}