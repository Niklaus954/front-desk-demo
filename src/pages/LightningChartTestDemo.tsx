import {
    lightningChart,
    emptyFill,
    emptyLine,
    AxisScrollStrategies,
    Themes,
    SolidFill,
    Theme,
    UILayoutBuilders,
    ChartXY,
    Dashboard,
    LineSeries,
    PointShape,
    FillStyle,
} from "@arction/lcjs";
import React, {useEffect, useId, useRef, useState} from "react";
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from "@ionic/react";
import Application from "./Application";
import {PubSubUtil} from "../gtc/utils/PubSubUtil";
import {SubKeyEnum} from "../gtc/utils/enums/SubKeyEnum";
import { render } from "react-dom";

const lcjs = lightningChart({
    // Valid until 15/03/2024
    license: "0002-nycj7b+NO3q0ebu2Cz9aqVxnkq13KwAmI9SrlT9koGG/qNOHgqy187rYHRUsTKGAFaw/w365rKTirKQF7RBJ5xXI-MEQCIE/xE+0ZpBJp9s/h+Vz3mCqTH0WLwNN9F+sAvNejgYoMAiAaaUl8RkDf772ZTB78HPWZ/Qg5aIK56xj9HNy0vlYCWg==",
    licenseInformation: {
        appTitle: "LightningChart JS Trial",
        company: "LightningChart Ltd."
    },
})

// 创建图表
const customChartXY = ({container,title}:{container: HTMLDivElement, title?: string })=>
{
    const lineChart =  lcjs.ChartXY({container})
    lineChart.setPadding({ right: 40 })
    title ? lineChart.setTitle(title): lineChart.setTitleFillStyle(emptyFill)
    //禁用自动光标
    // lineChart.setAutoCursorMode(AutoCursorModes.disabled)
    //禁用鼠标交互
    // lineChart.setMouseInteractions(false)
    return lineChart
}

//axis XY轴策略
interface axisStrategy {
    name:string,
    //undefined禁用自动缩放,fitting 缩放刻度适应数据,expansion 缩放刻度适应数据,progressive 渐进式,regressive 刻度大小不变，视图固定不滚动
    scrollStrategy:"undefined"|"fitting"|"expansion"|"progressive"|"regressive",
    //setInterval 设置初始刻度间隔
    interval?:{
        start:number,
        end:number,
        stopAxisAfter?:boolean
    },
    //setDefaultInterval 设置默认间隔,与setInterval方法相同，但在Axis.fit被触发，或者“缩放到适合”的用户交互被触发。
    defaultInterval?:{
        state?:"curStart"| "curEnd"|"dataMin"|"dataMax",
        start:number,
        end:number,
        stopAxisAfter?:boolean
    }

}
function axisScrollStrategy({lineChart,x,y}: { lineChart:ChartXY, x:axisStrategy, y:axisStrategy})
{
    let xyAxis = [x,y]
    for (const index in xyAxis) {
        let axis = index==='0'? lineChart.getDefaultAxisX():lineChart.getDefaultAxisY()
        // xyAxis[key].name && xAxis.setTitle(x.name)
        let strategy = xyAxis[index]
        strategy.name && axis.setTitle(strategy.name)
        strategy.scrollStrategy && strategy.scrollStrategy === "undefined" ?
            axis.setScrollStrategy(undefined):
            axis.setScrollStrategy(AxisScrollStrategies[strategy.scrollStrategy])
        let interval = strategy.interval
        interval && axis.setInterval({ start: interval.start, end: interval.end, stopAxisAfter: interval.stopAxisAfter })
        let defaultInterval = strategy.defaultInterval
        defaultInterval &&  axis.setDefaultInterval((state) =>{
            let cursor = 0
            defaultInterval?.state && ( cursor = (state[defaultInterval.state] ?? 0))
                return (
                    {
                        start: cursor + defaultInterval?.start,
                        end: cursor + defaultInterval?.end,
                        stopAxisAfter: defaultInterval?.stopAxisAfter })
            } )
    }
    //定义了轴刻度的定位和格式化逻辑，以及创建刻度的样式
    // .setTickStrategy('Empty')
}

