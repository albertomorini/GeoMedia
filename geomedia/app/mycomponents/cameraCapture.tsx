import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    Platform,
} from 'react-native';
import {
    Camera,
    useCameraDevice,
    useCameraPermission,
    CameraPermissionStatus,
    TakePhotoOptions,
} from 'react-native-vision-camera';

import RNFS from "react-native-fs";


// ─── Full-screen Camera Screen ───
export default function OpenCamera({ onClose }: { onClose: () => void }) {
    const { hasPermission, requestPermission } = useCameraPermission();
    const [cameraPermission, setCameraPermission] = useState<CameraPermissionStatus>('not-determined');

    const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('off');
    const [cameraPosition, setCameraPosition] = useState<'back' | 'front'>('back');

    const device = useCameraDevice(cameraPosition);
    const camera = useRef<Camera>(null);

    React.useEffect(() => {
        if (hasPermission) {
            setCameraPermission('authorized');
        } else if (cameraPermission === 'not-determined') {
            requestPermission().then((granted) => {
                setCameraPermission(granted ? 'authorized' : 'denied');
            });
        }
    }, [hasPermission, requestPermission, cameraPermission]);

    const toggleFlash = () => {
        setFlash((prev) => (prev === 'off' ? 'on' : prev === 'on' ? 'auto' : 'off'));
    };

    const toggleCamera = () => {
        setCameraPosition((prev) => (prev === 'back' ? 'front' : 'back'));
    };

    const takePhoto = async () => {
        try {
            if (camera.current == null) return;

            const photo = await camera.current.takePhoto({
                flash: flash,
                qualityPrioritization: 'balanced',
                enableShutterSound: false, // iOS only
            } satisfies TakePhotoOptions);

            const base64String = await RNFS.readFile(photo.path, 'base64');
            console.log("Base64 string: ", base64String); // Log base64



        } catch (e) {
            console.error('Failed to take photo', e);
            Alert.alert('Error', 'Could not capture photo');
        }
    };

    if (cameraPermission !== 'authorized') {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>
                    {cameraPermission === 'denied'
                        ? 'Camera permission denied. Please enable in settings.'
                        : 'Requesting camera permission...'}
                </Text>
                {cameraPermission === 'denied' && (
                    <TouchableOpacity onPress={requestPermission}>
                        <Text style={{ color: 'blue', marginTop: 20 }}>Request again</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (device == null) {
        return (
            <View style={styles.center}>
                <Text>No {cameraPosition} camera device found</Text>
            </View>
        );
    }

    return (
        <View style={StyleSheet.absoluteFill}>
            <Camera
                ref={camera}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                photo={true}           // enable photo capture
                video={false}          // enable if you want video later
                torch={flash === 'on' ? 'on' : 'off'} // continuous torch (flash preview)
            />

            {/* Top bar - controls */}
            <SafeAreaView style={styles.controlsTop}>
                <TouchableOpacity style={styles.iconButton} onPress={onClose}>
                    <Text style={styles.icon}>✕</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconButton} onPress={toggleCamera}>
                    <Text style={styles.icon}>↺</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconButton} onPress={toggleFlash}>
                    <Text style={styles.icon}>
                        {flash === 'on' ? '⚡' : flash === 'auto' ? '⚡ auto' : '⚡ off'}
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>

            {/* Bottom - capture button */}
            <View style={styles.controlsBottom}>
                <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                    <View style={styles.captureInner} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111',
    },
    openButton: {
        backgroundColor: '#0066ff',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 30,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        padding: 40,
    },
    permissionText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    controlsTop: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    controlsBottom: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    iconButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontSize: 24,
        color: 'white',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
    },
    closeButton: {
        marginTop: 30,
        backgroundColor: '#444',
        padding: 12,
        borderRadius: 8,
    },
});