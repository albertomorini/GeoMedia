import { MyContext } from "@/app/_layout";
import { style } from "@/components/globalstyle";
import { useLanguage } from "@/components/LanguageProvider";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Picker } from "@react-native-picker/picker";
import { useContext, useEffect, useState } from "react";
import { Linking, StyleSheet, TouchableOpacity } from "react-native";
import * as SecureStore from 'expo-secure-store';
import { ScrollView } from "react-native-gesture-handler";


export default function Settings(props) {
    const [protocol, setProtocol] = useState(null)
    const [servername, setServerName] = useState(null)
    const [port, setPort] = useState(null)

    const { langselected, changeLang } = useLanguage();


    const ctx = useContext(MyContext)


    function confirmNewURI() {
        SecureStore.setItemAsync("config", protocol + "://" + servername + ":" + port + "/");
        setModalSettingsVisible(false)
        ctx?.showToast({
            type: 'success',
            text1: 'Configuration saved',
        })
        load_config()
    }

    const my_email = 'albmor.dev@gmail.com'

    function linking_handler(mode) {
        let url = ``;
        if (mode == "email") {
            const email = my_email;
            const subject = 'GeoMedia';
            const body = ''

            url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        } else if (mode == "telegram") {
            url = `https://t.me/albertomorini`;

        } else if (mode == "github") {
            url = `https://github.com/albertomorini/geomedia`;
        }
        Linking.openURL(url).catch(err =>
            console.error('Error opening email client', err)
        );
    }

    async function logout() {
        //remove preferences
        await SecureStore.deleteItemAsync("collection_selected_map");
        await SecureStore.deleteItemAsync("user");
        ctx?.User.setUser(null);
    }


    useEffect(() => { }, [langselected])

    return (
        <ThemedView style={[{ flex: 1, }, style.container]}>

            <>
                <ThemedText style={style.style}>Get in touch</ThemedText>

                <ThemedView style={{
                    flexDirection: "row",
                    alignItems: 'center',
                }}>

                    <TouchableOpacity style={[style.colors.geomedia_blue, { width: "30%", marginStart:5, borderRadius:20 }]} onPress={() => linking_handler("email")}>
                        <ThemedText >📧 Email Me</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity style={[style.colors.geomedia_blue, { width: "30%", marginStart:5, borderRadius:20 }]} onPress={() => linking_handler("telegram")}>
                        <ThemedText >📞 Telegram</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity style={[style.colors.geomedia_blue, { width: "30%", marginStart:5, borderRadius:20 }]} onPress={() => linking_handler("github")}>
                        <ThemedText>🌐 Github</ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            </>

            <>
                <ThemedText style={style.label}>Language</ThemedText>
                <Picker
                    selectedValue={langselected}
                    onValueChange={(itemValue, itemIndex) => changeLang(itemValue)}
                    style={{ height: 70, width: 200 }}
                >
                    <Picker.Item label="Italiano 🇮🇹" value="IT" />
                    <Picker.Item label="English 🇬🇧" value="EN" />
                </Picker>
            </>

            <>
                <ThemedText style={style.label}>Server settings</ThemedText>
                <ThemedView
                    style={{
                        borderRadius: 10,
                        justifyContent: "space-between",
                    }}
                >
                    <ThemedText style={{ fontWeight: 300 }}>{langselected?.settings.protocol}</ThemedText>
                    <ThemedInput type="outlined" placeholder="https" onChangeText={(text) => {
                        setProtocol(text)
                    }} />
                    <ThemedText style={{ fontWeight: 300 }}>{langselected?.settings.serverName}</ThemedText>
                    <ThemedInput type="outlined" placeholder="geomediasrv" onChangeText={(text) => {
                        setServerName(text)
                    }} />
                    <ThemedText style={{ fontWeight: 300 }}>{langselected?.settings?.port}</ThemedText>
                    <ThemedInput type="outlined" placeholder="9911" onChangeText={(text) => {
                        setPort(text)
                    }} />

                    <ThemedView
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                        }}
                    >
                        <TouchableOpacity
                            onPress={confirmNewURI}
                            style={[style?.colors.geomedia_green, style.buttons.full_screen]}
                        >
                            <ThemedText>{langselected?.confirm}</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>

                </ThemedView>
            </>

            <>
                <ThemedText style={style.label}>Log out</ThemedText>
                <TouchableOpacity
                    onPress={() => logout()}
                    style={[style?.colors?.geomedia_red, style.buttons.full_screen]}
                >
                    <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                        {langselected?.profile?.logout}
                    </ThemedText>
                </TouchableOpacity>

            </>
        </ThemedView>
    )
}


const styles = StyleSheet.create({
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    button: {
        paddingHorizontal: 20,
        borderRadius: 8,
        marginVertical: 6,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});