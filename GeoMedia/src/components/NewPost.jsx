// Modal for creation of post (comment, media)

import { IonButton, IonCardSubtitle, IonContent, IonDatetime, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonLabel, IonModal, IonRow, IonTextarea, IonTitle, IonToggle, IonToolbar } from "@ionic/react";
import { add, close, cloudUpload } from 'ionicons/icons';
import { useRef, useState, useContext } from "react";
import { doRequest } from "../utility";
import "../theme/NewPost.css"

import { mycontext } from "../App";

const NewPost = (props) => {
    const refModalPost = useRef()
    const [PostContent, setPostContent] = useState({})
    const ctx = useContext(mycontext)

    //convert blob in base64 (which we store)
    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });

    // fetch server to store the content in input
    async function publishNewPost() {
        let media = document.querySelector('#myfile').files[0]
        let type = null
        let media_b64 = null
        if (media != null) {
            type = media?.type
            media_b64 = await toBase64(media);
        }

        doRequest("newPost", {
            author: ctx?.User?.User,
            postcontent: {
                title: PostContent.TITLE,
                comment: PostContent.COMMENT,
                media_b64: media_b64,
                mediatype: type,
                mediafilename: media?.name,
                // latitude: ctx?.UserPosition[0],
                // longitude: ctx?.UserPosition[1],
                latitude: 47.89,
                longitude: 12.32,
                IS_EXCLUSIVE: PostContent.IS_EXCLUSIVE,
                DATETIME_AVAILABILITY: PostContent.DATETIME_AVAILABILITY,
                AREA_METERS: PostContent.AREA_METERS
            }
        }).then(res => {
            if (res[0].ESITO) {
                refModalPost?.current?.dismiss();
                props?.reloadPosts()
            } else {
                ctx?.showMessage("Something went wrong... try again", "danger")
            }
        }).catch(err => {
            ctx?.showMessage("Something went wrong... try again " + err, "danger")
        })
    }

    return (
        <>
            <IonFab horizontal="end" vertical="bottom">
                <IonFabButton onClick={() => {
                    setPostContent({})
                    refModalPost?.current?.present()
                }}>
                    <IonIcon icon={add} />
                </IonFabButton>
            </IonFab>
            <IonModal ref={refModalPost}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>New post</IonTitle>
                        <IonButton slot='end' color={"danger"} onClick={() => refModalPost?.current?.dismiss()}>
                            <IonIcon icon={close} />
                        </IonButton>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <IonRow>
                        <IonLabel><b>Title</b></IonLabel>
                        <IonInput type="text" placeholder="Title of the post" mode="md" fill="outline"
                            onIonInput={(ev) => {
                                let tmp = PostContent
                                tmp.TITLE = ev.target.value
                                setPostContent({ PostContent, ...tmp })
                            }} />
                    </IonRow>
                    <IonRow>

                        <IonLabel><b>Comment</b></IonLabel>
                        <IonTextarea mode="md" fill="outline" placeholder="Tell something"
                            rows={6}
                            onIonInput={(ev) => {
                                let tmp = PostContent;
                                tmp.COMMENT = ev.target.value
                                setPostContent({ PostContent, ...tmp })
                            }} />
                    </IonRow>
                    <br />
                    <IonRow>
                        <IonLabel><b>Media file</b></IonLabel>
                        <br />
                        <br />
                        <input id="myfile" className="uploadFile" type="file" mode="md" fill="outline" placeholder="Add a media" />

                    </IonRow>
                    <br />
                    <IonRow>
                        <IonToolbar>
                            <IonLabel><b>Exclusivity</b></IonLabel>
                            <IonToggle slot="end"
                                value={PostContent.IS_EXCLUSIVE}
                                id="exclusiveCheck"
                                onIonChange={(ev) => {
                                    let tmp = PostContent;
                                    tmp.IS_EXCLUSIVE = document.getElementById("exclusiveCheck").checked
                                    setPostContent({ PostContent, ...tmp })
                                }}
                            />
                        </IonToolbar>
                        {
                            (PostContent.IS_EXCLUSIVE) ?
                                <IonRow>
                                    <>
                                        <IonLabel><b>Visibility distance</b></IonLabel>
                                        <IonInput
                                            mode="md" fill="outline"
                                            type="number" placeholder="Insert the meters within post will be visibile"
                                            onIonInput={(ev) => {
                                                let tmp = PostContent;
                                                tmp.AREA_METERS = ev.target.value
                                                setPostContent({ PostContent, ...tmp })
                                            }} />
                                    </>
                                    <>
                                        <IonLabel><b>Time availability</b> (Post will be available since the indicated date)</IonLabel>
                                        <br />
                                        <input type="datetime-local" style={{ width: "100%" }}
                                            onInput={(ev) => {
                                                let tmp = PostContent;
                                                
                                                tmp.DATETIME_AVAILABILITY = ev.target.value + ":00"  //add seconds
                                                setPostContent({ PostContent, ...tmp })
                                            }} />
                                    </>
                                </IonRow>
                                :
                                null
                        }

                    </IonRow>

                    <IonButton color={"success"} className="uploadButton" expand="block"
                        onClick={() => {
                            publishNewPost()
                        }}
                    >
                        Publish
                        <IonIcon icon={cloudUpload} />
                    </IonButton>
                </IonContent>

            </IonModal>

        </>
    )
}

export default NewPost;