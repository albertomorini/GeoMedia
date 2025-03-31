import { IonButton, IonCardContent, IonCardSubtitle, IonContent, IonHeader, IonIcon, IonModal, IonTitle, IonToolbar } from "@ionic/react";
import { Map, Marker, ZoomControl } from "pigeon-maps";
import { useContext, useEffect, useRef, useState } from "react";
import NewPost from "../components/NewPost";

import { datetime2datehour, doRequest } from "../utility";
import { close } from "ionicons/icons";
import { mycontext } from "../App";

import { Filesystem, Directory } from '@capacitor/filesystem';

const MyPMap = () => {

    const [PostList, setPostList] = useState([])
    const [PostSelected, setPostSelected] = useState(null)
    const refModalPost = useRef()
    const ctx = useContext(mycontext)


    async function downloadAudio(file) {
        let checkPer = await Filesystem.checkPermissions()
        // let ask = await Filesystem.requestPermissions()
        try {
            let y = await Filesystem.writeFile({
                path: file.TITLE + "." + (file.MEDIATYPE.split("/")[1]), //trying
                data: file.MEDIADATA,
                directory: Directory.Documents,
            });
            if (y.uri.length > 0) {
                ctx?.showMessage("File saved into Documents folder")
            }
        } catch (error) {
            alert(error)
        }
    }

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
                                <Marker width={50} anchor={[s.LATITUDE, s.LONGITUDE]} color={
                                    (s?.MEDIADATA.length > 0) ? '#5078fc' : '#f23c3c'
                                }
                                    onClick={() => {
                                        setPostSelected(s)
                                        refModalPost?.current?.present()
                                    }}
                                />
                            ))
                        }
                    </Map>
            }

            <NewPost reloadPosts={() => getPosts()} />

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
                                <IonButton mode="md" color={"success"} expand="block" onClick={() => {
                                    downloadAudio(PostSelected)
                                }}>Download file</IonButton>
                        }
                    </IonCardContent>

                </IonContent>

            </IonModal>


        </IonContent>
    )
}

export default MyPMap