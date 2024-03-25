export enum MsgEventTypeEnum {
    ReadData = 1,   // 读数据
    NotifyMsg = 2,  // 其他通知消息
    GtMsg = 3,      // mgt驱动发出的消息
    StateChanged = 4,
    FreshWatchParam = 5 //可以刷新WatchParam
}