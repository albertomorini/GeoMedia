import { IonButton, IonCardTitle, IonContent, IonHeader, IonInput, IonItemDivider, IonLabel, IonSegment, IonSegmentButton, IonToolbar } from "@ionic/react"
import { useContext, useState } from "react";
import { doRequest, React_MD5 } from "../utility";

import { mycontext } from "../App"
import NewPost from "../components/NewPost";

const Login = () => {
    const [Choiche, setChoiche] = useState("signIN")
    const [Username, setUsername] = useState(null)
    const [Password, setPassword] = useState(null)
    const [RepeatPSW, setRepeatPSW] = useState(null)
    const ctx = useContext(mycontext)

    function doLogin() {
        if (Username?.replace(" ", "").length > 0 && Password?.replace(" ", "").length > 0 && Password == RepeatPSW) {
            doRequest("doLogin", {
                username: Username,
                password: React_MD5(Password),
                newuser: (Choiche == "signIN") ? false : true
            }).then(res => {
                if (res[0].ESITO == 1) { //login done
                    ctx?.User?.setUser(Username)
                    ctx?.Psw?.setPsw(React_MD5(Password),)
                    ctx.showMessage("Welcome back " + Username, "success")
                } else {
                    ctx.showMessage("Wrong credentials", "danger")
                }
            })
        } else {
            ctx?.showMessage("Error - wrong passwords or empty", "danger")
        }

    }

    return (
        <IonContent className="ion-padding" >

            <IonCardTitle>Welcome to Geomedia!</IonCardTitle>
            <br />
            <IonSegment onIonChange={(ev) => { setChoiche(ev.target.value); setUsername(null); setPassword(null) }} value={Choiche} mode="ios" >
                <IonSegmentButton value={"signIN"}>Sign in</IonSegmentButton>
                <IonSegmentButton value={"signUP"}>Sign up</IonSegmentButton>
            </IonSegment>

            {
                (Choiche == "signIN") ?
                    <>
                        <IonLabel>Username</IonLabel>
                        <IonInput mode="md" fill="outline" type="text" placeholder="username" onIonInput={(ev) => setUsername(ev.target.value)} />
                        <IonLabel>Password</IonLabel>
                        <IonInput mode="md" fill="outline" type="password" placeholder="your password" onIonInput={(ev) => {
                            setPassword(ev.target.value)
                            setRepeatPSW(ev.target.value)
                        }}> </IonInput>
                    </>
                    :
                    <>
                        <IonLabel>Username</IonLabel>
                        <IonInput mode="md" fill="outline" type="text" placeholder="what's your name?" onIonInput={(ev) => setUsername(ev.target.value)} />
                        <IonItemDivider mode="md" />
                        <IonLabel>Password</IonLabel>
                        <IonInput mode="md" fill="outline" type="password" placeholder="pick a strong one" onIonInput={(ev) => setPassword(ev.target.value)} />
                        <IonLabel>Reapat it please</IonLabel>
                        <IonInput mode="md" fill="outline" type="password" placeholder="repeat your password" onIonInput={(ev) => setRepeatPSW(ev.target.value)} />
                    </>
            }
            <IonButton expand="block" onClick={() => doLogin()}>
                {(Choiche == "signIN") ?
                    "LOGIN"
                    :
                    "REGISTER"
                }
            </IonButton>

        </IonContent>
    )
}

export default Login;