import { MyContext } from "@/app/_layout";
import { doRequest } from "@/app/utility";
import { default_account_profilepic } from "@/assets/images/account_icon";
import { style } from "@/components/globalstyle";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useContext, useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";

import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as SecureStore from 'expo-secure-store';

export default function ProfileEditor() {


    const ctx = useContext(MyContext);
    const user = ctx?.User?.User;
    const [ProfilePic, setProfilePic] = useState(default_account_profilepic);

    const [userInfo, setUserInfo] = useState(null);

    function getProfilePic() {
        doRequest("profile_getpfp", {
            USERNAME: user?.USERNAME
        }).then(res => {
            // console.log(res[0].substring(0, 10))
            let pp = res[0].PROFILE_PICTURE
            if (pp != undefined) {
                setProfilePic(pp)
            }
        })
    }

    async function upload_picture() {
        try {


            const result = await DocumentPicker.getDocumentAsync({
                type: "image/*",   // only images
                multiple: false,   // single file
                copyToCacheDirectory: true,
            });

            if (result.type === "cancel") return;

            console.log(result.assets);

            const { name, uri } = result.assets[0];

            // Read file as base64
            const file = new FileSystem.File(uri); //load the file
            const base64 = await file.base64();

            setUserInfo(prev => ({
                ...prev,
                PROFILE_PICTURE: base64
            }))
            setProfilePic(base64) //just to render immediately after picked

        } catch (error) {
            console.error("Error picking or reading file:", error);
            Alert.alert("Error reading files", error)
        }
    }

    function saveInfo() {
        doRequest("profile_editinfo", {
            INFO: userInfo
        }).then(async res => {
            let newinfo = res[0];
            newinfo.AUTH = 1
            await SecureStore.setItemAsync("user", JSON.stringify(newinfo));
            ctx?.User?.setUser(newinfo)
            // getProfilePic()
        })
    }


    async function load_from_cache() {
        let cache_user = await SecureStore.getItemAsync("user");

        if (cache_user != null) {
            try {
                let j = JSON.parse(cache_user)
                setUserInfo(j)
            } catch (error) {
                console.error(error);

            }
        }
    }


    useEffect(() => {
        getProfilePic()
        load_from_cache()
    }, []);

    return (
        <ThemedView style={style.container}>

            <View style={{ alignItems: 'center', marginVertical: 20 }} >
                <Pressable onPress={() => { upload_picture() }}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: `data:image/jpeg;base64,${ProfilePic}` }}
                            style={{
                                width: 120,
                                height: 120,
                                borderRadius: 40,
                            }}

                        />

                        <View style={styles.textBackground}>
                            <ThemedText style={styles.overlayText}>Tap to edit picture</ThemedText>
                        </View>
                    </View>
                </Pressable>
            </View>

            <ThemedText>Username</ThemedText>
            <ThemedInput type="outlined" value={userInfo?.USERNAME} onChangeText={(text) => {
                setUserInfo(prev => ({
                    ...prev,
                    USERNAME: text
                }))
            }} />
            <ThemedText>Name</ThemedText>
            <ThemedInput type="outlined" value={userInfo?.NAME} onChangeText={(text) => {
                setUserInfo(prev => ({
                    ...prev,
                    NAME: text
                }))
            }} />
            <ThemedText>Surname</ThemedText>
            <ThemedInput type="outlined" value={userInfo?.SURNAME} onChangeText={(text) => {
                setUserInfo(prev => ({
                    ...prev,
                    SURNAME: text
                }))
            }} />
            {/* //TODO: password? */}

            <TouchableOpacity style={[style.buttons.full_screen, style.colors.geomedia_green]} onPress={() => { saveInfo() }}>
                <ThemedText>Save</ThemedText>
            </TouchableOpacity>

        </ThemedView>
    )
}

const styles = StyleSheet.create({
    imageContainer: {
        width: 120,
        height: 120,
        borderRadius: 40,
        overflow: 'hidden', // ensures overlay stays inside the rounded image
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    textBackground: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // semi-transparent black
        paddingVertical: 5,
    },
    overlayText: {
        textAlign: 'center',
        color: 'white',
        fontWeight: 'bold',
    },
});