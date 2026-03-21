import { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, Alert, PermissionsAndroid, Platform, StatusBar, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps

import Geolocation from '@react-native-community/geolocation';
import { MyContext } from '../_layout';
import { style } from '@/components/globalstyle';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Button } from 're-native-ui';

const MapPicking = forwardRef((props, ref) => {

    const mapRef = useRef(null);
    const ctx = useContext(MyContext)
    /////////////////////////////////////////////////////////////

    const [UserPosition, setUserPosition] = useState({ lat: 0, lon: 0 });
    const [selectedMarker, setSelectedMarker] = useState(null);


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
        <View style={{ flex: 1 }}>
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
                onMarkerPress={(mrk) => {
                    console.log(mrk);
                }}
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
                    key="picker"
                    coordinate={{
                        latitude: UserPosition.lat + 0.001,
                        longitude: UserPosition.lon + 0.001
                    }}
                    draggable
                    onDragEnd={async (e) => {
                        const { latitude, longitude } = e.nativeEvent.coordinate;
                        setSelectedMarker({ latitude, longitude });
                    }}
                    pinColor="#da5353"
                    title="Post location (drag me)"
                />
            </MapView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    bottom: 60, // Position at the bottom
                    right: 20,  // Align to the right
                    backgroundColor: '#3b5998', // Background color
                    width: 60,
                    height: 60,
                    borderRadius: 30, // Circular button
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 5, // Add some shadow on Android
                    shadowColor: '#000', // Shadow on iOS
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                }}
                onPress={() => {
                    props?.returnLocationChoosen(selectedMarker);
                }}
            >
                <ThemedText style={styles.fabText}>Pick</ThemedText>
            </TouchableOpacity>
        </View>
    )
})

export default MapPicking

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
  
})