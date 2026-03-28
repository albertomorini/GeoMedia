import { MyContext } from "@/app/_layout";
import { doRequest } from "@/app/utility";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Alert, TouchableOpacity } from "react-native";


import { Ionicons } from "@expo/vector-icons";
import { style } from "@/components/globalstyle";
import CarouselFileViewer from "@/app/mycomponents/file/CarouselFileViewer";

const PostViewer = () => {
    const params = useLocalSearchParams();
    const ctx = useContext(MyContext)
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
            //TODO: show tost
        }).catch(err => {

        })
    }

    useEffect(() => {
        loadFullPost()
    }, [])

    return (
        <>
            <Stack.Screen // SET THE TITLE 
                options={{
                    title: postData?.TITLE,
                }}
            />
            <ThemedView style={{ height: "100%" }}>
                <ThemedView style={style.container}>
                    <ThemedText style={style?.title}>{postData?.TITLE}</ThemedText>
                    <ThemedText style={style?.subtitle}>{postData?.COMMENT}</ThemedText>
                    {postData?.attachments?.length > 0 &&
                        <CarouselFileViewer attachments={postData?.attachments} isEdit={false} />
                    }

                    <ThemedView style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: 15,
                        paddingVertical: 10,
                    }}>
                        <ThemedText style={{
                            fontSize: 16,
                            fontWeight: "500",
                        }}>Views: {postData?.NUM_VIEWS}</ThemedText>

                        <ThemedView style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8
                        }}>
                            <ThemedText style={{
                                fontSize: 16,
                                fontWeight: "500",
                            }}>Likes: {postData?.NUM_LIKES}</ThemedText>

                            {/* Heart button */}
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
                                    name='heart'
                                    name={postData?.LIKED_BY_CURR_USER ? 'heart' : 'heart-outline'}
                                    size={24}
                                    color={postData?.LIKED_BY_CURR_USER ? 'red' : 'white'}
                                />
                            </TouchableOpacity>
                        </ThemedView>

                    </ThemedView >
                    {(parseInt(ctx?.getUID()) == parseInt(postData?.AUTHOR_ID)) ?
                        <TouchableOpacity style={[style.buttons.full_screen, style.colors.geomedia_blue]}
                            onPress={() => {
                                router.push({
                                    pathname: '/PostCreator',
                                    params: {
                                        postid: postData?.ID,
                                    }
                                });
                            }}>
                            <ThemedText>Edit post</ThemedText>
                        </TouchableOpacity>
                        :
                        null
                    }
                </ThemedView >
            </ThemedView >
        </>
    );
}

export default PostViewer;