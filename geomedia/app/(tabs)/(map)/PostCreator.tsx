import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Modal, useColorScheme, ScrollView } from 'react-native';
import { ThemedView } from "@/components/themed-view";
import { style } from "@/components/globalstyle";
import { ThemedText } from '@/components/themed-text';
import { ThemedInput } from '@/components/themed-input';
import Geolocation from '@react-native-community/geolocation';

// slider for area
import Slider from '@react-native-community/slider';

/// FILE SYSTEMS

import { MyContext } from '@/app/_layout';
import FileHandler from '@/app/mycomponents/file/FileHandler';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { doRequest, lowercaseKeys } from '@/app/utility';
import { Ionicons } from '@expo/vector-icons';


//////////////////////////////
// bottom sheet and exclusivity/collection handling
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import ExclusivityPicking from './ExclusivityPicking';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ItemIconizable from '@/app/mycomponents/ItemIconizable';
import { useLanguage } from '@/components/LanguageProvider';
import Collections from '../(collections)/Collections';
import MapPicking from './MapPicking';


////////////////////////////////////////////////////////////////////////////////////////////


const PostCreator = () => {


    const ctx = useContext(MyContext);
    const colorScheme = useColorScheme()
    const { langselected } = useLanguage()
    const params = useLocalSearchParams();

    const refFileHandler = useRef()
    const [fullScreenCamera, setFullScreenCamera] = useState(false)
    const [btnCreateDisabled, setBtnCreateDisabled] = useState(false)
    ////////////////////////////////////////////////////////////////////

    const [ModalMapVisibity, setModalMapVisibility] = useState(false)

    const [currentLocation, setCurrentLocation] = useState({
        latitude: null,
        longitude: null,
        altitude: null
    })
    const [coordinateChosen, setCoordinateChosen] = useState({
        latitude: null,
        longitude: null,
        altitude: null
    })

    /// for exclusivity bottom menu
    const snapPoints = useMemo(() => ["50%", '90%'], []);
    const exclusivity_sheet_handler = useRef()
    const collection_sheet_handler = useRef()

    /////////////////////////////////////////////////////////////

    const [PositionOverrided, setPositionOverrided] = useState(false)
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
        VISIBILITY_AREA_KM: 0.6, //default 200m
        ///////////
        // these are not stored on post but dinamically loaded and inherited by collection
        COLOR: null,
        ICON: null,
        COLLECTION_NAME: null,
        REMOTE_POSTING_ENABLED: false
    })


    //////////////////////////////////////////////////////////////////////


    const requiredFields = {
        title: (v) => v != null && v.trim().length > 0,
        visibility_area_km: (v) => v != null && v > 0,
        collection_id: (v) => v != null,
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

        setBtnCreateDisabled(true) //thus to avoid double click
        ctx?.showToast({
            type: "info",
            text1: langselected.postCreator.saving,
        })
        let files = await refFileHandler?.current?.return_files()

        let dummy_body = postData


        //SET THE POSITION ONLY ON NEW POSTS OR IN EDIT WHEN POSITION OVVERRIDED (it has changed, otherwise will override always even on different changes (like title/comments/etc))
        if (
            (PositionOverrided && (dummy_body.ID != undefined || dummy_body.ID != -1))
            ||
            dummy_body.ID == undefined
        ) {
            /// position chosen, if not chosen automatically use the current one
            dummy_body.LATITUDE = coordinateChosen.latitude
            dummy_body.LONGITUDE = coordinateChosen.longitude
            dummy_body.ALTITUDE = coordinateChosen.altitude
            if (coordinateChosen.longitude != currentLocation.longitude) { //remove altitude if location chosen
                dummy_body.ALTITUDE = null
            }
        }
        dummy_body.attachments = files //attach files
        dummy_body = lowercaseKeys(dummy_body)

        // the exclusivity (date, recurrency, viewers) are already setted by the modal
        let missing_fields = validatePost(dummy_body)
        if (missing_fields.length > 0) {
            ctx?.showToast({
                type: "error",
                text1: langselected.reportPost.missing_data,
                text2: langselected.requiredfields + JSON.stringify(missing_fields)
            })
            setBtnCreateDisabled(false)

        } else {
            console.log("going", dummy_body);

            doRequest("post", dummy_body, "POST").then(res => {
                if (res?.OK) {
                    setBtnCreateDisabled(false)
                    setPostData(prev => ({
                        ...prev,
                        ID: res?.post_id
                    }))
                    ctx?.showToast({
                        type: 'success',
                        text1: langselected.postCreator.saved,
                    });
                    setTimeout(() => {
                        if (router.canGoBack()) {
                            router.back()
                        }
                    }, 1000);
                } else {
                    setBtnCreateDisabled(false)

                    ctx?.showToast({
                        type: "error",
                        text1: langselected.network.offline1,
                        text2: langselected.network.offline2,
                    })
                }
            }).catch(err => {
                setBtnCreateDisabled(false)

                ctx?.showToast({
                    type: "error",
                    text1: langselected.network.offline1,
                    text2: langselected.network.offline2,
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
                        "altitude": position?.coords?.altitude
                    })
                )
                setCurrentLocation(
                    prev => ({
                        ...prev,
                        "latitude": position?.coords?.latitude,
                        "longitude": position?.coords?.longitude,
                        "altitude": position?.coords?.altitude
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
        ctx?.showToast({
            type: "info",
            text1: langselected.loadingPost,
        })
        let postid = null;
        try {
            postid = params.postid ? JSON.parse(params.postid as string) : null;
        } catch (e) {
            console.error("Failed to parse postData", e);
            postid = null;
        }
        if (postid != null) {
            doRequest("post/id/" + postid, {
                "uid": ctx?.getUID()
            }, "GET").then(resQuery => {
                let x = resQuery[0]
                setPostData(prev => ({
                    ...prev,
                    ...x,
                    EXCLUSIVITY: {
                        ...prev.EXCLUSIVITY,
                        VIEWERS: x?.VIEWERS ? JSON.parse(x.VIEWERS) : [],
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
                    longitude: x?.LONGITUDE,
                    altitude: x?.ALTITUDE
                }))
                refFileHandler?.current?.load_files(x.attachments)
            }).catch(err => {
                ctx?.showToast({
                    type: "error",
                    text1: langselected.network.offline1,
                    text2: langselected.network.offline2,
                })
            })
        }
    }

    function deletePost() {
        Alert.alert(
            langselected.confirm,
            langselected.fileUpload.confirm,
            [
                { text: langselected.cancel, style: "cancel" },
                {
                    text: "OK", onPress: () => {
                        doRequest("post/" + postData?.ID, { password: ctx?.User?.User?.PASSWORD }, "DELETE").then(resQuery => {
                            ctx?.showToast({
                                type: "success",
                                text1: langselected.postCreator.postdeleted
                            })
                            router.replace("/(tabs)/(map)/MapViewer")
                        }).catch(err => {
                            ctx?.showToast({
                                type: "error",
                                text1: langselected.network.offline1,
                                text2: langselected.network.offline2,
                            })
                        })
                    }
                }
            ]
        );
    }

    useFocusEffect( //to handle the back on routing
        useCallback(async () => {
            load_current_location()
            if (params?.postid != null) {
                loadFullPost()
            }
        }, []) //when position or collections change (or are loaded) refresh posts
    )


    return (
        <>
            <Stack.Screen
                options={{
                    title: postData?.TITLE ?? (langselected?.newm + "post"),
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
                                <TouchableOpacity style={[style.colors.geomedia_blue, style.buttons.full_screen]}
                                    accessibilityRole="button"
                                    accessibilityLabel={langselected.postCreator.pickCollection}
                                    onPress={() => {
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
                            <ThemedText style={style.label}>{langselected?.postCreator?.area}: {postData?.VISIBILITY_AREA_KM} KM </ThemedText>
                            <Slider
                                style={{ width: "100%", height: 40 }}
                                minimumValue={0.2}
                                maximumValue={30}
                                minimumTrackTintColor="#b03535"
                                maximumTrackTintColor="#d62f2f"
                                thumbTintColor={"rgb(170, 170, 163)"}
                                thumbSize={22}
                                value={parseFloat(postData?.VISIBILITY_AREA_KM)}
                                step={0.2}
                                onValueChange={(val) => {
                                    let rounded = val.toFixed(2)
                                    setPostData(prev => ({ ...prev, VISIBILITY_AREA_KM: rounded }))

                                }}
                                // onSlidingComplete={(val) => {
                                //     let rounded = val.toFixed(2)
                                //     setPostData(prev => ({ ...prev, VISIBILITY_AREA_KM: rounded }))
                                // }}
                            />
                            <>
                                {
                                    isUsingCurrentLocation() ?
                                        <ThemedText style={style.label}>{langselected?.postCreator?.locationCurrent}</ThemedText>
                                        :
                                        <>
                                            <ThemedText style={style.label}>{langselected?.postCreator?.locationRemote}:</ThemedText>
                                            <ThemedText>
                                                {langselected?.postCreator?.lat}: {coordinateChosen?.latitude?.toFixed(2)}
                                                {"   "}
                                                {langselected?.postCreator?.lon}: {coordinateChosen?.longitude?.toFixed(2)}
                                            </ThemedText>
                                        </>
                                }

                                <TouchableOpacity
                                    disabled={!postData?.REMOTE_POSTING_ENABLED}
                                    style={[style.buttons.full_screen, (!postData?.REMOTE_POSTING_ENABLED ? style.colors.geomedia_gray : isUsingCurrentLocation() ? style.colors.geomedia_blue : style.colors.geomedia_green), { flexDirection: "row" }]}
                                    accessibilityRole="button"
                                    accessibilityLabel={postData?.REMOTE_POSTING_ENABLED ? langselected?.postCreator?.pickLocaton : langselected?.postCreator?.disabledRemote}
                                    onPress={() => {
                                        setModalMapVisibility(true)
                                        setPositionOverrided(true)
                                    }}>
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
                                                }}
                                                cancel={() => {
                                                    setModalMapVisibility(false); // close map modal
                                                    setCoordinateChosen(currentLocation)
                                                }}
                                            />
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

                            <TouchableOpacity style={[style.buttons.full_screen, style.colors.geomedia_blue]}
                                accessibilityRole="button"
                                accessibilityLabel={langselected?.exclusivity.title}
                                onPress={() => {
                                    exclusivity_sheet_handler.current?.snapToIndex(0);

                                }}>
                                <ThemedText>{langselected?.exclusivity.title}</ThemedText>
                            </TouchableOpacity>

                            {postData?.ID == null ? null :
                                <TouchableOpacity
                                    accessibilityRole="button"
                                    accessibilityLabel={langselected?.postCreator?.deletePost}
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
                            disabled={btnCreateDisabled}
                            style={[style.buttons.full_screen, style.colors.geomedia_green, style.bottom_bar_item, { width: "90%", alignSelf: "center" }]}
                            onPress={save_post}
                            accessibilityRole="button"
                            accessibilityLabel={postData?.ID == null ?
                                langselected.postCreator.create : langselected.postCreator.confirm_changes
                            }
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
                        width: "100%",
                        margin: 0,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        backgroundColor: colorScheme === 'dark' ? '#121212' : '#fff', // must be forced not dynamic, in my opinion is quite bugged but whatever tho
                    }}
                >
                    <BottomSheetScrollView contentContainerStyle={{ flex: 1, lexGrow: 1, }}

                        keyboardShouldPersistTaps="handled"
                    >
                        <Collections
                            isBottomSheet={true}//thus to render the list
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
