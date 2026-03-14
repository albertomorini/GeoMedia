import { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, Text, TextInput, View, SafeAreaView } from 'react-native';
import { Box, Button, TextArea } from 're-native-ui'; // Assuming you have the right imports
import { ThemedView } from "@/components/themed-view"; // Assuming you have custom components
import { style } from "@/components/globalstyle"; // Assuming custom styles

// import * as DocumentPicker from 'expo-document-picker';


import CameraCapture from "./cameraCapture";
import { ThemedText } from '@/components/themed-text';


const PostWriter = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [showCamera, setShowCamera] = useState(false);   // ← new state

    const toggleModal = () => setModalVisible(prev => !prev);

    return (
        <ThemedView style={{ flex: 1 }}>
            <TouchableOpacity
                style={[style.buttons.fab, style.colors.geomedia_blue]}
                onPress={toggleModal}
            >
                <Text style={style.buttons.fabText}>+</Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisible}
                onRequestClose={toggleModal}
            >
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
                    <SafeAreaView style={{ flex: 1, backgroundColor: 'your-background-color' }}>
                        <ThemedView style={{ flex: 1 }}>
                            <Box p="md">  {/* keep your padding here – it's now safe inside SafeAreaView */}
                                <ThemedText style={style.label}>Category</ThemedText>
                                {/* TODO: category picker */}

                                <ThemedText style={style.label}>Title: </ThemedText>
                                <TextInput /* your props */ />

                                <ThemedText style={style.label}>Comment (optional):</ThemedText>
                                <TextArea style={styles.textarea} />

                                <View style={styles.uploadBox}>
                                    <Text style={styles.title}>Upload a file</Text>
                                    <View style={styles.optionsRow}>
                                        <Button style={styles.option}>
                                            <Text style={styles.icon}>📄</Text>
                                            <Text style={styles.label}>Pick a file</Text>
                                        </Button>

                                        <Button
                                            style={styles.option}
                                            onPress={() => setShowCamera(true)}
                                        >
                                            <Text style={styles.icon}>📷</Text>
                                            <Text style={styles.label}>Take a picture</Text>
                                        </Button>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[style.buttons.closeButton, style.colors.geomedia_red]}
                                    onPress={toggleModal}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                                        Close
                                    </Text>
                                </TouchableOpacity>
                            </Box>
                        </ThemedView>
                    </SafeAreaView>
                )}
            </Modal>
        </ThemedView>
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
        borderStyle: "dashed"
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


