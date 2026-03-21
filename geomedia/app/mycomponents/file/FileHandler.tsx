import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"

import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useState } from "react";

import CameraCapture from "./cameraCapture";
import { Ionicons } from "@expo/vector-icons";
import { style } from "@/components/globalstyle";
import { Collapsible } from "@/components/ui/collapsible";

import Share from 'react-native-share';
import RNFS from 'react-native-fs';

const FileHandler = (props: any) => {
    const [showCamera, setShowCamera] = useState(false);   // camera control

    const [filesAttached, setFilesAttached] = useState([])

    // pick a file from filesystem
    async function file_pick() {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "*/*",
                multiple: true,
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            let files = []
            for (const asset of result.assets) {
                const { name, uri } = asset; //filename and uri path
                const mimetype = asset?.mimeType;

                //BASE64 computing
                const file = new FileSystem.File(uri); //load the file
                const base64 = await file.base64();

                files.push({
                    filename: name,
                    updated: true,
                    base64: base64,
                    mimetype: mimetype
                })
            }

            setFilesAttached(prev => [...prev, ...files])

        } catch (error) {
            console.error("Error picking or reading file:", error);
            Alert.alert("Error reading files", error)
        }
    }

    // open share file menu
    async function file_share(base64Data: any, fileName: string, mimeType: string) {
        try {
            // get the path, just the filename
            const path = `${RNFS.CachesDirectoryPath}/${fileName}`;

            // Write the file into cache
            await RNFS.writeFile(path, base64Data, 'base64');

            // Open with Share / Other apps
            await Share.open({
                url: `file://${path}`,
                type: mimeType //parametric mimetype 
            });

        } catch (error) {
            console.log('Error opening file:', error);
        }
    };


    /////////////////////////

    function remove_attachment(filename) {

        Alert.alert(
            "Post deletion", 
            "Are you sure you want to proceed?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "OK",
                    onPress: () => {
                        let dummy = filesAttached.find(f => f.filename == filename)
                        let index = filesAttached.indexOf(dummy)
                        if (index != -1) {
                            filesAttached.pop(index)
                            setFilesAttached([...filesAttached])
                        }
                    },
                },
            ],
            { cancelable: true } // Allows to tap outside to close
        );

    }

    return (
        <>
            {showCamera && (
                <View style={styles.fullScreenCamera}>
                    <CameraCapture
                        storePhoto={(b64) => {
                            const files = [
                                {
                                    filename: Date.now() + '.jpg',
                                    updated: true,
                                    base64: b64,
                                    mimetipe: "image/jpg"
                                },
                            ];
                            setFilesAttached(prev => [...prev, ...files])
                            setShowCamera(false);
                            props?.fullScreenCamera(false);
                        }}
                        onClose={() => {
                            setShowCamera(false);
                            props?.fullScreenCamera(false);
                        }}
                    />
                </View>
            )}

            {!showCamera && (
                <ThemedView style={styles.uploadBox}>
                    {filesAttached?.length == 0 ?
                        <ThemedText style={styles.title}>Upload a file</ThemedText>
                        :
                        <Collapsible title="Attached Files">
                            <ScrollView style={{ height: 100, width: "100%" }}>
                                {filesAttached?.map((s, index) => (
                                    <ThemedView
                                        key={index}
                                        style={{
                                            width: "100%",
                                            marginBottom: 5,
                                            borderBottomWidth: 1,
                                            borderColor: "black",
                                            flexDirection: "row",       // row layout
                                            justifyContent: "space-between", // text left, buttons right
                                            alignItems: "center",
                                        }}
                                    >
                                        <ThemedText
                                            style={{
                                                fontSize: 16,
                                                fontWeight: "500",
                                                flexShrink: 1, // wrap text
                                                marginEnd: 15
                                            }}
                                        >
                                            {s?.filename}
                                        </ThemedText>

                                        {/* Button group */}
                                        <View style={{ flexDirection: "row" }}>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    file_share(s?.base64, s?.filename, s?.mimetype)
                                                }}
                                                style={[{ borderRadius: 14, padding: 7 }, style.colors.geomedia_blue]}
                                            >
                                                <Ionicons name="download-outline" size={28} color={"black"} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => { remove_attachment(s?.filename) }}
                                                style={[{ borderRadius: 14, padding: 7, marginLeft: 5 }, style.colors.geomedia_red]}
                                            >
                                                <Ionicons name="trash-bin-outline" size={28} color={"black"} />
                                            </TouchableOpacity>
                                        </View>
                                    </ThemedView>
                                ))}
                            </ScrollView>
                        </Collapsible>
                    }

                    <ThemedView style={[styles.optionsRow, { borderWidth: 0, padding: 0, paddingStart: 20, paddingEnd: 20, paddingTop: 5, alignItems: "center" }]} >
                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => file_pick()}
                        >
                            <ThemedText style={styles.icon}>📄</ThemedText>
                            <ThemedText style={styles.label}>Pick a file</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => {
                                props?.fullScreenCamera(true);
                                setShowCamera(true);
                            }}
                        >
                            <ThemedText style={styles.icon}>📷</ThemedText>
                            <ThemedText style={styles.label}>Take a picture</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </ThemedView>
            )}
        </>
    )
}

export default FileHandler;

const styles = StyleSheet.create({
    fullScreenCamera: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        elevation: 999, // important for Android
        backgroundColor: "black",
    },
    uploadBox: {
        borderWidth: 2,
        borderColor: "#aaa",
        borderStyle: "dashed",
        borderRadius: 12,
        padding: 20,
    },
    title: {
        fontSize: 16,
        marginBottom: 15,
        color: "#444",
    },
    optionsRow: {
        flexDirection: "row",
        gap: 20,
        alignItems: "center",
    },
    option: {
        alignItems: "center",
        padding: 12,
        borderRadius: 10,
        backgroundColor: "#e2e2e2",
        minWidth: 110,
    },
    icon: {
        fontSize: 26,
        marginBottom: 6,
    },
    label: {
        fontSize: 14,
        color: "#333",
    },
});


