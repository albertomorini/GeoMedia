import { MyContext } from "@/app/_layout";
import { style } from "@/components/globalstyle";
import { useLanguage } from "@/components/LanguageProvider";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Picker } from "@react-native-picker/picker";
import { useContext, useEffect, useState } from "react";
import { Linking, TouchableOpacity } from "react-native";
import * as SecureStore from 'expo-secure-store';
import { load_config } from "./utility";


export default function Settings(props) {
    const [protocol, setProtocol] = useState(null)
    const [servername, setServerName] = useState(null)
    const [port, setPort] = useState(null)
    const my_email = 'albmor.dev@gmail.com'

    const { lang, langselected, changeLang } = useLanguage();
    const [mapPreferenceStyle, setMapPreferenceStyle] = useState("system")


    const ctx = useContext(MyContext)

    /////////////////////////////////////////////////////

    function confirmNewURI() {
        SecureStore.setItemAsync("config", protocol + "://" + servername + ":" + port + "/");
        ctx?.showToast({
            type: 'success',
            text1: 'Configuration saved',
        })
        load_config() //utility
    }


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
    /////////////////////

    function save_map_preference_style(style) {
        setMapPreferenceStyle(style)
        SecureStore.setItemAsync("map_style", style);
    }
    async function load_map_preference_style() {
        let style = await SecureStore.getItemAsync("map_style")
        try {
            if (style == null || style == "system") {
                setMapPreferenceStyle("system")
            } else {

                setMapPreferenceStyle(style)
            }
        } catch (error) {
            setMapPreferenceStyle("system")

        }
    }


    useEffect(() => {
        load_map_preference_style()

    }, [langselected])

    return (
        <ThemedView style={[{ flex: 1, }, style.container]}>

            <>
                <ThemedText style={style.style}>{langselected.settings_component.contact_me}</ThemedText>

                <ThemedView style={{
                    flexDirection: "row",
                    alignItems: 'center',
                }}>

                    <TouchableOpacity style={[style.colors.geomedia_blue, { width: "30%", paddingStart: 5, paddingEnd: 5, height: 50, paddingTop: 10, alignItems: "center", marginStart: 5, borderRadius: 20 }]} onPress={() => linking_handler("email")}>
                        <ThemedText >Email Me</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity style={[style.colors.geomedia_blue, { width: "30%", paddingStart: 5, paddingEnd: 5, height: 50, paddingTop: 10, alignItems: "center", marginStart: 5, borderRadius: 20 }]} onPress={() => linking_handler("telegram")}>
                        <ThemedText >Telegram</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity style={[style.colors.geomedia_blue, { width: "30%", paddingStart: 5, paddingEnd: 5, height: 50, paddingTop: 10, alignItems: "center", marginStart: 5, borderRadius: 20 }]} onPress={() => linking_handler("github")}>
                        <ThemedText>Github</ThemedText>
                    </TouchableOpacity>
                </ThemedView >
            </>

            <>
                <ThemedText style={style.label}>{langselected.settings_component.language}</ThemedText>
                <Picker
                    selectedValue={lang}
                    onValueChange={(itemValue, itemIndex) => changeLang(itemValue)}
                    style={{ height: 70, width: 200 }}
                >
                    <Picker.Item label="Italiano 🇮🇹" value="IT" />
                    <Picker.Item label="English 🇬🇧" value="EN" />
                </Picker>
            </>

            <>
                <ThemedText style={style.label}>{langselected.settings.map_style}</ThemedText>
                <Picker
                    selectedValue={mapPreferenceStyle}
                    onValueChange={(itemValue, itemIndex) => {
                        save_map_preference_style(itemValue)
                        ctx?.showToast({
                            type: "success",
                            text1: langselected.settings.map_changed
                        })
                    }}
                    style={{ height: 70, width: 200 }}
                >
                    <Picker.Item label="System default" value="system" />
                    <Picker.Item label="Dark" value="dark" />
                    <Picker.Item label="Light" value="light" />
                    <Picker.Item label="Retro" value="retro" />
                    <Picker.Item label="Night blue" value="blue" />
                    <Picker.Item label="Google default" value="google" />
                </Picker>
            </>

            <>
                <ThemedText style={style.label}>{langselected?.settings?.labelSrv}</ThemedText>
                <ThemedView
                    style={{
                        borderRadius: 10,
                        justifyContent: "space-between",
                    }}
                >
                    <ThemedText style={{ fontWeight: "bold" }}>{langselected?.settings.protocol}</ThemedText>
                    <ThemedInput type="outlined" placeholder="https" onChangeText={(text) => {
                        setProtocol(text)
                    }} />
                    <ThemedText style={{ fontWeight: "bold" }}>{langselected?.settings.serverName}</ThemedText>
                    <ThemedInput type="outlined" placeholder="geomediasrv" onChangeText={(text) => {
                        setServerName(text)
                    }} />
                    <ThemedText style={{ fontWeight: "bold" }}>{langselected?.settings?.port}</ThemedText>
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

            {
                ctx?.getUID() == undefined ? null : //login
                    <>
                        <ThemedText style={style.label}>{langselected.profile.logout}</ThemedText>
                        <TouchableOpacity
                            onPress={() => logout()}
                            style={[style?.colors?.geomedia_red, style.buttons.full_screen]}
                        >
                            <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                                {langselected?.profile?.logout}
                            </ThemedText>
                        </TouchableOpacity>

                    </>
            }
        </ThemedView >
    )
}
