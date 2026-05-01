import { MyContext } from "@/app/_layout";
import { style } from "@/components/globalstyle";
import { ThemedView } from "@/components/themed-view";
import { useCallback, useContext, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useLanguage } from "@/components/LanguageProvider";
import TagSelector from "./TagSelector";
import { Pressable, ScrollView } from "react-native";
import { doRequest } from "@/app/utility";
import { ThemedText } from "@/components/themed-text";


const ForYou = (props) => {

    const ctx = useContext(MyContext)
    const { langselected } = useLanguage()
    const params = useLocalSearchParams();

    const [interests, setInterests] = useState([])

    function profile_interest_merge(p_interests = interests) {
        doRequest("profile/interests", {
            uid: ctx?.getUID(),
            interests: p_interests
        }).then(res => {
            setInterests(res)
            ctx?.showToast({
                type: "success",
                text1: "Preferences saved!"
            })
        })
    }

    function profile_interest_get() {
        doRequest("profile/interests", { uid: ctx?.getUID() }, "GET").then(resQuery => {
            setInterests(resQuery)
        })
    }

    useFocusEffect(
        useCallback(() => {
            profile_interest_get()
        }, [props])
    )


    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemedView style={[style.container, { height: "100%", flex: 1 }]}>

                <ThemedView style={{ height: 100 }}>

                    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                        <ThemedView style={{
                            width: 150,
                            height: 80,
                            margin: 4,
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "row",
                            flexWrap: "wrap",
                        }}>
                            <TagSelector
                                selected={interests.filter(s => s?.ENTITY == "HASHTAG").map(s => s?.TITLE)} //just the array of valuesF
                                onConfirm={(tags) => {
                                    let final = tags.map(t => { return { value: t, entity: "HASHTAG" } })
                                    // setInterests([...final])
                                    profile_interest_merge(final)
                                }}
                            />
                            {interests?.length > 0 && interests.filter(s => s?.ENTITY == "HASHTAG").map(s => s.TITLE).map(c => (
                                <ThemedView style={{
                                    flexDirection: "row",
                                    flexWrap: "wrap",
                                }}>
                                    <Pressable
                                        key={c}
                                        style={[
                                            {
                                                paddingVertical: 6,
                                                paddingHorizontal: 12,
                                                borderRadius: 20,
                                                backgroundColor: "#eee",
                                                margin: 4,
                                                marginTop: 15
                                            }
                                        ]}
                                    >
                                        <ThemedText style={{ color: "#333" }}>
                                            #{c}
                                        </ThemedText>
                                    </Pressable>
                                </ThemedView>
                            ))}
                        </ThemedView>


                    </ScrollView>
                </ThemedView>
            </ThemedView>

        </GestureHandlerRootView >
    )
}


export default ForYou;
