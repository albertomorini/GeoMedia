import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';

export default function FloatingButton() {
    return (
        <View style={styles.container}>

            {/* Your screen content here */}

            <TouchableOpacity style={styles.fab} onPress={() => alert('Pressed!')}>
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

});