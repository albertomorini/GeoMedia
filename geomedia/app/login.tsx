import { useContext, useEffect, useState } from 'react';
import { Text, PasswordInput, Button, ControlledInput, Stack, Box, OTPInput } from "re-native-ui";

import { useForm } from "react-hook-form"; /// npm install react-hook-form
import { style } from '@/components/globalstyle';
import { t } from '@/components/i18n';
import { doRequest, React_MD5 } from "./utility";


import * as SecureStore from 'expo-secure-store';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { MyContext } from './_layout';
import { ThemedInput } from '@/components/themed-input';
import { TextInput, TouchableOpacity } from 'react-native';
import { ThemedPassword } from '@/components/themed-password';



export default function LoginScreen(props) {

    const ctx = useContext(MyContext)
    const [isLogin, setIsLogin] = useState(true);
    //////////////////////////////////////////////////

    const [email, setEmail] = useState(null)
    const [username, setUsername] = useState(null); //TODO: the check if already exists
    const [password, setPassword] = useState("");
    const [passwordRep, setPasswordRep] = useState("");
    const [errorPassword, seterrorPassword] = useState("");

    ///
    const [OTP, setOTP] = useState(null);

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
                seterrorPassword(res[0]?.MSG)
            }
        }).catch(err => {
            console.warn(err);
            seterrorPassword(JSON.stringify(err))
        })
    }

    function checkValidityPassword(password: string) {
        //TODO: to implement
        return true;
    }

    function doSignUp() {

        ///////
        if (!email.includes("@") && !email?.includes(".")) {
            alert(t?.signup?.emailNotValid)
        } else if (!checkValidityPassword(password)) {
            alert(t?.signup?.weakPassword)
        } else if (password != passwordRep) {
            seterrorPassword(t?.signup?.diffPass)
        } else {
            console.log("HERE");
            doRequest("auth_signin", {
                EMAIL: email,
                USERNAME: username,
                PASSWORD: React_MD5(password)
            }).then(res => {
                console.log(res);
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
            console.log(res);
            await SecureStore.setItemAsync("user", JSON.stringify(res[0]));
            check_cache_login()
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
    }, [])

    return (

        <ThemedView style={[style.center, style.container]} >
            {/* <SettingsConfig /> */}

            <Text variant="heading" style={style.login.title}>GeoMedia</Text>
            <></>
            {
                (isLogin) ?

                    <ThemedView style={[style.container]}>
                        <ThemedText style={[style.label, { textAlign: "left" }]} >Email or username</ThemedText>
                        <ThemedInput type='outlined' name="email" placeholder={t.login.placeholderEmail} onChangeText={(text) => { setEmail(text) }} />
                        <ThemedText style={{ fontWeight: "bold" }}>Password</ThemedText>
                        <ThemedPassword type='outlined' name="email" placeholder={t.login.placeholderPassord} onChangeText={(val) => { setPassword(val) }} />

                        <TouchableOpacity style={[style?.buttons?.full_screen, style.colors.geomedia_green]} onPress={() => doLogin()} >
                            <ThemedText>
                                {t?.login.buttonConfirm}
                            </ThemedText>
                        </TouchableOpacity>

                    </ThemedView>
                    :
                    <ThemedView style={[style.container]}>
                        {
                            (OTP != null) ?
                                <>
                                    <OTPInput
                                        label="Check your inbox for OTP"
                                        value={OTP}
                                        onChangeText={setOTP}
                                        length={6}
                                    />
                                    <TouchableOpacity onPress={() => check_otp()} style={[style?.buttons?.full_screen, style.colors.geomedia_green]}>
                                        <ThemedText>
                                            Check OTP
                                        </ThemedText>
                                    </TouchableOpacity>
                                </>
                                :
                                <>
                                    <ThemedText style={[style.label, { textAlign: "left" }]} >Email</ThemedText>
                                    <ThemedInput type='outlined' name="email" placeholder={t.login.placeholderEmail} onChangeText={(text) => { setEmail(text) }} />

                                    <ThemedText style={[style.label, { textAlign: "left" }]} >Username</ThemedText>
                                    <ThemedInput type='outlined' name="email" placeholder={"Username"} onChangeText={(text) => { setUsername(text) }} />

                                    <ThemedText style={[style.label, { textAlign: "left" }]} >Password</ThemedText>

                                    <ThemedPassword type='outlined' name="password" placeholder={t.signup.placeholderPassord} onChangeText={(val) => { setPassword(val) }} />
                                    {/* <ThemedText style={[style.label, { textAlign: "left" }]} >Repeat password</ThemedText> */}
                                    <ThemedPassword type='outlined' name="repPassword" placeholder={t.signup.placeholderPassordRepeat} onChangeText={(val) => { setPasswordRep(val) }} />


                                    <TouchableOpacity style={[style?.buttons?.full_screen, style.colors.geomedia_green]} onPress={() => doSignUp()}>
                                        <ThemedText>
                                            {t?.signup?.buttonConfirm}
                                        </ThemedText>
                                    </TouchableOpacity>

                                </>
                        }
                    </ThemedView>
            }

            <ThemedText onPress={switchMode} style={{ textAlign: "right", marginTop: 4, fontStyle: "italic" }}>
                {isLogin ?
                    t?.login.buttonOther
                    :
                    t?.signup.buttonOther

                }
            </ThemedText>
        </ThemedView>
    );
}