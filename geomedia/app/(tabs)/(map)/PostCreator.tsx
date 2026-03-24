import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { TouchableOpacity, Switch, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, ToastAndroid, Modal, useColorScheme } from 'react-native';
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
import { Ionicons } from '@expo/vector-icons';
import MapPicking from '@/app/mycomponents/MapPicking';

import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import ExclusivityPicking from './ExclusivityPicking';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


////////////////////////////////////////////////////////////////////////////////////////////


const PostCreator = () => {


    const ctx = useContext(MyContext)
    const refFileHandler = useRef()
    const [fullScreenCamera, setFullScreenCamera] = useState(false)
    ////////////////////////////////////////////////////////////////////

    const [ModalMapVisibity, setModalMapVisibility] = useState(false)

    const [currentLocation, setCurrentLocation] = useState({
        latitude: null,
        longitude: null,
    })
    const [coordinateChosen, setCoordinateChosen] = useState({
        latitude: null,
        longitude: null,
    })

    /// for excluivity bottom menu
    const snapPoints = useMemo(() => ['90%', '100%'], []);
    const bottomSheetRef = useRef()

    /////////////////////////////////////////////////////////////
    const [postData, setPostData] = useState({
        ID: null,
        TITLE: null,
        COMMENT: null,
        AUTHOR_ID: ctx?.getUID(),
        EXCLUSIVITY: {
            DATERANGE: { DATE_START: null, DATE_END: null },
            USERS: { viewers: [] }
        },
        VISIBILITY_AREA_KM: 2, //default 2km
    })

    //////////////////////////////////////////////////////////////////////


    async function save_post() {

        let files = refFileHandler?.current?.return_files()

        let dummy_body = postData
        /// position chosen, if not chosen automatically use the current one
        dummy_body.LATITUDE = coordinateChosen.latitude
        dummy_body.LONGITUDE = coordinateChosen.longitude
        dummy_body.attachments = files //attach files

        // the exclusivity (date, recurrency, viewers) are already setted by the modal

        doRequest("post_merge", {
            postdata: dummy_body
        }).then(res => {
            console.log("POST MERGE RETURNED::", res);
            if (res?.OK) {
                setPostData(prev => ({
                    ...prev,
                    ID: res?.post_id
                }))
                console.log(ctx);

                /// TODO: check, not working now
                ctx?.showToast({
                    type: 'success',        // 'success', 'error', 'info'
                    text1: 'Post saved!',
                    position: 'bottom',     // <-- Set position to bottom
                    visibilityTime: 3000,   // duration in ms
                });
            } else {
                Alert.alert("Post not saved: " + res?.MSG)
            }
        })
    }

    function load_current_location() {
        Geolocation.getCurrentPosition(info => {
            setCoordinateChosen({
                latitude: info?.coords?.latitude,
                longitude: info?.coords?.longitude,
            })
            setCurrentLocation({
                latitude: info?.coords?.latitude,
                longitude: info?.coords?.longitude,
            })
        });
    }

    function isUsingCurrentLocation() {
        return coordinateChosen?.latitude == currentLocation.latitude && coordinateChosen.longitude == currentLocation.longitude
    }

    useEffect(() => {
        load_current_location()
    }, [])


    return (
        <GestureHandlerRootView style={{ flex: 1 }}>

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
                            value={postData?.TITLE}
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
                            value={postData?.COMMENT}
                            placeholder="Add a comment.."
                            onChangeText={(text) => {
                                setPostData(prev => ({
                                    ...prev,
                                    COMMENT: text
                                }));
                            }}
                        />
                        <ThemedText style={style.label}>Area of visibility (in KM):</ThemedText>
                        <ThemedInput type='outlined' placeholder='Area of visibility in KM'
                            value={postData?.VISIBILITY_AREA_KM}
                            onChangeText={(txt) => {
                                if (isNaN(txt)) {
                                    Alert.alert("Must be a number")
                                } else {
                                    setPostData(prev => ({
                                        ...prev,
                                        VISIBILITY_AREA_KM: txt
                                    }))
                                }
                            }} />

                        <>
                            {
                                isUsingCurrentLocation() ?
                                    <ThemedText style={style.label}>Currently using current location</ThemedText>
                                    :
                                    <>
                                        <ThemedText style={style.label}>Remote location setted:</ThemedText>
                                        <ThemedText>Latitude: {coordinateChosen?.latitude}</ThemedText>
                                        <ThemedText>longitude: {coordinateChosen?.longitude}</ThemedText>
                                    </>
                            }

                            <TouchableOpacity
                                style={[style.buttons.full_screen, (isUsingCurrentLocation() ? style.colors.geomedia_blue : style.colors.geomedia_green), { flexDirection: "row" }]}
                                onPress={() => { setModalMapVisibility(true) }}>
                                <ThemedText>Choose the location</ThemedText>
                                <Ionicons name="map-outline" size={28} color={"white"} />
                            </TouchableOpacity>
                            <ThemedView>
                                <Modal
                                    animationType="slide"
                                    transparent={false}
                                    visible={ModalMapVisibity}
                                    onRequestClose={() => {
                                        setModalMapVisibility(false)
                                    }}
                                >
                                    <>
                                        <MapPicking
                                            coordinateChosen={coordinateChosen}
                                            returnLocationChoosen={(coords) => {
                                                setModalMapVisibility(false); // close map modal
                                                setCoordinateChosen(coords)
                                            }} />
                                    </>
                                </Modal>
                            </ThemedView>
                        </>

                        {/* FILE SYSTEM TO UPLOAD AND DOWNLOAD FILES */}
                        <FileHandler
                            fullScreenCamera={() => setFullScreenCamera(!fullScreenCamera)}
                            ref={refFileHandler}
                        />

                        <TouchableOpacity style={[style.buttons.full_screen, style.colors.geomedia_blue]} onPress={() => {
                            bottomSheetRef.current?.snapToIndex(0);

                        }}>
                            <ThemedText>Exclusivity</ThemedText>
                        </TouchableOpacity>


                        {/* show save button only if theres no camera open */}
                        {!fullScreenCamera && (
                            <TouchableOpacity
                                style={[style.buttons.full_screen, style.colors.geomedia_green]}
                                onPress={save_post}
                            >
                                <ThemedText>{postData?.ID == null ? 'Create' : 'Update'}</ThemedText>
                            </TouchableOpacity>
                        )}

                        <BottomSheet
                            ref={bottomSheetRef}
                            index={-1} // start closed
                            snapPoints={snapPoints}
                            enablePanDownToClose={true} // drag down to close
                            backgroundStyle={{
                                borderTopLeftRadius: 24,
                                borderTopRightRadius: 24,
                                backgroundColor: useColorScheme() === 'dark' ? '#121212' : '#fff', // must be forced not dynamic, in my opinion is quite bugged but whatever tho
                            }}
                        >
                            <BottomSheetView style={{ flex: 1 }}>
                                <ThemedView>
                                    <ExclusivityPicking
                                        exclusivity={postData?.EXCLUSIVITY}
                                        setExclusivity={(obj) => {
                                            setPostData(prev => ({
                                                ...prev,
                                                EXCLUSIVITY: obj
                                            }));
                                            bottomSheetRef?.current?.close()
                                        }} />
                                </ThemedView>
                            </BottomSheetView>
                        </BottomSheet>
                    </ThemedView>
                </KeyboardAvoidingView>
            </ScrollView >
        </GestureHandlerRootView>

    );
};
export default PostCreator;


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