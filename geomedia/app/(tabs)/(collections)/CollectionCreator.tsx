import { MyContext } from "@/app/_layout";
import IconColorPickerModal from "@/app/mycomponents/IconColorPicker";
import { style } from "@/components/globalstyle";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, Switch, TouchableOpacity, useColorScheme } from "react-native";
import ExclusivityPicking from "../(map)/ExclusivityPicking";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { doRequest } from "@/app/utility";
import { router, useLocalSearchParams } from "expo-router";
import CollectionPosts from "./CollectionPosts";
import { useLanguage } from "@/components/LanguageProvider";
import TagSelector from "./TagSelector";
import { ScrollView } from "react-native";


const CollectionCreator = () => {

    const ctx = useContext(MyContext)
    const { langselected } = useLanguage()
    const params = useLocalSearchParams();


    /// for exclusivity bottom menu
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
        "HASHTAGS": [],
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

    /**
     * load the all the information of the collection
     */
    function loadFullCollection() {
        let collectionid = null;
        try {
            collectionid = params.collectionid ? JSON.parse(params.collectionid as string) : null;
        } catch (e) {
            collectionid = null;
        }
        if (collectionid != null) {
            doRequest("collection/id/"+collectionid, {
                "uid": ctx?.getUID(),
            },"GET").then(resQuery => {
                let x = resQuery[0];
                if (x != undefined) {
                    setCollectionData(prev => ({
                        ...prev,
                        ...x,
                        HASHTAGS: JSON.parse(x?.HASHTAGS),
                        VIEWERS: JSON.parse(x?.VIEWERS),
                        CREATORS: JSON.parse(x?.CREATORS),
                    }));
                }
            }).catch(err => {
                Alert.alert("Err loading collection", err)
            })
        }
    }

    // must have a name, and icon/color 
    const requiredFields = {
        TITLE: (v) => v != null && v.trim().length > 0,
        ICON: (v) => v != null,
        COLOR: (v) => v != null,
    };
    /**
     * check if the post is ok
     * @param body JSON body of the request
     * @returns return the missing values of required fields
     */
    function validateCollection(body: object) {
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
     * create/update  the collection
     */
    function save_collection() {
        let missing_fields = validateCollection(collectionData)
        if (missing_fields.length > 0) {
            ctx?.showToast({
                type: "error",
                text1: "Missing info",
                text2: langselected.requiredFields + JSON.stringify(missing_fields)
            })
        } else {
            doRequest("collection", collectionData,"POST").then(resQuery => {
                if (resQuery[0]?.OK) {
                    setCollectionData(prev => ({
                        ...prev,
                        ID: resQuery[0]?.ID
                    }))
                    ctx?.showToast({
                        type: "success",
                        text1: langselected.collection.colSaved
                    })
                    setTimeout(() => {
                        if (router.canGoBack()) {
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
    }

    useEffect(() => {
        if (params != null) {
            loadFullCollection()
        }
    }, [])

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemedView style={[style.container, { height: "100%" }]}>
                <ThemedView style={{ flex: 1 }}>

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

                        <ThemedInput mode="outlined" placeholder={langselected.postCreator.title} style={{ width: "80%", left: -20 }}
                            value={collectionData?.TITLE} onChangeText={(txt) => {
                                setCollectionData(prev => ({ ...prev, TITLE: txt }))
                            }}
                        />
                    </ThemedView>
                    <ThemedInput multiline={true} mode="outline" placeholder={langselected.collection.description} value={collectionData?.DESCRIPTION}
                        onChangeText={(txt) => {
                            setCollectionData(prev => ({ ...prev, DESCRIPTION: txt }))
                        }}
                    />
                    <ThemedView style={{ height: 100 }}>

                        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                            <ThemedView style={{
                                width: 150,
                                height: 80,
                                margin: 4,
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "row",
                                flexWrap: "wrap",
                            }}>
                                <TagSelector
                                    selected={collectionData?.HASHTAGS}
                                    onConfirm={(tags) => {
                                        setCollectionData(prev => ({
                                            ...prev,
                                            HASHTAGS: tags
                                        }))
                                    }}
                                />
                            </ThemedView>

                            {collectionData?.HASHTAGS != null && collectionData?.HASHTAGS?.map(c => (
                                <ThemedView style={{
                                    flexDirection: "row",
                                    flexWrap: "wrap",
                                }}>
                                    <Pressable
                                        key={c}
                                        style={[
                                            {
                                                paddingVertical: 6,
                                                paddingHorizontal: 12,
                                                borderRadius: 20,
                                                backgroundColor: "#eee",
                                                margin: 4,
                                                marginTop: 15
                                            }
                                        ]}
                                    >
                                        <ThemedText style={{ color: "#333" }}>
                                            #{c}
                                        </ThemedText>
                                    </Pressable>
                                </ThemedView>
                            ))}
                        </ScrollView>
                    </ThemedView>

                    <ThemedView style={{
                        flexDirection: "row",
                        width: "100%",
                        justifyContent: "space-between",
                    }}>
                        <ThemedText>{langselected?.collection.remote}?</ThemedText>
                        <Switch
                            value={collectionData?.REMOTE_POSTING}
                            onValueChange={(value) => {
                                setCollectionData(prev => ({ ...prev, REMOTE_POSTING: value }))
                            }}
                        />
                    </ThemedView>


                    { //only for collection already created, otherwise we wouldn't even have any posts
                        collectionData?.ID == null ? null :
                            <CollectionPosts collection={collectionData}
                                sequentialConfirmed={(arr: Array<Object>) => {
                                    setCollectionData(prev => ({ ...prev, SEQUENTIALS: arr }))
                                }}

                            />
                    }


                    <TouchableOpacity style={[style.colors.geomedia_blue, style.buttons.full_screen]} onPress={() => {
                        bottomSheetRef.current?.snapToIndex(0); // open bottom sheett
                    }}>
                        <ThemedText>{langselected?.exclusivity.title}</ThemedText>
                    </TouchableOpacity>




                    <IconColorPickerModal
                        visible={showIconPicker}
                        onClose={() => { setShowIconPicker(false) }}
                        defaults={{
                            "COLOR": collectionData?.COLOR,
                            "ICON": collectionData?.ICON
                        }}
                        onSelect={(c) => {
                            setCollectionData(prev => ({
                                ...prev,
                                "ICON": c?.icon,
                                "COLOR": c?.color
                            }))
                            setShowIconPicker(false)
                        }}
                    />
                </ThemedView>

                <ThemedView >
                    <TouchableOpacity
                        style={[style.buttons.full_screen, style.colors.geomedia_green, style.bottom_bar_item, { width: "90%", alignSelf: "center" }]}
                        onPress={() => {
                            save_collection()
                        }}
                    >
                        {collectionData?.ID == null ?
                            <ThemedText>{langselected.postCreator?.create}</ThemedText>
                            :
                            <ThemedText>{langselected.save}</ThemedText>
                        }
                    </TouchableOpacity>
                </ThemedView>
            </ThemedView>
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
                                    RECURRENT: obj.DATERANGE?.RECURRENT
                                }));
                                bottomSheetRef?.current?.close()
                            }} />
                    </>
                </BottomSheetScrollView>
            </BottomSheet>
        </GestureHandlerRootView >
    )
}


export default CollectionCreator;
