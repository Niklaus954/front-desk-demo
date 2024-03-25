import {SubKeyEnum} from "./enums/SubKeyEnum";

export class PubSubUtil {

    private static readonly SUB_MAP = {};

    public static subscribe<T>(key: SubKeyEnum | string, fn: (result: T) => void): void {
        if (!PubSubUtil.SUB_MAP.hasOwnProperty(key)) {
            PubSubUtil.SUB_MAP[key] = [];
        }
        PubSubUtil.SUB_MAP[key].push(fn);
    }

    public static publish<T>(key: SubKeyEnum | string, result: T) {
        if (!PubSubUtil.SUB_MAP.hasOwnProperty(key)) {
            return;
        }
        PubSubUtil.SUB_MAP[key].forEach(fn => fn(result));
    }
}