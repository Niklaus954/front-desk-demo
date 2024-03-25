import './RemoteControl.css';
import React, {useState} from 'react';
import {
    IonChip, IonIcon,
    IonText, IonSelect, IonSelectOption,
    IonGrid, IonRow, IonCol, IonButton,
} from '@ionic/react';
import {add, caretBack, caretForward, remove, stop} from "ionicons/icons";

function Screen({screen,passage,changePass}:{screen:string|number,passage:string|number,changePass: Function}) {
    return (
        <div className="screen-box">
            <div className="fl-row">
                <IonText className="select-text">通道:</IonText>
                <IonSelect aria-label="通道" placeholder="" className="ion-select" value={passage} onIonChange={(e)=>changePass(e.detail.value)} >
                    <IonSelectOption value="Encoder">Encoder</IonSelectOption>
                    <IonSelectOption value="oranges">Oranges</IonSelectOption>
                    <IonSelectOption value="bananas">Bananas</IonSelectOption>
                </IonSelect>
            </div>
            <IonText className="screen-text">{screen}</IonText>
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

function CenterHandle() {
    return(
        <>
            <IonGrid className="handle-box">
                <IonRow>
                    <IonCol className="hide-btn"></IonCol>
                    <IonCol className="handle-btn fl-row center-col">
                        <IonIcon icon={add} size="large"/>
                    </IonCol>
                    <IonCol className="hide-btn"></IonCol>
                </IonRow>
                <IonRow className="center-row">
                    <IonCol className="handle-btn fl-row">
                        <IonIcon icon={caretBack} size="large"/>
                    </IonCol>
                    <IonCol className="handle-btn handle-center fl-row center-col">
                        <IonIcon icon={stop} size="large"/>
                    </IonCol>
                    <IonCol className="handle-btn fl-row">
                        <IonIcon icon={caretForward} size="large"/>
                    </IonCol>
                </IonRow>
                <IonRow>
                    <IonCol className="hide-btn"></IonCol>
                    <IonCol className="handle-btn fl-row center-col">
                        <IonIcon icon={remove} size="large"/>
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
const RemoteControl:any = () => {
    const [screen,setScreen] = useState('0.000')
    const [passage,setPassage] = useState('Encoder')
    const [speed,setSpeed] = useState(0)
    function handleSelectPassage(value:any){
        console.log(value)
        setPassage(value)
    }
    function handleChangeSpeed(i:number) {
        console.log(i)
        setSpeed(i)
    }
    return (
        <div className="container-remote">
            <Screen screen={screen} passage={passage} changePass={handleSelectPassage}/>
            <SpeedBtn speed={speed} changeSpeed={handleChangeSpeed}/>
            <CenterHandle />
            <FootBtn />
        </div>
    );
};

export default RemoteControl;