//series光标笔画
function seriesStrategy({lineChart,name,minDataPointCount,selectedFillStyle}: { lineChart:ChartXY,name?:string,minDataPointCount?:number,selectedFillStyle?:FillStyle}) {
    // const selectedFillStyle = new SolidFill({ color: theme.examples.mainDataColor })
    // 创建光标
    const lineSeries =
        lineChart.addLineSeries({
        dataPattern: {
            pattern: 'ProgressiveX',
            regularProgressiveStep: true,
        },
    })
    //平滑曲线画笔
    // lineChart.addSplineSeries({ pointShape: PointShape.Circle })

    name && lineSeries.setName(name)
    // 为系列设置选定的填充颜色
    selectedFillStyle && lineSeries.setStrokeStyle((style) => style.setFillStyle(selectedFillStyle))
    //销毁数据。
    minDataPointCount && lineSeries.setDataCleaning({ minDataPointCount: minDataPointCount })
    //配置游标格式
    lineSeries.setCursorResultTableFormatter((builder, series, Xvalue, Yvalue) => {
        // Find cached entry for the figure.
        name && builder.addRow(series.getName())
        builder.addRow((series.axisX.getTitle()??'x')+": " + series.axisX.formatValue(Xvalue))
        series.axisY.getTitle() && builder
            .addRow((series.axisY.getTitle()??'y')+": " + Yvalue.toFixed(2))
        return builder
    })
    return lineSeries
}


