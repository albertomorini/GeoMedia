import { MyContext } from "@/app/_layout";
import { datetime2date, doRequest } from "@/app/utility";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { Alert, ScrollView, TouchableOpacity, useColorScheme } from "react-native";


import { Ionicons } from "@expo/vector-icons";
import { style } from "@/components/globalstyle";
import CarouselFileViewer from "@/app/mycomponents/file/CarouselFileViewer";
import ItemIconizable from "@/app/mycomponents/ItemIconizable";
import ReportPost from "@/app/mycomponents/ReportPost";
import { useLanguage } from "@/components/LanguageProvider";

const PostViewer = () => {
    const ctx = useContext(MyContext)
    const params = useLocalSearchParams();
    const [postData, setPostData] = useState(null)

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

    function loadFullPost() {
        let postid = null;
        try {
            postid = params.postid ? JSON.parse(params.postid as string) : null;
        } catch (e) {
            console.error("Failed to parse postData", e);
            postid = null;
        }

        if (postid != null) {
            doRequest("post/id/" + postid, {
                "uid": ctx?.getUID()
            }, "GET").then(resQuery => {
                getUserCreator(resQuery[0]?.AUTHOR_ID)
                setPostData(resQuery[0])
            }).catch(err => {
                ctx?.showToast({
                    type: "error",
                    text1: langselected.network.offline1,
                    text2: langselected.network.offline2,
                })
            })
        }
    }

    function toggleLike() {

        setPostData(prev => ({
            ...prev,
            LIKED_BY_CURR_USER: !postData?.LIKED_BY_CURR_USER,
            NUM_LIKES: postData?.NUM_LIKES + (!postData?.LIKED_BY_CURR_USER ? 1 : -1) //if liked remove it
        }));

        doRequest("post/interactions_likepost", {
            postid: postData?.ID,
            uid: ctx?.getUID()
        }, "GET").then(resQuery => {
            ctx?.showToast({
                type: "success",
                text1: "Post " + (resQuery[0].OPERATION == "I" ? langselected.liked : langselected.unliked)
            })
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
            if (params?.postid != null) {
                loadFullPost()
            }
        }, [])
    );

    return (
        <>
            <Stack.Screen
                options={{
                    title: postData?.TITLE,
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
                                ICON: postData?.ICON,
                                COLOR: postData?.COLOR,
                                TITLE: postData?.TITLE,
                                SUBTITLE: postData?.COLLECTION_NAME,
                            }}
                        />

                        {postData?.attachments?.length > 0 && (
                            <CarouselFileViewer
                                attachments={postData?.attachments}
                                isEdit={false}
                            />
                        )}

                        {
                            (postData?.COMMENT == undefined || postData?.COMMENT?.length == 0) ? null :
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
                                    {postData?.COMMENT}
                                </ThemedText>
                        }

                        <ItemIconizable
                            isImage={true}
                            onPress={() => {
                                router.push({
                                    pathname: "/ProfileViewer",
                                    params: { uid: userCreator?.uid },
                                });
                            }}
                            item={{
                                ICON: userCreator?.pfp,
                                TITLE: userCreator?.username,
                                SUBTITLE: (langselected.on + " " + datetime2date(postData?.DC))
                            }}
                        />


                        {/* EDIT BUTTON */}
                        {(parseInt(ctx?.getUID()) === parseInt(postData?.AUTHOR_ID)) && (
                            <TouchableOpacity
                                style={[
                                    style.buttons.full_screen,
                                    style.colors.geomedia_blue,
                                    { marginTop: 20 },
                                ]}
                                onPress={() => {
                                    router.push({
                                        pathname: "/PostCreator",
                                        params: { postid: postData?.ID },
                                    });
                                }}
                            >
                                <ThemedText>{langselected.postCreator.modify} post</ThemedText>
                            </TouchableOpacity>
                        )}

                        <ReportPost postid={postData?.ID} />
                    </ScrollView>

                    <ThemedView style={style.bottom_bar}>

                        <ThemedView style={style.bottom_bar_item}>
                            <Ionicons name="eye-outline" size={20} color={"#555"} />
                            <ThemedText style={{
                                fontSize: 16,
                                fontWeight: "500",
                            }}>{langselected?.views}: {postData?.NUM_VIEWS}</ThemedText>
                        </ThemedView>

                        <ThemedView style={style.bottom_bar_item}>
                            <ThemedText style={{
                                fontSize: 16,
                                fontWeight: "500",
                            }}>{langselected.likes}: {postData?.NUM_LIKES}</ThemedText>

                            <TouchableOpacity
                                onPress={() => {
                                    toggleLike()
                                }}
                                style={{
                                    backgroundColor: 'rgba(0,0,0,0.4)',
                                    padding: 8,
                                    borderRadius: 20,
                                }}
                            >
                                <Ionicons
                                    name={postData?.LIKED_BY_CURR_USER ? 'heart' : 'heart-outline'}
                                    size={24}
                                    color={postData?.LIKED_BY_CURR_USER ? 'red' : 'white'}
                                />
                            </TouchableOpacity>
                        </ThemedView>

                    </ThemedView>

                </ThemedView>
            </ThemedView>
        </>
    );
}

export default PostViewer;
