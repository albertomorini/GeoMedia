import { MyContext } from "@/app/_layout";
import { doRequest } from "@/app/utility";
import { default_account_profilepic } from "@/assets/images/default_pictures";
import { style } from "@/components/globalstyle";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useContext, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, TouchableOpacity } from "react-native";

import { Image } from "expo-image"

import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as SecureStore from 'expo-secure-store';
import { router } from "expo-router";
import { useLanguage } from "@/components/LanguageProvider";

export default function ProfileEditor() {


    const ctx = useContext(MyContext);
    const user = ctx?.User?.User;
    const [ProfilePic, setProfilePic] = useState(default_account_profilepic);
    const { lang } = useLanguage()
    const [userInfo, setUserInfo] = useState(null);

    function getProfilePic() {
        doRequest("profile_getpfp", {
            USERNAME: user?.USERNAME
        }).then(res => {
            let pp = res[0].PROFILE_PICTURE
            if (pp != undefined) {
                setProfilePic(pp)
            }
        }).catch(err => {
            ctx?.showToast({
                type: "error",
                text1: "Error",
                text2: "Network error... are you offline?"
            })
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
            console.error(langselected.fileUpload.readingError, error);
            Alert.alert(langselected.fileUpload.readingError, error)
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
            ctx?.showToast({
                type: "success",
                text1: langselected.profile.editedProfile
            })
            router.back()
        }).catch(err => {
            ctx?.showToast({
                type: "error",
                text1: "Error: " + JSON.stringify(err)
            })
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
        <ThemedView style={{ height: "100%" }}>
            <ThemedView style={style.container}>

                <ThemedView style={{ alignItems: 'center', paddingVertical: 20 }} >
                    <Pressable onPress={() => { upload_picture() }}>
                        <ThemedView style={styles.imageContainer}>
                            <Image
                                source={{ uri: `data:image/jpeg;base64,${ProfilePic}` }}
                                style={{
                                    width: 120,
                                    height: 120,
                                    borderRadius: 40,
                                }}

                            />

                            <ThemedView style={styles.textBackground}>
                                <ThemedText style={styles.overlayText}>{langselected.profile.editPic}</ThemedText>
                            </ThemedView>
                        </ThemedView>
                    </Pressable>
                </ThemedView>

                <ThemedText>Username</ThemedText>
                <ThemedInput type="outlined" value={userInfo?.USERNAME} onChangeText={(text) => {
                    setUserInfo(prev => ({
                        ...prev,
                        USERNAME: text
                    }))
                }} />
                <ThemedText>{langselected.profile.name}</ThemedText>
                <ThemedInput type="outlined"
                    placeholder={langselected.profile.insertName}
                    value={userInfo?.NAME} onChangeText={(text) => {
                        setUserInfo(prev => ({
                            ...prev,
                            NAME: text
                        }))
                    }} />
                <ThemedText>{langselected.profile.surname}</ThemedText>
                <ThemedInput type="outlined" value={userInfo?.SURNAME}
                    placeholder={langselected.profile.insertSurname}
                    onChangeText={(text) => {
                        setUserInfo(prev => ({
                            ...prev,
                            SURNAME: text
                        }))
                    }} />

                <ThemedText style={[style.label]}>Your collections:</ThemedText>

                <TouchableOpacity style={[style.buttons.full_screen, style.colors.geomedia_green]} onPress={() => { saveInfo() }}>
                    <ThemedText>{langselected.save}</ThemedText>
                </TouchableOpacity>

            </ThemedView>
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