const STEP = 2
const creatDefaultChart=(container:HTMLDivElement,title:string)=>{
    let lineChart = customChartXY({container,title})
    axisScrollStrategy({
        lineChart:lineChart,
        x:{
            name:"Time",
            scrollStrategy:"progressive",
            interval:{start:0,end:STEP,stopAxisAfter:false},
            defaultInterval:{start:0,end:STEP,state:"dataMax",stopAxisAfter:false},
        },
        y:{
            name:"SnapshotVal",
            scrollStrategy:"fitting",
            interval:{start:0,end:10,stopAxisAfter:false},
            defaultInterval:{start:0,end:10,stopAxisAfter:false}
        }
    })


    let tongdao = ["Tension","ACCE","Encoder"]
    let seriesArr:LineSeries[] = []
    tongdao.forEach((td,i)=>{
        let lineSeries = seriesStrategy({lineChart:lineChart,name:tongdao[i],minDataPointCount:50000})
        seriesArr.push(lineSeries)
    })
    // let lineSeries=lineChart.addPointLineAreaSeries({ dataPattern: 'ProgressiveX',}).setAreaFillStyle(emptyFill)
    //     .setPointShape(PointShape.Star)
    // seriesArr.push(lineSeries)


    // this.nodeInfoList = await GtcClient.fetchNodeInfo();
    PubSubUtil.subscribe(SubKeyEnum.NEW_DATA_REFRESH, async data => {
        // console.log(data.channelListMap[null + '-0'][0].LastVal + "<<>>" + data.channelListMap[null + '-0'][1].LastVal + "<<>>" + data.channelListMap[null + '-0'][2].LastVal);
        // console.log(data.channelListMap)
        const channel = data.channelListMap[null + '-0'][0];
        const timeArr = data.timeSnapshotMap[null + '-0'];
        const snapshotValArray = channel.SnapshotValArray;
        // console.log(snapshotValArray);
        for (let i = 0; i < snapshotValArray.length; i++) {
            // c += 0.0001;
            seriesArr[0].add({
                x: timeArr[i],
                y: snapshotValArray[i],
            });
            seriesArr[1].add({
                x: timeArr[i],
                y: data.channelListMap[null + '-0'][1].SnapshotValArray[i],
            });
            seriesArr[2].add({
                x: timeArr[i],
                y: data.channelListMap[null + '-1'][0].SnapshotValArray[i],
            });
        }
    });
    //Legend要在Series后添加
    const legend = lineChart
        .addLegendBox() //(LegendBoxBuilders.HorizontalLegendBox)
        .setTitleFillStyle(emptyFill)
        .add(lineChart)
        .setAutoDispose({
            type: 'max-width',
            maxWidth: 0.3,
        })

}
const creatSweepChart=(container:HTMLDivElement,title:string)=>{
    let lineChart = customChartXY({container,title})
    axisScrollStrategy({
        lineChart:lineChart,
        x:{
            name:"Time",
            scrollStrategy:"expansion",
            interval:{start:0,end:STEP,stopAxisAfter:false},
            defaultInterval:{start:0,end:STEP,stopAxisAfter:false},
        },
        y:{
            name:"SnapshotVal",
            scrollStrategy:"expansion",
            interval:{start:0,end:10,stopAxisAfter:false},
            defaultInterval:{start:0,end:10,stopAxisAfter:false}
        }
    })
    let tongdao = ["Tension","ACCE","Encoder"]
    let seriesArr:LineSeries[] = []
    tongdao.forEach((td,i)=>{
        let lineSeries = seriesStrategy({lineChart:lineChart,name:tongdao[i],minDataPointCount:50000})
        seriesArr.push(lineSeries)
    })
    PubSubUtil.subscribe(SubKeyEnum.NEW_DATA_REFRESH, async data => {
        // console.log(data)
        const channel = data.channelListMap[null + '-0'][0];
        const timeArr = data.timeSnapshotMap[null + '-0'];
        const snapshotValArray = channel.SnapshotValArray;
        // console.log(snapshotValArray);
        for (let i = 0; i < snapshotValArray.length; i++) {
            // c += 0.0001;
            seriesArr[0].add({
                x: timeArr[i] % STEP,
                y: snapshotValArray[i],
            });
            seriesArr[1].add({
                x: timeArr[i] % STEP,
                y: data.channelListMap[null + '-0'][1].SnapshotValArray[i],
            });
            seriesArr[2].add({
                x: timeArr[i] % STEP,
                y: data.channelListMap[null + '-1'][0].SnapshotValArray[i],
            });
            if (timeArr[i] % STEP === 0){
                seriesArr[0].clear()
                seriesArr[1].clear()
                seriesArr[2].clear()
            }
        }
        // for (let i = 0; i < snapshotValArray.length; i++) {
        //     // c += 0.0001;
        //     lineSeries.add({
        //         x: timeArr[i] % 10,
        //         y: snapshotValArray[i],
        //     });
        //     if (timeArr[i] % 10 === 0){
        //         lineSeries.clear()
        //     }
        // }
    });
    //Legend要在Series后添加
    const legend = lineChart
        .addLegendBox() //(LegendBoxBuilders.HorizontalLegendBox)
        .setTitleFillStyle(emptyFill)
        .add(lineChart)
        .setAutoDispose({
            type: 'max-width',
            maxWidth: 0.3,
        })

}


const ExampleContainer=()=>{
    useEffect(() => {
        const exampleContainer = document.getElementById('chart')
        creatDefaultChart(exampleContainer as HTMLDivElement,"滚动")
        const exampleContainer2 = document.getElementById('chart2')
        creatSweepChart(exampleContainer2 as HTMLDivElement,"清屏")}, []);
    return (
        <IonPage>
            <IonContent>
                <div id='chart' className="chart1"></div>
                <div id='chart2' className="chart2"></div>
                {/*<Application/>*/}
                {/*<InitChart/>*/}
            </IonContent>
        </IonPage>
    );
}


class InitChart extends React.Component<any, any>{
    lightningChart= lcjs
    creatChartXY = (container: HTMLDivElement, title?: string) =>{
        return  customChartXY({container, title})
    }
    setAxisStrategy =(lineChart: ChartXY, x: axisStrategy, y: axisStrategy)=>{
        axisScrollStrategy({lineChart, x, y})
    }
    setSeriesStrategy = (lineChart: ChartXY, name?: string | undefined, minDataPointCount?: number | undefined, selectedFillStyle?: FillStyle | undefined)=>{
        return  seriesStrategy({lineChart, name, minDataPointCount, selectedFillStyle})
    }
    render() {return <></>}
};


export default InitChart;

