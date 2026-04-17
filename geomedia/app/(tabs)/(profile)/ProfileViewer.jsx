import { useCallback, useContext, useState } from 'react';
import { MyContext } from '../../_layout';
import { Image } from "expo-image"; // really, huge improveement
import { Text } from "re-native-ui";
import { style } from '@/components/globalstyle';

import { ThemedText } from '@/components/themed-text';
import { doRequest } from '../../utility';
import { default_account_profilepic } from '@/assets/images/default_pictures';
import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { useLanguage } from '@/components/LanguageProvider';
import { PieChart } from 'react-native-gifted-charts';
import { View } from 'react-native';

const ProfileViewer = () => {

    const ctx = useContext(MyContext)
    const { langselected } = useLanguage()
    const [ProfilePic, setProfilePic] = useState(default_account_profilepic)
    const params = useLocalSearchParams()
    const [user, setUser] = useState()
    const [stats, setStats] = useState([])
    const [selected,setSelected] = useState()


    function getProfilePic(username) {
        doRequest("profile_getpfp", {
            USERNAME: username
        }).then(res => {
            let pp = res[0].PROFILE_PICTURE
            if (pp != undefined) {
                setProfilePic(pp)
            }
        }).catch(err => {
            ctx?.showToast({
                type: "error",
                text1: "Error",
                text2: "Network error... try later"
            })
        })
    }

    function get_stats(username) {
        doRequest("profile_getstats_categories", {
            username: username
        }).then(res => {
            setStats(
                res.map(item => ({
                    value: item.TOT_POSTS,
                    color: item.COLLECTION_COLOR,
                    text: item.COLLECTION_TITLE,
                }))
            )
        })
    }

    function getInfo(username) {
        doRequest("profile_getinfo", {
            username: username
        }).then(res => {
            setUser(res[0])
        }).catch(err => {
            ctx?.showToast({
                type: "error",
                text1: "Network error",
                text2: err
            })
        })
    }

    function post_get_authorid() {
        console.log("TODO")
    }


    useFocusEffect(
        useCallback(() => {
            if (params?.username != null) {
                getInfo(params.username)
                get_stats(params.username)
                getProfilePic(params.username)
            }
            post_get_authorid()
        }, [])
    );

    return (
        <>
            <Stack.Screen
                options={{
                    title: params?.username,
                }}
            />
            <ThemedView style={[style.container, { height: "100%" }]}>
                <ThemedView
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 10,
                    }}
                >
                    <ThemedView style={{ flex: 1, paddingRight: 10 }}>
                        <ThemedText className="text-lg font-bold" style={style.subtitle}>
                            {user?.NAME} {user?.SURNAME}
                        </ThemedText>

                        <Text variant="caption">
                            {user?.USERNAME}
                        </Text>

                        <Text
                            variant="caption"
                            style={{ fontStyle: 'italic', marginTop: 2 }}
                        >
                            {user?.EMAIL}
                        </Text>
                    </ThemedView>

                    <Image
                        source={{ uri: `data:image/jpeg;base64,${ProfilePic}` }}
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 40,
                        }}
                    />
                </ThemedView>


                <ThemedView style={{ height: 250, justifyContent: 'center', alignItems: 'center' }}>

                    <PieChart
                        data={stats}
                        donut
                        radius={90}
                        textSize={12}
                        innerRadius={60}
                        onPress={(item, index) => {
                            setSelected(item);
                        }}
                        focusOnPress
                        centerLabelComponent={() => {
                            return (
                                <ThemedView style={{ alignItems: 'center', borderRadius: 10 }}>
                                    <ThemedText style={{ fontSize: 18, fontWeight: 'bold' }}>
                                        {stats?.length}
                                    </ThemedText>
                                    <ThemedText>categories</ThemedText >
                                </ThemedView>
                            );
                        }}
                    />
                    {selected && (
                        <ThemedText style={{ marginTop: 20, fontSize: 16 }}>
                            {selected.text}: with {selected.value} posts
                        </ThemedText>
                    )}
                </ThemedView>
            </ThemedView>


        </>
    )
}

export default ProfileViewer;