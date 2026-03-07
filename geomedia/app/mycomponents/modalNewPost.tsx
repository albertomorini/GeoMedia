import { style } from "@/components/globalstyle";
import { Box, Text, ThemeProvider } from "re-native-ui";
import { useState } from "react";
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";


const ModalNewPost = () => {
    const [modalVisible, setModalVisible] = useState(false);

    const toggleModal = () => setModalVisible(prev => !prev);

    return (
        <View style={{ flex: 1 }}>
            <ThemeProvider>
                <TouchableOpacity style={[style.buttons.fab, style.colors.geomedia_blue]} onPress={toggleModal}>
                    <Text style={style.buttons.fabText}>+</Text>
                </TouchableOpacity>

                {/* Full Screen Modal */}
                <Modal animationType="slide"
                    transparent={false} // full screen
                    visible={modalVisible}
                    onRequestClose={toggleModal} // Android back button
                >
                    <Box style={styles.modalContainer}>
                        {/* Close button */}
                        <TouchableOpacity style={[style.buttons.closeButton, style.colors.geomedia_red]} onPress={toggleModal}>
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
                        </TouchableOpacity>

                        <Text>Nuovo post</Text>

                    </Box>
                </Modal>
            </ThemeProvider>
        </View>
    )
}

export default ModalNewPost;



const styles = StyleSheet.create({

    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 50,
    },

    modalContent: {
        paddingTop: 100,
        paddingHorizontal: 20,
        paddingBottom: 50,
    },
});