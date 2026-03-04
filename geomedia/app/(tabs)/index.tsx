import { useEffect, useState } from 'react';
import { Alert, Modal, PermissionsAndroid, Platform, Pressable, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps

import Geolocation from '@react-native-community/geolocation';

const MapScreen = () => {
  const [data, setData] = useState(null)

  const [UserPosition, setUserPosition] = useState([0, 0]);


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
        setUserPosition([latitude, longitude]);
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


    // Geolocation.getCurrentPosition(info => {
    //   console.log(
    //     "HERE",
    //     info.coords.latitude, info.coords.longitude
    //   );

    //   setUserPosition([info.coords.latitude, info.coords.longitude])
    // });

  }
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedMarker, setSelectedMarker] = useState(null);

  useEffect(() => {
    getLocation()
  }, [])

  return (
    <>
      <View style={styles.container}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle={isDark ? 'dark-content' : 'light-content'}
        />

        <MapView
          // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          style={styles.map}
          region={{
            latitude: 51.537430,
            longitude: -0.125250,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}

        >
          <Marker
            key={"self"}
            coordinate={{
              latitude: UserPosition[0],
              longitude: UserPosition[1]
            }}
            pinColor="blue" // 👈 change color here
            title={"Current position"}
            onPress={() =>
              setSelectedMarker({
                title: 'Second one',
                description: 'This is a custom modal example',
              })
            }
          />
          <Marker
            key={"second"}
            coordinate={{
              latitude: 51.537430,
              longitude: -0.125250
            }}
            pinColor="#448d41" // 👈 change color here
            title={"Second one"}
            onPress={() =>
              setSelectedMarker({
                title: 'Second one',
                description: 'This is a custom modal example',
              })
            }
          />
        </MapView>

        <Modal
          visible={!!selectedMarker}
          transparent
          animationType="slide"
        >
          <View style={styles.fullScreenModal}>
            <View style={styles.modalContent}>
              <Text style={styles.title}>
                {selectedMarker?.title}
              </Text>
              <Text>{selectedMarker?.description}</Text>

              <Pressable
                style={styles.closeButton}
                onPress={() => setSelectedMarker(null)}
              >
                <Text style={{ color: '#fff' }}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </>
  )
}

export default MapScreen

const styles = StyleSheet.create({
  contentContainer: {
    flex: 10
  },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fullScreenModal: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
})