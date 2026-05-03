import { style } from '@/components/globalstyle';
import { Image } from "expo-image"; // really, huge improveement
import { useCallback, useContext, useEffect, useState } from 'react';
import { MyContext } from '../../_layout';

import { default_account_profilepic } from '@/assets/images/default_pictures';
import { useLanguage } from '@/components/LanguageProvider';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { Animated, useColorScheme } from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { datetime2date, doRequest } from '../../utility';



const ProfileViewer = () => {

    const ctx = useContext(MyContext)
    const { langselected } = useLanguage()
    const [ProfilePic, setProfilePic] = useState(default_account_profilepic)
    const params = useLocalSearchParams()
    const [user, setUser] = useState()
    const [statsCategory, setstatsCategory] = useState([])
    const [selected, setSelected] = useState(null)
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const [statsTimeMonth, setStatTimeMonth] = useState([])
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthColors = ['#FFB3BA',
        '#FFDFBA',
        '#FFFFBA',
        '#BAFFC9',
        '#BAE1FF',
        '#E3BAFF',
    ]


    function getProfilePic(username) {
        doRequest("profile/pfp", {
            username: username
        }, "GET").then(res => {
            let pp = res[0].PROFILE_PICTURE
            if (pp != undefined) {
                setProfilePic(pp)
            }
        }).catch(err => {
            ctx?.showToast({
                type: "error",
                text1: langselected.network.offline1,
                text2: langselected.network.offline2,
            })
        })
    }

    function get_statsCategory(username) {
        doRequest("profile/stats", {
            username: username,
            mode: "categories"
        }, "GET").then(res => {
            setstatsCategory(
                res.map(item => ({
                    value: item.TOT_POSTS,
                    color: item.COLLECTION_COLOR,
                    text: item.COLLECTION_TITLE,
                }))
            )
        }).catch(err => {
            ctx?.showToast({
                type: "error",
                text1: langselected.network.offline1,
                text2: langselected.network.offline2,
            })
        })
        doRequest("profile/stats", {
            username: username,
            mode: "timemonths"
        }, "GET").then(res => {
            setStatTimeMonth(
                res.map((item, index) => ({
                    value: item.TOT_POSTS,
                    label: monthNames[item.M - 1],
                    frontColor: monthColors[index % 6]
                }))
            )
        }).catch(err => {
            ctx?.showToast({
                type: "error",
                text1: langselected.network.offline1,
                text2: langselected.network.offline2,
            })
        })
    }


    function getInfo(uid) {
        doRequest("profile/info/" + uid, {}, "GET").then(res => {
            get_statsCategory(res[0].USERNAME)
            getProfilePic(res[0].USERNAME)

            setUser(res[0])
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
            if (params?.uid != null) {
                getInfo(params.uid)
            }
        }, [])
    );

    useEffect(() => {
        // animation for donuts chart
        if (selected) {
            scaleAnim.setValue(0);
            opacityAnim.setValue(0);

            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 5,
                    tension: 120,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [selected]);

    return (
        <>
            <Stack.Screen
                options={{
                    title: user?.USERNAME,
                    gestureEnabled: true, 
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
                        <ThemedText className="ThemedText-lg font-bold" style={style.subtitle}>
                            {user?.NAME} {user?.SURNAME}
                        </ThemedText>

                        <ThemedText variant="caption">
                            {user?.USERNAME}
                        </ThemedText>

                        <ThemedText variant="caption" style={{ fontStyle: 'italic', marginBottom: 2 }}>
                            {langselected?.profile.activefrom}: {datetime2date(user?.DC)}
                        </ThemedText>
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


                <ThemedView style={{ flex: 1, width: "100%" }}>
                    <ThemedText style={style.label}>
                        Active on {statsCategory?.length} categories
                    </ThemedText>

                    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <PieChart
                            data={statsCategory}
                            donut
                            radius={90}
                            textSize={12}
                            innerCircleColor={useColorScheme() === 'dark' ? '#121212' : '#fff'}  //thus to allow dark mode
                            innerRadius={40}
                            onPress={(item, index) => {
                                setSelected(item);
                            }}
                            focusOnPress
                        />
                        {selected == null ?
                            <ThemedText>Tap on a category to see more</ThemedText>
                            :
                            (
                                <Animated.View
                                    style={{
                                        marginTop: 20,
                                        transform: [{ scale: opacityAnim }],
                                        opacity: opacityAnim,
                                    }}
                                >
                                    <ThemedText style={{ fontSize: 16 }}>
                                        {selected.text}: with {selected.value} posts
                                    </ThemedText>
                                </Animated.View>
                            )}

                    </ThemedView>


                    <ThemedView style={{ flex: 1, width: "100%" }}>
                        <ThemedText style={style.label}>
                            Number of posts
                        </ThemedText>

                        <BarChart
                            data={statsTimeMonth}
                            barWidth={28}
                            spacing={40}
                            roundedTop
                            roundedBottom
                            hideRules={true}
                            xAxisLabelTextStyle={{ color: "#666", fontSize: 12 }}
                            yAxisTextStyle={{ color: "#666" }}
                            xAxisColor="#ddd"
                            yAxisColor="#ddd"
                            isAnimated={true}
                        />
                    </ThemedView>

                </ThemedView>
            </ThemedView >
        </ >
    )
}

export default ProfileViewer;