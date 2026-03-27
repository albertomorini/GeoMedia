import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { Alert, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"

import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { forwardRef, useImperativeHandle, useState } from "react";

import CameraCapture from "./cameraCapture";
import { Ionicons } from "@expo/vector-icons";
import { style } from "@/components/globalstyle";
import { Collapsible } from "@/components/ui/collapsible";

import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import Carousel from "react-native-reanimated-carousel";
import { Image } from "expo-image";
import { doRequest } from "@/app/utility";
const width = Dimensions.get('window').width;


export async function file_share(base64Data: any, fileName: string, mimeType: string) {
    try {
        const path = `${RNFS.CachesDirectoryPath}/${fileName}`;

        await RNFS.writeFile(path, base64Data, 'base64'); //type base644, we pass that

        // Open share menu
        await Share.open({
            url: `file://${path}`,
            type: mimeType
        });

    } catch (error) {
        console.log('Error opening file:', error);
    }
};


const FileHandler = forwardRef((props: any, ref: any) => {
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
                    FILENAME: name,
                    updated: true,
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
                        let dummy = filesAttached.find(f => f.FILENAME == FILENAME)
                        let index = filesAttached.indexOf(dummy)
                        if (index != -1) {
                            filesAttached.pop(index)
                            setFilesAttached([...filesAttached])
                        }
                        if (props?.postid != undefined) { //post exists, do the request to unbind the file, otherwise not existing is a local modification
                            doRequest("hpmedia_remove", {
                                "postid": 1,
                                "filename": FILENAME
                            }).then(resQuery => {
                                //TODO: toast?
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
                        <ThemedText style={styles.title}>Upload a file</ThemedText>
                        :
                        <>
                            <Collapsible title="Attached Images">
                                <Carousel
                                    width={width}
                                    height={250}
                                    data={filesAttached?.filter(f => f?.MIME_TYPE == "image/jpeg")}
                                    pagingEnabled
                                    snapEnabled
                                    loop={false}
                                    mode="parallax"
                                    modeConfig={{
                                        parallaxScrollingScale: 0.9,
                                        parallaxScrollingOffset: 51,
                                    }}
                                    windowSize={3}
                                    renderItem={({ item }) => (
                                        <ThemedView style={{ flex: 1 }}>
                                            <Image
                                                source={{ uri: `data:image/jpeg;base64,${item?.BASE64}` }}
                                                style={{ width: '50%', height: '50%' }}
                                                contentFit="cover"
                                                transition={200}
                                            />

                                            <TouchableOpacity //DOWNLOAD BUTTON
                                                onPress={() => {
                                                    file_share(item.BASE64, item.FILENAME, item.MIME_TYPE)
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    backgroundColor: 'rgba(0,0,0,0.6)',
                                                    paddingVertical: 8,
                                                    paddingHorizontal: 12,
                                                    borderRadius: 8,
                                                }}
                                            >
                                                <ThemedText style={{ color: 'white' }}>Download</ThemedText>

                                            </TouchableOpacity>
                                            <TouchableOpacity //REMOVE BUTTON
                                                onPress={() => remove_attachment(item.FILENAME)}
                                                style={{
                                                    position: 'absolute',
                                                    top: 15,
                                                    right: 15,
                                                    backgroundColor: 'rgba(206, 38, 38, 0.6)',
                                                    paddingVertical: 8,
                                                    paddingHorizontal: 12,
                                                    borderRadius: 8,
                                                }}
                                            >
                                                <ThemedText style={{ color: 'white' }}>Remove</ThemedText>

                                            </TouchableOpacity>
                                        </ThemedView>
                                    )}
                                />
                            </Collapsible>
                            <Collapsible title="Attached Files">
                                <ScrollView style={{ height: 100, width: "100%" }}
                                    nestedScrollEnabled={true}
                                >
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
                                                {s?.FILENAME}
                                            </ThemedText>

                                            {/* Button group */}
                                            <View style={{ flexDirection: "row" }}>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        console.log(s)
                                                        file_share(s?.BASE64, s?.FILENAME, s?.MIME_TYPE)
                                                    }}
                                                    style={[{ borderRadius: 14, padding: 7 }, style.colors.geomedia_blue]}
                                                >
                                                    <Ionicons name="download-outline" size={28} color={"black"} />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={() => { remove_attachment(s?.FILENAME) }}
                                                    style={[{ borderRadius: 14, padding: 7, marginLeft: 5 }, style.colors.geomedia_red]}
                                                >
                                                    <Ionicons name="trash-bin-outline" size={28} color={"black"} />
                                                </TouchableOpacity>
                                            </View>
                                        </ThemedView>
                                    ))}
                                </ScrollView>
                            </Collapsible>
                        </>
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


