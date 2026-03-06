import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Text, PasswordInput, Input, Button, ControlledInput, OTPInput, Stack, Box, ThemeProvider, useToggleColorMode } from "re-native-ui";

import { useForm } from "react-hook-form"; /// npm install react-hook-form
import { style } from '@/components/globalstyle';
import { t } from '@/components/i18n';
import { doRequest } from "./utility"


export default function LoginScreen(props) {

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
        doRequest("doLogin", {
            email: data?.email,
            password: password
        }).then(res => {
            alert(res)
        }).catch(err => {
            seterrorPassword(err)
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
        //TODO -  just for testing

        if (data?.email?.toUpperCase() == "A") {
            props?.setuser({
                "Name": "Alberto",
                "UID": 51
            })
        }

        if (isLogin) {
            doLogin(data)
        } else {
            doSignUp(data)
        }

    };

    return (
        <Box p="lg" style={style.center}>
            <ThemeProvider>
                <Stack>

                    <Text variant="heading" style={style.login.title}>GeoMedia</Text>
                    <></>
                    <></>
                    {
                        (isLogin) ?

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

            </ThemeProvider>
        </Box>
    );
}
