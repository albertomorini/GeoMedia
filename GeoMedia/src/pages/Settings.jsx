// settinsg of app such as the server base url and list of posts published by user
import { IonButton, IonCol, IonContent, IonIcon, IonItem, IonItemDivider, IonRow } from "@ionic/react";
import { useContext, useEffect, useState } from "react";
import { mycontext } from "../App";
import { ContentConfigServer, datetime2datehour, doRequest } from "../utility";
import ViewPost from "../components/ViewPost";
import { open } from "ionicons/icons";

const Settings = () => {
    const ctx = useContext(mycontext);
    const [PostSelected, setPostSelected] = useState(null)

    const [Posts, setPosts] = useState(null)
    // get the post of the account logged in
    function getPosts() {
        doRequest("getPosts", {
            USERNAME: ctx?.User?.User
        }).then(res => {
            setPosts(res)
        })
    }
    useEffect(() => {
        getPosts()
    }, [])

    return (
        <IonContent className="ion-padding">
            <br /><br /><br /><br /><br /><br />
            <br /><br /><br /><br /><br />

            <ContentConfigServer showButton={true} expand="block" />
            <IonButton color={"danger"} expand="block" onClick={() => {
                if (confirm("Are you sure?")) {
                    ctx?.showMessage("Okay, bye...", "warning")
                    ctx?.User?.setUser(null)
                }
            }}>
                LOG OFF
            </IonButton>
            <IonItemDivider />
            <>
                <h3>Hello {ctx?.User.User}</h3>
                <h5>Your posts</h5>
                <IonItem>
                    <IonRow style={{ width: "100%" }}>
                        <IonCol><b>Title</b></IonCol>
                        <IonCol size="4.5"><b>Date</b></IonCol>
                        <IonCol><b>Latitude & longitude</b></IonCol>
                        <IonCol size="2">
                            <IonButton>
                                <IonIcon icon={open} />
                            </IonButton>
                        </IonCol>
                    </IonRow>
                </IonItem>
                {
                    Posts?.map(s => (
                        <IonItem>
                            <IonRow style={{ width: "100%" }}>
                                <IonCol>{s?.TITLE}
                                    <br />
                                    {s?.COMMENT}

                                </IonCol>
                                <IonCol size="4.5">{datetime2datehour(s?.POSTDATETIME)}</IonCol>
                                <IonCol>{s?.LATITUDE.toFixed(2)} <br />{s?.LONGITUDE.toFixed(2)}</IonCol>
                                <IonCol size="2">
                                    <IonButton onClick={() => { setPostSelected(s) }}>
                                        <IonIcon icon={open} />
                                    </IonButton>
                                </IonCol>

                            </IonRow>
                        </IonItem>
                    ))
                }
            </>

            <ViewPost PostSelected={PostSelected} reloadPosts={()=>getPosts()}/>
        </IonContent>
    )
}

export default Settings