import { IonButton, IonCardContent, IonCardSubtitle, IonContent, IonHeader, IonIcon, IonModal, IonTitle, IonToolbar } from "@ionic/react";
import { useContext, useEffect, useRef } from "react";

import { datetime2datehour, doRequest } from "../utility";
import { close } from "ionicons/icons";

import { Filesystem, Directory } from '@capacitor/filesystem';
import { mycontext } from "../App";


const ViewPost = (props) => {
    const refModalPost = useRef()
    const ctx = useContext(mycontext)

    async function downloadAudio(file) {
        let checkPer = await Filesystem.checkPermissions()
        let ask = await Filesystem.requestPermissions()
        try {
            let y = await Filesystem.writeFile({
                path: file.MEDIAFILENAME,
                data: file.MEDIADATA,
                directory: Directory.Documents,
            });
            if (y.uri.length > 0) {
                ctx?.showMessage("File saved into Documents folder","success")
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

    useEffect(() => {

        if (props?.PostSelected != null) {
            refModalPost?.current?.present()
        }
    }, [props?.PostSelected])

    return (
        <>

            <IonModal ref={refModalPost}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>{props?.PostSelected?.TITLE}</IonTitle>
                        <IonButton slot="end" color={"danger"} onClick={() => { refModalPost?.current?.dismiss() }}>
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
                            (props?.PostSelected?.MEDIADATA?.length > 0) ?
                                (props?.PostSelected?.MEDIATYPE?.split("/")[0] == "image") ?
                                    <img src={props?.PostSelected?.MEDIADATA} alt="image" />
                                    :
                                    <IonButton mode="md" color={"success"} expand="block" onClick={() => {
                                        downloadAudio(props?.PostSelected)
                                    }}>Download file</IonButton>
                                :
                                null
                        }
                    </IonCardContent>
                    {
                        (ctx?.User?.User == props?.PostSelected?.AUTHOR) ?
                            <IonButton color={"danger"} onClick={() => { deletePost() }} expand="block">DELETE POST</IonButton>
                            :
                            null
                    }
                </IonContent>
            </IonModal>
        </>
    )
}

export default ViewPost