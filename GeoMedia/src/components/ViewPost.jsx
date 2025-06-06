//modal to view post and download/store media into document folder android
import { IonButton, IonCardContent, IonCardSubtitle, IonCol, IonContent, IonHeader, IonIcon, IonItemDivider, IonModal, IonRow, IonTitle, IonToolbar } from "@ionic/react";
import { useContext, useEffect, useRef, useState } from "react";

import { datetime2datehour, doRequest } from "../utility";
import { close, download } from "ionicons/icons";

import { Filesystem, Directory } from '@capacitor/filesystem';
import { mycontext } from "../App";


const ViewPost = (props) => {
    const refModalPost = useRef()
    const ctx = useContext(mycontext)

    const [DataBase64, setDataBase64] = useState(null)

    async function downloadFile(file) {
        let checkPer = await Filesystem.checkPermissions()
        let ask = await Filesystem.requestPermissions()
        try {
            let y = await Filesystem.writeFile({
                path: file.MEDIAFILENAME,
                data: DataBase64,
                directory: Directory.Documents,
            });
            if (y.uri.length > 0) {
                ctx?.showMessage("File saved into Documents folder", "success")
            }
        } catch (error) {
            alert(error)
        }
    }

    function deletePost() {
        if (confirm("Confirm delete?")) {
            doRequest("deletePost", {
                POSTID: props?.PostSelected?.ID,
                USERNAME: ctx?.User?.User,
                PASSWORD: ctx?.Psw?.Psw
            }).then(resQuery => {
                if (resQuery[0].ESITO) {
                    refModalPost?.current.dismiss();
                    props?.reloadPosts()
                }
            })
        }
    }

    // get the media content in base64, different endpoint due to increment performance
    function getMediaPost(postid) {
        doRequest("getMediaPost", {
            POSTID: postid
        }).then(res => {
            //res[0]?.MEDIADATA
            if (res[0]?.MEDIADATA != null) {
                setDataBase64(res[0]?.MEDIADATA)
            }
        })
    }


    useEffect(() => {
        if (props?.PostSelected != null) {
            refModalPost?.current?.present()
            getMediaPost(props?.PostSelected?.ID)
        }
    }, [props?.PostSelected])

    return (
        <>

            <IonModal ref={refModalPost}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>{props?.PostSelected?.TITLE}</IonTitle>
                        <IonButton slot="end" color={"danger"} onClick={() => {
                            refModalPost?.current?.dismiss();
                            setDataBase64(null)
                        }}>
                            <IonIcon icon={close} />
                        </IonButton>
                    </IonToolbar>
                </IonHeader>

                <IonContent className="ion-padding">
                    <>
                        <i>{props?.PostSelected?.COMMENT}</i>
                    </>
                    <IonCardSubtitle>Posted by {props?.PostSelected?.AUTHOR} at {datetime2datehour(props?.PostSelected?.POSTDATETIME)}</IonCardSubtitle>
                    <IonCardContent>
                        {
                            (DataBase64?.length > 0) ?
                                <>
                                    {(props?.PostSelected?.MEDIATYPE?.split("/")[0] == "image") ?
                                        <img src={DataBase64} alt="image" />
                                        :
                                        null
                                    }
                                    <IonButton mode="md" color={"success"} expand="block" onClick={() => {
                                        downloadFile(props?.PostSelected)
                                    }}>Download file
                                        <IonIcon icon={download} />
                                    </IonButton>
                                </>
                                :
                                null
                        }
                    </IonCardContent>
                    {
                        (ctx?.User?.User == props?.PostSelected?.AUTHOR) ?
                            <>
                                <IonItemDivider mode="md" />
                                <IonRow>
                                    <IonCol size='8'>
                                        <h4>Danger zone</h4>
                                    </IonCol>
                                    <IonCol size='4'>
                                        <IonButton color={"danger"} onClick={() => {
                                            if (confirm("Sure to delete?")) {
                                                deletePost()
                                            }
                                        }} expand="block">DELETE POST</IonButton>
                                    </IonCol>
                                </IonRow>
                            </>
                            :
                            null
                    }
                </IonContent>
            </IonModal>
        </>
    )
}

export default ViewPost