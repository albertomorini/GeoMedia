import { MyContext } from "@/app/_layout";
import { doRequest } from "@/app/utility";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Alert, ScrollView, TouchableOpacity } from "react-native";


import { Ionicons } from "@expo/vector-icons";
import { style } from "@/components/globalstyle";
import CarouselFileViewer from "@/app/mycomponents/file/CarouselFileViewer";
import ItemIconizable from "@/app/mycomponents/ItemIconizable";

const PostViewer = () => {
    const ctx = useContext(MyContext)
    const params = useLocalSearchParams();
    const [postData, setPostData] = useState(null)

    function loadFullPost() {
        let postid = null;
        try {
            postid = params.postid ? JSON.parse(params.postid as string) : null;
        } catch (e) {
            console.error("Failed to parse postData", e);
            postid = null;
        }

        if (postid != null) {
            doRequest("post_get_fullpost", {
                "postid": postid,
                "uid": ctx?.getUID()
            }).then(resQuery => {
                setPostData(resQuery[0])
            }).catch(err => {
                Alert.alert("Error reading post", err)
            })
        }
    }

    function toggleLike() {

        setPostData(prev => ({
            ...prev,
            LIKED_BY_CURR_USER: !postData?.LIKED_BY_CURR_USER,
            NUM_LIKES: postData?.NUM_LIKES + (!postData?.LIKED_BY_CURR_USER ? 1 : -1) //if liked remove it
        }));

        doRequest("interactions_likepost", {
            postid: postData?.ID,
            uid: ctx?.getUID()
        }).then(resQuery => {
            ctx?.showToast({
                type: "success",
                text: "Post " + (resQuery[0].OPERATION == "I" ? "liked" : "unliked")
            })
        }).catch(err => {
            ctx?.showToast({
                type: "error",
                text1: "Network error ",
                text2: JSON.stringify(err)
            })
        })
    }

    useEffect(() => {
        loadFullPost()
    }, [])

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
                                TITLE: postData?.COLLECTION_NAME,
                            }}
                        />

                        <ThemedText style={style.title}>
                            {postData?.TITLE}
                        </ThemedText>

                        <ThemedText
                            style={[
                                style.subtitle,
                                {
                                    backgroundColor: "#777879",
                                    borderRadius: 20,
                                    padding: 16,
                                    marginTop: 10,
                                    marginBottom: 20,
                                },
                            ]}
                        >
                            {postData?.COMMENT}
                        </ThemedText>

                        {postData?.attachments?.length > 0 && (
                            <CarouselFileViewer
                                attachments={postData?.attachments}
                                isEdit={false}
                            />
                        )}

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
                                <ThemedText>Edit post</ThemedText>
                            </TouchableOpacity>
                        )}

                    </ScrollView>

                    <ThemedView style={style.bottom_bar}>

                        <ThemedView style={style.bottom_bar_item}>
                            <Ionicons name="eye-outline" size={20} color={"#555"} />
                            <ThemedText style={{
                                fontSize: 16,
                                fontWeight: "500",
                            }}>Views: {postData?.NUM_VIEWS}</ThemedText>
                        </ThemedView>

                        <ThemedView style={style.bottom_bar_item}>
                            <ThemedText style={{
                                fontSize: 16,
                                fontWeight: "500",
                            }}>Likes: {postData?.NUM_LIKES}</ThemedText>

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
