import React, {useEffect, useState} from 'react';
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
import {AxisScrollStrategies, emptyFill, lightningChart, Themes} from "@arction/lcjs";
import ExampleContainer from "./LightningChartTestDemo";
import RemoteControl from "../components/RemoteControl";

class Application extends React.Component {

    private serverUrl: string = 'http://localhost:9001';

    private nodeInfoList: NodeInfo[];

    // instId-ctrlIndex: deviceName
    private deviceNameMap = {};

    // instId-ctrlIndex: channelList
    private channelListMap = {};

    // instId-ctrlIndex: atsHandle
    private atsHandleMap = {};
    constructor(props) {
        super(props);
        this.state = { channelListR: [],channelScreen:{} };
        this.setChannelListR = this.setChannelListR.bind(this);
        this.setChannelScreen = this.setChannelScreen.bind(this);
    }
    setChannelListR(vaule){
        this.setState({channelListR:vaule})
    }
    setChannelScreen(vaule){
        this.setState({channelScreen:vaule})
    }
    // private channelListR:Array<any> = []
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
                // 监听通道实时数据
                GtcClient.listenDataGram(node.instId, ServiceTypeEnum.MGT, i, result => DataGramUtil.receive(node.instId, result));
                GtcClient.launch(node.instId, ServiceTypeEnum.MGT, i).then(async alreadyStart =>{
                    console.log(alreadyStart)
                    if (alreadyStart) {
                        // 获取控制器产品信息
                        const productInfo: ProductInfo = await GtcClient.getProductInfo(node.instId, ServiceTypeEnum.MGT, i);
                        const key = node.instId + '-' + i;
                        this.deviceNameMap[key] = productInfo.device;
                        // 初始化通道信息
                        this.channelListMap[key] = await GtcClient.getVinChannels(node.instId, ServiceTypeEnum.MGT, i);
                        taskSynchronizer.finishTaskKey(key);
                    }
                });
                taskSynchronizer.addTaskKey(node.instId + '-' + i);
            }
        }
        // 控制器启动成功回调
        PubSubUtil.subscribe(SubKeyEnum.LAUNCH_OK, async eventMsg => {
            console.log(eventMsg)
            // 获取控制器产品信息
            const productInfo: ProductInfo = await GtcClient.getProductInfo(eventMsg.instId, ServiceTypeEnum.MGT, eventMsg.ctrlIndex);
            const key = eventMsg.instId + '-' + eventMsg.ctrlIndex;
            this.deviceNameMap[key] = productInfo.device;
            // 初始化通道信息
            this.channelListMap[key] = await GtcClient.getVinChannels(eventMsg.instId, ServiceTypeEnum.MGT, eventMsg.ctrlIndex);
            taskSynchronizer.finishTaskKey(key);
        });
        await taskSynchronizer.waitAll();
        // this.channelListR = [];
        this.setChannelListR([])
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
        // const atsScript = '{"class":"Ats","title":"","start":"","developer":"","release":"2024/3/14 16:30:55","remarks":[],"parameters":{"_upT":10.0,"_downT":0.0,"_Fre":1,"_nT":4294967295,"maxLoad":10,"minLoad":0,"frequency":10,"cycleCount":1000000},"tags":{},"axes":[{"class":"Axis","controller":"My Tc901","triggers":[{"class":"Trigger.OnButton","goto":"pause","name":"pauseBtn"},{"class":"Trigger.OnButton","goto":"sin","name":"continueBtn"}],"actions":[{"class":"ClosedAction.ClosedRefGenAction","tag":"sin","triggers":[{"class":"Trigger.Jump","goto":"stop"}],"switching":[],"capture":{},"feedVin":"Tension","cycleNum":0,"startSync":false,"syncDelay":0.0,"syncNumber":1,"sequence":[{"class":"RefGen.SlopeTo","speed":"=(_upT-_downT)/20","target":"=(_upT+_downT)/2"},{"class":"RefGen.Wait","time":5.0},{"class":"RefGen.Wave.Sin","freq":"=_Fre","amp":"=(_upT-_downT)/2","num":"=_nT"}]},{"class":"ClosedAction.ClosedRefGenAction","tag":"pause","triggers":[],"switching":[],"capture":{},"feedVin":"Tension","cycleNum":0,"startSync":false,"syncDelay":0.0,"syncNumber":1,"sequence":[{"class":"RefGen.SlopeTo","speed":"=(_upT-_downT)/20","target":"=(_upT+_downT)/2"},{"class":"RefGen.Hold"}]},{"class":"StopAction","tag":"stop","triggers":[],"switching":[],"capture":{},"level":5}]}]}';
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
            // alert(eventMsg.instId + "试验结束");
        });
        console.log(this.channelListMap)
        // const { series: loadSeries } = this.InitChart(document.getElementById('loadChart111'), '载荷-时间曲线', '时间(s)', '载荷(kN)');
        // // 订阅新数据流
        // PubSubUtil.subscribe(SubKeyEnum.NEW_DATA_REFRESH, async data => {
        //     // console.log(data.channelListMap[null + '-0'][0].LastVal + "<<>>" + data.channelListMap[null + '-0'][1].LastVal + "<<>>" + data.channelListMap[null + '-0'][2].LastVal);
        //
        //     let channel;
        //     for (const key in data.channelListMap) {
        //         if (data.channelListMap[key].length === 3) {
        //             channel = data.channelListMap[key][0];
        //         }
        //     }
        //     const timeArr = data.timeSnapshotMap[null + '-0'];
        //     const snapshotValArray = channel.SnapshotValArray;
        //     for (let i = 0; i < snapshotValArray.length; i++) {
        //         loadSeries.add({
        //             x: timeArr[i],
        //             y: snapshotValArray[i],
        //         });
        //     }
        // });
        this.CreatDefaultChart()
        await this.loadAts();
    }

    InitChart(container, chartTitle, xTitle, yTitle) {
        const chart = lightningChart({
            // Valid until 15/03/2024
            license: "0002-nycj7b+NO3q0ebu2Cz9aqVxnkq13KwAmI9SrlT9koGG/qNOHgqy187rYHRUsTKGAFaw/w365rKTirKQF7RBJ5xXI-MEQCIE/xE+0ZpBJp9s/h+Vz3mCqTH0WLwNN9F+sAvNejgYoMAiAaaUl8RkDf772ZTB78HPWZ/Qg5aIK56xj9HNy0vlYCWg==",
            licenseInformation: {
                appTitle: "LightningChart JS Trial",
                company: "LightningChart Ltd."
            },
        })
            .ChartXY({
                theme: Themes.darkGold,
                container,
            })
            .setTitle(chartTitle);

        const series = chart.addLineSeries({
            dataPattern: {
                pattern: 'ProgressiveX',
                regularProgressiveStep: true,
            },
        });

        const xAxis = chart.getDefaultAxisX()
            .setTitle(xTitle)
            .setScrollStrategy(AxisScrollStrategies.progressive);

        const yAxis = chart.getDefaultAxisY()
            .setTitle(yTitle);

        return {
            series,
        };
    }


    CreatDefaultChart(){
        let start = 0
        let step = 2
        let end = start + step
        let box = new ExampleContainer("")
        const exampleContainer = document.getElementById('chart')
        let aChart =  box.creatChartXY(exampleContainer as HTMLDivElement,"滚动")
        box.setAxisStrategy(aChart,{
            name:"Time",
                scrollStrategy:"progressive",
                interval:{start:start,end:end,stopAxisAfter:false},
            defaultInterval:{start:start,end:end,state:"dataMax",stopAxisAfter:false},
        },
        {
            name:"SnapshotVal",
                scrollStrategy:"fitting",
                interval:{start:0,end:10,stopAxisAfter:false},
            defaultInterval:{start:0,end:10,stopAxisAfter:false}
        })
        // console.log(this.channelListMap)
        let channelList = this.channelListMap
        let seriesMap = {}
        let channelListR= []
        for (const key in channelList) {
            channelList[key].forEach(channel=>{
                channelListR.push({
                    caption:channel.Caption,
                    bindHandle:channel.BindHandle,
                    instId:key
                })
                let lineSeries = box.setSeriesStrategy(aChart,channel.Caption,500000000)
                seriesMap[key+'-'+channel.BindHandle] = lineSeries
            })
        }
        this.setChannelListR(channelListR)
        PubSubUtil.subscribe(SubKeyEnum.NEW_DATA_REFRESH, async data => {
            // console.log(data)
            for (const key in data.channelListMap) {
                const timeArr = data.timeSnapshotMap[key];
                let channelList = data.channelListMap[key]
                for (let i = 0; i < timeArr.length; i++) {
                    let channelScreenT = this.state.channelScreen
                    channelList.forEach(channel=>{
                        const snapshotValArray = channel.SnapshotValArray;
                        seriesMap[key+'-'+channel.BindHandle].add({
                            x: timeArr[i],
                            y: snapshotValArray[i],
                        });
                        channelScreenT[key+'-'+channel.BindHandle] = snapshotValArray[i]
                    })
                    this.setChannelScreen(channelScreenT)
                }
                // channelList.forEach(channel=>{
                //     const snapshotValArray = channel.SnapshotValArray;
                //     for (let i = 0; i < snapshotValArray.length; i++) {
                //         seriesMap[key+'-'+channel.BindHandle].add({
                //             x: timeArr[i],
                //             y: snapshotValArray[i],
                //         });
                //     }
                // })
            }
        });
        //Legend要在Series后添加
        const legend = aChart
            .addLegendBox() //(LegendBoxBuilders.HorizontalLegendBox)
            .setTitleFillStyle(emptyFill)
            .add(aChart)
            .setAutoDispose({
                type: 'max-width',
                maxWidth: 0.3,
            })

        // const exampleContainer2 = document.getElementById('chart2')
        // aChart.craetChartXY(exampleContainer2 as HTMLDivElement,"清屏")
    }

    render() {
        return (
            <>
                <ExampleContainer/>
                <div id='chart' className="chart1"></div>
                <RemoteControl channel={this.state.channelListR} channelScreen={this.state.channelScreen}></RemoteControl>
                {/*<div id='chart2' className="chart2"></div>*/}
            </>

        // <div id="loadChart111" style={{width: 600, height: 600}}></div>
            // <div id="loadChart111" style="width: 500px;height: 300px;">
            //
            // </div>
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