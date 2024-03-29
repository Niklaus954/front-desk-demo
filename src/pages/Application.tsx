import React from 'react';
import {GtcClient} from "../gtc/GtcClient";
import {ServiceTypeEnum} from "../gtc/domain/enums/ServiceTypeEnum";
import {Spin} from "antd";
import {IonContent} from "@ionic/react";
import {ConnectStatusEnum} from "../gtc/domain/enums/ConnectStatusEnum";
import {LogUtil} from "../gtc/utils/LogUtil";
import {PubSubUtil} from "../gtc/utils/PubSubUtil";
import {SubKeyEnum} from "../gtc/utils/enums/SubKeyEnum";
import {ProductInfo} from "../gtc/domain/ProductInfo";
import {VinChnl} from "../gtc/domain/VinChnl";
import {TaskSynchronizer} from "../gtc/utils/TaskSynchronizer";
import {NodeInfo} from "../gtc/domain/NodeInfo";
import {DataGramUtil} from "../gtc/utils/DataGramUtil";

class Application extends React.Component {

    private serverUrl: string = 'http://localhost:9001';

    private nodeInfoList: NodeInfo[];

    // instId-ctrlIndex: deviceName
    private deviceNameMap = {};

    // instId-ctrlIndex: channelList
    private channelListMap = {};

    // instId-ctrlIndex: atsHandle
    private atsHandleMap = {};

    private async discoverLaunchAll() {
        // 获取已连接的节点信息
        this.nodeInfoList = await GtcClient.fetchNodeInfo();
        const taskSynchronizer: TaskSynchronizer = new TaskSynchronizer();
        for (const node of this.nodeInfoList.filter(node => node.nodeStatus == ConnectStatusEnum.CONNECTED)) {
            // 遍历节点，获取卡的数量
            const cardNum = await GtcClient.getCardNumber(node.instId, ServiceTypeEnum.MGT);
            DataGramUtil.initSize(node.instId, cardNum);
            for (let i = 0; i < cardNum; i++) {
                // 挨个启动控制器
                GtcClient.listenEventMsg(node.instId, ServiceTypeEnum.MGT, i, result => LogUtil.receive(node.instId, i, result));
                GtcClient.launch(node.instId, ServiceTypeEnum.MGT, i);
                taskSynchronizer.addTaskKey(node.instId + '-' + i);
            }
        }
        // 控制器启动成功回调
        PubSubUtil.subscribe(SubKeyEnum.LAUNCH_OK, async eventMsg => {
            // 获取控制器产品信息
            const productInfo: ProductInfo = await GtcClient.getProductInfo(eventMsg.instId, ServiceTypeEnum.MGT, eventMsg.ctrlIndex);
            const key = eventMsg.instId + '-' + eventMsg.ctrlIndex;
            this.deviceNameMap[key] = productInfo.device;
            // 初始化通道信息
            this.channelListMap[key] = await GtcClient.getVinChannels(eventMsg.instId, ServiceTypeEnum.MGT, eventMsg.ctrlIndex);
            // 监听通道实时数据
            GtcClient.listenDataGram(eventMsg.instId, ServiceTypeEnum.MGT, eventMsg.ctrlIndex, result => DataGramUtil.receive(eventMsg.instId, result));
            taskSynchronizer.finishTaskKey(key);
        });
        await taskSynchronizer.waitAll();
        console.log("Application初始化完成，可以开始做试验了");
    }

