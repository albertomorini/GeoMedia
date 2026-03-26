import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';

const ICONS = [
    'home', 'alarm', 'information-circle', 'cart',
    'heart', 'paw', 'library', 'restaurant',
    'chatbubble', 'briefcase', 'analytics', 'american-football',
];

const COLORS = [
    '#FF8A80', '#FFB74D', '#FFD54F', '#AED581',
    '#4DD0E1', '#64B5F6', '#7986CB', '#BA68C8',
    '#F06292', '#A1887F', '#90A4AE', '#81C784',
];

export default function IconColorPickerModal({ visible, onClose, onSelect }) {

    const [colorSelected, setColorSelected] = useState(null);
    const [iconSelected, setIconSelected] = useState(null);

    return (
        <Modal transparent visible={visible} animationType="fade">
            <ThemedView style={[styles.centered, styles.overlay]}>
                <ThemedView style={styles.modal}>

                    <ThemedView style={styles.grid}>
                        {ICONS.map((icon) => {
                            const isSelected = iconSelected === icon;

                            return (
                                <TouchableOpacity
                                    key={icon}
                                    onPress={() => setIconSelected(icon)}
                                    style={styles.item}
                                >
                                    <ThemedView
                                        style={[
                                            styles.circle, { backgroundColor: colorSelected || '#F2F2F2', },
                                            isSelected && styles.selected, {
                                                borderColor: (useColorScheme() === "dark" ? '#ffffff' : "#000000"),
                                            }
                                        ]}
                                    >
                                        <Ionicons
                                            name={icon}
                                            size={24}
                                            color={colorSelected ? '#fff' : '#333'}
                                        />
                                    </ThemedView>
                                </TouchableOpacity>
                            );
                        })}
                    </ThemedView>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.colorRow}
                    >
                        {COLORS.map((color) => {
                            const isSelected = colorSelected === color;

                            return (
                                <TouchableOpacity
                                    key={color}
                                    onPress={() => setColorSelected(color)}
                                    style={[
                                        styles.colorCircle,
                                        { backgroundColor: color },
                                        isSelected && styles.selected,
                                        {
                                            borderColor: (useColorScheme() === "dark" ? '#ffffff' : "#000000"),
                                        }
                                    ]}
                                />
                            );
                        })}
                    </ScrollView>

                    <ThemedView style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}>
                        <TouchableOpacity onPress={() => {
                            setColorSelected(null);
                            setIconSelected(null);
                            onClose()
                        }}>
                            <ThemedText>Cancel</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            onSelect({
                                "color": colorSelected,
                                "icon": iconSelected
                            });
                        }}>
                            <ThemedText>Confirm</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </ThemedView>
            </ThemedView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        width: '85%',
        borderRadius: 20,
        padding: 20,
    },

    // ICON GRID
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    item: {
        width: '25%',
        alignItems: 'center',
        marginBottom: 15,
    },
    circle: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selected: {
        borderWidth: 4,
    },

    // COLOR ROW
    colorRow: {
        paddingVertical: 10,
    },
    colorCircle: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        marginRight: 10,
    },
    colorSelected: {
        borderWidth: 1.5,
        borderColor: '#000',
    },
});