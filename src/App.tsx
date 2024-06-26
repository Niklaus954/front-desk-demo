import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import LightningChartTestDemo from "./pages/LightningChartTestDemo";
import Application from "./pages/Application";

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import React from "react";
import {GtcClient} from "./gtc/GtcClient";
import {ServiceTypeEnum} from "./gtc/domain/enums/ServiceTypeEnum";

setupIonicReact();

// GtcClient.init("http://localhost:9001").then(async () => {
//   const slaveInstId = null;
//   console.log(await GtcClient.getDllVer(slaveInstId, ServiceTypeEnum.MGT));
//   console.log(await GtcClient.getCardNumber(slaveInstId, ServiceTypeEnum.MGT));
//   GtcClient.listenEventMsg(slaveInstId, ServiceTypeEnum.MGT, 0, result => console.log(result));
//   GtcClient.listenDataGram(slaveInstId, ServiceTypeEnum.MGT, 0, result => console.log(result));
//   await GtcClient.launch(slaveInstId, ServiceTypeEnum.MGT, 0);
//   GtcClient.listenNodeInfo(info => console.log(info));
// }).catch(e => console.log(e));

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/home">
          <Home />
        </Route>
        <Route exact path="/LCDemo">
          <LightningChartTestDemo />
        </Route>
        <Route exact path="/application">
          <Application />
        </Route>
        <Route exact path="/">
          <Redirect to="/application" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
