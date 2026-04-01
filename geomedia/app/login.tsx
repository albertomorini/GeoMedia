import { useContext, useEffect, useState } from 'react';
import { Text, OTPInput } from "re-native-ui";

import { style } from '@/components/globalstyle';
import { checkValidityPassword, doRequest, React_MD5, SettingsConfig } from "./utility";



import * as SecureStore from 'expo-secure-store';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { MyContext } from './_layout';
import { ThemedInput } from '@/components/themed-input';
import { KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { ThemedPassword } from '@/components/themed-password';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useLanguage } from '@/components/LanguageProvider';
import ModalPswReset from './mycomponents/ModalPswReset';



export default function LoginScreen(props) {

    const { langselected } = useLanguage();
    const ctx = useContext(MyContext)
    const [isLogin, setIsLogin] = useState(true);
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
        doRequest("auth_login", {
            EMAIL: email,
            USERNAME: email, // reusing the field of email, whatever tho
            PASSWORD: React_MD5(password)
        }).then(async res => {
            if (res[0]?.AUTH) {
                await SecureStore.setItemAsync("user", JSON.stringify(res[0]));
                check_cache_login()
            } else {
                ctx?.showToast({
                    type: "error",
                    text1: "Authentication failed",
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
        if (!email.includes("@") && !email?.includes(".")) {
            seterrorPassword(langselected?.signup?.emailNotValid)
        } else if (!checkValidityPassword(password)) {
            alert(langselected?.signup?.weakPassword)
        } else if (password != passwordRep) {
            seterrorPassword(langselected?.signup?.diffPass)
        } else if (!validUsername && validUsername != null) {
            seterrorPassword("Username already taken!")
        } else {
            doRequest("auth_signin", {
                EMAIL: email,
                USERNAME: username,
                PASSWORD: React_MD5(password)
            }).then(res => {
                if (res.AUTH == 2) { //pending OTP
                    setOTP("")
                } else {
                    seterrorPassword("Error: " + JSON.stringify(res.error))
                }
            })
        }
    }

    function check_otp() {
        doRequest("auth_check_otp", {
            USERNAME: username,
            OTP: OTP
        }).then(async res => {
            if (res[0]?.AUTH) {
                await SecureStore.setItemAsync("user", JSON.stringify(res[0]));
                check_cache_login()
            } else {
                seterrorPassword("OTP EXPIRED, redo the signin")
            }
        })
    }

    function check_username(username: string) {
        doRequest("auth_check_username", {
            USERNAME: username
        }).then(resQuery => {
            if (resQuery[0]?.OK, username) {
                setValidUsername(true)
                ctx?.showToast({
                    type: 'success',
                    text1: 'Username available',
                    text2: 'Hello ' + username
                })
            } else {
                ctx?.showToast({
                    type: 'error',
                    text1: 'Username taken',
                })
            }
        })
    }

    //////////////////////////////////////////////////////////////////
    function switchMode() {
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
        <GestureHandlerRootView >

            <ThemedView style={{ flex: 1, padding: 16 }}>


                <ThemedView style={[style.center, { flex: 1 }]}>


                    <Text variant="heading" style={style.login.title}>GeoMedia</Text><></>
                    {
                        (isLogin) ?

                            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "padding"} style={{ width: "100%" }}>
                                <ThemedView style={style.containerContent}>

                                    <ThemedView style={{ width: "100%" }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>

                                        <ThemedText>Email or username</ThemedText>
                                        <ThemedInput placeholder="Enter email" onChangeText={setEmail} />

                                        <ThemedText>Password</ThemedText>
                                        <ThemedPassword placeholder="Enter password" onChangeText={setPassword} />

                                        <TouchableOpacity style={[style?.buttons?.full_screen, style.colors.geomedia_green]} onPress={doLogin}>
                                            <ThemedText style={{ color: 'white', textAlign: 'center' }}>Login</ThemedText>
                                        </TouchableOpacity>
                                        {errorPassword?.length > 0 ?
                                            <ThemedText style={{ color: '#f66868', fontWeight: "bold", textAlign: "center", fontSize: 16 }}>{errorPassword}</ThemedText>
                                            :
                                            null
                                        }

                                    </ThemedView>
                                </ThemedView>

                            </KeyboardAvoidingView>
                            :
                            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "padding"} style={{ width: "100%" }}>
                                <ThemedView style={[style.container]}>
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
                                                                BACK
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
                                                    borderColor={validUsername == null ? null : validUsername ? "succes" : "error"}
                                                    name="email"
                                                    placeholder={"Username"}
                                                    onChangeText={(text) => {
                                                        setUsername(text)
                                                        setValidUsername(null) //will be checked onblur
                                                    }}
                                                    onBlur={() => {
                                                        check_username(username);
                                                    }}
                                                />

                                                <ThemedText style={[style.label, { textAlign: "left" }]} >Password</ThemedText>

                                                <ThemedPassword type='outlined' name="password" placeholder={langselected.signup.placeholderPassord} onChangeText={(val) => { setPassword(val) }} />
                                                {/* <ThemedText style={[style.label, { textAlign: "left" }]} >Repeat password</ThemedText> */}
                                                <ThemedPassword type='outlined' name="repPassword" placeholder={langselected.signup.placeholderPassordRepeat} onChangeText={(val) => { setPasswordRep(val) }} />


                                                <TouchableOpacity style={[style?.buttons?.full_screen, style.colors.geomedia_green]} onPress={() => doSignUp()}>
                                                    <ThemedText>
                                                        {langselected?.signup?.buttonConfirm}
                                                    </ThemedText>
                                                </TouchableOpacity>

                                            </>
                                    }
                                </ThemedView>
                            </KeyboardAvoidingView>
                    }
                    <ModalPswReset />

                </ThemedView>

                <ThemedText onPress={switchMode} style={{ textAlign: 'right', marginTop: 60, bottom: "25%", fontStyle: 'italic', right: 0 }}>
                    {isLogin ?
                        langselected?.login.buttonOther
                        :
                        langselected?.signup.buttonOther

                    }
                </ThemedText>
                <SettingsConfig />

            </ThemedView>

        </GestureHandlerRootView >
    );
}