    private async loadAts() {
        const atsLoadSynchronizer: TaskSynchronizer = new TaskSynchronizer();
        const atsStartSynchronizer: TaskSynchronizer = new TaskSynchronizer();
        PubSubUtil.subscribe(SubKeyEnum.ATS_LOAD_OK, async eventMsg => {
            atsLoadSynchronizer.finishTaskKey(eventMsg.instId + '-0');
        });
        PubSubUtil.subscribe(SubKeyEnum.ATS_START_OK, async eventMsg => {
            atsStartSynchronizer.finishTaskKey(eventMsg.instId + '-0');
        });
        const atsScript = '{"class":"Ats","title":"","start":"","developer":"","release":"2022/10/18 11:37:39","remarks":[],"parameters":{"_out":6,"_isUp":true,"_speed":1,"_target":5},"tags":{"ƣ��":""},"axes":[{"class":"Axis","controller":"My Tc901","triggers":[{"class":"Trigger.OnButton","goto":"go","name":"go","key":100},{"class":"Trigger.OnButton","goto":"sin","name":"sin","key":101}],"actions":[{"class":"StopAction","tag":"halt","triggers":[],"switching":[],"capture":{},"level":3},{"class":"ClosedAction.ClosedRefGenAction","tag":"go","triggers":[],"switching":[],"capture":{},"feedVin":"Tension","cycleNum":0,"startSync":false,"syncDelay":0,"syncNumber":1,"sequence":[{"class":"RefGen.SlopeTo","speed":"=_speed","target":"=_target"}],"connectDriving":0,"driP":10,"drivingController":""},{"class":"ClosedAction.ClosedRefGenAction","tag":"sin","triggers":[],"switching":[],"capture":{},"feedVin":"Tension","cycleNum":0,"startSync":true,"syncDelay":0,"syncNumber":2,"sequence":[{"class":"RefGen.Wave.Sin","freq":5,"num":1000000,"amp":5},{"class":"RefGen.SlopeTo","speed":1,"target":0}],"connectDriving":0,"driP":10,"drivingController":""},{"class":"StopAction","tag":"stop","triggers":[],"switching":[],"level":5,"capture":{}}]},{"class":"Axis","controller":"My Tc900","triggers":[],"actions":[{"class":"StopAction","tag":"halt","triggers":[],"switching":[],"capture":{},"level":3},{"class":"ClosedAction.ClosedRefGenAction","tag":"go","triggers":[],"switching":[],"capture":{},"feedVin":"Tension","cycleNum":0,"startSync":false,"syncDelay":0,"syncNumber":1,"connectDriving":0,"driP":10,"drivingController":"","sequence":[{"class":"RefGen.SlopeTo","speed":"=_speed","target":"=_target"}]},{"class":"ClosedAction.ClosedRefGenAction","tag":"sin","triggers":[],"switching":[],"capture":{},"feedVin":"Tension","cycleNum":0,"startSync":true,"syncDelay":0,"syncNumber":2,"connectDriving":0,"driP":10,"drivingController":"","sequence":[{"class":"RefGen.Wave.Sin","freq":10,"num":1000000,"amp":10},{"class":"RefGen.SlopeTo","speed":1,"target":0}]},{"class":"StopAction","tag":"stop","triggers":[],"switching":[],"capture":{},"level":5}]}]}';
        for (const nodeInfo of this.nodeInfoList) {
            GtcClient.atsLoad(nodeInfo.instId, ServiceTypeEnum.MGT, 0, atsScript).then(atsHandle => {
                this.atsHandleMap[nodeInfo.instId + '-0'] = atsHandle;
            });
            atsLoadSynchronizer.addTaskKey(nodeInfo.instId + '-0');
            atsStartSynchronizer.addTaskKey(nodeInfo.instId + '-0');
        }
        // 等待所有从机的ats都加载完成
        await atsLoadSynchronizer.waitAll();
        // 启动ats脚本
        for (const nodeInfo of this.nodeInfoList) {
            GtcClient.atsStart(nodeInfo.instId, ServiceTypeEnum.MGT, 0, this.atsHandleMap[nodeInfo.instId + '-0'], atsScript);
        }
        // 等待所有ats脚本都启动完成
        await atsStartSynchronizer.waitAll();
        for (const nodeInfo of this.nodeInfoList) {
            GtcClient.atsPushButton(nodeInfo.instId, ServiceTypeEnum.MGT, 0, this.atsHandleMap[nodeInfo.instId + '-0'], "go");
        }
    }

    async componentWillMount() {
        try {
            await GtcClient.init(this.serverUrl);
        } catch (e) {
            // 连接服务器失败
            console.log(e);
            return;
        }
        // 服务发现并启动
        await this.discoverLaunchAll();
        // 订阅ATS动作跳转事件
        PubSubUtil.subscribe(SubKeyEnum.ATS_JUMP_ACTION, async eventMsg => {

        });
        // 订阅ATS停止事件
        PubSubUtil.subscribe(SubKeyEnum.ATS_TERMINATE, async eventMsg => {
            alert(eventMsg.instId + "试验结束");
        });
        // 订阅新数据流
        PubSubUtil.subscribe(SubKeyEnum.NEW_DATA_REFRESH, async data => {
            console.log(data.channelListMap[null + '-0'][0].LastVal + "<<>>" + data.channelListMap[null + '-0'][1].LastVal + "<<>>" + data.channelListMap[null + '-0'][2].LastVal);
        });
        await this.loadAts();
    }

    render() {
        return (
            <div></div>
            // <IonContent fullscreen={true}>
            //     <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
            //         <Spin tip={'联机中...'}>
            //
            //         </Spin>
            //     </div>
            // </IonContent>
        )
    }
}

export default Application;