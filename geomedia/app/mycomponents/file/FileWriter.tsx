import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native"

import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useState } from "react";

import CameraCapture from "../../mycomponents/file/cameraCapture";

const FileWriter = (props: any) => {
    const [showCamera, setShowCamera] = useState(false);   // camera control

    const [filesAttached, setFilesAttached] = useState([]); //is an array since allows to upload more file

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

                //BASE64 computing
                const file = new FileSystem.File(uri); //load the file
                const base64 = await file.base64();

                files.push({
                    filename: name,
                    updated: true,
                    base64: base64
                })
            }

            setFilesAttached(prev => [...prev, ...files]);

        } catch (error) {
            console.error("Error picking or reading file:", error);
            Alert.alert("Error reading files", error)
        }
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
                                },
                            ];

                            setFilesAttached((prev) => [...prev, ...files]);
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
                    <ThemedText style={styles.title}>Upload a file</ThemedText>

                    <View style={styles.optionsRow}>
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
                    </View>
                </ThemedView>
            )}
        </>
    )
}

export default FileWriter;

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
    modalContent: {
        flex: 1,
        padding: 10
    },
    textarea: {
        width: "100%",
        borderStyle: "dashed",
        // backgroundColor: (theme === "dark" ? "#333" : '#fff'),
        // text: (theme === "dark" ? "#fff" : '#000'),
        // border: theme === "dark" ? "#555" : '#ccc',
    },
    container: {
        padding: 20,
    },
    uploadBox: {
        borderWidth: 2,
        borderColor: "#aaa",
        borderStyle: "dashed",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
    },
    title: {
        fontSize: 16,
        marginBottom: 15,
        color: "#444",
    },
    optionsRow: {
        flexDirection: "row",
        gap: 20,
    },
    option: {
        alignItems: "center",
        padding: 12,
        borderRadius: 10,
        backgroundColor: "#f5f5f5",
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


