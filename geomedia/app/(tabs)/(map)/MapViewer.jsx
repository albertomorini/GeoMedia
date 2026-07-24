import { forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, PermissionsAndroid, Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps

import Geolocation from '@react-native-community/geolocation';
import { MyContext } from '../../_layout';
import { style } from '@/components/globalstyle';
import { ThemedView } from '@/components/themed-view';
import { doRequest } from '../../utility';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Collections from "../(collections)/Collections";
import * as SecureStore from 'expo-secure-store';

import { MapDarkMode, MapLightMode, MapRetro, MapDefaultMode, MapNightMode } from "@/assets/MapStyler";
import { useLanguage } from "@/components/LanguageProvider";
import TagSelector from '../(collections)/TagSelector';

import * as Haptics from 'expo-haptics';


const MapViewer = forwardRef((props, ref) => {


    const ctx = useContext(MyContext)
    const mapRef = useRef(null);
    const colorScheme = useColorScheme()
    const { langselected } = useLanguage()

    const [mapPreferenceStyle, setMapPreferenceStyle] = useState("system")

    /////////////////////////////////////////////////////////////
    const [postMarkers, setPostMarkers] = useState(null)

    const [UserPosition, setUserPosition] = useState({ latitude: 0, longitude: 0 });

    const snapPoints = useMemo(() => ['50%', '90%'], []);
    const collectionPickerSheet = useRef()

    const [collectionsChosen, setCollectionsChosen] = useState([]);
    const [localCollections, setLocalCollections] = useState([])

    /////////////////////////////////////////////////////////////

    // return true if current position changed within a delta (100m)
    function positionChanged(latitude, longitude, currentPosition = UserPosition) {
        const MIN_DELTA = 0.001; // ~100m

        if (
            Math.abs(latitude - currentPosition.latitude) > MIN_DELTA ||
            Math.abs(longitude - currentPosition.longitude) > MIN_DELTA
        ) {
            return true
        }
        return false
    }

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


    /**
     * GET THE INITIAL LOCATION OF THE USER
     */
    async function getLocation() {

        const hasPermission = await requestLocationPermission();

        if (!hasPermission) {
            Alert.alert(langselected?.permission.location.denied);
            return;
        }
        if (Platform.OS === 'ios') {
            Geolocation.requestAuthorization();
        }

        Geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                if (positionChanged(latitude, longitude, UserPosition)) {
                    setUserPosition(prev => ({ ...prev, latitude: latitude, longitude: longitude }));
                    get_posts_map({ latitude: latitude, longitude: longitude })
                }

                // set map with center on user location 
                mapRef.current?.animateToRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.03, //zoom
                    longitudeDelta: 0.03, //zoom
                }, 1000);
                return { latitude: latitude, longitude: longitude }
            },
            error => {
                console.error(error);

                setTimeout(() => {
                    getLocation()
                }, 5000); //retry within 5 seconds

                if (error.code == 2) { //no GPS
                    ctx?.showToast({
                        type: "info",
                        text1: langselected.permission.location.nogps
                    })
                } else if (error.code == 3) { //no internet
                    ctx?.showToast({
                        type: "info",
                        text1: langselected.permission.location.nointernet
                    })
                }
            },
            {
                enableHighAccuracy: false,
                timeout: 15000, //15 sec
                maximumAge: 15000,// allow 10s cached location
            }
        );
    }
    /////////////////////////////////////////////////////////////

    async function store_preferences(colls) {
        await SecureStore.setItemAsync("collection_selected_map", JSON.stringify(colls));
    }

    async function check_cache_collection_chosen() {
        let colls = await SecureStore.getItemAsync("collection_selected_map")
        try {
            colls = JSON.parse(colls)
            if (colls == null) {
                colls = []
            }
            setCollectionsChosen(colls)
            return colls
        } catch (error) {
            return []
        }
    }

    /////////////////////////////////////////////////////////////
    function get_posts_map(curPos = UserPosition, collections = collectionsChosen) {
        doRequest("post/map", {
            uid: ctx?.getUID(),
            current_position: curPos,
            collection_chosen: collections
        }).then(resQuery => {
            setPostMarkers([...resQuery])
        }).catch(err => {
            ctx?.showToast({
                type: "error",
                text1: langselected.network.offline1,
                text2: langselected.network.offline2,
            })
        })
    }

    /////////////////////////////////////////////////////////////

    async function collections_get_local() {
        if (UserPosition?.latitude != 0 && UserPosition?.longitude != 0) {

            return doRequest("collections/get_local", {
                uid: ctx?.getUID(),
                curr_lat: UserPosition?.latitude,
                curr_lon: UserPosition?.longitude
            }, "GET").then(resQuery => {
                if (resQuery?.length > 0) {
                    setLocalCollections(resQuery)
                    return resQuery
                }
            }).catch(err => {
                ctx?.showToast({
                    type: "error",
                    text1: langselected.network.offline1,
                    text2: langselected.network.offline2,
                })
            })
        }
    }

    /////////////////////////////////////////////////////////////

    async function load_map_preference_style() {
        let style = await SecureStore.getItemAsync("map_style")
        try {
            if (style == null || style == "system") {
                setMapPreferenceStyle("system")
            } else if (style == "dark") {
                setMapPreferenceStyle(MapDarkMode)
            } else if (style == "light") {
                setMapPreferenceStyle(MapLightMode)
            } else if (style == "blue") {
                setMapPreferenceStyle(MapNightMode)
            } else if (style == "retro") {
                setMapPreferenceStyle(MapRetro)
            } else if (style == "google") {
                setMapPreferenceStyle(MapDefaultMode)
            }
        } catch (error) {
        }
    }

    useFocusEffect( //to handle the back on routing
        useCallback(async () => {
            let cols = await check_cache_collection_chosen()
            let local_cols = await collections_get_local()
            if (cols?.length == 0) {
                let lc_ids = local_cols.map(s => s?.ID)
                setCollectionsChosen([...lc_ids])
                get_posts_map(UserPosition, lc_ids)
            } else {

                get_posts_map(UserPosition, cols)
            }
            load_map_preference_style() //thus to get the change of style
        }, [UserPosition]) //when position or collections change (or are loaded) refresh posts
    )
    useEffect(() => {
        getLocation();
        check_cache_collection_chosen()
        load_map_preference_style()
    }, [])

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>

            {
                UserPosition?.latitude == 0 ? //render a spinner while loading current location
                    <ThemedView style={styles.container}>
                        <ActivityIndicator size={"large"} color={style?.colors?.geomedia_green} />
                    </ThemedView>
                    :
                    <ThemedView style={styles.container}>

                        <MapView
                            ref={mapRef}
                            style={styles.map}
                            showsUserLocation={true}
                            toolbarEnabled={true}
                            followsUserLocation={true}
                            initialRegion={{
                                latitude: UserPosition.latitude,
                                longitude: UserPosition.longitude,
                                latitudeDelta: 0.1,
                                longitudeDelta: 0.1,
                            }}
                            customMapStyle={
                                mapPreferenceStyle == "system" ? //here thus to render automatically when toggled by user via status-bar
                                    colorScheme == "dark" ? MapDarkMode : MapLightMode
                                    :
                                    mapPreferenceStyle
                            }
                            onUserLocationChange={(event) => {
                                const { latitude, longitude } = event.nativeEvent.coordinate;

                                if (positionChanged(latitude, longitude)) {
                                    setUserPosition({ latitude: latitude, longitude: longitude });
                                    get_posts_map({ latitude: latitude, longitude: longitude }) //retrieve new posts
                                }
                            }}
                            zoomEnabled={true}
                            camera={{
                                center: {
                                    latitude: UserPosition.latitude,
                                    longitude: UserPosition.longitude,
                                },
                                pitch: 30, // like the angle
                                heading: 0, // direction the camera faces (0 = north)
                                zoom: 13.7, // optional, overrides altitude
                            }}
                            pitchEnabled={true}
                            showsCompass={false}
                            showsBuildings={true}
                            showsMyLocationButton={false} //make it custom thus to give space to collections
                        >
                            {//rendering the markers
                                postMarkers?.map((p, index) => (
                                    <Marker
                                        key={p?.ID}
                                        coordinate={{
                                            latitude: p?.LATITUDE,
                                            longitude: p?.LONGITUDE,
                                        }}
                                        pinColor={p?.COLOR}
                                        title={p?.TITLE}
                                        onPress={() => { ///redirect to post viewer
                                            router.push({
                                                pathname: 'viewer/PostViewer',
                                                params: {
                                                    postid: p?.ID,
                                                }
                                            });
                                        }}
                                    />
                                ))
                            }
                        </MapView>

                        {/* MY LOCATION BUTTON */}
                        <TouchableOpacity
                            onPress={() => {
                                mapRef.current?.animateCamera({
                                    center: {
                                        latitude: UserPosition.latitude,
                                        longitude: UserPosition.longitude,
                                    },
                                    zoom: 15,
                                });
                            }}
                            style={[style.buttons.fab, {
                                // position: "absolute",
                                bottom: 120,
                                right: 20,
                                borderRadius: 28,
                                backgroundColor: "#f2f2f2e7",
                                justifyContent: "center",
                                alignItems: "center",
                            }]}
                        >
                            <Ionicons
                                name="locate"
                                size={24}
                                color="#333"
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel={langselected?.newm}
                            style={[style.buttons.fab, style.colors.geomedia_blue, {
                                bottom: 60,
                                justifyContent: "center",
                            }]}
                            onPress={() => router.push('PostCreator')}
                        >
                            {/* <ThemedText style={style.buttons.fabText}>+</ThemedText> */}
                            <Ionicons
                                name="add"
                                size={24}
                                color="#333"
                            />
                        </TouchableOpacity>

                        {/* COLLECTIONS ON TOP */}
                        <View
                            style={{
                                position: "absolute",
                                right: 0,
                                left: 7,
                                flexDirection: "row",
                                alignItems: "center",
                                top: 50,
                                // paddingTop: localCollections?.length > 0 ? 0 : 35,
                            }}
                        >

                            {/* SCROLLABLE COLLECTIONS */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                inverted
                                style={{
                                    flex: 1,
                                    marginRight: 10,
                                    bottom: 35,
                                }}
                                contentContainerStyle={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <ThemedView
                                    style={{
                                        flexDirection: "row",
                                        backgroundColor: "transparent",
                                    }}
                                >
                                    {localCollections?.map(s => (
                                        <TouchableOpacity
                                            key={s?.ID}
                                            style={{
                                                paddingHorizontal: 9,
                                                paddingVertical: 5,
                                                borderRadius: 20,
                                                marginRight: 8,
                                                borderColor: 'pink',
                                                backgroundColor: collectionsChosen?.includes(s.ID)
                                                    ? s.COLOR
                                                    : `${s.COLOR}99`,
                                            }}
                                            onPress={async () => {

                                                const updatedCollections = collectionsChosen.includes(s?.ID)
                                                    ? collectionsChosen.filter(id => id !== s?.ID)
                                                    : [...collectionsChosen, s?.ID];

                                                setCollectionsChosen(updatedCollections);

                                                get_posts_map(UserPosition, updatedCollections);
                                                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            }}
                                        >
                                            <ThemedText>{s?.TITLE}</ThemedText>
                                        </TouchableOpacity>
                                    ))}
                                </ThemedView>
                            </ScrollView>

                            {/* FIXED BUTTON */}
                            <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityLabel={langselected?.close}
                                style={[
                                    style.colors.geomedia_gray,
                                    {
                                        paddingHorizontal: 9,
                                        paddingVertical: 5,
                                        borderRadius: 20,
                                        marginRight: 8,
                                        bottom: 35,
                                    }
                                ]}
                                onPress={() => {
                                    collectionPickerSheet?.current?.snapToIndex(0)
                                }}
                            >
                                <Ionicons name={"layers"} size={24} style={{ color: "#555" }} />
                            </TouchableOpacity>

                        </View>

                    </ThemedView>
            }
            <BottomSheet
                ref={collectionPickerSheet}
                index={-1}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                enableDynamicSizing={true}
                backgroundStyle={{
                    width: "100%",
                    margin: 0,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    backgroundColor: colorScheme === 'dark' ? '#121212' : '#fff',
                }}

            >

                <BottomSheetScrollView contentContainerStyle={{ flexGrow: 1, flex: 1 }}>
                    <Collections isSelectable={true}
                        allowCreation={false}
                        isBottomSheet={true}
                        itemSelected={collectionsChosen}
                        onSelect={(colls, closeBottom = true) => {
                            store_preferences([...colls]) // store the prefernces on cache
                            setCollectionsChosen([...colls])
                            get_posts_map(UserPosition, colls)
                            // if (closeBottom) {
                            //     collectionPickerSheet?.current?.close()
                            // }
                        }} />

                </BottomSheetScrollView>
            </BottomSheet>

        </GestureHandlerRootView >
    )
})

export default MapViewer





const styles = StyleSheet.create({

    container: {
        flex: 1,
        ...StyleSheet.absoluteFillObject,
        height: "100%",
        width: "100%",
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
})