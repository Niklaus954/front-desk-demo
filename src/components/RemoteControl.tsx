import './RemoteControl.css';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {IonButton, IonChip, IonCol, IonGrid, IonIcon, IonRow, IonSelect, IonSelectOption, IonText,} from '@ionic/react';
import {add, caretBack, caretDown, caretForward, caretUp, remove, stop} from "ionicons/icons";
import {GtcClient} from "../gtc/GtcClient";
import {ServiceTypeEnum} from "../gtc/domain/enums/ServiceTypeEnum";

function Screen({channelList,screen,passage,changePass}:{channelList?:Array<any>,screen:string|number,passage:string|number,changePass: Function}) {
    let channelSelect = []
    if (channelList && channelList.length>0)
    for (let i = 0; i < channelList.length; i++) {
        channelSelect.push(
            <IonSelectOption key={channelList[i].instId+'-'+channelList[i].bindHandle} value={channelList[i].instId+'-'+channelList[i].bindHandle}>{channelList[i].instId+'-'+channelList[i].caption}</IonSelectOption>
        )
    }
    else
        channelSelect= [<IonSelectOption value="Encoder" key='encoder'>占位展示1</IonSelectOption>,
            <IonSelectOption value="oranges" key='oranges'>占位展示2</IonSelectOption>,
            <IonSelectOption value="bananas" key='bananas'>占位展示3</IonSelectOption>]
    return (
        <div className="screen-box">
            <div className="fl-row">
                <IonText className="select-text">通道:</IonText>
                <IonSelect aria-label="通道" placeholder="" className="ion-select" value={passage} onIonChange={(e)=>changePass(e.detail.value)} >
                    {channelSelect}
                </IonSelect>
            </div>
            <IonText className="screen-text">{(screen??'0.000')}</IonText>
        </div>
    );
}

function SpeedBtn({speed,changeSpeed}:{speed:number,changeSpeed:Function}) {
    const speeds = [0.1,0.5,1,2,5,10]
    let list = []
    list = speeds.map((item,i)=>{
        return (
        speed===i?<IonChip className="ion-chip check-chip" key={i} >{item}/s</IonChip>:
            <IonChip className="ion-chip" key={i} onClick={()=>changeSpeed(i)}>{item}/s</IonChip>
        )
    })
    return (
        <div className="speed-box fl-row">
            {/*<IonIcon icon={playCircle} className="speed-icon"/>*/}
            {/*<IonChip className="ion-chip check-chip">0.1/s</IonChip>
            <IonChip className="ion-chip">0.5/s</IonChip>
            <IonChip className="ion-chip">1/s</IonChip>
            <IonChip className="ion-chip">2/s</IonChip>
            <IonChip className="ion-chip">5/s</IonChip>
            <IonChip className="ion-chip">10/s</IonChip>*/}
            {list}
        </div>
    )
}

function CenterHandle({status=0,stopImme,upOrDown,changeSpeedLevel}:{status:number,stopImme:Function,upOrDown:Function,changeSpeedLevel:Function}) {
    const [check,setCheck] = useState(0)
    function clickBtn(n) {
        setCheck(n)
    }
    return(
        <>
            <IonGrid className="handle-box">
                <IonRow>
                    <IonCol className="hide-btn"></IonCol>
                    <IonCol className={`handle-btn fl-row center-col ${check===2?'check-btn':''}` }>
                        <IonIcon icon={status?add:caretUp} size="large" onClick={
                            ()=>{ clickBtn(2); !status && upOrDown(1); }}/>
                    </IonCol>
                    <IonCol className="hide-btn"></IonCol>
                </IonRow>
                <IonRow className="center-row">
                    <IonCol className={`handle-btn fl-row ${check===4?'check-btn':''}`}>
                        <IonIcon icon={status?caretBack:remove} size="large" onClick={
                            ()=>{!status && changeSpeedLevel(-1);}}/>
                    </IonCol>
                    <IonCol className={`handle-btn handle-center fl-row center-col ${check===5?'check-btn':''}`}>
                        <IonIcon icon={stop} size="large" onClick={
                            ()=>{stopImme();clickBtn(5)}}/>
                    </IonCol>
                    <IonCol className={`handle-btn fl-row ${check===6?'check-btn':''}`}>
                        <IonIcon icon={status?caretForward:add} size="large" onClick={
                            ()=>{!status && changeSpeedLevel(1);}}/>
                    </IonCol>
                </IonRow>
                <IonRow>
                    <IonCol className="hide-btn"></IonCol>
                    <IonCol className={`handle-btn fl-row center-col ${check===8?'check-btn':''}`}>
                        <IonIcon icon={status?remove:caretDown} size="large" onClick={
                            ()=>{clickBtn(8);!status && upOrDown(2);}}/>
                    </IonCol>
                    <IonCol className="hide-btn"></IonCol>
                </IonRow>
            </IonGrid>
        </>
    )
}

