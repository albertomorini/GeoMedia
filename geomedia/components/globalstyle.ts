import { StyleSheet } from 'react-native';

export const style = StyleSheet.create({
    container: {
        padding: 10,
        width: "100%",
    }
    , containerContent: {
        paddingTop: 50
    }
    , center: {
        flex: 3,
        padding: 5,
        justifyContent: "center",
        alignItems: "center",
        height: 200
    },
    login: {
        title: {
            marginBottom: 20,
            textAlign: "center",
            color: "#bfea7f"
        }
    },
    success: {
        backgroundColor: "#22c55e"
    },
    colors: {
        geomedia_green: {
            backgroundColor: "#9ace4e",
        },
        geomedia_blue: {
            backgroundColor: "#7bbcf0"
        },
        geomedia_red: {
            backgroundColor: "#f66868"
        },
        geomedia_gray: {
            backgroundColor: "#b0b0b0"
        },
    },
    title: {
        fontSize: 16,
        fontWeight: "bold"
    },
    subtitle: {
        // fontFamily: 'Nunito-Bold',
        fontSize: 15,
        fontWeight: "bold"
    },
    label: {
        fontWeight: "bold",
        textAlign: 'left'
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
        small: {
            width: "25%",
            borderRadius: 8,         // optional rounded corners
            alignItems: 'center',    // center text horizontally
            justifyContent: 'center',
            marginVertical: 10,
        },
        fab: {
            position: 'absolute',
            bottom: 30,
            right: 0,
            left: "83%",
            width: 50,
            height: 50,
            borderRadius: 30,           // circular button
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 5,
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
            flex: 1
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
    },
    switch: {
        track_color_true: "#81b0ff",
        track_color_false: "#767577",
        thumb_color_true: "#aeb8c8",
        thumb_color_false: "#f4f3f4",

    },
    circleIcon: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottom_bar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,

        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

        paddingHorizontal: 20,
        paddingVertical: 14,
        flex:1,

        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.1)",

        // // backgroundColor: "#1e293b",
        // // borderTopWidth: 1,
        // // borderTopColor: "rgba(255,255,255,0.1)",

        // // // iOS shadow
        // // shadowColor: "#000",
        // // shadowOpacity: 0.2,
        // // shadowRadius: 10,

        // Android
        elevation: 10,
    },
    bottom_bar_item:{
        flexDirection: "row",
        alignItems: "center",
        gap: 8, 
    }
})