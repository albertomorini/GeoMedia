import IconColorPickerModal from "@/app/mycomponents/IconColorPicker";
import { style } from "@/components/globalstyle";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, useColorScheme } from "react-native";


const CategoryCreator = () => {

    const [showIconPicker, setShowIconPicker] = useState(false)
    const colorScheme = useColorScheme();

    ////
    const [categoryData, setCategoryData] = useState({
        "TITLE": null,
        "ICON": null,
        "COLOR": null,
        "CREATORS": [],
        "VIEWERS": [],
    })

    return (
        <ThemedView style={{ height: "100%" }}>
            <ThemedView style={style.container}>

                <ThemedView style={{
                    flexDirection: "row",
                    width: "100%"

                }}>
                    <TouchableOpacity
                        key={"chose"}
                        onPress={() => setShowIconPicker(true)}
                        style={{
                            width: '25%',
                            alignItems: 'center',
                            marginTop: 7,
                        }}
                    >
                        <ThemedView
                            style={[
                                styles.circle, {
                                    backgroundColor:
                                        categoryData?.COLOR == null
                                            ? (colorScheme === "dark" ? "#fff" : "#000")
                                            : categoryData?.COLOR
                                },
                            ]}
                        >
                            <Ionicons
                                name={categoryData?.ICON == null ? "home" : categoryData?.ICON}
                                size={24}
                                color={"#555"}
                            />
                        </ThemedView>
                    </TouchableOpacity>


                    <ThemedInput mode="outlined" placeholder="Titolo" style={{
                        width: "90%"
                    }} />
                </ThemedView>


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

                <TouchableOpacity style={[style.buttons.full_screen, style.colors.geomedia_green]}>
                    <ThemedText>Save</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        </ThemedView>
    )
}


export default CategoryCreator;

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        width: '85%',
        borderRadius: 20,
        padding: 20,
    },

    // ICON GRID
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    item: {
        width: '25%',
        alignItems: 'center',
        marginBottom: 15,
    },
    circle: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selected: {
        borderWidth: 4,
    },

    // COLOR ROW
    colorRow: {
        paddingVertical: 10,
    },
    colorCircle: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        marginRight: 10,
    },
    colorSelected: {
        borderWidth: 1.5,
        borderColor: '#000',
    },
});