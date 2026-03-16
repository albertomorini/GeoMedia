import { useContext, useEffect, useState } from 'react';
import { Text, PasswordInput, Button, ControlledInput, Stack, Box } from "re-native-ui";

import { useForm } from "react-hook-form"; /// npm install react-hook-form
import { style } from '@/components/globalstyle';
import { t } from '@/components/i18n';
import { doRequest, React_MD5 } from "./utility";


import * as SecureStore from 'expo-secure-store';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { MyContext } from './_layout';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { ScrollView } from 'react-native-reanimated/lib/typescript/Animated';



export default function LoginScreen(props) {

    const ctx = useContext(MyContext)
    const { control, handleSubmit } = useForm({
        defaultValues: { email: "" }
    });
    const [isLogin, setIsLogin] = useState(true);
    const [password, setPassword] = useState("");
    const [passwordRep, setPasswordRep] = useState("");
    const [errorPassword, seterrorPassword] = useState("");
    const [pin, setPin] = useState("");

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
            doRequest("signup")
        }
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
        console.log(">", cache_user);

        if (cache_user != null) {
            try {
                let j = JSON.parse(cache_user)
                console.log(ctx?.User.User);
                ctx?.User?.setUser(j)
                // props?.setuser(j)
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
                            <Stack spacing={12}>
                                <ControlledInput
                                    style={{ width: "100%" }}
                                    name="email"
                                    label="Email"
                                    placeholder={t.login.placeholderEmail}
                                    control={control}
                                    rules={{ required: "Email is required" }}
                                />
                                <PasswordInput
                                    label="Password"
                                    style={{ width: "100%" }}
                                    onChangeText={(val) => { setPassword(val) }}
                                    error={errorPassword}
                                    placeholder="Enter your password"
                                />
                                <PasswordInput
                                    label="Repeat password"
                                    style={{ width: "100%" }}
                                    onChangeText={(val) => { setPasswordRep(val) }}
                                    error={errorPassword}
                                    placeholder="Enter your password"
                                />
                                <Button onPress={handleSubmit(onSubmit)}>{t?.signup.buttonConfirm}</Button>
                                <Button onPress={switchMode} style={style.success}> {t?.signup.buttonOther}</Button>

                            </Stack>
                    }

                </Box>
            </Stack>

            {/* <Box p="lg">
                    <Text variant="body">Box with medium padding from theme</Text>
                </Box>
                <Box
                    bg="secondary"
                    style={{
                        borderRadius: 12,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                        paddingLeft: 50,
                        paddingRight: 50
                    }}
                >

                    <OTPInput label="5-Digit PIN" value={pin} onChangeText={setPin} length={5} />

                </Box> */}

        </ThemedView>

    );
}