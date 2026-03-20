import { useContext, useEffect, useState } from 'react';
import { TouchableOpacity, Alert, Switch } from 'react-native';
import { ThemedView } from "@/components/themed-view";
import { style } from "@/components/globalstyle";
import { ThemedText } from '@/components/themed-text';
import { ThemedInput } from '@/components/themed-input';
import Geolocation from '@react-native-community/geolocation';



/// FILE SYSTEMS

import { doRequest } from '@/app/utility';
import { MyContext } from '@/app/_layout';
import FileWriter from '@/app/mycomponents/file/FileWriter';
import ExclusivityPicking from '@/app/mycomponents/ExclusivityPicking';
import { ScrollView } from 'react-native-reanimated/lib/typescript/Animated';
////////////////////////////////////////////////////////////////////////////////////////////


const PostWriter = () => {

    const ctx = useContext(MyContext)
    const [fullScreenCamera, setFullScreenCamera] = useState(false)


    /////////////////////////////////////////////////////////////
    const [postData, setPostData] = useState({
        ID: null,
        TITLE: null,
        COMMENT: null,
        AUTHOR_ID: ctx?.User?.User?.UID
    })

    const [currLocation, setCurrLocation] = useState({ // for posting in current location
        lat: null,
        lon: null
    })

    const [exclusivity, setExclusivity] = useState(false);


    //////////////////////////////////////////////////////////////////////


    async function save_post() {


        let dummy_body = postData
        dummy_body.LATITUDE = currLocation.lat
        dummy_body.LONGITUDE = currLocation.lon
        dummy_body.attachments = filesAttached

        doRequest("post_merge", {
            postdata: postData
        }).then(res => {
            console.log("POST MERGE RETURNED::", res);
            if (res?.OK) {
                setPostData(prev => ({
                    ...prev,
                    ID: res?.post_id
                }))
            } else {
                Alert.alert("Post not saved: " + res?.MSG)
            }
        })
    }

    function load_current_location() {
        Geolocation.getCurrentPosition(info => {

            setCurrLocation({
                lat: info?.coords?.latitude,
                lon: info?.coords?.longitude
            })
        });
    }

    useEffect(() => {
        load_current_location()
    }, [])




    // {/* {
    //                     filesAttached?.map(f => (
    //                         <ThemedText key={f?.filename}>
    //                             {f?.filename}
    //                         </ThemedText>
    //                     ))
    //                 } */}

    return (
        <ThemedView style={style.container, {
            flex: 1,
            padding: 20,
            overflow: "visible",
        }}>

            <ThemedText style={style.label}>Category</ThemedText>
            {/* //TODO: category picker */}

            <ThemedText style={style.label}>Title: </ThemedText>
            <ThemedInput placeholder="Title" type="outlined" onChangeText={(text) => {
                setPostData(prev => ({
                    ...prev,
                    TITLE: text
                }));
            }} />
            <ThemedText style={style.label}>Comment:</ThemedText>
            <ThemedInput multiline={true} type="outlined" placeholder='Add a comment..'
                onChangeText={(text) => {
                    setPostData(prev => ({
                        ...prev,
                        COMMENT: text
                    }));
                }}
            />

            <FileWriter fullScreenCamera={() => setFullScreenCamera(!fullScreenCamera)} />

            {/* <ThemedView style={{ width: "100%", height: "50%" }}>
                        <MapViewer isPicking={true} returnLocationChoosen={(coords: Object) => {
                            //TODO: set the coordinate into the post object`
                            console.log(">>", coords?.latitude)
                            }} />
                            </ThemedView> */}

            <ThemedView style={{
                flexDirection: 'row',    // Put text and switch in a row
                alignItems: 'center',
                margin: 20,
                width: "100%"
            }}>
                <ThemedText>Exclusivity</ThemedText>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={exclusivity ? "#78f54b" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => { setExclusivity(!exclusivity) }}
                    value={exclusivity}
                />
            </ThemedView>

            {exclusivity &&
                <ExclusivityPicking />
            }


            {fullScreenCamera ? null :

                <TouchableOpacity style={[style?.buttons?.full_screen, style.colors.geomedia_green]} onPress={() => { save_post() }}>
                    {
                        postData?.ID == null ?
                            <ThemedText>Create</ThemedText>
                            :
                            <ThemedText>Update</ThemedText>

                    }
                </TouchableOpacity>
            }
        </ThemedView>
    );
};
export default PostWriter;
