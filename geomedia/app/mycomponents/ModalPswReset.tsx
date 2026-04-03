import { style } from "@/components/globalstyle"
import { ThemedInput } from "@/components/themed-input"
import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { OTPInput } from "re-native-ui"
import { useContext, useState } from "react"
import { Modal, TouchableOpacity } from "react-native"
import { checkValidityPassword, doRequest, React_MD5 } from "../utility"
import { MyContext } from "../_layout"
import { ThemedPassword } from "@/components/themed-password"
import { useLanguage } from "@/components/LanguageProvider"

const ModalPswReset = () => {


    const { langselected } = useLanguage();


    const ctx = useContext(MyContext)
    const [modalPswReset, setModalPswReset] = useState(false);
    const [OTP, setOTP] = useState("")
    const [OTPValid, setOTPValid] = useState(null)
    const [usernamemail, setUsernamemail] = useState(null)

    const [newPassword, setNewPassword] = useState(null)
    const [RepPassword, setRepPassword] = useState(null)


    function check_otp(usr = usernamemail) {
        if (ctx?.getUID() != undefined) {
            usr = ctx?.User.User?.USERNAME
        }
        doRequest("auth_check_otp", {
            USERNAME: usr,
            OTP: OTP
        }).then(async res => {
            if (res[0]?.AUTH) {
                setOTPValid(true)
            } else {
                ctx?.showToast({
                    type: "error",
                    text1: "OTP Expired",
                    text2: "Proceed to repeat the procedure"
                })
            }
        }).catch(err => {
            ctx?.showToast({
                type: "error",
                text1: "Error",
                text2: "Network error... are you offline?"
            })
        })
    }

    function auth_psw_forgotten(usrmail = usernamemail) {
        if (ctx?.getUID() != undefined) {
            usrmail = ctx?.User.User?.USERNAME
        }
        doRequest("auth_psw_forgotten", {
            USERNAMEMAIL: usrmail
        }).then(resQuery => {
            if (resQuery.AUTH == 2) { //pending OTP
                setOTPValid(false)
            } else {
                ctx?.showToast({
                    type: "error",
                    text1: "AUTH FAILED",
                    text2: resQuery.MSG
                })
            }
        }).catch(err => {
            ctx?.showToast({
                type: "error",
                text1: "Error",
                text2: "Network error... are you offline?"
            })
        })
    }

    function auth_psw_reset() {
        let usrmail = usernamemail
        if (ctx?.getUID() != undefined) {
            usrmail = ctx?.User.User?.USERNAME
        }
        if (!checkValidityPassword(newPassword)) {
            ctx?.showToast({
                type: "error",
                text1: langselected?.signup?.emailNotValid
            })
        } else if (newPassword != RepPassword) {
            ctx?.showToast({
                type: "error",
                text1: "The passwords are not matching"
            })
        } else {
            doRequest("auth_psw_reset", {
                USERNAMEMAIL: usrmail,
                NEWPASSWORD: React_MD5(newPassword),
                OTP: OTP
            }).then(resQuery => {
                if (resQuery[0].OK) {
                    setModalPswReset(false);
                    ctx?.showToast({
                        type: "success",
                        text1: "Password changed"
                    })
                }
            }).catch(err => {
                ctx?.showToast({
                    type: "error",
                    text1: "Error",
                    text2: JSON.stringify(err)
                })
            })
        }
    }

    return (
        <>
            <TouchableOpacity onPress={() => {
                setModalPswReset(true)
            }}>
                <ThemedText>Reset password</ThemedText>
            </TouchableOpacity>

            <Modal visible={modalPswReset}
                transparent={true}
                onRequestClose={() => {
                    setModalPswReset(false)
                }}
                animationType="slide">
                <ThemedView style={{
                    backgroundColor: "rgba(138, 138, 138, 0.8)",
                    // borderWidth: 3,\
                    height: "100%",
                    padding: 10,
                }}>
                    <ThemedView
                        style={{
                            padding: 20,
                            borderRadius: 10,
                            justifyContent: "space-between",
                            top: 150

                        }}
                    >

                        {OTPValid == null ?
                            <>
                                <ThemedText style={style.label}>Do you want to proceed to change password?</ThemedText>
                                {ctx?.getUID() ??
                                    <>
                                        <ThemedText style={style.label}>Username or email</ThemedText>
                                        <ThemedInput type='outlined' name="email"
                                            placeholder={"Username or email"} onChangeText={(text) => {
                                                setUsernamemail(text)
                                            }} />
                                    </>
                                }

                                <TouchableOpacity
                                    style={[style.buttons.full_screen, { backgroundColor: "#c97f30" }]}
                                    onPress={() => {
                                        auth_psw_forgotten() //send the OTP 
                                    }}>
                                    <ThemedText>Send OTP</ThemedText>
                                </TouchableOpacity>
                            </>
                            :
                            <>
                                {OTPValid == true ?
                                    <>
                                        <ThemedText style={style.label}>New password</ThemedText>
                                        <ThemedPassword type='outlined' name="NewPassword"
                                            placeholder={"New passowrd"} onChangeText={(text) => {
                                                setNewPassword(text)
                                            }} />
                                        <ThemedText style={style.label}>Repeat password</ThemedText>
                                        <ThemedPassword type='outlined' name="RepeatPassword"
                                            placeholder={"Repeat password"} onChangeText={(text) => {
                                                setRepPassword(text)
                                            }} />
                                        <TouchableOpacity style={[style?.buttons?.full_screen, style?.colors?.geomedia_green]} onPress={() => { auth_psw_reset() }}>
                                            <ThemedText>Confirm</ThemedText>
                                        </TouchableOpacity>
                                    </>
                                    :
                                    <>
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
                                        <></>
                                    </>
                                }
                            </>
                        }


                    </ThemedView>
                </ThemedView>
            </Modal>
        </>
    )
}

export default ModalPswReset;