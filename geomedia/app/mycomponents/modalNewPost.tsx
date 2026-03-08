import { style } from "@/components/globalstyle";
import { ThemedView } from "@/components/themed-view";
import { Container, Input, Text, ThemeProvider } from "re-native-ui";
import { useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, useColorScheme } from "react-native";


const ModalNewPost = () => {
    const [modalVisible, setModalVisible] = useState(false);

    const toggleModal = () => setModalVisible(prev => !prev);
    const colorScheme = useColorScheme()
    return (
        <ThemedView style={{ flex: 1 }}>
            <ThemeProvider >
                <TouchableOpacity style={[style.buttons.fab, style.colors.geomedia_blue]} onPress={toggleModal}>
                    <Text style={style.buttons.fabText}>+</Text>
                </TouchableOpacity>

                {/* Full Screen Modal */}
                <Modal animationType="slide"
                    transparent={false} // full screen
                    visible={modalVisible}
                    onRequestClose={toggleModal} // Android back button
                >
                    <TouchableOpacity style={[style.buttons.closeButton, style.colors.geomedia_red]} onPress={toggleModal}>
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
                    </TouchableOpacity>
                    <ThemedView style={styles.modalContent}>
                        <Container>
                            <Input placeholder="Titolo" />
                        </Container>
                    </ThemedView>

                </Modal>
            </ThemeProvider>
        </ThemedView>
    )
}

export default ModalNewPost;



const styles = StyleSheet.create({

    modalContainer: {
        flex: 1,
    },

    modalContent: {
        width: "100%",
        height: "100%"
    },
});