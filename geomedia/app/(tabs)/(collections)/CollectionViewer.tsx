import { MyContext } from "@/app/_layout";
import { datetime2date, doRequest } from "@/app/utility";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useContext, useState } from "react";
import { Pressable, ScrollView, useColorScheme } from "react-native";


import { style } from "@/components/globalstyle";
import ItemIconizable from "@/app/mycomponents/ItemIconizable";
import { useLanguage } from "@/components/LanguageProvider";

const CollectionViewer = () => {
    const ctx = useContext(MyContext)
    const params = useLocalSearchParams();
    const [collectionData, setCollectionData] = useState(null)

    const { langselected } = useLanguage()
    const colorScheme = useColorScheme()

    const [userCreator, setUserCreator] = useState({
        uid: null,
        username: null,
        name: null,
        pfp: null
    })

    function profile_getpfp(username) {
        doRequest("profile/pfp", { username: username }, "GET").then(res => {
            setUserCreator(prev => ({ ...prev, pfp: res[0]?.PROFILE_PICTURE }))
        }).catch(err => {
            ctx?.showToast({
                type: "error",
                text1: langselected.network.offline1,
                text2: langselected.network.offline2,
            })
        })
    }

    function getUserCreator(userid) {
        doRequest("profile/info/" + userid, {}, "GET").then(res => {

            profile_getpfp(res[0].USERNAME) //yes I could incapsulate all in a single request but nah, better like this, due to optimiziation and async
            setUserCreator(prev => ({
                ...prev,
                uid: userid,
                username: res[0].USERNAME,
                name: res[0].NAME,
                surname: res[0].SURNAME,
            }))
        }).catch(err => {
            ctx?.showToast({
                type: "error",
                text1: langselected.network.offline1,
                text2: langselected.network.offline2,
            })
        })
    }

    function loadFullCollection() {
        let collectionid = null;
        try {
            collectionid = params.collectionid ? JSON.parse(params.collectionid as string) : null;
        } catch (e) {
            console.error("Failed to parse collectionData", e);
            collectionid = null;
        }

        if (collectionid != null) {
            doRequest("collection/id/" + collectionid, {
                "uid": ctx?.getUID()
            }, "GET").then(resQuery => {
                getUserCreator(resQuery[0]?.OWNERID)
                setCollectionData(resQuery[0])
                console.log(JSON.parse(resQuery[0].HASHTAGS));

            }).catch(err => {
                ctx?.showToast({
                    type: "error",
                    text1: langselected.network.offline1,
                    text2: langselected.network.offline2,
                })
            })
        }
    }

    useFocusEffect(
        useCallback(() => {
            if (params?.collectionid != null) {
                loadFullCollection()
            }
        }, [])
    );

    return (
        <>
            <Stack.Screen
                options={{
                    title: collectionData?.TITLE,
                }}
            />

            <ThemedView style={{ flex: 1 }}>

                {/* MAIN LAYOUT */}
                <ThemedView style={{ flex: 1 }}>

                    {/* SCROLLABLE CONTENT */}
                    <ScrollView
                        contentContainerStyle={{
                            padding: 16,
                            paddingBottom: 100, // space for bottom bar
                        }}
                    >


                        <ItemIconizable
                            item={{
                                ICON: collectionData?.ICON,
                                COLOR: collectionData?.COLOR,
                                TITLE: collectionData?.TITLE,
                                SUBTITLE: collectionData?.COLLECTION_NAME,
                            }}
                        />


                        {
                            (collectionData?.DESCRIPTION == undefined || collectionData?.DESCRIPTION?.length == 0) ? null :
                                <ThemedText
                                    style={[
                                        style.subtitle,
                                        {
                                            backgroundColor: colorScheme === 'dark' ? "#4d4d4d" : '#f2f2f2',
                                            borderRadius: 50,
                                            padding: 16,
                                            marginBottom: 5,
                                            fontStyle: "italic"
                                        },
                                    ]}
                                >
                                    {collectionData?.DESCRIPTION}
                                </ThemedText>
                        }

                        <ThemedView style={{ height: 100 }}>

                            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                                {collectionData?.HASHTAGS != null && JSON.parse(collectionData?.HASHTAGS)?.map(c => (
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
                        </ThemedView>
                        <ThemedText style={style.label}>
                            {langselected.collection.collectionowner}
                        </ThemedText>
                        <ItemIconizable
                            isImage={true}
                            onPress={() => {
                                router.push({
                                    pathname: "viewer/ProfileViewer",
                                    params: { uid: userCreator?.uid },
                                });
                            }}
                            item={{
                                ICON: userCreator?.pfp,
                                TITLE: userCreator?.username,
                                SUBTITLE: (langselected.on + " " + datetime2date(collectionData?.DC))
                            }}
                        />
                    </ScrollView>

                </ThemedView>
            </ThemedView>
        </>
    );
}

export default CollectionViewer;
