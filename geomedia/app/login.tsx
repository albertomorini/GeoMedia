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



export default function LoginScreen(props) {

    const ctx = useContext(MyContext)
    const { control, handleSubmit } = useForm({
        defaultValues: { email: "" }
    });
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState(null); //TODO: the check if already exists
    const [password, setPassword] = useState("");
    const [passwordRep, setPasswordRep] = useState("");
    const [errorPassword, seterrorPassword] = useState("");

    ///
    const [OTP, setOTP] = useState(null);

    //////////////////////////////////////////////////////////////////

    function doLogin(data: any) {
        doRequest("auth_login", {
            EMAIL: data?.email,
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

    function doSignUp(data: any) {
        ///////
        if (!data?.email.includes("@") && !data?.email?.includes(".")) {
            alert(t?.signup?.emailNotValid)
        } else if (!checkValidityPassword(password)) {
            alert(t?.signup?.weakPassword)
        } else if (password != passwordRep) {
            setTimeout(() => {
                seterrorPassword(t?.signup?.diffPass)
            }, 1200)
        } else {
            //TODO: do request
            doRequest("auth_signin", {
                EMAIL: data?.email,
                USERNAME: username,
                PASSWORD: password
            }).then(res => {
                console.log(res);
                setOTP("")
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

    function switchMode() {
        seterrorPassword("")
        setIsLogin(!isLogin)
    }

    //////////////////////////////////////////////////////////////////


    const onSubmit = (data: any) => {
        if (isLogin) {
            doLogin(data)
        } else {
            doSignUp(data)
        }
    };


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

        <ThemedView style={style.center}>
            {/* <SettingsConfig /> */}
            <Stack >

                <Text variant="heading" style={style.login.title}>GeoMedia</Text>
                <></>
                <></>
                <Box p="lg">
                    {
                        (isLogin) ?

                            <Stack spacing={12}>
                                <ThemedText style={{ fontWeight: "bold" }} >Email or username</ThemedText>
                                <ControlledInput
                                    style={{ width: "100%" }}
                                    name="email"
                                    placeholder={t.login.placeholderEmail}
                                    control={control}
                                    rules={{ required: "Email is required" }}
                                />
                                <ThemedText style={{ fontWeight: "bold" }}>Password</ThemedText>
                                <PasswordInput
                                    label=""
                                    style={{ width: "100%" }}
                                    onChangeText={(val) => { setPassword(val) }}
                                    error={errorPassword}
                                    placeholder="Enter your password"
                                />
                                <Button onPress={handleSubmit(onSubmit)}>{t?.login.buttonConfirm}</Button>
                                <></>
                                <></>
                                <Button onPress={switchMode}>{t?.login.buttonOther}</Button>
                            </Stack>
                            :
                            <>
                                {
                                    (OTP != null) ?
                                        <>
                                            <OTPInput
                                                label="Check your inbox for OTP"
                                                value={OTP}
                                                onChangeText={setOTP}
                                                length={6}
                                            />
                                            <Button onPress={() => check_otp()}>
                                                check otp
                                            </Button>
                                        </>
                                        :
                                        <>
                                            <ControlledInput
                                                style={{ width: "100%" }}
                                                name="email"
                                                label="Email"
                                                placeholder={t.login.placeholderEmail}
                                                control={control}
                                                rules={{ required: "Email is required" }}
                                            />

                                            <ThemedText>Username</ThemedText>

                                            <ThemedInput
                                                type="outlined"
                                                placeholder="Username"
                                                onChangeText={(text) => setUsername(text)}
                                            />

                                            <PasswordInput
                                                label="Password"
                                                style={{ width: "100%" }}
                                                onChangeText={(val) => setPassword(val)}
                                                error={errorPassword}
                                                placeholder="Enter your password"
                                            />

                                            <PasswordInput
                                                label="Repeat password"
                                                style={{ width: "100%" }}
                                                onChangeText={(val) => setPasswordRep(val)}
                                                error={errorPassword}
                                                placeholder="Enter your password"
                                            />

                                            <Button onPress={handleSubmit(onSubmit)}>
                                                {t?.signup.buttonConfirm}
                                            </Button>

                                            <Button onPress={switchMode} style={style.success}>
                                                {t?.signup.buttonOther}
                                            </Button>
                                        </>
                                }
                            </>
                    }

                </Box>
            </Stack>



        </ThemedView>

    );
}