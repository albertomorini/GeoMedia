import { useContext, useEffect, useRef, useState } from 'react';
import { TouchableOpacity, Switch, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, ToastAndroid } from 'react-native';
import { ThemedView } from "@/components/themed-view";
import { style } from "@/components/globalstyle";
import { ThemedText } from '@/components/themed-text';
import { ThemedInput } from '@/components/themed-input';
import Geolocation from '@react-native-community/geolocation';

import Toast from 'react-native-toast-message';

/// FILE SYSTEMS

import { MyContext } from '@/app/_layout';
import FileHandler from '@/app/mycomponents/file/FileHandler';
import { router, useLocalSearchParams } from 'expo-router';
import { doRequest } from '@/app/utility';
////////////////////////////////////////////////////////////////////////////////////////////


const PostWriter = () => {


    const ctx = useContext(MyContext)
    const [fullScreenCamera, setFullScreenCamera] = useState(false)
    const refFileHandler = useRef()

    /////////////////////////////////////////////////////////////
    const [postData, setPostData] = useState({
        ID: null,
        TITLE: null,
        COMMENT: null,
        AUTHOR_ID: ctx?.User?.User?.UID,
        EXCLUSIVITY: {
            LOCATION: { latitude: null, longitude: null, areakm: null, isremote: false }, //TEST: 51.878232, 0.258271
            DATERANGE: { start: null, end: null },
            USERS: { viewers: [] }
        },
        VISIBILITY_AREA_KM: 2, //default 2km
    })

    // the returned data
    const params = useLocalSearchParams();
    let EXCLUSIVITY_PARAMS = null;
    try {
        EXCLUSIVITY_PARAMS = params.exclusivity ? JSON.parse(params.exclusivity as string) : null;
        console.log("post writer", EXCLUSIVITY_PARAMS);
        //WARNING: not set post data,  otherwise will go on loop to redirection (because we passing as param next)
        // // setPostData(prev => ({
        // //     ...prev,
        // //     EXCLUSIVITY: EXCLUSIVITY_PARAMS
        // // }))

    } catch (err) {
        console.error("Failed to parse", err);
        EXCLUSIVITY_PARAMS = null;
    }


    const [currLocation, setCurrLocation] = useState({ // for posting in current location
        latitude: null,
        longitude: null
    })


    //////////////////////////////////////////////////////////////////////


    async function save_post() {


        let files = refFileHandler?.current?.return_files()

        let dummy_body = postData
        //check if a remote position has been setted, then replace the current one with that one
        dummy_body.LATITUDE = currLocation.latitude
        dummy_body.LONGITUDE = currLocation.longitude
        if (EXCLUSIVITY_PARAMS?.LOCATION?.latitude != null && EXCLUSIVITY_PARAMS?.LOCATION?.longitude != null) {
            dummy_body.LATITUDE = EXCLUSIVITY_PARAMS?.LOCATION?.latitude
            dummy_body.LONGITUDE = EXCLUSIVITY_PARAMS?.LOCATION?.longitude
            //TODO: decide if the area is set a default values or must be setted by user
        }
        dummy_body.EXCLUSIVITY = EXCLUSIVITY_PARAMS
        dummy_body.attachments = files //todo: check on beckaend for naming convention


        doRequest("post_merge", {
            postdata: dummy_body
        }).then(res => {
            console.log("POST MERGE RETURNED::", res);
            if (res?.OK) {
                setPostData(prev => ({
                    ...prev,
                    ID: res?.post_id
                }))

                Toast.show({
                    type: 'success',
                    position: 'bottom',
                    text1: 'Post created',

                });
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

    return (
        <ScrollView
            contentContainerStyle={styles.scrollViewContentContainer}
            keyboardShouldPersistTaps="handled" // Adjusted to allow tapping to dismiss keyboard
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ThemedView style={[styles.container, { flex: 1, padding: 20, overflow: 'visible' }]}>
                    <ThemedText style={style.label}>Category</ThemedText>
                    {/* //TODO: implement category picker */}

                    <ThemedText style={style.label}>Title: </ThemedText>
                    <ThemedInput
                        placeholder="Title"
                        type="outlined"
                        onChangeText={(text) => {
                            setPostData(prev => ({
                                ...prev,
                                TITLE: text
                            }));
                        }}
                    />
                    <ThemedText style={style.label}>Comment:</ThemedText>
                    <ThemedInput
                        multiline={true}
                        type="outlined"
                        placeholder="Add a comment.."
                        onChangeText={(text) => {
                            setPostData(prev => ({
                                ...prev,
                                COMMENT: text
                            }));
                        }}
                    />
                    <ThemedText style={style.label}>Area of visibility (in KM):</ThemedText>
                    <ThemedInput type='outlined' placeholder='Area of visibility in KM' onChangeText={(txt) => {
                        if (isNaN(txt)) {
                            Alert.alert("Must be a number")
                        } else {
                            setPostData(prev => ({
                                ...prev,
                                VISIBILITY_AREA_KM: txt
                            }))
                        }
                    }} />

                    {/* FILE SYSTEM TO UPLOAD AND DOWNLOAD FILES */}
                    <FileHandler
                        fullScreenCamera={() => setFullScreenCamera(!fullScreenCamera)}
                        ref={refFileHandler}
                    />

                    {/* show exclusivity button only if theres no camera open */}
                    {!fullScreenCamera && (
                        <>
                            <TouchableOpacity
                                style={[style.buttons.full_screen, style.colors.geomedia_blue]}
                                onPress={() => {
                                    router.push({
                                        pathname: '/ExclusivityPicking',
                                        params: {
                                            exclusivity: JSON.stringify(postData?.EXCLUSIVITY), /// pass just the exclusivity sections
                                        }
                                    });
                                }}
                            >
                                <ThemedText >Exclusive</ThemedText>
                            </TouchableOpacity>

                        </>
                    )}

                    {/* show save button only if theres no camera open */}
                    {!fullScreenCamera && (
                        <TouchableOpacity
                            style={[style.buttons.full_screen, style.colors.geomedia_green]}
                            onPress={save_post}
                        >
                            <ThemedText>{postData?.ID == null ? 'Create' : 'Update'}</ThemedText>
                        </TouchableOpacity>
                    )}
                </ThemedView>
            </KeyboardAvoidingView>
        </ScrollView>
    );
};
export default PostWriter;


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollViewContentContainer: {
        flexGrow: 1, // allows the scrollview to grow
    },
    exclusivityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 20,
        width: '100%',
    },
});