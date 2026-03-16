import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { ThemedView } from "@/components/themed-view";
import { style } from "@/components/globalstyle";
import { ThemedText } from '@/components/themed-text';
import { ThemedInput } from '@/components/themed-input';

import CameraCapture from "../../mycomponents/cameraCapture";


/// FILE SYSTEMS

import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { doRequest } from '@/app/utility';
////////////////////////////////////////////////////////////////////////////////////////////


const PostWriter = () => {

    const [postData, setPostData] = useState({
        ID: null,
        TITLE: null,
        COMMENT: null,
        AUTHOR_ID: null, //TODO: context
    })

    const [showCamera, setShowCamera] = useState(false);   // camera control
    const [filesAttached, setFilesAttached] = useState([]); //array for multiple?


    const file_share = async (base64Data: any, fileName: string, fileType: string) => {
        try {
            // Define path in cache directory
            const path = `${RNFS.CachesDirectoryPath}/${fileName}.${fileType}`;

            // Write the file
            await RNFS.writeFile(path, base64Data, 'base64');
            console.log('File written to:', path);

            // Open with Share / Other apps
            await Share.open({
                url: `file://${path}`,
                type: `${fileType === 'pdf' ? 'application/pdf' : 'image/*'}`, // adjust MIME type
            });

        } catch (error) {
            console.log('Error opening file:', error);
        }
    };


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
                    base64: base64
                })
            }

            setFilesAttached(prev => [...prev, ...files]);

        } catch (error) {
            console.error("Error picking or reading file:", error);
            Alert.alert("Error reading files", error)
        }
    }



    function savePost() {
        doRequest("post_merge", {
            postdata: postData
        }).then(res => {

        })
    }

    return (
        <>

            {showCamera ? (
                <CameraCapture
                    storePhoto={(b64) => {
                        let files = [{
                            filename: Date.now() + '.jpg',
                            base64: b64
                        }]
                        setFilesAttached(prev => [...prev, ...files]);
                        setShowCamera(false);
                    }}
                    onClose={() => setShowCamera(false)}
                />
            ) : (
                // Wrap form content in SafeAreaView + flex:1 to respect insets without pushing off-screen

                <ThemedView style={style.container}>


                    <ThemedText style={style.label}>Category</ThemedText>
                    {/* //TODO: category picker */}

                    <ThemedText style={style.label}>Title: </ThemedText>
                    <ThemedInput placeholder="Title" type="outlined" onChange={(text) => {
                        setPostData(prev => ({
                            ...prev,
                            TITLE: text
                        }));
                    }} />
                    <ThemedText style={style.label}>Comment:</ThemedText>
                    <ThemedInput multiline={true} type="outlined" placeholder='Add a comment..'
                        onChange={(text) => {
                            setPostData(prev => ({
                                ...prev,
                                COMMENT: text
                            }));
                        }}
                    />

                    <View style={styles.uploadBox}>
                        <Text style={styles.title}>Upload a file</Text>
                        <View style={styles.optionsRow}>
                            <TouchableOpacity style={styles.option} onPress={() => { file_pick() }}>
                                <Text style={styles.icon}>📄</Text>
                                <Text style={styles.label}>Pick a file</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.option}
                                onPress={() => setShowCamera(true)}
                            >
                                <Text style={styles.icon}>📷</Text>
                                <Text style={styles.label}>Take a picture</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {
                        filesAttached?.map(f => (
                            <ThemedText key={f?.filename}>
                                {f?.filename}
                            </ThemedText>
                        ))
                    }


                    <TouchableOpacity style={style.colors.geomedia_green}>
                        <ThemedText>Create</ThemedText>
                    </TouchableOpacity>


                </ThemedView>
            )}

        </>
    );
};
export default PostWriter;

const styles = StyleSheet.create({
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


