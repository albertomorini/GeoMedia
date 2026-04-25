import { forwardRef, useContext, useEffect, useRef, useState } from 'react';
import { Alert, PermissionsAndroid, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps

import Geolocation from '@react-native-community/geolocation';
import { MyContext } from '../_layout';
import { ThemedText } from '@/components/themed-text';
import { useLanguage } from '@/components/LanguageProvider';
import { style } from '@/components/globalstyle';
import { ThemedView } from '@/components/themed-view';

const MapPicking = (props, ref) => {

    const mapRef = useRef(null);
    const ctx = useContext(MyContext)
    const { langselected } = useLanguage();
    /////////////////////////////////////////////////////////////

    const [UserPosition, setUserPosition] = useState({ lat: 0, lon: 0, alt: 0 });
    const [selectedMarker, setSelectedMarker] = useState({
        latitude: props?.coordinateChosen?.latitude,
        longitude: props?.coordinateChosen?.longitude,
        altitude: props?.coordinateChosen?.altitude
    });

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
                const { latitude, longitude, altitude } = position.coords;
                setUserPosition({ lat: latitude, lon: longitude, alt: altitude });
                setSelectedMarker({ latitude: latitude, longitude: longitude, altitude: altitude })
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
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000,
            }
        );
    }

    /////////////////////////////////////////////////////////////

    const markerRef = useRef()

    useEffect(() => {
        getLocation();

        // show title when mounted
        setTimeout(() => {
            markerRef.current?.showCallout();
        }, 500);

        // hide it after 5 sec
        setTimeout(() => {
            markerRef.current?.hideCallout();
        }, 4500);
    }, [])

    return (
        <ThemedView style={{ flex: 1 }}>
            <MapView
                ref={mapRef}
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
                camera={{
                    center: {
                        latitude: UserPosition.lat,
                        longitude: UserPosition.lon,
                    },
                    pitch: 30,
                    heading: 0,
                    zoom: 13.7,
                }}
                pitchEnabled={true}
                showsBuildings={true}
                showsMyLocationButton={true}
            >
                <Marker
                    ref={markerRef}
                    key="picker"
                    coordinate={{
                        latitude: (selectedMarker?.latitude == undefined) ? (UserPosition.lat + 0.005) : selectedMarker?.latitude,
                        longitude: (selectedMarker?.longitude == undefined) ? (UserPosition.lon + 0.005) : selectedMarker?.longitude,
                    }}
                    draggable
                    onDragEnd={async (e) => {
                        //ALTITUDE IS NOT AVAILABLE IN DRAGGING - WARNING
                        const { latitude, longitude } = e.nativeEvent.coordinate;
                        setSelectedMarker({ latitude, longitude });
                    }}

                    pinColor="#da5353"
                    title="Post location (drag me)"
                />
            </MapView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={[{
                    position: 'absolute',
                    bottom: 60, // Position at the bottom
                    left: 20,  // Align to the right
                    width: 140,
                    height: 70,
                    padding: 10,
                    borderRadius: 20, // Circular button
                    justifyContent: 'center',
                    alignItems: 'center',
                }, style.colors.geomedia_blue]}
                onPress={() => {
                    props?.cancel();
                }}
            >
                <ThemedText>{langselected?.postCreator?.locationCurrent}</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
                style={[{
                    position: 'absolute',
                    bottom: 60, // Position at the bottom
                    right: 20,  // Align to the right
                    width: 140,
                    height: 70,
                    padding: 10,
                    borderRadius: 20, // Circular button
                    justifyContent: 'center',
                    alignItems: 'center',
                }, style.colors.geomedia_green]}
                onPress={() => {
                    props?.returnLocationChoosen(selectedMarker);
                }}
            >
                <ThemedText >{langselected?.confirm}</ThemedText>
            </TouchableOpacity>
        </ThemedView>
    )
};

export default MapPicking

const styles = StyleSheet.create({

    map: {
        ...StyleSheet.absoluteFillObject,
    },

})