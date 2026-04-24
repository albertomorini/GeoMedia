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
import { router, Stack, useLocalSearchParams } from 'expo-router';
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
import { useLanguage } from '@/components/LanguageProvider';


////////////////////////////////////////////////////////////////////////////////////////////


const PostCreator = () => {


    const ctx = useContext(MyContext);
    const { langselected } = useLanguage()
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

    /// for exclusivity bottom menu
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
        VISIBILITY_AREA_KM: 2, //default 2km //TODO: sure?
        ///////////
        // these are not stored on post but dinamically loaded and inherited by collection
        COLOR: null,
        ICON: null,
        COLLECTION_NAME: null,
        REMOTE_POSTING_ENABLED: false
    })


    //////////////////////////////////////////////////////////////////////


    const requiredFields = {
        TITLE: (v) => v != null && v.trim().length > 0,
        VISIBILITY_AREA_KM: (v) => v != null && v > 0,
        COLLECTION_ID: (v) => v != null,
    };
    /**
     * check if the post is ok
     * @param body JSON body of the request
     * @returns return the missing values of required fields
     */
    function validatePost(body: object) {
        const missing = [];
        for (const key in requiredFields) {
            const isValid = requiredFields[key](body[key]);
            if (!isValid) {
                missing.push(key);
            }
        }
        return missing;
    }

    /**
     * create/update the post
     */
    async function save_post() {

        let files = await refFileHandler?.current?.return_files()

        let dummy_body = postData
        /// position chosen, if not chosen automatically use the current one
        dummy_body.LATITUDE = coordinateChosen.latitude
        dummy_body.LONGITUDE = coordinateChosen.longitude
        dummy_body.attachments = files //attach files

        // the exclusivity (date, recurrency, viewers) are already setted by the modal
        let missing_fields = validatePost(dummy_body)
        if (
            missing_fields.length > 0
        ) {
            ctx?.showToast({
                type: "error",
                text1: "Missing info",
                text2: JSON.stringify(missing_fields) + " not compiled"
            })
        } else {
            doRequest("post", {
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
                    setTimeout(() => {
                        if (router.canGoBack()) {
                            router.back()
                        }
                    }, 450);
                } else {
                    Alert.alert("Post not saved: " + res?.MSG)
                }
            }).catch(err => {
                ctx?.showToast({
                    type: "error",
                    text1: "Error",
                    text2: "Network error... are you offline?"
                })
            })
        }

    }

    /**
     * load the current position and set into the state, not into the post yet (made during the saving)
     */
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
            doRequest("post/" + postid, {
                "uid": ctx?.getUID()
            }, "GET").then(resQuery => {
                let x = resQuery[0]
                setPostData(prev => ({
                    ...prev,
                    ...x,
                    EXCLUSIVITY: {
                        ...prev.EXCLUSIVITY,
                        VIEWERS: JSON.parse(x?.VIEWERS),
                        DATERANGE: {
                            DATE_START: x?.EXCL_DATE_START,
                            DATE_END: x?.EXCL_DATE_END,
                            RECURRENT: x?.RECURRENT
                        }
                    }
                }));
                setCoordinateChosen(prev => ({
                    ...prev,
                    latitude: x?.LATITUDE,
                    longitude: x?.LONGITUDE
                }))
                refFileHandler?.current?.load_files(x.attachments)
            }).catch(err => {
                Alert.alert("Error reading post", err)
            })
        }
    }

    function deletePost() {
        Alert.alert(
            "Confirm",
            "Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "OK", onPress: () => {
                        doRequest("post/" + postData?.ID, { uid: ctx?.getUID(), password: ctx?.User?.User?.PASSWORD }, "DELETE").then(resQuery => {
                            ctx?.showToast({
                                type: "success",
                                text1: "Post deleted"
                            })
                            router.replace("/(tabs)/(map)/MapViewer")
                        }).catch(err => {
                            ctx?.showToast({
                                type: "error",
                                text1: "Cannot delete post"
                            })
                        })
                    }
                }
            ]
        );
    }

    useEffect(() => {
        load_current_location()
        if (params != null) {
            loadFullPost()
        }
    }, [])


    return (
        <>
            <Stack.Screen
                options={{
                    title: postData?.TITLE?? (langselected?.newm+"post"),
                }}
            />

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
                            <ThemedText style={style.label}>{langselected.collections}</ThemedText>
                            {postData?.COLLECTION_ID == null ?
                                <TouchableOpacity style={[style.colors.geomedia_blue, style.buttons.full_screen]} onPress={() => {
                                    collection_sheet_handler?.current?.snapToIndex(0)
                                }}>
                                    <ThemedText>{langselected.postCreator.pickCollection}</ThemedText>
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

                            <ThemedText style={style.label}>{langselected?.postCreator.title}: </ThemedText>
                            <ThemedInput
                                placeholder={langselected?.postCreator.title}
                                value={postData?.TITLE}
                                type="outlined"
                                onChangeText={(text) => {
                                    setPostData(prev => ({
                                        ...prev,
                                        TITLE: text
                                    }));
                                }}
                            />
                            <ThemedText style={style.label}>{langselected?.postCreator?.comment}:</ThemedText>
                            <ThemedInput
                                multiline={true}
                                type="outlined"
                                value={postData?.COMMENT}
                                placeholder={langselected.postCreator.comment_placeholder}
                                onChangeText={(text) => {
                                    setPostData(prev => ({
                                        ...prev,
                                        COMMENT: text
                                    }));
                                }}
                            />
                            <ThemedText style={style.label}>{langselected?.postCreator?.area}: </ThemedText>
                            <ThemedInput type='outlined'
                                value={postData?.VISIBILITY_AREA_KM.toString()}
                                placeholder={langselected?.postCreator?.area}
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
                                        <ThemedText style={style.label}>{langselected?.postCreator?.locationCurrent}</ThemedText>
                                        :
                                        <>
                                            <ThemedText style={style.label}>{langselected?.postCreator?.locationRemote}:</ThemedText>
                                            <ThemedText>{langselected?.postCreator?.lat}: {coordinateChosen?.latitude}</ThemedText>
                                            <ThemedText>{langselected?.postCreator?.lon}: {coordinateChosen?.longitude}</ThemedText>
                                        </>
                                }

                                <TouchableOpacity
                                    disabled={!postData?.REMOTE_POSTING_ENABLED}
                                    style={[style.buttons.full_screen, (!postData?.REMOTE_POSTING_ENABLED ? style.colors.geomedia_gray : isUsingCurrentLocation() ? style.colors.geomedia_blue : style.colors.geomedia_green), { flexDirection: "row" }]}
                                    onPress={() => { setModalMapVisibility(true) }}>
                                    {
                                        postData?.REMOTE_POSTING_ENABLED ?
                                            <ThemedText>{langselected?.postCreator?.pickLocaton}</ThemedText>
                                            :
                                            <ThemedText>{langselected?.postCreator?.disabledRemote}</ThemedText>
                                    }
                                    <Ionicons name="map-outline" size={28} color={"white"} style={{ marginLeft: 8 }} />
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
                                <ThemedText>{langselected?.exclusivity.title}</ThemedText>
                            </TouchableOpacity>

                            {postData?.ID == null ? null :
                                <TouchableOpacity
                                    style={[style.buttons.full_screen, style.colors.geomedia_red, style.bottom_bar_item, { alignSelf: "center" }]}
                                    onPress={() => {
                                        deletePost()
                                    }}>
                                    <ThemedText>{langselected?.postCreator?.deletePost}</ThemedText>
                                </TouchableOpacity>
                            }


                        </ThemedView>
                    </KeyboardAvoidingView>
                </ScrollView >


                {/* show save button only if theres no camera open */}
                {!fullScreenCamera && (
                    <ThemedView>
                        <TouchableOpacity
                            style={[style.buttons.full_screen, style.colors.geomedia_green, style.bottom_bar_item, { width: "90%", alignSelf: "center" }]}
                            onPress={save_post}
                        >

                            {postData?.ID == null ?
                                <ThemedText>
                                    {langselected.postCreator.create}
                                </ThemedText>
                                :
                                <ThemedText>
                                    {langselected.postCreator.modify}
                                </ThemedText>
                            }
                        </TouchableOpacity>


                    </ThemedView>
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
                                postCreation={"W"}
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
                                EXCLUSIVITY={postData?.EXCLUSIVITY}
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
            </GestureHandlerRootView >
        </>
    );
};
export default PostCreator;
