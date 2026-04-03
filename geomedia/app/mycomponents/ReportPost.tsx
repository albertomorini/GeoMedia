import { style } from "@/components/globalstyle"
import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { Ionicons } from "@expo/vector-icons"
import { useContext, useState } from "react"
import { Modal, TouchableOpacity } from "react-native"
import { Picker } from '@react-native-picker/picker';
import { ThemedInput } from "@/components/themed-input"
import { doRequest } from "../utility"
import { MyContext } from "../_layout"

const ReportPost = (props) => {
    const ctx = useContext(MyContext)
    const [visibleModalReport, setVisibleModalReport] = useState(false)
    const [kind, setKind] = useState(null)
    const [motive, setMotive] = useState(null)


    function createReport() {
        doRequest("report_new", {
            postid: props?.postid,
            uid: ctx?.getUID(),
            motive: motive,
            kind: kind
        }).then(r => {
            ctx?.showToast({
                type: "success",
                text1: "Report saving",
                text2: "We'll analyze the content and let you know soon"
            })
            setVisibleModalReport(false)
        }).catch(err => {
            ctx?.showToast({
                type: "error",
                text1: "Something went wrong",
                text2: "Try later"
            })
        })
    }


    return (
        <>
            <ThemedText onPress={() => { setVisibleModalReport(true) }} style={{ color: "red" }}>
                Report this post
            </ThemedText>
            <Modal visible={visibleModalReport}
                transparent={true}
                animationType="slide">
                <ThemedView style={{
                    backgroundColor: "rgba(138, 138, 138, 0.9)",
                    height: "100%",
                    padding: 10,
                }}>
                    <ThemedView
                        style={{
                            borderRadius: 10,
                            justifyContent: "space-between",
                            top: 150,
                            width: "100%",
                        }}
                    >

                        <ThemedView style={{
                            flexDirection: "row",
                            width: "100%",
                            height: 40,
                            justifyContent: "space-between",
                            backgroundColor: "#b4a5a5",
                            padding: 5
                        }}>
                            <ThemedText style={style.title}>Report</ThemedText>
                            <TouchableOpacity style={[style?.colors?.geomedia_red, { borderRadius: 7 }]} onPress={() => {
                                setVisibleModalReport(false)
                            }}>
                                <Ionicons name="close-outline" size={28} color={"#70726db9"} />
                            </TouchableOpacity>
                        </ThemedView>

                        <ThemedView style={{ padding: 15 }}>
                            <Picker
                                selectedValue={kind}
                                onValueChange={(itemValue, itemIndex) =>
                                    setKind(itemValue)
                                }>
                                <Picker.Item label="Choose the kind of report" value={null} enabled={false} />
                                <Picker.Item label="Wrong places/information" value="misinformation" />
                                <Picker.Item label="Illegal content" value="illegal" />
                                <Picker.Item label="Hate Speech" value="hate_speech" />
                                <Picker.Item label="Harassment / Bullying" value="harassment" />
                                <Picker.Item label="Adult Content" value="adult" />
                                <Picker.Item label="Impersonation" value="impersonation" />
                                <Picker.Item label="Copyright Violation" value="copyright" />
                                <Picker.Item label="Privacy Violation" value="privacy" />
                                <Picker.Item label="Other" value="other" />
                            </Picker>
                            <ThemedInput
                                multiline={true}
                                type="outlined"
                                placeholder="Motive of the report"
                                onChangeText={(text) => {
                                    setMotive(text)
                                }}
                            />
                            <TouchableOpacity style={[style?.buttons?.full_screen, style?.colors?.geomedia_blue]} onPress={() => {
                                createReport()
                            }}>
                                <ThemedText>Confirm</ThemedText>
                            </TouchableOpacity>
                        </ThemedView>

                    </ThemedView>
                </ThemedView>

            </Modal>
        </>
    )
}

export default ReportPost;