import { IonContent, IonHeader, IonTitle, IonToolbar } from "@ionic/react"
import { Map, Marker } from "pigeon-maps"
import { useEffect, useState } from "react"

const MyPMap = () => {

    const [UserPosition, setUserPosition] = useState([45.96,12.32]) // the current position of user //TODO: default


    const [PostList,setPostList] = useState([])

    useEffect(()=>{
        setTimeout(() => {
            console.log("OK");
            
            // setUserPosition([
            //     45.96,
            //     12.32
            // ])

            let tmp = []
            tmp.push([47.96,12.32])
            tmp.push([44.96,12.32])
            setPostList([...tmp])
        }, 2000);
    },[])

    return (
        <IonContent>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Geo Media</IonTitle>
                </IonToolbar>
            </IonHeader>
            <Map defaultCenter={UserPosition} defaultZoom={11}>
                <Marker width={50} anchor={UserPosition} />
                {
                    PostList?.map(s=>(
                        <Marker width={50} anchor={s} />
                    ))
                }
            
            
            </Map>

        </IonContent>
    )
}

export default MyPMap