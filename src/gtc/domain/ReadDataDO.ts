import {VinChnl} from "./VinChnl";
import {DiDo} from "./DiDo";

export interface ReadDataDO {
    ChannelList: Array<VinChnl>;
    DiList: Array<DiDo>;
    DoList: Array<DiDo>;
    TimeArr: number[];
}