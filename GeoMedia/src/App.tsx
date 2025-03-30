import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonHeader,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonTitle,
  IonToast,
  IonToolbar,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, hammer, map, square, triangle } from 'ionicons/icons';

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
import { Geolocation } from "@capacitor/geolocation"

import Login from "./pages/Login"

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

import MyPMap from "./pages/MyPMap";
import Settings from "./pages/Settings";
import { createContext, useContext, useEffect, useRef, useState } from 'react';

export const mycontext = createContext();


const App: React.FC = () => {
  const [User, setUser] = useState(null)
  const [Message, setMessage] = useState(null)
  const [Color, setColor] = useState(null)
  const [UserPosition, setUserPosition] = useState(null) // the current position of user //TODO: default
  const refMessage = useRef()

  function showMessage(textmessage, colormessage) {
    setMessage(textmessage)
    setColor(colormessage)
    console.log(textmessage);

    refMessage?.current?.present()
  }

  async function getPosition() {
    let check = await Geolocation.checkPermissions()
    if (check.location == "granted" || check.coarseLocation == "granted") {

      let location = await Geolocation.getCurrentPosition()
      setUserPosition([location.coords.latitude, location.coords.longitude])

    } else {//if(check.location=="prompt" || check.coarseLocation=="prompt") {
      let x = await Geolocation.requestPermissions()
    }
  }

  useEffect(() => {
    getPosition()
  }, [])

  return (
    < IonApp >
      <IonHeader>
        <IonToolbar>
          <IonTitle>Geomedia</IonTitle>
        </IonToolbar>
      </IonHeader>
      <mycontext.Provider value={{
        "User": { User, setUser },
        "UserPosition": UserPosition,
        "showMessage": (msg, esito) => showMessage(msg, esito),
      }}>
        {(User == null) ?
          <Login />
          :
          <IonReactRouter>
            <IonTabs>
              <IonRouterOutlet>

                <Route exact path="/DashboardMaps">
                  <MyPMap />
                </Route>
                <Route exact path="/Settings">
                  {/* <Tab2 /> */}
                  <Settings />
                </Route>

                <Route exact path="/">
                  <Redirect to="/DashboardMaps" />
                </Route>
              </IonRouterOutlet>
              <IonTabBar slot="bottom">
                <IonTabButton tab="tab1" href="/DashboardMaps">
                  <IonIcon aria-hidden="true" icon={map} />
                  <IonLabel>Map</IonLabel>
                </IonTabButton>
                <IonTabButton tab="tab2" href="/Settings">
                  <IonIcon aria-hidden="true" icon={hammer} />
                  <IonLabel>Settings</IonLabel>
                </IonTabButton>

              </IonTabBar>
            </IonTabs>
          </IonReactRouter>
        }


      </mycontext.Provider>






      <IonToast
        ref={refMessage}
        message={Message}
        color={Color}
        position='bottom'
        duration={2400}
      />

    </IonApp >
  )
}

export default App;
