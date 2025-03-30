import { IonButton, IonCardContent, IonCardSubtitle, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonModal, IonTitle, IonToolbar } from "@ionic/react";
import { Map, Marker, ZoomControl } from "pigeon-maps";
import { useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";
import NewPost from "../components/NewPost";

import { Geolocation } from "@capacitor/geolocation"
import { datetime2datehour, doRequest } from "../utility";
import { close } from "ionicons/icons";
import { mycontext } from "../App";

const MyPMap = () => {

    // const [UserPosition, setUserPosition] = useState(null) // the current position of user //TODO: default

    const [PostList, setPostList] = useState([])
    const [PostSelected, setPostSelected] = useState(null)
    const refModalPost = useRef()
    const ctx = useContext(mycontext)

    // async function getPosition() {
    //     let check = await Geolocation.checkPermissions()
    //     // alert(JSON.stringify(check));

    //     if (check.location == "granted" || check.coarseLocation == "granted") {

    //         let location = await Geolocation.getCurrentPosition()
    //         setUserPosition([location.coords.latitude, location.coords.longitude])

    //     } else {//if(check.location=="prompt" || check.coarseLocation=="prompt") {
    //         alert("Permission not granted, ask again")
    //         let x = await Geolocation.requestPermissions()
    //         alert(JSON.stringify(x))
    //     }
    // }

    function getPosts() {
        if (ctx?.UserPosition != null) {
            doRequest("getPosts", {
                latitude: ctx?.UserPosition[0]
                , longitude: ctx?.UserPosition[1]
            }).then(res => {
                console.log(res);
                setPostList(res)
            })
        } else {
            doRequest("getPosts", {
                latitude: null
                , longitude: null
            }).then(res => {
                console.log(res);
                setPostList(res)
            })

        }
    }


    useEffect(() => {
        getPosts();
    }, [])

    return (
        <IonContent>
            {
                (ctx?.UserPosition == null) ?
                    <>
                        <br />
                        <br />
                        <br />
                        <b>Please allow location permission</b>
                    </>
                    :
                    <Map defaultCenter={ctx?.UserPosition} defaultZoom={11}>
                        <ZoomControl />
                        <Marker width={50} anchor={ctx?.UserPosition} color={"#154c79"} />
                        {
                            PostList?.map(s => (
                                <Marker width={50} anchor={[s.LATITUDE, s.LONGITUDE]} color={'red'}
                                    onClick={() => {
                                        setPostSelected(s)
                                        refModalPost?.current?.present()
                                    }}
                                />
                            ))
                        }
                    </Map>
            }

            <NewPost reloadPosts={()=>getPosts()}/>

            <IonModal ref={refModalPost}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>{PostSelected?.TITLE}</IonTitle>
                        <IonButton slot="end" color={"danger"} onClick={() => { refModalPost?.current?.dismiss() }}>
                            <IonIcon icon={close} />
                        </IonButton>
                    </IonToolbar>
                </IonHeader>

                <IonContent className="ion-padding">
                    <>
                        <i>{PostSelected?.COMMENT}</i>
                    </>
                    <IonCardSubtitle>Posted by {PostSelected?.AUTHOR} at {datetime2datehour(PostSelected?.POSTDATETIME)}</IonCardSubtitle>
                    <IonCardContent>
                        {
                            (PostSelected?.MEDIATYPE.split("/")[0] == "image") ?
                                <img src={PostSelected?.MEDIADATA} alt="image" />
                                :
                                <a href={PostSelected?.MEDIADATA} download={PostSelected?.TITLE}>Download file({PostSelected?.MEDIATYPE})</a>
                        }
                    </IonCardContent>

                </IonContent>

            </IonModal>


        </IonContent>
    )
}

export default MyPMap