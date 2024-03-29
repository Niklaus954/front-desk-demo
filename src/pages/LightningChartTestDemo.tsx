import {
    lightningChart, emptyFill, emptyLine,
    AxisScrollStrategies, Themes, SolidFill, Theme, UILayoutBuilders, ChartXY, Dashboard, LineSeries, PointShape,
} from "@arction/lcjs";
import React, {useEffect, useId, useRef, useState} from "react";
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from "@ionic/react";
import Application from "./Application";
import {PubSubUtil} from "../gtc/utils/PubSubUtil";
import {SubKeyEnum} from "../gtc/utils/enums/SubKeyEnum";
import {GtcClient} from "../gtc/GtcClient";

const lcjs = lightningChart({
    // Valid until 15/03/2024
    license: "0002-nycj7b+NO3q0ebu2Cz9aqVxnkq13KwAmI9SrlT9koGG/qNOHgqy187rYHRUsTKGAFaw/w365rKTirKQF7RBJ5xXI-MEQCIE/xE+0ZpBJp9s/h+Vz3mCqTH0WLwNN9F+sAvNejgYoMAiAaaUl8RkDf772ZTB78HPWZ/Qg5aIK56xj9HNy0vlYCWg==",
    licenseInformation: {
        appTitle: "LightningChart JS Trial",
        company: "LightningChart Ltd."
    },
})

//axis轴策略
interface axisStrategy {
    name:string,
    //undefined禁用自动缩放,fitting 缩放刻度适应数据,expansion 缩放刻度适应数据,progressive 渐进式,regressive 刻度大小不变，视图固定不滚动
    scrollStrategy:"undefined"|"fitting"|"expansion"|"progressive"|"regressive",
    interval?:{
        //type 0 setInterval 设置刻度间隔, 1 setDefaultInterval 设置默认间隔,与setInterval方法相同，但在Axis.fit被触发，或者“缩放到适合”的用户交互被触发。
        type:0|1,
        state?:"curStart"| "curEnd"|"dataMin"|"dataMax",
        start:number,
        end:number,
        stopAxisAfter?:boolean
    }

}
function axisScrollStrategy({lineChart,x,y}: {
                                    lineChart:ChartXY,
                                    x:axisStrategy,
                                    y:axisStrategy})
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
        interval &&
        (
            interval.type ?
            axis.setDefaultInterval((state) =>{
                let cursor = 0
                interval?.state && ( cursor = (state[interval.state] ?? 0))
                return (
                    {
                        start: cursor + interval?.start,
                        end: cursor + interval?.end,
                        stopAxisAfter: interval?.stopAxisAfter })
            } ):
            axis.setInterval({ start: interval.start, end: interval.end, stopAxisAfter: interval.stopAxisAfter })
        )
    }

    //定义了轴刻度的定位和格式化逻辑，以及创建刻度的样式
    // .setTickStrategy('Empty')
    // 设置刻度间隔，使分布合适
    // .setInterval({ start: 0, end: 5, stopAxisAfter: false })
    //设置Axis默认间隔。这与setInterval方法相同，但在Axis.fit被触发，或者“缩放到适合”的用户交互被触发。
    // .setDefaultInterval((state) => ({ start: (state.dataMax ?? 0), end: (state.dataMax ?? 0) + 10, stopAxisAfter: false }))}
}


//series光标笔画
function seriesStrategy({lineChart,isSpline,name,minDataPointCount,theme}: { lineChart:ChartXY,name?:string,minDataPointCount?:number,theme?:Theme,isSpline:boolean }) {
    // const selectedFillStyle = new SolidFill({ color: theme.examples.mainDataColor })
    // 创建光标
    const lineSeries = isSpline ? lineChart.addSplineSeries({
            dataPattern: {
                pattern: 'ProgressiveX',
                regularProgressiveStep: true,
            },
        }).setPointFillStyle(emptyFill) :
        lineChart.addLineSeries({
        dataPattern: {
            pattern: 'ProgressiveX',
            regularProgressiveStep: true,
        },
    })
    name && lineSeries.setName(name)
    // lineSeries.addSplineSeries({ pointShape: PointShape.Circle })
    // 为系列设置选定的填充颜色
    // lineSeries.setStrokeStyle((style) => style.setFillStyle(selectedFillStyle))
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

// 创建图表
const customChartXY = ({container,title}:{
    container: HTMLDivElement, title?: string })=>{
    const lineChart =  lcjs.ChartXY({container})
    lineChart.setPadding({ right: 40 })
    title ? lineChart.setTitle(title):
    lineChart.setTitleFillStyle(emptyFill)
    //禁用自动光标
    // .setAutoCursorMode(AutoCursorModes.disabled)
    //禁用鼠标交互
    // .setMouseInteractions(false)
    return lineChart
}

const creatChart=(container:HTMLDivElement)=>{
    let lineChart = customChartXY({container,title:'111'})
    axisScrollStrategy({
        lineChart:lineChart,
        x:{name:"Time", scrollStrategy:"progressive",interval:{type:1,start:0,end:10,state:"dataMax",stopAxisAfter:false}},
        y:{name:"SnapshotVal", scrollStrategy:"fitting",interval:{start:0,end:10,type:0,stopAxisAfter:false}}
    })

    let tongdao = ["Tension","ACCE","Encoder"]
    let seriesArr:LineSeries[] = []
    tongdao.forEach((td,i)=>{
        let lineSeries = seriesStrategy({lineChart:lineChart,name:tongdao[i],isSpline:true})
        seriesArr.push(lineSeries)
    })



    interface ContentTableData {
        x: number;
        y: number;
    }
    // this.nodeInfoList = await GtcClient.fetchNodeInfo();
    PubSubUtil.subscribe(SubKeyEnum.NEW_DATA_REFRESH, async data => {
        // @ts-ignore
        console.log(
            data.channelListMap[null + '-0'][0].LastVal
            + "<<>>" +
            data.channelListMap[null + '-0'][1].LastVal
            + "<<>>" +
            data.channelListMap[null + '-0'][2].LastVal
            + "<<>>" +
            data.channelListMap[null + '-1'][0].LastVal
        );
        seriesArr[0].add({y:data.channelListMap[null + '-0'][0].LastVal,x:data.timeSnapshotMap[null + '-0'][0]})
        seriesArr[1].add({y:data.channelListMap[null + '-0'][1].LastVal,x:data.timeSnapshotMap[null + '-0'][1]})
        seriesArr[2].add({y:data.channelListMap[null + '-1'][0].LastVal,x:data.timeSnapshotMap[null + '-1'][0]})
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


const MyChart=()=>{
    useEffect(() => {
        const exampleContainer = document.getElementById('chart')
        creatChart(exampleContainer as HTMLDivElement)
    }, []);
    return <></>
}

const ExampleContainer: React.FC = () => {
    // chart();
    return (
        <IonPage>
            <IonContent>
                <div id='chart' className="chart1"></div>
                <Application/>
                <MyChart/>
            </IonContent>
        </IonPage>
    );
};

export default ExampleContainer;

