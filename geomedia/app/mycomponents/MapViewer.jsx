import { forwardRef, useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, PermissionsAndroid, Platform, StyleSheet } from 'react-native';
import MapView from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps

import Geolocation from '@react-native-community/geolocation';
import { MyContext } from '../_layout';
import { style } from '@/components/globalstyle';
import { ThemedView } from '@/components/themed-view';

const MapViewer = forwardRef((props, ref) => {

    const mapRef = useRef(null);
    const ctx = useContext(MyContext)
    /////////////////////////////////////////////////////////////

    const [UserPosition, setUserPosition] = useState({ lat: 0, lon: 0 });


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

        Geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                setUserPosition({ lat: latitude, lon: longitude });
                console.log(latitude, longitude);

                // set map with center on user location 
                mapRef.current?.animateToRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.03, //zoom
                    longitudeDelta: 0.03, //zoom
                }, 1000);

            },
            error => {
                console.log('Location error:', error);
                Alert.alert('Error getting location', error.message);
            },
            {
                enableHighAccuracy: false,
                timeout: 15000,
                maximumAge: 10000,
            }
        );


    }


    /////////////////////////////////////////////////////////////

    useEffect(() => {
        getLocation()
    }, [])

    return (
        <>
            {
                UserPosition?.lat == 0 ? //render a spinner while loading current location
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
                            followsUserLocation={true}
                            initialRegion={{
                                latitude: UserPosition.lat,
                                longitude: UserPosition.lon,
                                latitudeDelta: 0.1,
                                longitudeDelta: 0.1,
                            }}
                            zoomEnabled={true}
                            onMarkerPress={(mrk) => {
                                console.log(mrk)
                            }}
                            camera={{
                                center: {
                                    latitude: UserPosition.lat,
                                    longitude: UserPosition.lon,
                                },
                                pitch: 30, // like the angle
                                heading: 0, // direction the camera faces (0 = north)
                                zoom: 13.7, // optional, overrides altitude
                            }}
                            pitchEnabled={true}
                            showsBuildings={true}
                            showsMyLocationButton={true}
                        >
                            {/* //TODO: render the markers  */}
                        </MapView>
                    </ThemedView>
            }
        </>
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