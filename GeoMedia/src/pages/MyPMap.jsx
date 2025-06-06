// main pages, shows the map and fetch server thus to retrieve the posts
import { IonContent } from "@ionic/react";
import { Map, Marker, ZoomControl } from "pigeon-maps";
import { useContext, useEffect, useState } from "react";
import NewPost from "../components/NewPost";

import { doRequest } from "../utility";
import { mycontext } from "../App";

import ViewPost from "../components/ViewPost";

const MyPMap = () => {

    const [PostList, setPostList] = useState([])
    const [PostSelected, setPostSelected] = useState(null)
    const ctx = useContext(mycontext)

    // retrieve all post giving the actual position of user (in the server it will be computed the nearest posts)
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
    }, [ctx?.UserPosition])

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
                            PostList?.map(s => {
                                let dummy_color = '#f23c3c' //red
                                if (s?.MEDIATYPE?.length > 0) {
                                    dummy_color = "#d6c531"
                                }
                                if (s?.IS_EXCLUSIVE) {
                                    dummy_color = "#6fe465"
                                }

                                return (
                                    <Marker width={50} anchor={[s.LATITUDE, s.LONGITUDE]} color={dummy_color}
                                        onClick={() => {
                                            setPostSelected(s)
                                        }}
                                    />

                                )
                            })
                        }
                    </Map>
            }


            <NewPost reloadPosts={() => getPosts()} />

            <ViewPost PostSelected={PostSelected} />


        </IonContent>
    )
}

export default MyPMap