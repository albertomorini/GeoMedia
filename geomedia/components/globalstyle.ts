import { Alert, Image, Modal, PermissionsAndroid, Platform, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

export const style = StyleSheet.create({
    container: {
        padding: 10,
    }
    , containerContent: {
        paddingTop: 50
    }
    , center: {
        flex: 3,
        justifyContent: "center",
        alignItems: "center",
        height: 200
    },
    login: {
        title: {
            marginBottom: 20,
            textAlign: "center",
            color: "#bfea7fb9"
        }
    },
    success: {
        backgroundColor: "#22c55e"
    }
})