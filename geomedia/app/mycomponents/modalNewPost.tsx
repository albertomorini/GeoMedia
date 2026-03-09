import { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, Text, useColorScheme, Alert } from 'react-native';
import { Button, ThemeProvider } from 're-native-ui'; // Assuming you have the right imports
import { ThemedView } from "@/components/themed-view"; // Assuming you have custom components
import { style } from "@/components/globalstyle"; // Assuming custom styles

// import * as DocumentPicker from 'expo-document-picker';
import fs from "react-native-nitro-file-system"; // Node-like API
import { NitroDocumentPicker } from 'react-native-nitro-document-picker';

import RNFS from 'react-native-fs';
import Share from 'react-native-share';


const ModalNewPost = () => {
    const [modalVisible, setModalVisible] = useState(false);

    const toggleModal = () => setModalVisible(prev => !prev);


    const openBase64File = async (base64Data, fileName, fileType) => {
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

    async function pickAndReadFile() {
        try {
            const file = await NitroDocumentPicker.pick({
                types: ['all'],
                multiple: false,
            });
            console.log(file);

            const { name, uri } = file;
            const extension = name.split(".").pop() ?? "";

            console.log("Picked file:", name);
            console.log("Extension:", extension);
            console.log("URI:", uri);

            const base64String = await fs.promises.readFile(
                uri,
                "base64"
            );

            console.log("Base64 (first 100 chars):", base64String.slice(0, 100));
            console.log("Base64 length:", base64String.length);


            openBase64File(base64String,name,extension)
            // await saveBase64WithSaveAs(base64String, name, extension)

        } catch (error) {
            console.error("Error picking or reading file:", error);
            Alert.alert("Error", error.message);
        }
    }


    return (
        <ThemedView style={{ flex: 1 }}>
            <ThemeProvider>
                <TouchableOpacity
                    style={[style.buttons.fab, style.colors.geomedia_blue]}
                    onPress={toggleModal}
                >
                    <Text style={style.buttons.fabText}>+</Text>
                </TouchableOpacity>

                {/* Full Screen Modal */}
                <Modal
                    animationType="slide"
                    transparent={false} // full screen
                    visible={modalVisible}
                    onRequestClose={toggleModal} // Android back button
                >
                    <TouchableOpacity
                        style={[style.buttons.closeButton, style.colors.geomedia_red]}
                        onPress={toggleModal}
                    >
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
                    </TouchableOpacity>
                    <ThemedView style={styles.modalContent}>

                    
                        <Button onPress={pickAndReadFile}>
                            <Text>Daje22</Text>
                        </Button>
                    </ThemedView>

                </Modal>
            </ThemeProvider>
        </ThemedView>
    );
};

export default ModalNewPost;

const styles = StyleSheet.create({
    modalContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});