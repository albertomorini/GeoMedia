// settinsg of app such as the server base url and list of posts published by user
import { IonButton, IonCol, IonContent, IonIcon, IonItem, IonItemDivider, IonRow, IonToolbar } from "@ionic/react";
import { useContext, useEffect, useState } from "react";
import { mycontext } from "../App";
import { ContentConfigServer, datetime2datehour, doRequest } from "../utility";
import ViewPost from "../components/ViewPost";
import { expand, logOut } from "ionicons/icons";

const Profile = () => {
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
            <br />
            <br />
            <br />
            <IonRow>
                <IonToolbar>
                    <h3>Hello {ctx?.User.User}</h3>

                    <ContentConfigServer showButton={true} expand="block" />
                    <IonButton slot="end"
                        color={"danger"} expand="block" onClick={() => {
                            if (confirm("Log out, are you sure?")) {
                                ctx?.showMessage("Okay, bye...", "warning")
                                ctx?.User?.setUser(null)
                            }
                        }}>
                        <IonIcon icon={logOut} />
                    </IonButton>
                </IonToolbar>

            </IonRow>
            <IonItemDivider />
            <>
                <h5>Your posts</h5>
                <IonItem>
                    <IonRow style={{ width: "100%" }}>
                        <IonCol><b>Title</b></IonCol>
                        <IonCol size="4.5"><b>Date</b></IonCol>
                        <IonCol><b>Latitude & longitude</b></IonCol>
                        <IonCol size="2">
                            <IonButton>
                                <IonIcon icon={expand} />
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
                                        <IonIcon icon={expand} />
                                    </IonButton>
                                </IonCol>

                            </IonRow>
                        </IonItem>
                    ))
                }
            </>

            <ViewPost PostSelected={PostSelected} reloadPosts={() => getPosts()} />

        </IonContent >
    )
}

export default Profile