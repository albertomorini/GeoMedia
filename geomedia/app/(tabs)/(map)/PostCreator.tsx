import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Modal, useColorScheme, ScrollView } from 'react-native';
import { ThemedView } from "@/components/themed-view";
import { style } from "@/components/globalstyle";
import { ThemedText } from '@/components/themed-text';
import { ThemedInput } from '@/components/themed-input';
import Geolocation from '@react-native-community/geolocation';


/// FILE SYSTEMS

import { MyContext } from '@/app/_layout';
import FileHandler from '@/app/mycomponents/file/FileHandler';
import { router, useLocalSearchParams } from 'expo-router';
import { doRequest } from '@/app/utility';
import { Ionicons } from '@expo/vector-icons';
import MapPicking from '@/app/mycomponents/MapPicking';

//////////////////////////////
// bottom sheet and exclusivity/collection handling
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import ExclusivityPicking from './ExclusivityPicking';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CollectionsList from '../(collections)/CollectionsList';
import ItemIconizable from '@/app/mycomponents/ItemIconizable';


////////////////////////////////////////////////////////////////////////////////////////////


const PostCreator = () => {


    const ctx = useContext(MyContext)
    const params = useLocalSearchParams();

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
    const snapPoints = useMemo(() => ["50%", '90%'], []);
    const exclusivity_sheet_handler = useRef()
    const collection_sheet_handler = useRef()

    /////////////////////////////////////////////////////////////



    const [postData, setPostData] = useState({
        ID: null,
        COLLECTION_ID: null,
        TITLE: null,
        COMMENT: null,
        AUTHOR_ID: ctx?.getUID(),
        EXCLUSIVITY: {
            DATERANGE: { DATE_START: null, DATE_END: null },
            VIEWERS: []
        },
        VISIBILITY_AREA_KM: 2, //default 2km
        ///////////
        // these are not stored on post but dinamically loaded and inherited by collection
        COLOR: null,
        ICON: null,
        COLLECTION_NAME: null,
        REMOTE_POSTING_ENABLED: false
    })


    //////////////////////////////////////////////////////////////////////


    async function save_post() {

        let files = await refFileHandler?.current?.return_files()

        let dummy_body = postData
        /// position chosen, if not chosen automatically use the current one
        dummy_body.LATITUDE = coordinateChosen.latitude
        dummy_body.LONGITUDE = coordinateChosen.longitude
        dummy_body.attachments = files //attach files

        // the exclusivity (date, recurrency, viewers) are already setted by the modal
        console.log("POSTCREATION", dummy_body)

        doRequest("post_merge", {
            postdata: dummy_body
        }).then(res => {
            if (res?.OK) {
                setPostData(prev => ({
                    ...prev,
                    ID: res?.post_id
                }))
                ctx?.showToast({
                    type: 'success',
                    text1: 'Post saved!',
                });
                if (router.canGoBack()) {
                    router.back()
                }
            } else {
                Alert.alert("Post not saved: " + res?.MSG)
            }
        })
    }

    function load_current_location() {
        Geolocation.getCurrentPosition(
            position => {
                setCoordinateChosen(
                    prev => ({
                        ...prev,
                        "latitude": position?.coords?.latitude,
                        "longitude": position?.coords?.longitude,
                    })
                )
                setCurrentLocation(
                    prev => ({
                        ...prev,
                        "latitude": position?.coords?.latitude,
                        "longitude": position?.coords?.longitude,
                    })
                )
            },
            error => {
                console.error('Location error:', error);
                Alert.alert('Error getting location', error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            }
        );
    }

    function isUsingCurrentLocation() {
        return coordinateChosen?.latitude == currentLocation.latitude && coordinateChosen.longitude == currentLocation.longitude
    }


    function loadFullPost() {
        let postid = null;
        try {
            postid = params.postid ? JSON.parse(params.postid as string) : null;
        } catch (e) {
            console.error("Failed to parse postData", e);
            postid = null;
        }
        if (postid != null) {
            doRequest("post_get_fullpost", {
                "postid": postid,
                "uid": ctx?.getUID()
            }).then(resQuery => {
                let x = resQuery[0]
                setPostData(prev => ({
                    ...prev,
                    ...x,
                    EXCLUSIVITY: {
                        ...prev.EXCLUSIVITY,
                        VIEWERS: JSON.parse(x?.VIEWERS)
                        //TODO: check for DATERANGE
                    }
                }));
                refFileHandler?.current?.load_files(x.attachments)
            }).catch(err => {
                Alert.alert("Error reading post", err)
            })
        }
    }

    useEffect(() => {
        load_current_location()
        if (params != null) {
            loadFullPost()
        }
    }, [])


    return (
        <GestureHandlerRootView style={{ flex: 1 }}>

            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled" // Adjusted to allow tapping to dismiss keyboard
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <ThemedView style={[{ flex: 1, padding: 20, overflow: 'visible' }]}>
                        <ThemedText style={style.label}>Collections</ThemedText>
                        {postData?.COLLECTION_ID == null ?
                            <TouchableOpacity style={[style.colors.geomedia_blue, style.buttons.full_screen]} onPress={() => {
                                collection_sheet_handler?.current?.snapToIndex(0)
                            }}>
                                <ThemedText>Select collection</ThemedText>
                            </TouchableOpacity>
                            :
                            <ItemIconizable
                                onPress={() => {
                                    collection_sheet_handler?.current?.snapToIndex(0)
                                }}
                                item={{
                                    ICON: postData?.ICON,
                                    COLOR: postData?.COLOR,
                                    TITLE: postData?.COLLECTION_NAME
                                }} />
                        }

                        <ThemedText style={style.label}>Title: </ThemedText>
                        <ThemedInput placeholder="Title"
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
                        <ThemedText style={style.label}>Area of visibility (in KM): </ThemedText>
                        <ThemedInput type='outlined'
                            value={postData?.VISIBILITY_AREA_KM.toString()}
                            placeholder='Area of visibility in KM'
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
                                disabled={!postData?.REMOTE_POSTING_ENABLED}
                                style={[style.buttons.full_screen, (!postData?.REMOTE_POSTING_ENABLED ? style.colors.geomedia_gray : isUsingCurrentLocation() ? style.colors.geomedia_blue : style.colors.geomedia_green), { flexDirection: "row" }]}
                                onPress={() => { setModalMapVisibility(true) }}>
                                {
                                    postData?.REMOTE_POSTING_ENABLED ?
                                        <ThemedText>Choose the location</ThemedText>
                                        :
                                        <ThemedText>Disabled by collection</ThemedText>
                                }
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
                            postid={postData?.ID}
                        />

                        <TouchableOpacity style={[style.buttons.full_screen, style.colors.geomedia_blue]} onPress={() => {
                            exclusivity_sheet_handler.current?.snapToIndex(0);

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
                            ref={collection_sheet_handler}
                            index={-1} // start closed
                            snapPoints={snapPoints}
                            enablePanDownToClose={true} // drag down to close
                            backgroundStyle={{
                                borderTopWidth: 1,
                                borderEndWidth: 1,
                                borderStartWidth: 1,
                                borderColor: useColorScheme() === 'dark' ? '#fff' : '#121212', // must be forced not dynamic, in my opinion is quite bugged but whatever tho
                                borderTopLeftRadius: 24,
                                borderTopRightRadius: 24,
                                backgroundColor: useColorScheme() === 'dark' ? '#121212' : '#fff', // must be forced not dynamic, in my opinion is quite bugged but whatever tho
                            }}
                        >
                            <BottomSheetScrollView style={{ flex: 1 }}
                                contentContainerStyle={{ paddingBottom: 20 }}
                                keyboardShouldPersistTaps="handled"
                            >
                                <ThemedView>
                                    <CollectionsList
                                        allowCreation={true}
                                        onSelect={(cat: Object) => {
                                            collection_sheet_handler?.current?.close()
                                            setPostData(prev => ({
                                                ...prev,
                                                COLLECTION_ID: cat?.ID,
                                                COLLECTION_NAME: cat?.TITLE,
                                                COLOR: cat?.COLOR,
                                                ICON: cat?.ICON,
                                                REMOTE_POSTING_ENABLED: cat?.REMOTE_POSTING
                                            }))
                                        }} />
                                </ThemedView>
                            </BottomSheetScrollView>
                        </BottomSheet>

                        <BottomSheet
                            ref={exclusivity_sheet_handler}
                            index={-1} // start closed
                            snapPoints={snapPoints}
                            enablePanDownToClose={true} // drag down to close
                            backgroundStyle={{
                                borderTopWidth: 1,
                                borderEndWidth: 1,
                                borderStartWidth: 1,
                                borderColor: useColorScheme() === 'dark' ? '#fff' : '#121212', // must be forced not dynamic, in my opinion is quite bugged but whatever tho

                                borderTopLeftRadius: 24,
                                borderTopRightRadius: 24,
                                backgroundColor: useColorScheme() === 'dark' ? '#121212' : '#fff', // must be forced not dynamic, in my opinion is quite bugged but whatever tho
                            }}
                        >
                            <BottomSheetScrollView style={{ flex: 1 }}
                                contentContainerStyle={{ paddingBottom: 20 }}
                                keyboardShouldPersistTaps="handled"
                            >
                                <ThemedView>
                                    <ExclusivityPicking
                                        creatorEnabled={false}
                                        exclusivity={postData?.EXCLUSIVITY}
                                        setExclusivity={(obj) => {
                                            setPostData(prev => ({
                                                ...prev,
                                                EXCLUSIVITY: obj
                                            }));
                                            exclusivity_sheet_handler?.current?.close()
                                        }} />
                                </ThemedView>
                            </BottomSheetScrollView>
                        </BottomSheet>



                    </ThemedView>
                </KeyboardAvoidingView>
            </ScrollView >
        </GestureHandlerRootView >

    );
};
export default PostCreator;
