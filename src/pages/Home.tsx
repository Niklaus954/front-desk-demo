import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';
import RemoteControl from "../components/RemoteControl";
import React from "react";
import {Button} from 'antd'
import LightningDemo from "../pages/LightningChartTestDemo"
import Application from "./Application";
import {Route, BrowserRouter, Switch, Link} from 'react-router-dom'

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>朗杰测控</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">朗杰测控</IonTitle>
          </IonToolbar>
        </IonHeader>
        {/*<ExploreContainer />*/}
        {/*  <RemoteControl />*/}
        {/*  <Application />*/}
          {/*<Button><Link to="/application">toDemo</Link></Button>*/}
      </IonContent>
    </IonPage>
  );
};

export default Home;
