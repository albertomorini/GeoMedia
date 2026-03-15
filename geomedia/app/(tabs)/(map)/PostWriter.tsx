import { useState } from 'react';
import { StyleSheet, Text, View, useColorScheme, Pressable, TouchableOpacity } from 'react-native';
import { ThemedView } from "@/components/themed-view"; // Assuming you have custom components
import { style } from "@/components/globalstyle"; // Assuming custom styles

// import * as DocumentPicker from 'expo-document-picker';


import CameraCapture from "../../mycomponents/cameraCapture";
import { ThemedText } from '@/components/themed-text';
import { ThemedInput } from '@/components/themed-input';


const PostWriter = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [showCamera, setShowCamera] = useState(false);   // ← new state

    const toggleModal = () => setModalVisible(prev => !prev);

    const theme = useColorScheme()



    return (
        <>

            {showCamera ? (
                <CameraCapture
                    onCapture={(photo) => {
                        console.log('Photo captured:', photo.path);
                        // TODO: store the photo URI for upload/preview
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
                    {/* <TextInput
                        style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                        placeholderTextColor={theme === 'dark' ? '#aaa' : '#323232'}
                    /> */}
                    <ThemedInput placeholder="Title" type="outlined" />
                    <ThemedText style={style.label}>Comment:</ThemedText>
                    <ThemedInput multiline={true} type="outlined" placeholder='Add a comment..' />


                    <View style={styles.uploadBox}>
                        <Text style={styles.title}>Upload a file</Text>
                        <View style={styles.optionsRow}>
                            <TouchableOpacity style={styles.option} >
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


