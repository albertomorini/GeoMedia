import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";

import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { forwardRef, useContext, useImperativeHandle, useState } from "react";

import CameraCapture from "./cameraCapture";
import { Collapsible } from "@/components/ui/collapsible";

import { doRequest } from "@/app/utility";
import CarouselFileViewer from "./CarouselFileViewer";
import { MyContext } from "@/app/_layout";
import { useLanguage } from "@/components/LanguageProvider";


const FileHandler = forwardRef((props: any, ref: any) => {
    const [showCamera, setShowCamera] = useState(false);   // camera control
    const ctx = useContext(MyContext) //mainly for toast
    const { langselected } = useLanguage()

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
                    FILENAME: name,
                    UPDATED: true,
                    BASE64: base64,
                    MIME_TYPE: mimetype
                })
            }

            setFilesAttached(prev => [...prev, ...files])

        } catch (error) {
            console.error("Error picking or reading file:", error);
            Alert.alert("Error reading files", error)
        }
    }

    /////////////////////////

    function remove_attachment(FILENAME) {

        Alert.alert(
            langselected.fileUpload.fileDeletion,
            langselected.fileUpload.confirm,
            [
                {
                    text: langselected.cancel,
                    style: "cancel",
                },
                {
                    text: "OK",
                    onPress: () => {
                        let dummy = filesAttached.find(f => f.FILENAME == FILENAME)
                        let index = filesAttached.indexOf(dummy)
                        if (index != -1) {
                            filesAttached.pop(index)
                            setFilesAttached([...filesAttached])
                        }
                        if (props?.postid != undefined) { //post exists, do the request to unbind the file, otherwise not existing is a local modification
                            doRequest("post/hpmedia_remove", {
                                "postid": 1,
                                "filename": FILENAME
                            }, "DELETE").then(resQuery => {
                                ctx?.showToast({
                                    type: "success",
                                    text1: langselected.fileUpload.fileremoved + FILENAME,
                                })
                            }).catch(err => {
                                ctx?.showToast({
                                    type: "error",
                                    text1: langselected.network.offline1,
                                    text2: langselected.network.offline2,
                                })
                            })
                        }
                    },
                },
            ],
            { cancelable: true } // Allows to tap outside to close
        );

    }
    ///////////////////

    useImperativeHandle(ref, () => ({
        return_files: () => {
            return filesAttached
        },
        load_files: (files) => { //allows to pass existent files
            setFilesAttached(files)
        }
    }), [filesAttached]);


    return (
        <>
            {showCamera && (
                <View style={styles.fullScreenCamera}>
                    <CameraCapture
                        storePhoto={(b64) => {
                            const files = [
                                {
                                    FILENAME: Date.now() + '.jpeg',
                                    UPDATED: true,
                                    BASE64: b64,
                                    MIME_TYPE: "image/jpeg"
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
                        <ThemedText style={styles.title}>{langselected.fileUpload.uploadFile}</ThemedText>
                        :
                        <>
                            <Collapsible title={langselected.fileUpload.attached}>
                                <CarouselFileViewer attachments={filesAttached} remove_attachment={(filename) => { remove_attachment(filename) }} isEdit={true} />
                            </Collapsible>
                        </>
                    }

                    <ThemedView style={[styles.optionsRow, { borderWidth: 0, padding: 0, paddingStart: 20, paddingEnd: 20, paddingTop: 5, alignItems: "center" }]} >
                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => file_pick()}
                        >
                            <ThemedText style={styles.icon}>📄</ThemedText>
                            <ThemedText style={styles.label}>{langselected.fileUpload.pickfile}</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => {
                                props?.fullScreenCamera(true);
                                setShowCamera(true);
                            }}
                        >
                            <ThemedText style={styles.icon}>📷</ThemedText>
                            <ThemedText style={styles.label}>{langselected.fileUpload.takepic}</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </ThemedView>
            )}
        </>
    )
})

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