function FootBtn() {
    return(
        <div>
            <IonButton className="footBtn">复位</IonButton>
            <IonButton className="footBtn" >随动</IonButton>
        </div>
    )
}

// 1.封装节流函数
function useThrottle(fn, delay, dep = []) {
    const { current } = useRef({ fn, timer: null });
    useEffect(function () {
        current.fn = fn;
    }, [fn]);

    return useCallback(function f(...args) {
        if (!current.timer) {
            current.timer = setTimeout(() => {
                delete current.timer;
            }, delay);
            current.fn(...args);
        }
    }, dep);
}

const RemoteControl:any = ({channel,channelScreen}:{channel:Array<any>,channelScreen:{}}) => {
    //值显示
    const [screen,setScreen] = useState('0.000')
    //通道信息列表
    const [channelList,setChannelList] = useState<Array<any>>(channel)
    //通道单选
    const [passage,setPassage] = useState('')
    //速度按钮单选
    const [speed,setSpeed] = useState(0)
    const [uord,setUorD] = useState(0)
    useEffect(() => {
        setChannelList(channel)
    }, [channel]);

    function handleSelectPassage(value:any){
        setPassage(value)
    }
    useEffect(() => {
        handleChangeScreen(channelScreen)
    }, [passage]);

    function handleChangeSpeed(i:number) {
        setSpeed(i)
    }
    function handleChangeSpeedLevel(i:number) {
        if ((speed===0 && i<0) || (speed===5 && i>0))
            return

        setSpeed(speed+i)
    } function handleChangeUorD(i:number) {
        setUorD(i)
    }
    function handleChangeScreen(screenList:object) {
        // console.log(passage,screenList)
        passage && Object.keys(screenList).length>0  && setScreen(screenList[passage].toFixed(2))
    }

    const handleChangeScreenT = useThrottle(handleChangeScreen,100)

    useEffect(() => {
        handleChangeScreenT(channelScreen)
    }, [channelScreen[passage]]);

    function handleStopImme() {
        let aa = passage.split('-')
        if (passage && aa.length===3){
            console.log('stop',aa)
            setUorD(0)
            GtcClient.stopImmediately(aa[0]==='null'?null:aa[0],ServiceTypeEnum.MGT,parseInt(aa[1]) )
        }
    }
    function handleSlope(speed) {
        let aa = passage.split('-')
        if (passage && aa.length===3){
            GtcClient.setRefGenSlope(aa[0]==='null'?null:aa[0],ServiceTypeEnum.MGT, parseInt(aa[1]),parseInt(aa[2]),speed)
        }
    }

    useEffect(() => {
        const speeds = [0.1,0.5,1,2,5,10]

        if (uord){
            uord === 1 ? handleSlope(speeds[speed]) : handleSlope(-speeds[speed])
        }
    }, [speed,uord]);
    return (
        <div className="container-remote">
            <Screen screen={screen} passage={passage} channelList={channelList} changePass={handleSelectPassage}/>
            <SpeedBtn speed={speed} changeSpeed={handleChangeSpeed}/>
            <CenterHandle  status={0} stopImme={handleStopImme} upOrDown={handleChangeUorD} changeSpeedLevel={handleChangeSpeedLevel}/>
            {/*<FootBtn />*/}
        </div>
    );
};

export default RemoteControl;
