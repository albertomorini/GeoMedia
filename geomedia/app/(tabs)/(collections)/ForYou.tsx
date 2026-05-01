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
import { BottomSheetInternalContext } from "@gorhom/bottom-sheet/lib/typescript/contexts";
import ListItem from "@/app/mycomponents/ListItem";
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
                text1: "Preferences saved!"
            })
        })
    }

    function profile_interest_get() {
        doRequest("profile/interests", { uid: ctx?.getUID() }, "GET").then(resQuery => {
            setInterests(resQuery)
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

        })
    }

    useFocusEffect(
        useCallback(() => {
            profile_interest_get();
            collectios_by_interest()
        }, [props])
    )


    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemedView style={[style.container, { height: "100%" }]}>
                <ThemedView style={{ flex: 1 }}>
                    <ThemedView style={{ height: 100 }}>

                        <ThemedText>I tuoi interessi</ThemedText>
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
                                        selected={interests.filter(s => s?.ENTITY == "HASHTAG").map(s => s?.TITLE)} //just the array of valuesF
                                        onConfirm={(tags) => {
                                            let final = tags.map(t => { return { value: t, entity: "HASHTAG" } })
                                            // setInterests([...final])
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
                                            // setInterests([...final])
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
                </ThemedView>
                {/* FOR EACH TAG SHOWS THE COLLECTIONS */}
                {collectionByTag != null && Object.keys(collectionByTag)?.map(cc => (
                    <ThemedView
                        style={[styles.card, { flex: 1, width: "100%" }]}
                    >
                        <ThemedText>{cc}</ThemedText>
                        <ThemedView style={{ width: "100%", flex: 1 }}>
                            lista collezioni
                            <CollectionListSingle
                                collections={collectionByTag[cc]}
                                isSelectable={props?.isSelectable}
                                onSelect={props?.onSelect}
                                allowCreation={false}
                                isBottomSheet={props?.isBottomSheet}
                                style={{ flex: 1 }}
                            />
                        </ThemedView>
                    </ThemedView>
                ))}
            </ThemedView>
        </GestureHandlerRootView >
    )
}


export default ForYou;


const styles = StyleSheet.create({
    card: {
        height: 100,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    indexBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // or your theme color
        borderRadius: 6,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    indexText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
