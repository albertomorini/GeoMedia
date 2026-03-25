import { MyContext } from "@/app/_layout";
import { doRequest } from "@/app/utility";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Stack, useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Alert, Dimensions, Pressable, TouchableOpacity } from "react-native";

import { Image } from 'expo-image'; //BETTER PERFORMANCE COMPARED TO NATIVE ONE

import Carousel from 'react-native-reanimated-carousel';
import { Ionicons } from "@expo/vector-icons";
import { style } from "@/components/globalstyle";
const width = Dimensions.get('window').width;

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
                console.log("!@@@>", resQuery);

            }).catch(err => {
                Alert.alert("Error reading post", err)
            })
        }
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
            <ThemedView style={style.container}>

                <ThemedText style={style?.title}>{postData?.TITLE}</ThemedText>
                <ThemedText style={style?.subtitle}>{postData?.COMMENT}</ThemedText>
                <Carousel
                    width={width}
                    height={250}
                    data={postData?.attachments} //TODO: filter by mime type
                    pagingEnabled
                    snapEnabled
                    loop={false}
                    mode="parallax"
                    modeConfig={{
                        parallaxScrollingScale: 0.9,
                        parallaxScrollingOffset: 52,
                    }}
                    windowSize={3}
                    renderItem={({ item }) => (
                        <ThemedView style={{ flex: 1 }}>
                            <Image
                                source={{ uri: `data:image/jpeg;base64,${item?.BASE64}` }}
                                style={{ width: '100%', height: '100%' }}
                                contentFit="cover"
                                transition={200}
                            />

                            <TouchableOpacity //DOWNLOAD BUTTON
                                onPress={() => console.log(item.filename)}
                                style={{
                                    position: 'absolute',
                                    bottom: 15,
                                    right: 15,
                                    backgroundColor: 'rgba(0,0,0,0.6)',
                                    paddingVertical: 8,
                                    paddingHorizontal: 12,
                                    borderRadius: 8,
                                }}
                            >
                                <ThemedText style={{ color: 'white' }}>Download</ThemedText>

                            </TouchableOpacity>
                            <TouchableOpacity //REMOVE BUTTON //TODO: to show only in editing!!!
                                onPress={() => console.log(item.filename)}
                                style={{
                                    position: 'absolute',
                                    top: 15,
                                    right: 15,
                                    backgroundColor: 'rgba(206, 38, 38, 0.6)',
                                    paddingVertical: 8,
                                    paddingHorizontal: 12,
                                    borderRadius: 8,
                                }}
                            >
                                <ThemedText style={{ color: 'white' }}>Remove</ThemedText>

                            </TouchableOpacity>
                        </ThemedView>
                    )}
                />

                <ThemedView style={[{ flex: 1 },style.containerContent]} >
                    <ThemedText style={[style.label]}>This post has  views</ThemedText>

                    <TouchableOpacity
                        onPress={() => console.log("HEY")}
                        style={{
                            position: 'absolute',
                            top: 40,
                            right: 15,
                            backgroundColor: 'rgba(0,0,0,0.4)',
                            padding: 8,
                            borderRadius: 20,
                        }}
                    >
                        <Ionicons
                            name='heart'
                            color={"red"}
                            // name={isLiked ? 'heart' : 'heart-outline'}
                            size={24}
                        // color={isLiked ? 'red' : 'white'}
                        />
                    </TouchableOpacity>
                </ThemedView>
            </ThemedView >
        </>
    );
}

export default PostViewer;