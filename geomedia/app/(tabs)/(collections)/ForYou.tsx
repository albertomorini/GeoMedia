import { MyContext } from "@/app/_layout";
import { style } from "@/components/globalstyle";
import { ThemedView } from "@/components/themed-view";
import { useCallback, useContext, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useLanguage } from "@/components/LanguageProvider";
import TagSelector from "./TagSelector";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { doRequest } from "@/app/utility";
import { ThemedText } from "@/components/themed-text";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import CollectionListSingle from "./CollectionsListSingle";


const ForYou = (props) => {

    const ctx = useContext(MyContext)
    const { langselected } = useLanguage()
    const params = useLocalSearchParams();

    const [interests, setInterests] = useState([])
    const [collectionByTag, setCollectionByTag] = useState({})

    function profile_interest_merge(p_interests = interests) {
        doRequest("profile/interests", {
            uid: ctx?.getUID(),
            interests: p_interests
        }).then(res => {
            setInterests(res)
            ctx?.showToast({
                type: "success",
                text1: langselected.collections_page.preferences_saved
            })
        }).catch(err => {
            ctx?.showToast({
                type: "error",
                text1: langselected.network.offline1,
                text2: langselected.network.offline2,
            })
        })
    }

    function profile_interest_get() {
        doRequest("profile/interests", { uid: ctx?.getUID() }, "GET").then(resQuery => {
            setInterests(resQuery)
        }).catch(err => {
            ctx?.showToast({
                type: "error",
                text1: langselected.network.offline1,
                text2: langselected.network.offline2,
            })
        })
    }

    function collectios_by_interest() {
        doRequest("collection/groupByTag", { uid: ctx?.getUID() }, "GET").then(resQuery => {
            let dummy = {}
            // group by tag the collections
            resQuery.forEach(x => {
                if (dummy[x.TAG] == undefined) {
                    dummy[x.TAG] = []
                }
                dummy[x.TAG].push(x)
            })

            setCollectionByTag(dummy)

        }).catch(err => {
            ctx?.showToast({
                type: "error",
                text1: langselected.network.offline1,
                text2: langselected.network.offline2,
            })
        })
    }

    useFocusEffect(
        useCallback(() => {
            profile_interest_get();
            collectios_by_interest()
        }, [])
    )


    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemedView style={[style.container, { height: "100%" }]}>
                <ThemedView style={{ height: 100 }}>
                    <ThemedText style={style.title}>{langselected.collections_page.your_interests}</ThemedText>
                    {props?.isBottomSheet ?
                        <BottomSheetScrollView horizontal showsHorizontalScrollIndicator={true}>
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
                                    selected={interests?.filter(s => s?.ENTITY == "HASHTAG")?.map(s => s?.TITLE)} //just the array of valuesF
                                    onConfirm={(tags) => {
                                        let final = tags.map(t => { return { value: t, entity: "HASHTAG" } })
                                        // setInterests([...final])
                                        profile_interest_merge(final)
                                    }}
                                />
                            </ThemedView>

                            {interests?.length > 0 && interests.filter(s => s?.ENTITY == "HASHTAG").map(s => s.TITLE).map(c => (
                                <ThemedView
                                    key={"view" + c}
                                    style={{
                                        flexDirection: "row",
                                        flexWrap: "wrap",

                                    }}>
                                    <Pressable
                                        key={"press" + c}

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

                        </BottomSheetScrollView>
                        :
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
                                        profile_interest_merge(final)
                                    }}
                                />
                            </ThemedView>

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

                        </ScrollView>
                    }
                </ThemedView>

                {/* ------------------------------------------------- */}
                {/* FOR EACH TAG SHOWS THE COLLECTIONS */}
                {
                    props?.isBottomSheet ?
                        <BottomSheetScrollView>
                            {collectionByTag != null && Object.keys(collectionByTag)?.map(cc => (
                                <ThemedView
                                    style={[styles.card, { flex: 1, width: "100%", height: "100%" }]}
                                >
                                    <ThemedText style={styles.title}>#{cc}</ThemedText>
                                    <ThemedView style={{ width: "100%", flex: 1, }}>
                                        <CollectionListSingle
                                            collections={collectionByTag[cc]}
                                            isSelectable={props?.isSelectable}
                                            onSelect={props?.onSelect}
                                            itemSelected={props?.itemSelected}
                                            allowCreation={false}
                                            isBottomSheet={props?.isBottomSheet}
                                            style={{ flex: 1 }}
                                        />
                                    </ThemedView>
                                </ThemedView>
                            ))}
                        </BottomSheetScrollView>
                        :

                        <ScrollView
                            showsVerticalScrollIndicator={true}
                        >
                            {collectionByTag != null && Object.keys(collectionByTag)?.map(cc => (
                                <ThemedView
                                    style={[styles.card, { flex: 1, width: "100%", height: "100%" }]}
                                >
                                    <ThemedText style={styles.title}>#{cc}</ThemedText>
                                    <ThemedView style={{ width: "100%", flex: 1, }}>
                                        <CollectionListSingle
                                            collections={collectionByTag[cc]}
                                            isSelectable={props?.isSelectable}
                                            onSelect={props?.onSelect}
                                            itemSelected={props?.itemSelected}
                                            allowCreation={false}
                                            isBottomSheet={props?.isBottomSheet}
                                            style={{ flex: 1 }}
                                        />
                                    </ThemedView>
                                </ThemedView>
                            ))}
                        </ScrollView>
                }


            </ThemedView>
        </GestureHandlerRootView >
    )
}


export default ForYou;


const styles = StyleSheet.create({
    card: {
        height: 100,
        borderRadius: 10,

        alignItems: 'flex-start',
        justifyContent: 'flex-start',

        overflow: "hidden",
        marginVertical: 10,
        padding: 5,

        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
    title: {
        fontWeight: "600",
        textAlign: "left",
        color: "#333",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: "#eee",
        margin: 4,
    },
});
