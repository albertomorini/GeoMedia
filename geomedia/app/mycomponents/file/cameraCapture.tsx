import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, CameraPermissionStatus, TakePhotoOptions, } from 'react-native-vision-camera';

import RNFS from "react-native-fs";
import { ThemedText } from '@/components/themed-text';
import { useLanguage } from '@/components/LanguageProvider';

export default function OpenCamera(
    { onClose, storePhoto }: { onClose: () => void; storePhoto: (b64: string) => void }
) {
    const { hasPermission, requestPermission } = useCameraPermission();
    const [cameraPermission, setCameraPermission] = useState<CameraPermissionStatus>('not-determined');

    const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('off');
    const [cameraPosition, setCameraPosition] = useState<'back' | 'front'>('back');

    const device = useCameraDevice(cameraPosition);
    const camera = useRef<Camera>(null);
    const langselected = useLanguage()

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
                fileType: 'jpg',
                qualityPrioritization: 'balanced',
                enableShutterSound: false, // iOS only
            } satisfies TakePhotoOptions);

            const base64String = await RNFS.readFile(photo.path, 'base64');
            // return { base64: base64String, format: "jpg" }
            return base64String
        } catch (e) {
            console.error('Failed to take photo', e);
            Alert.alert('Error', langselected.permission.camera.error + ": " + e);
        }
    };

    if (cameraPermission !== 'authorized') {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>
                    {cameraPermission === 'denied'
                        ? langselected.permission?.camera.denied
                        : langselected.permission?.camera.asking}
                </Text>
                {cameraPermission === 'denied' && (
                    <TouchableOpacity onPress={requestPermission}>
                        <Text style={{ color: 'blue', marginTop: 20 }}>{langselected.permission.camera.again}</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.buttonText}>{langselected.close}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (device == null) {
        return (
            <View style={styles.center}>
                <Text>{cameraPosition} {langselected.permission.camera.notfound}</Text>
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
                enableZoomGesture={true}
                torch={flash === 'on' ? 'on' : 'off'} // continuous torch (flash preview)
            />

            {/* CONTROLS*/}
            <ThemedText style={styles.controlsTop}>
                {/* CLOSE */}
                <TouchableOpacity style={[styles.iconButton, styles.iconClose]} onPress={onClose}>
                    <Text style={styles.icon}>✕</Text>
                </TouchableOpacity>

            </ThemedText>

            <ThemedText style={styles.controlsBottom, styles?.controlsTopLeft}>

                {/* FLASH */}
                <TouchableOpacity style={styles.iconButton} onPress={toggleFlash}>
                    <Text style={styles.icon, styles?.iconFlash}>
                        {flash === 'on' ? '⚡' : flash === 'auto' ? '⚡ auto' : '⚡ off'}
                    </Text>
                </TouchableOpacity>
            </ThemedText>
            <ThemedText style={styles.controlsBottom, styles?.controlsRight}>

                {/* REVERSE CAMERA */}
                <TouchableOpacity style={styles.iconButton} onPress={toggleCamera}>
                    <Text style={styles.icon}>↺</Text>
                </TouchableOpacity>
            </ThemedText>

            {/* CAPTURE BUTTON */}
            <View style={styles.controlsBottom}>
                <TouchableOpacity style={styles.captureButton} onPress={async () => {
                    let b64 = await takePhoto();
                    storePhoto(b64)
                }}>
                    <View style={styles.captureInner} />
                </TouchableOpacity>
            </View>
        </View >
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
        right: 10, // place near right edge
        flexDirection: 'column', // stack vertically
        alignItems: 'center', // center buttons horizontally
        justifyContent: 'flex-start',
        margin: 5,
        paddingHorizontal: 0, // remove left/right padding
    },
    controlsBottom: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    controlsTopLeft: {
        position: 'absolute',
        right: "70%", // place near right edge
        left: 0,
        flexDirection: 'column', // stack vertically
        alignItems: 'center', // center buttons horizontally
        justifyContent: 'flex-start',
        margin: 5,
        paddingHorizontal: 0, // remove left/right padding
    },
    controlsRight: {
        position: 'absolute',
        bottom: 40,
        left: "70%",
        right: 0,
        alignItems: 'center',
    },
    iconButton: {
        width: 70,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconClose: {
        top: 10,
        marginTop: 40,
        backgroundColor: 'rgba(208, 63, 63, 0.4)',
    },
    iconFlash: {
        fontSize: 14
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