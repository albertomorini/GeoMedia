import { IonContent } from "@ionic/react";
import { Map, Marker, ZoomControl } from "pigeon-maps";
import { useContext, useEffect, useRef, useState } from "react";
import NewPost from "../components/NewPost";

import { doRequest } from "../utility";
import { mycontext } from "../App";

import ViewPost from "../components/ViewPost";

const MyPMap = () => {

    const [PostList, setPostList] = useState([])
    const [PostSelected, setPostSelected] = useState(null)
    const refModalPost = useRef()
    const ctx = useContext(mycontext)


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
                                    (s?.MEDIADATA?.length > 0) ? '#d6c531' : '#f23c3c'
                                }
                                    onClick={() => {
                                        setPostSelected(s)
                                        //refModalPost?.current?.present()
                                    }}
                                />
                            ))
                        }
                    </Map>
            }

            {/* <Map defaultCenter={[45, 12]} defaultZoom={11}>
                <ZoomControl />
                <Marker width={50} anchor={[45,12]} color={"#154c79"} />
                {
                    PostList?.map(s => (
                        <Marker width={50} anchor={[s.LATITUDE, s.LONGITUDE]} color={
                            (s?.MEDIADATA?.length > 0) ? '#d6c531' : '#f23c3c'
                        }
                            onClick={() => {
                                setPostSelected(s)
                                //refModalPost?.current?.present()
                            }}
                        />
                    ))
                }
            </Map> */}

            <NewPost reloadPosts={() => getPosts()} />

            <ViewPost PostSelected={PostSelected} />


        </IonContent>
    )
}

export default MyPMap