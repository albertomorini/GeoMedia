import { useContext, useEffect, useState } from 'react';
import { Text, OTPInput } from "re-native-ui";

import { style } from '@/components/globalstyle';
import SettingsConfig, { checkValidityPassword, doRequest, React_MD5 } from "./utility";



import * as SecureStore from 'expo-secure-store';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { MyContext } from './_layout';
import { ThemedInput } from '@/components/themed-input';
import { KeyboardAvoidingView, Modal, Platform, TouchableOpacity } from 'react-native';
import { ThemedPassword } from '@/components/themed-password';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { useLanguage } from '@/components/LanguageProvider';
import ModalPswReset from './mycomponents/ModalPswReset';
import { router } from 'expo-router';
import Settings from './Settings';
import { Ionicons } from '@expo/vector-icons';



export default function LoginScreen(props) {

    const { langselected } = useLanguage();
    const ctx = useContext(MyContext)
    const [isLogin, setIsLogin] = useState(true);
    const [modalVisible, setModalVisible] = useState(false)
    //////////////////////////////////////////////////

    const [email, setEmail] = useState(null)
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState("");
    const [passwordRep, setPasswordRep] = useState("");
    const [errorPassword, seterrorPassword] = useState("");

    ///
    const [OTP, setOTP] = useState(null);
    const [validUsername, setValidUsername] = useState(null);

    //////////////////////////////////////////////////////////////////

    function doLogin() {
        doRequest("auth/login", {
            email: email,
            username: email, // reusing the field of email, whatever tho
            password: React_MD5(password)
        }).then(async res => {
            if (res[0]?.AUTH) {
                let user_w_psw = res[0]
                user_w_psw.PASSWORD = React_MD5(password)
                await SecureStore.setItemAsync("user", JSON.stringify(user_w_psw));
                check_cache_login()
            } else {
                ctx?.showToast({
                    type: "error",
                    text1: langselected.login.errorMessage,
                    visibilityTime: 3000,
                });
                seterrorPassword(res[0]?.MSG)
            }
        }).catch(err => {
            console.warn(err);
            seterrorPassword(JSON.stringify(err))
        })
    }

    function doSignUp() {
        ///////
        if (!email?.includes("@") && !email?.includes(".")) {
            seterrorPassword(langselected?.signup?.emailNotValid)
        } else if (!checkValidityPassword(password)) {
            alert(langselected?.signup?.weakPassword)
        } else if (password != passwordRep) {
            seterrorPassword(langselected?.signup?.diffPass)
        } else if (!validUsername && validUsername != null && username != null) {
            seterrorPassword(langselected.signup.usernametaken)
        } else {
            doRequest("auth/signin", {
                email: email,
                username: username,
                password: React_MD5(password)
            }).then(res => {
                if (res.AUTH == 2) { //pending OTP
                    setOTP("")
                } else {
                    seterrorPassword("Error: " + res?.MSG)
                    setTimeout(() => {
                        seterrorPassword(null)
                    }, 3000);
                }
            }).catch(err => {
                console.log(err);

                ctx?.showToast({
                    type: "error",
                    text1: langselected.network.offline1,
                    text2: langselected.network.offline2
                })
            })
        }
    }

    function check_otp() {
        doRequest("auth/check_otp", {
            username: username,
            otp: parseInt(OTP, 10)
        }).then(async res => {
            if (res[0]?.AUTH) {
                await SecureStore.setItemAsync("user", JSON.stringify(res[0]));
                check_cache_login()
            } else {
                seterrorPassword(langselected.pswReset.otp_expired)
            }
        }).catch(err => {
            ctx?.showToast({
                type: "error",
                text1: langselected.network.offline1,
                text2: langselected.network.offline2
            })
        })
    }

    function check_username(username: string) {
        if (username != null && username?.toString().length > 0) {
            doRequest("auth/check_username", {
                username: username
            }, "GET").then(resQuery => {
                if (parseInt(resQuery[0]?.OK)) {
                    setValidUsername(true)
                    ctx?.showToast({
                        type: 'success',
                        text1: langselected.signup.usernamefree,
                        text2: langselected.profile.hello + " " + username
                    })
                } else {
                    ctx?.showToast({
                        type: 'error',
                        text1: langselected.signup.usernametaken,
                    })
                }
            }).catch(err => {
                ctx?.showToast({
                    type: "error",
                    text1: langselected.network.offline1,
                    text2: langselected.network.offline2
                })
            })
        } else {
            setValidUsername(false)
        }
    }

    //////////////////////////////////////////////////////////////////
    function switchMode() {
        setEmail(null)
        setUsername(null)
        seterrorPassword("")
        setOTP(null)
        setIsLogin(!isLogin)
    }

    async function check_cache_login() {
        let cache_user = await SecureStore.getItemAsync("user");
        if (cache_user != null) {
            try {
                let j = JSON.parse(cache_user)
                ctx?.User?.setUser(j)
            } catch (error) {
                console.error(error);

            }
        }
    }

    useEffect(() => {
        check_cache_login()
    }, [langselected])

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>

            <ThemedView style={{ flex: 1, padding: 16 }}>

                <TouchableOpacity
                    style={{
                        position: "static",
                        marginTop: "20%",
                        alignSelf: "flex-end",
                        backgroundColor: "#a5a4a4",
                        borderRadius: 20,
                        padding: 10,
                    }}
                    onPress={() => {
                        setModalVisible(true);
                    }}
                >
                    <Ionicons name="cog-outline" size={28} color="#70726d" />
                </TouchableOpacity>


                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled" // Adjusted to allow tapping to dismiss keyboard
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={{ flex: 1 }}
                    >

                        <Text variant="heading" style={style.login.title}>GeoMedia</Text><></>
                        {
                            (isLogin) ?


                                <ThemedView style={style.containerContent}>

                                    <ThemedView style={{ width: "100%" }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>

                                        <ThemedText style={[style.label, { textAlign: "left" }]}>{langselected.login.emailOrUsername}</ThemedText>
                                        <ThemedInput type='outlined' placeholder={langselected.login.placeholderEmail} onChangeText={setEmail} />

                                        <ThemedText style={[style.label, { textAlign: "left" }]}>Password</ThemedText>
                                        <ThemedPassword type='outlined' placeholder={langselected.login.placeholderPassord} onChangeText={setPassword} />
                                        <ModalPswReset />

                                        <TouchableOpacity style={[style?.buttons?.full_screen, style.colors.geomedia_green, { marginTop: "25" }]} onPress={doLogin}>
                                            <ThemedText style={{ color: 'white', textAlign: 'center' }}>{langselected.login.login}</ThemedText>
                                        </TouchableOpacity>
                                        {errorPassword?.length > 0 ?
                                            <ThemedText style={{ color: '#f66868', fontWeight: "bold", textAlign: "center", fontSize: 16 }}>{errorPassword}</ThemedText>
                                            :
                                            null
                                        }

                                    </ThemedView>
                                </ThemedView>

                                :
                                <ThemedView style={[style.containerContent]}>
                                    {
                                        (OTP != null) ?
                                            <>
                                                <ThemedText>Check your inbox ({email}) for the OTP code:</ThemedText>
                                                <OTPInput
                                                    label="Will expire whitin an hour"
                                                    value={OTP}
                                                    onChangeText={setOTP}
                                                    length={6}
                                                />
                                                <TouchableOpacity onPress={() => check_otp()} style={[style?.buttons?.full_screen, style.colors.geomedia_green]}>
                                                    <ThemedText>
                                                        Check OTP
                                                    </ThemedText>
                                                </TouchableOpacity>
                                                {errorPassword?.length > 0 ?
                                                    <>
                                                        <ThemedText style={{ color: '#f66868', fontWeight: "bold", textAlign: "center", fontSize: 16 }}>{errorPassword}</ThemedText>
                                                        <TouchableOpacity onPress={() => { setOTP(null) }}>
                                                            <ThemedText style={{ textAlign: 'right', marginTop: 60, bottom: "25%", fontStyle: 'italic', right: 0 }}>
                                                                {langselected.signup.buttonOther}
                                                            </ThemedText>
                                                        </TouchableOpacity>
                                                    </>
                                                    :
                                                    null
                                                }
                                            </>
                                            :
                                            <>
                                                <ThemedText style={[style.label, { textAlign: "left" }]} >Email</ThemedText>
                                                <ThemedInput type='outlined' name="email" placeholder={langselected.login.placeholderEmail} onChangeText={(text) => { setEmail(text) }} />

                                                <ThemedText style={[style.label, { textAlign: "left" }]} >Username</ThemedText>
                                                <ThemedInput type='outlined'
                                                    // borderColor={validUsername == undefined ? undefined : validUsername ? "succes" : "error"}
                                                    name="username"
                                                    placeholder={"Username"}
                                                    onChangeText={(text) => {
                                                        setUsername(text)
                                                        setValidUsername(undefined) //will be checked onblur
                                                    }}
                                                    onBlur={() => {
                                                        check_username(username);
                                                    }}
                                                />

                                                <ThemedText style={[style.label, { textAlign: "left" }]} >Password</ThemedText>

                                                <ThemedPassword type='outlined' name="password" placeholder={langselected.signup.placeholderPassord} onChangeText={(val) => { setPassword(val) }} />
                                                <ThemedPassword type='outlined' name="repPassword" placeholder={langselected.signup.placeholderPassordRepeat} onChangeText={(val) => { setPasswordRep(val) }} />


                                                <TouchableOpacity style={[style?.buttons?.full_screen, style.colors.geomedia_green, { marginTop: "20" }]} onPress={() => doSignUp()}>
                                                    <ThemedText>
                                                        {langselected?.signup?.buttonConfirm}
                                                    </ThemedText>
                                                </TouchableOpacity>

                                                {errorPassword?.length > 0 ?
                                                    <ThemedText style={{ color: '#f66868', fontWeight: "bold", textAlign: "center", fontSize: 16 }}>{errorPassword}</ThemedText>
                                                    :
                                                    null
                                                }

                                            </>
                                    }
                                </ThemedView>
                        }
                        <TouchableOpacity style={[style.buttons.full_screen, style.colors.geomedia_blue]}
                            onPress={switchMode}
                        >

                            <ThemedText  //style={{ textAlign: 'right', marginTop: 60, bottom: "25%", fontStyle: 'italic', right: 0 }}
                            >
                                {isLogin ?
                                    langselected?.login.buttonOther
                                    :
                                    langselected?.signup.buttonOther

                                }
                            </ThemedText>
                        </TouchableOpacity>

                    </KeyboardAvoidingView>
                </ScrollView>

                <Modal
                    visible={modalVisible}
                    transparent={true}
                    animationType="slide"
                    style={{
                        borderRadius: 10,
                    }}
                >
                    <ThemedView
                        style={{
                            backgroundColor: "rgba(114, 114, 114, 0.8)",
                            borderRadius: 10,
                            height: "100%",
                            padding: 10,
                            borderBottomStartRadius: 10,
                            borderBottomEndRadius: 10,
                        }}
                    >
                        <ThemedView style={[{
                            flexDirection: "row",
                            height: 50,
                            justifyContent: "space-between",
                            marginTop: 50,
                            borderTopEndRadius: 10,
                            borderTopStartRadius: 10,
                            backgroundColor: "#838383",
                            padding: 5
                        }]}>
                            <ThemedText style={[style.title, { alignItems: "center", padding: 10 }]}>{langselected?.settings?.labelSrv}</ThemedText>
                            <TouchableOpacity style={[style?.colors?.geomedia_red, { borderRadius: 7, height: "100%", padding: 0, margin: 0, width: "15%", justifyContent: "center", alignContent: "center", alignItems: "center" }]} onPress={() => {
                                setModalVisible(false)
                            }}>
                                <Ionicons name="close-outline" size={28} color={"#70726db9"} />
                            </TouchableOpacity>
                        </ThemedView>

                        <ScrollView>
                            <Settings />
                        </ScrollView>
                    </ThemedView>
                </Modal>
            </ThemedView >
        </GestureHandlerRootView >
    );
}