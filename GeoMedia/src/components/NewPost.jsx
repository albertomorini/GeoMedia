// Modal for creation of post (comment, media)

import { IonButton, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonLabel, IonModal, IonTextarea, IonTitle, IonToolbar } from "@ionic/react";
import { add, close } from 'ionicons/icons';
import { useRef, useState, useContext } from "react";
import { doRequest } from "../utility";

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
    async function publishNewPost(){
        let media = document.querySelector('#myfile').files[0]
        let type=null
        let media_b64=null
        if(media!=null){
            type = media?.type
            media_b64 = await toBase64(media);
        }
        
        doRequest("newPost",{ 
            author: ctx?.User?.User,
            postcontent: {
                title: PostContent.TITLE,
                comment: PostContent.COMMENT,
                media_b64: media_b64,
                mediatype: type,
                mediafilename: media.name,
                latitude: ctx?.UserPosition[0],
                longitude: ctx?.UserPosition[1]
            }
        }).then(res=>{
            if(res[0].ESITO){
                refModalPost?.current?.dismiss();
                props?.reloadPosts()
            }else{
                ctx?.showMessage("Something went wrong... try again","danger")
            }
        }).catch(err=>{
            ctx?.showMessage("Something went wrong... try again "+err,"danger")
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
                    <IonLabel>Title</IonLabel>
                    <IonInput type="text" placeholder="Title" mode="md" fill="outline"
                        onIonInput={(ev) => {
                            let tmp = PostContent
                            tmp.TITLE = ev.target.value
                            setPostContent({ PostContent, ...tmp })
                        }} />
                    <br />
                    <IonLabel>Comment</IonLabel>
                    <IonTextarea mode="md" fill="outline" placeholder="Tell something" 
                    rows={6}
                    onIonInput={(ev) => {
                        let tmp = PostContent;
                        tmp.COMMENT = ev.target.value
                        setPostContent({ PostContent, ...tmp })
                    }} />
                    <br />
                    <IonLabel>Media file</IonLabel>
                    <input id="myfile" type="file" mode="md" fill="outline" placeholder="Add a media" />
                    <br />
                    <br />

                    <IonButton color={"success"} style={{ marginTop: "90%" }} expand="block"
                    onClick={()=>{
                        publishNewPost()
                    }}
                    >Publish</IonButton>
                </IonContent>

            </IonModal>

        </>
    )
}

export default NewPost;