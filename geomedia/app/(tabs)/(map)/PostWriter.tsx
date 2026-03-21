import { useContext, useEffect, useRef, useState } from 'react';
import { TouchableOpacity, Alert, Switch, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedView } from "@/components/themed-view";
import { style } from "@/components/globalstyle";
import { ThemedText } from '@/components/themed-text';
import { ThemedInput } from '@/components/themed-input';
import Geolocation from '@react-native-community/geolocation';



/// FILE SYSTEMS

import { doRequest } from '@/app/utility';
import { MyContext } from '@/app/_layout';
import FileHandler from '@/app/mycomponents/file/FileHandler';
import ExclusivityPicking from '@/app/mycomponents/ExclusivityPicking';
import { Collapsible } from '@/components/ui/collapsible';
////////////////////////////////////////////////////////////////////////////////////////////


const PostWriter = () => {


    const ctx = useContext(MyContext)
    const [fullScreenCamera, setFullScreenCamera] = useState(false)
    const refFileHandler = useRef()
    const refExclusivity = useRef()

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

        let x = refExclusivity?.current?.getExclusivities()
        console.log(">>", x)

        let files = refFileHandler?.current?.return_files()
        postData.files = files //TODO: check on backend
        let dummy_body = postData
        dummy_body.LATITUDE = currLocation.lat
        dummy_body.LONGITUDE = currLocation.lon
        dummy_body.attachments = filesAttached

        // doRequest("post_merge", {
        //     postdata: postData
        // }).then(res => {
        //     console.log("POST MERGE RETURNED::", res);
        //     if (res?.OK) {
        //         setPostData(prev => ({
        //             ...prev,
        //             ID: res?.post_id
        //         }))
        //     } else {
        //         Alert.alert("Post not saved: " + res?.MSG)
        //     }
        // })
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
                    {/* TODO: category picker */}

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

                    <FileHandler
                        fullScreenCamera={() => setFullScreenCamera(!fullScreenCamera)}
                        ref={refFileHandler}
                    />

                    {/* Handle exclusivity option */}
                    {!fullScreenCamera && (
                        <>
                            <ThemedView style={styles.exclusivityContainer}>
                                <ThemedText>Exclusivity</ThemedText>
                                <Switch
                                    trackColor={{ false: style.switch.track_color_false, true: style.switch.track_color_true }}
                                    thumbColor={exclusivity ? style.switch.thumb_color_true : style.switch.thumb_color_false}
                                    ios_backgroundColor="#3e3e3e"
                                    onValueChange={() => setExclusivity(!exclusivity)}
                                    value={exclusivity}
                                />
                            </ThemedView>
                            {exclusivity && <ExclusivityPicking ref={refExclusivity} />}
                        </>
                    )}

                    {/* Handle button to save or update post */}
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