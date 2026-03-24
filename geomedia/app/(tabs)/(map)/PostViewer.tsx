import { MyContext } from "@/app/_layout";
import { doRequest } from "@/app/utility";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Stack, useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Alert, Image } from "react-native";


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
                console.log("!@@@>",resQuery);
                
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
            <ThemedView>

                <ThemedText>{postData?.TITLE}</ThemedText>
                <ThemedText>{postData?.COMMENT}</ThemedText>

                {
                    postData?.attachments?.map(p => (
                        <Image
                            source={{ uri: `data:image/jpeg;base64,${p?.BASE64}` }}
                            style={{
                                width: 180,
                                height: 180,
                                borderRadius: 40,
                            }}
                        />
                    ))
                }

            </ThemedView>
        </>
    );
}

export default PostViewer;