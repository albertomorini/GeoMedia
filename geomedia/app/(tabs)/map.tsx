import { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, PermissionsAndroid, Platform, Pressable, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps

import Geolocation from '@react-native-community/geolocation';
import { MyContext } from '../_layout';
import { style } from '@/components/globalstyle';

const MapScreen = () => {

  const mapRef = useRef(null);
  const ctx = useContext(MyContext)
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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

  /////////////////////////////////////////////////////////////

  useEffect(() => {
    console.log(ctx);

    getLocation()
  }, [])

  return (
    <>
      {
        UserPosition?.lat == 0 ? //while loading current location
          <ActivityIndicator size={"large"} color={style?.colors?.geomedia_green} />
          :
          <View style={styles.container}>

            <MapView
              ref={mapRef}
              // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
              style={styles.map}
              showsUserLocation={true}
              followsUserLocation={true}
              initialRegion={{
                latitude: UserPosition.lat = 0 ? 51 : UserPosition.lat,
                longitude: UserPosition.lon = 0 ? 30 : UserPosition.lon,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              }}
              zoomEnabled={true}
              onMarkerPress={(mrk) => {
                console.log(mrk)
              }}
              camera={{
                center: {
                  latitude: UserPosition.lat === 0 ? 51 : UserPosition.lat,
                  longitude: UserPosition.lon === 0 ? 30 : UserPosition.lon,
                },
                pitch: 30, // <-- default pitch in degrees
                heading: 0, // direction the camera faces (0 = north)
                // // altitude: 1000, // controls zoom
                zoom: 13.7, // optional, overrides altitude
              }}
              pitchEnabled={true}
              showsBuildings={true}
              showsMyLocationButton={true}
            >

              <Marker
                key={"second"}
                coordinate={{
                  latitude: 41.53,
                  longitude: 20.12
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

              {/* {
            DraggableLocation != null ?
              <Marker draggable
                coordinate={DraggableLocation}
                onDragEnd={(e) => { setDraggableLocation(e.nativeEvent.coordinate) }}
              />
              :
              null
          } */}
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

                  {/* 
              <Image
                source={{ uri: base64String }}
                style={{ width: "70%", height: "70%" }}
                resizeMode="contain"
              /> */}

                  <Pressable
                    style={styles.closeButton}
                    onPress={() => setSelectedMarker(null)}
                  >
                    <Text style={{ color: '#fff' }}>Close</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>

            {/* 
        <TouchableOpacity style={styles.fab} onPress={() => {
          setDraggableLocation({
            longitude: UserPosition[0],
            latitude: UserPosition[1]
          })
        }}>
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity> */}


          </View>
      }
    </>
  )
}

export default MapScreen

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
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#66d413',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    color: 'white',
    fontSize: 30,
    lineHeight: 32,
  },
})