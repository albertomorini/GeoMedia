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
    },
    colors: {
        geomedia_green: {
            backgroundColor: "#bfea7fb9",
        },
        geomedia_blue: {
            backgroundColor: "#7bbcf0"
        },
        geomedia_red: {
            backgroundColor: "#f66868"
        }
    },
    title: {
        fontSize: 16,
        fontWeight: "bold"
    },
    images: {
        profile_picture: {
            width: 70,         // width of the circle
            height: 70,        // height of the circle (same as width)
            borderRadius: 25,   // half of width/height → makes it circular
            overflow: 'hidden', // ensures the i
        }
    },
    buttons: {
        full_screen: {
            width: '100%',           // full screen width
            paddingVertical: 10,     // vertical padding for height
            borderRadius: 8,         // optional rounded corners
            alignItems: 'center',    // center text horizontally
            justifyContent: 'center',
            marginVertical: 10,      // optional spacing
        },
        fab: {
            position: 'absolute',
            bottom: 30,
            right: 0,
            left: 120,
            width: 60,
            height: 60,
            borderRadius: 30,           // circular button
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 5,
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
        },
        fabText: {
            color: '#fff',
            fontSize: 30,
            fontWeight: 'bold',
        },
        closeButton: {
            position: 'absolute',
            top: 40,
            right: 20,
            paddingVertical: 10,
            paddingHorizontal: 15,
            borderRadius: 8,
            zIndex: 10,
        },
    }
})