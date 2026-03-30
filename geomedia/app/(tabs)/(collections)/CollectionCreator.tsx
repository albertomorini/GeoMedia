import { MyContext } from "@/app/_layout";
import IconColorPickerModal from "@/app/mycomponents/IconColorPicker";
import { style } from "@/components/globalstyle";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Switch, TouchableOpacity, useColorScheme } from "react-native";
import ExclusivityPicking from "../(map)/ExclusivityPicking";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { doRequest } from "@/app/utility";
import { router, useLocalSearchParams } from "expo-router";


const CollectionCreator = () => {

    const ctx = useContext(MyContext)
    const params = useLocalSearchParams();


    /// for excluivity bottom menu
    const snapPoints = useMemo(() => ['90%', '100%'], []);
    const bottomSheetRef = useRef()

    const [showIconPicker, setShowIconPicker] = useState(false)
    const colorScheme = useColorScheme();

    ////
    const [collectionData, setCollectionData] = useState({
        "ID": null,
        "TITLE": null,
        "OWNERID": ctx?.getUID(),
        "DESCRIPTION": null,
        "CREATORS": [],
        "VIEWERS": [],
        "EXCL_DATE_START": null,
        "EXCL_DATE_END": null,
        "RECURRENT": null,
        "REMOTE_POSTING": false,
        "SEQUENTIALS": null,
        "ICON": null,
        "COLOR": null,
    });


    function loadFullCollection() {
        let collectionid = null;
        try {
            collectionid = params.collectionid ? JSON.parse(params.collectionid as string) : null;
        } catch (e) {
            console.error("Failed to parse collection data", e);
            collectionid = null;
        }
        if (collectionid != null) {
            doRequest("collections_get_fullcollection", {
                "collectionid": collectionid,
                "uid": ctx?.getUID()
            }).then(resQuery => {
                let x = resQuery[0];
                setCollectionData(prev => ({
                    ...prev,
                    ...x,
                    VIEWERS: JSON.parse(x?.VIEWERS),
                    CREATORS: JSON.parse(x?.CREATORS),
                }));
            }).catch(err => {
                Alert.alert("Err loading collection", err)
            })
        }
    }

    function save_collection() {
        doRequest("collection_merge", {
            collectionData: collectionData
        }).then(resQuery => {
            if (resQuery[0]?.OK) {
                setCollectionData(prev => ({
                    ...prev,
                    ID: resQuery[0]?.ID
                }))
                ctx?.showToast({
                    type: "success",
                    text1: "Collection saved"
                })
                setTimeout(() => {
                    if (router.canGoBack()) { //TODO: check on post creation if allowed new cat
                        router.back()
                    }
                }, 450);
            } else {
                ctx?.showToast({
                    type: "error",
                    text1: "Error",
                    text2: resQuery[0]?.MSG
                })
            }
        }).catch(err => {
            ctx?.showToast({
                type: "error",
                text1: "Network error",
                text2: JSON.stringify(err)
            })
        })
    }

    useEffect(() => {
        if (params != null) {
            loadFullCollection()
        }
    }, [])

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemedView style={[style.container, { height: "100%" }]}>

                <ThemedView style={{
                    flexDirection: "row",
                    width: "100%",
                    justifyContent: "space-between",

                }}>
                    <TouchableOpacity
                        key={"chose"}
                        onPress={() => setShowIconPicker(true)}
                        style={{
                            width: '25%',
                            alignItems: 'center',
                            marginTop: 7,
                            left: -20,
                        }}
                    >
                        <ThemedView
                            style={[
                                style.circleIcon, {
                                    backgroundColor:
                                        collectionData?.COLOR == null
                                            ? (colorScheme === "dark" ? "#fff" : "#000")
                                            : collectionData?.COLOR
                                },
                            ]}
                        >
                            <Ionicons
                                name={collectionData?.ICON == null ? "add" : collectionData?.ICON}
                                size={24}
                                color={"#555"}
                            />
                        </ThemedView>
                    </TouchableOpacity>

                    <ThemedInput mode="outlined" placeholder="Titolo" style={{ width: "80%", left: -20 }}
                        value={collectionData?.TITLE} onChangeText={(txt) => {
                            setCollectionData(prev => ({ ...prev, TITLE: txt }))
                        }}
                    />
                </ThemedView>
                <ThemedInput multiline={true} mode="outline" placeholder="Description" value={collectionData?.DESCRIPTION}
                    onChangeText={(txt) => {
                        setCollectionData(prev => ({ ...prev, DESCRIPTION: txt }))
                    }}
                />


                <ThemedView style={{
                    flexDirection: "row",
                    width: "100%",
                    justifyContent: "space-between",
                }}>
                    <ThemedText>Remote posting?</ThemedText>
                    <Switch
                        value={collectionData?.REMOTE_POSTING}
                        onValueChange={(value) => {
                            setCollectionData(prev => ({ ...prev, REMOTE_POSTING: value }))
                        }}
                    />
                </ThemedView>


                {/* //TODO: SEQUENTIABILITY OF THE POSTS */}


                <TouchableOpacity style={[style.colors.geomedia_blue, style.buttons.full_screen]} onPress={() => {
                    bottomSheetRef.current?.snapToIndex(0); // open bottom sheett
                }}>
                    <ThemedText>Exclusivity</ThemedText>
                </TouchableOpacity>




                <IconColorPickerModal
                    visible={showIconPicker}
                    onClose={() => setShowIcon(false)}
                    onSelect={(c) => {
                        setCollectionData(prev => ({
                            ...prev,
                            "ICON": c?.icon,
                            "COLOR": c?.color
                        }))
                        setShowIconPicker(false)
                    }}
                />

                <TouchableOpacity style={[style.buttons.full_screen, style.colors.geomedia_green]}
                    onPress={() => {
                        save_collection()
                    }}
                >
                    <ThemedText>{collectionData?.ID == null ? "CREATE" : "UPDATE"}</ThemedText>
                </TouchableOpacity>
                <BottomSheet
                    ref={bottomSheetRef}
                    index={-1} // start closed
                    snapPoints={snapPoints}
                    enablePanDownToClose={true} // drag down to close
                    keyboardBehavior="interactive"
                    keyboardBlurBehavior="restore"
                    handleIndicatorStyle={{ backgroundColor: 'gray' }}
                    backgroundStyle={{
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        backgroundColor: colorScheme === 'dark' ? '#121212' : '#fff', // must be forced not dynamic, in my opinion is quite bugged but whatever tho
                    }}
                >
                    <BottomSheetScrollView style={{ flex: 1 }}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    // keyboardShouldPersistTaps="handled"
                    >
                        <>
                            <ExclusivityPicking
                                creatorsEnabled={true} //allowing creators
                                EXCLUSIVITY={{
                                    "DATERANGE": {
                                        "DATE_START": collectionData?.EXCL_DATE_START,
                                        "DATE_END": collectionData?.EXCL_DATE_END,
                                        "IS_RECURRENT": collectionData?.RECURRENT
                                    },
                                    "CREATORS": collectionData?.CREATORS,
                                    "VIEWERS": collectionData?.VIEWERS,
                                }}
                                setExclusivity={(obj) => {
                                    setCollectionData(prev => ({
                                        ...prev,
                                        CREATORS: obj.CREATORS,
                                        VIEWERS: obj.VIEWERS,
                                        EXCL_DATE_END: obj.DATERANGE?.DATE_END,
                                        EXCL_DATE_START: obj.DATERANGE?.DATE_START,
                                        RECURRENT: obj.DATERANGE?.IS_RECURRENT
                                    }));
                                    bottomSheetRef?.current?.close()
                                }} />
                        </>
                    </BottomSheetScrollView>
                </BottomSheet>

            </ThemedView>
        </GestureHandlerRootView>
    )
}


export default CollectionCreator;
