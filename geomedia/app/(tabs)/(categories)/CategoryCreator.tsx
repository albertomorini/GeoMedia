import { MyContext } from "@/app/_layout";
import IconColorPickerModal from "@/app/mycomponents/IconColorPicker";
import { style } from "@/components/globalstyle";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { useContext, useRef, useState } from "react";
import { StyleSheet, Switch, TouchableOpacity, useColorScheme } from "react-native";
import ExclusivityPicking from "../(map)/ExclusivityPicking";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { doRequest } from "@/app/utility";


const CategoryCreator = () => {

    const ctx = useContext(MyContext)
    /// for excluivity bottom menu
    const snapPoints = useMemo(() => ['90%', '100%'], []);
    const bottomSheetRef = useRef()

    const [showIconPicker, setShowIconPicker] = useState(false)
    const colorScheme = useColorScheme();

    ////
    const [categoryData, setCategoryData] = useState({
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

    function save_category() {
        console.log(categoryData)
        doRequest("collection_merge", {
            categorydata: categoryData
        }).then(resQuery => {
            console.log("collection merge, res: ", resQuery)
        })

    }


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
                                        categoryData?.COLOR == null
                                            ? (colorScheme === "dark" ? "#fff" : "#000")
                                            : categoryData?.COLOR
                                },
                            ]}
                        >
                            <Ionicons
                                name={categoryData?.ICON == null ? "add" : categoryData?.ICON}
                                size={24}
                                color={"#555"}
                            />
                        </ThemedView>
                    </TouchableOpacity>

                    <ThemedInput mode="outlined" placeholder="Titolo" style={{ width: "80%", left: -20 }}
                        value={categoryData?.TITLE} onChangeText={(txt) => {
                            setCategoryData(prev => ({ ...prev, TITLE: txt }))
                        }}
                    />
                </ThemedView>
                <ThemedInput multiline={true} mode="outline" placeholder="Description" value={categoryData?.DESCRIPTION}
                    onChangeText={(txt) => {
                        setCategoryData(prev => ({ ...prev, DESCRIPTION: txt }))
                    }}
                />


                <ThemedView style={{
                    flexDirection: "row",
                    width: "100%",
                    justifyContent: "space-between",
                }}>
                    <ThemedText>Remote posting?</ThemedText>
                    <Switch
                        value={categoryData?.REMOTE_POSTING}
                        onValueChange={(value) => {
                            setCategoryData(prev => ({ ...prev, REMOTE_POSTING: value }))
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
                        setCategoryData(prev => ({
                            ...prev,
                            "ICON": c?.icon,
                            "COLOR": c?.color
                        }))
                        setShowIconPicker(false)
                    }}
                />

                <TouchableOpacity style={[style.buttons.full_screen, style.colors.geomedia_green]}
                    onPress={() => {
                        save_category()
                    }}
                >
                    <ThemedText>{categoryData?.ID == null ? "CREATE" : "UPDATE"}</ThemedText>
                </TouchableOpacity>
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
                                isCategory={true} //allowing creators
                                exclusivity={{
                                    "DATERANGE": {
                                        "DATE_START": categoryData?.EXCL_DATE_START,
                                        "DATE_END": categoryData?.EXCL_DATE_END,
                                        "IS_RECURRENT": categoryData?.RECURRENT
                                    }
                                }}
                                setExclusivity={(obj) => {
                                    console.log(obj)
                                    setCategoryData(prev => ({
                                        ...prev,
                                        CREATORS: obj.CREATORS,
                                        VIEWERS: obj.VIEWERS,
                                        EXCL_DATE_END: obj.DATERANGE?.DATE_END,
                                        EXCL_DATE_START: obj.DATERANGE?.DATE_START,
                                        RECURRENT: obj.DATERANGE?.IS_RECURRENT
                                    }));
                                    bottomSheetRef?.current?.close()
                                }} />
                        </ThemedView>
                    </BottomSheetView>
                </BottomSheet>

            </ThemedView>
        </GestureHandlerRootView>
    )
}


export default CategoryCreator;
