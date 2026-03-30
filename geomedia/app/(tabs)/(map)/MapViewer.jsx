import { forwardRef, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, PermissionsAndroid, Platform, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import MapView, { Marker } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps

import Geolocation from '@react-native-community/geolocation';
import { MyContext } from '../../_layout';
import { style } from '@/components/globalstyle';
import { ThemedView } from '@/components/themed-view';
import { doRequest } from '../../utility';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CollectionsList from "../(collections)/CollectionsList";


const MapViewer = forwardRef((props, ref) => {

    const ctx = useContext(MyContext)
    const mapRef = useRef(null);
    const colorScheme = useColorScheme()

    const [postMarkers, setPostMarkers] = useState(null)
    /////////////////////////////////////////////////////////////

    const [UserPosition, setUserPosition] = useState({ latitude: 0, longitude: 0 });

    const snapPoints = useMemo(() => ['50%', '90%'], []);
    const collectionPickerSheet = useRef()

    const [catsChosen, setCatsChosen] = useState([]);


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
                        title: 'Location Permission',
                        message: 'App needs access to your location',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
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
            Alert.alert('Permission denied');
            return;
        }
        if (Platform.OS === 'ios') {
            Geolocation.requestAuthorization();
        }

        return Geolocation.getCurrentPosition(
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
                console.log('Location error:', error);
                Alert.alert('Error getting location', error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            }
        );


    }


    /////////////////////////////////////////////////////////////
    function get_posts_map(curPos = UserPosition) {
        doRequest("post_get_map", {
            uid: ctx?.getUID(),
            current_position: curPos,
            collection_chosen: catsChosen
        }).then(resQuery => {
            console.log("readed posts: ", resQuery)
            setPostMarkers([...resQuery])
        }).catch(err => {
            Alert.alert("Error retrieving posts: ", err)
        })
    }

    /////////////////////////////////////////////////////////////
    useFocusEffect( //to handle the back on routing
        useCallback(() => {
            getLocation();
        }, [])
    )

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
                            // provider={PROVIDER_GOOGLE} // LATER: to check with google for design
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
                            showsBuildings={true}
                            showsMyLocationButton={true}
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
                                                pathname: '/PostViewer',
                                                params: {
                                                    postid: p?.ID,
                                                }
                                            });
                                        }}
                                    />
                                ))
                            }
                        </MapView>
                        <TouchableOpacity
                            style={[style.buttons.fab, style.colors.geomedia_blue, { bottom: 70 }]}
                            onPress={() => router.push('PostCreator')}
                        >
                            <ThemedText style={style.buttons.fabText}>+</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[style.buttons.fab, style.colors.geomedia_gray, { bottom: 130 }]}
                            onPress={() => {
                                collectionPickerSheet?.current?.snapToIndex(0)
                            }}
                        >
                            <Ionicons name={"layers"} size={24} style={{ color: "#555" }} />
                        </TouchableOpacity>


                        <BottomSheet
                            ref={collectionPickerSheet}
                            index={-1} // start closed
                            snapPoints={snapPoints}
                            enablePanDownToClose={true} // drag down to close
                            onClose={() => {
                                console.log("HEYYY", catsChosen)
                                //TODO: reload post passing what selected
                            }}
                            backgroundStyle={{
                                borderTopWidth: 1,
                                borderEndWidth: 1,
                                borderStartWidth: 1,
                                borderColor: colorScheme === 'dark' ? '#fff' : '#121212', // must be forced not dynamic, in my opinion is quite bugged but whatever tho

                                borderTopLeftRadius: 24,
                                borderTopRightRadius: 24,
                                backgroundColor: colorScheme === 'dark' ? '#121212' : '#fff', // must be forced not dynamic, in my opinion is quite bugged but whatever tho
                            }}
                        >
                            <BottomSheetView style={{ flex: 1 }}>
                                <ThemedView>
                                    <CollectionsList isSelectable={true} allowCreation={false} onSelect={(cats) => {
                                        setCatsChosen([...cats])
                                    }} />
                                </ThemedView>
                            </BottomSheetView>
                        </BottomSheet>
                    </ThemedView>
            }
        </GestureHandlerRootView>
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