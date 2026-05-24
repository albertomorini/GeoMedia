import { style } from '@/components/globalstyle';
import { Image } from "expo-image"; // really, huge improveement
import { useCallback, useContext, useEffect, useState } from 'react';
import { MyContext } from '../_layout';

import { default_account_profilepic } from '@/assets/images/default_pictures';
import { useLanguage } from '@/components/LanguageProvider';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { ActivityIndicator, Alert, Animated, PermissionsAndroid, Platform, ScrollView, StyleSheet, useColorScheme } from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { datetime2date, doRequest } from '../utility';
import ListItem from '@/app/mycomponents/ListItem';

///////////////////////////////////////////////////////////
import { Dimensions, TouchableOpacity } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Ionicons } from "@expo/vector-icons";
import Geolocation from '@react-native-community/geolocation';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const ProfileViewer = () => {

    const ctx = useContext(MyContext)
    const colorScheme = useColorScheme();

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

    /// FOR CAROUSEL STATS
    const carouselData = [
        { type: 'pie' },
        { type: 'bar' },
    ];
    const [activeIndex, setActiveIndex] = useState(0);

    const [allowedPost, setAllowedPost] = useState()

    /////////////////////////////////////////////////////////////////////////////////////////////

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

    /////////////////////////////////////////////////////////////////////////////////////////////
    async function requestLocationPermission() {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: langselected.permission.location.title,
                        message: langselected.permission.location.message,
                        buttonNeutral: langselected.permission.location.buttonNeutral,
                        buttonNegative: langselected.permission.location.buttonNegative,
                        buttonPositive: langselected.permission.location.buttonPositive,
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        // iOS
        return true;
    }
    async function getLocation() {

        const hasPermission = await requestLocationPermission();

        if (!hasPermission) {
            Alert.alert(langselected?.permission.location.denied);
            return;
        }
        if (Platform.OS === 'ios') {
            Geolocation.requestAuthorization();
        }

        return new Promise((resolve) => {
            Geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    resolve({
                        latitude,
                        longitude,
                    });
                },
                (error) => {
                    setTimeout(() => {
                        getLocation();
                    }, 5000);

                    if (error.code === 2) {
                        ctx?.showToast({
                            type: "info",
                            text1: langselected.permission.location.nogps,
                        });
                    } else if (error.code === 3) {
                        ctx?.showToast({
                            type: "info",
                            text1: langselected.permission.location.nointernet,
                        });
                    }

                    resolve(null);
                },
                {
                    enableHighAccuracy: false,
                    timeout: 15000,
                    maximumAge: 15000,
                }
            );
        });
    }

    async function profile_show_allowed_post(profile_id) {
        let coords = await getLocation();

        doRequest("profile/show_allowed_post", {
            uid: ctx?.getUID(),
            profile_id: profile_id,
            curr_lat: coords.latitude,
            curr_lon: coords.longitude,
        }, "GET").then(res => {
            setAllowedPost(res);
        }).catch(err => {
            ctx?.showToast({
                type: "error",
                text1: langselected.network.offline1,
                text2: langselected.network.offline2,
            })
        })
    }


    /////////////////////////////////////////////////////////////////////////////////////////////
    useFocusEffect(
        useCallback(() => {
            if (params?.uid != null) {
                getInfo(params.uid);
                profile_show_allowed_post(params.uid)
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
            {user == null ? //wait till complete
                <ThemedView style={{
                    flex: 1,
                    ...StyleSheet.absoluteFillObject,
                    height: "100%",
                    width: "100%",
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <Stack.Screen //thus to avoid the component name
                        options={{
                            title: langselected?.wait,
                            gestureEnabled: true,
                        }}
                    />
                    <ActivityIndicator size={"large"} color={style?.colors?.geomedia_green} />
                </ThemedView>
                :
                <>
                    <Stack.Screen
                        options={{
                            title: user?.USERNAME,
                            gestureEnabled: true,
                        }}
                    />
                    {/* <ScrollView> */}
                    <ThemedView style={[style.container, { flex: 1 }]}>
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

                        <ThemedView style={{ flex: 1 }}>
                            <ThemedText style={style.label}>{langselected.profile.allowedPost}</ThemedText>
                            <ListItem
                                isImage={false} //we render icons, not expo-image
                                isSelectable={false}
                                estimatedSize={30}
                                allowCreation={false}
                                label="Posts"
                                onSelect={(pickedItem) => {
                                    // console.log(pickedItem, JSON.parse(pickedItem),pickedItem.post_id);

                                    router.push({
                                        pathname: 'viewer/PostViewer',
                                        params: {
                                            postid: pickedItem?.post_id,
                                        }
                                    });

                                }}
                                DATA={allowedPost}
                            />
                        </ThemedView>

                        <ThemedView style={{ paddingBottom: 50 }}>
                            <ThemedText style={style.label}>{langselected?.profile?.stat}</ThemedText>
                            <Carousel
                                width={width}
                                height={height / 3}
                                data={carouselData}
                                pagingEnabled
                                snapEnabled
                                loop={false}
                                onSnapToItem={(index) => setActiveIndex(index)}
                                mode="parallax"
                                modeConfig={{
                                    parallaxScrollingScale: 0.9,
                                    parallaxScrollingOffset: 52,
                                }}
                                renderItem={({ item }) => {
                                    if (item.type === 'pie') {
                                        return (
                                            <ThemedView
                                                style={{
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <ThemedText style={style.label}>
                                                    Active on {statsCategory?.length} categories
                                                </ThemedText>

                                                <PieChart
                                                    data={statsCategory}
                                                    donut
                                                    radius={90}
                                                    textSize={12}
                                                    innerCircleColor={
                                                        colorScheme === 'dark'
                                                            ? '#121212'
                                                            : '#fff'
                                                    }
                                                    innerRadius={40}
                                                    onPress={(item) => setSelected(item)}
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
                                        );
                                    }

                                    return (
                                        <ThemedView
                                            style={{
                                                justifyContent: 'center',
                                                paddingHorizontal: 20,
                                            }}
                                        >
                                            <ThemedText style={style.label}>
                                                {langselected?.profile.stat_n_post}
                                            </ThemedText>

                                            <BarChart
                                                data={statsTimeMonth}
                                                barWidth={28}
                                                spacing={40}
                                                roundedTop
                                                roundedBottom
                                                hideRules
                                                isAnimated
                                                xAxisColor={colorScheme == "dark" ? '#fff' : '#000'}
                                                yAxisColor={colorScheme == "dark" ? '#fff' : '#000'}
                                                xAxisLabelTextStyle={{
                                                    color: colorScheme == "dark" ? '#fff' : '#000',
                                                }}
                                                yAxisTextStyle={{
                                                    color: colorScheme == "dark" ? '#fff' : '#000',
                                                }}
                                            />
                                        </ThemedView>
                                    );
                                }}
                            />

                            {/* Pagination Dots */}
                            <ThemedView
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                }}
                            >
                                {carouselData.map((_, index) => (
                                    <ThemedView
                                        key={index}
                                        style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: 4,
                                            marginHorizontal: 4,
                                            backgroundColor:
                                                colorScheme == "dark" ?
                                                    activeIndex === index ? '#ccc' : '#555' :
                                                    activeIndex === index ? '#555' : '#ccc'
                                            ,
                                        }}
                                    />
                                ))}
                            </ThemedView>
                        </ThemedView>

                    </ThemedView >
                    {/* </ScrollView> */}
                </ >
            }

        </>

    )
}

export default ProfileViewer;