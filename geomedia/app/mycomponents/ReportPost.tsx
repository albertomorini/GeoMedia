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
import { useLanguage } from "@/components/LanguageProvider"

const ReportPost = (props) => {
    const ctx = useContext(MyContext)
    const { langselected } = useLanguage()
    const [visibleModalReport, setVisibleModalReport] = useState(false)
    const [kind, setKind] = useState(null)
    const [motive, setMotive] = useState(null)

    function wordCount(text) {
        return text.trim().split(/\s+/).length;
    }
    function createReport() {
        if (kind != null && motive != null) {
            if (wordCount(motive) > 4) {

                doRequest("post/report_new", {
                    postid: props?.postid,
                    uid: ctx?.getUID(),
                    motive: motive,
                    kind: kind
                }).then(r => {
                    ctx?.showToast({
                        type: "success",
                        text1: langselected.reportPost.report_saved,
                        text2: langselected.reportPost.analyze,
                    })
                    setVisibleModalReport(false)
                }).catch(err => {
                    ctx?.showToast({
                        type: "error",
                        text1: langselected.network.offline1,
                        text2: langselected.network.offline2,
                    })
                })
            } else {
                ctx?.showToast({
                    type: "error",
                    text1: langselected.reportPost.missing_data,
                    text2: langselected.reportPost.missing_data_text,
                })
            }
        } else {
            ctx?.showToast({
                type: "error",
                text1: langselected.reportPost.missing_data,
                text2: langselected.reportPost.missing_data_empty,
            })
        }
    }


    return (
        <>
            <ThemedText onPress={() => { setVisibleModalReport(true) }} style={{ color: "red" }}>
                {langselected.reportPost.title}
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
                            <ThemedText style={style.title}>{langselected.reportPost.report}</ThemedText>
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
                                <Picker.Item label={langselected.reportPost.values.default} value={null} enabled={false} />
                                <Picker.Item label={langselected.reportPost.values.misinformation} value="misinformation" />
                                <Picker.Item label={langselected.reportPost.values.illegal} value="illegal" />
                                <Picker.Item label={langselected.reportPost.values.hate_speech} value="hate_speech" />
                                <Picker.Item label={langselected.reportPost.values.harassment} value="harassment" />
                                <Picker.Item label={langselected.reportPost.values.adult} value="adult" />
                                <Picker.Item label={langselected.reportPost.values.impersonation} value="impersonation" />
                                <Picker.Item label={langselected.reportPost.values.copyright} value="copyright" />
                                <Picker.Item label={langselected.reportPost.values.privacy} value="privacy" />
                                <Picker.Item label={langselected.reportPost.values.other} value="other" />
                            </Picker>
                            <ThemedInput
                                multiline={true}
                                type="outlined"
                                placeholder={langselected.reportPost.reportMotive}
                                onChangeText={(text) => {
                                    setMotive(text)
                                }}
                            />
                            <TouchableOpacity style={[style?.buttons?.full_screen, style?.colors?.geomedia_blue]} onPress={() => {
                                createReport()
                            }}>
                                <ThemedText>{langselected.confirm}</ThemedText>
                            </TouchableOpacity>
                        </ThemedView>

                    </ThemedView>
                </ThemedView>

            </Modal>
        </>
    )
}

export default ReportPost;