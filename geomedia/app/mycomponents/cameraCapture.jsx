import { useRef, useState, useEffect } from 'react';
import { Camera, useCameraDevice, useCameraDevices, useCameraPermission } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import Share, { Button } from 'react-native-share';
import { ThemedView } from '@/components/themed-view';
import { stat } from 'react-native-nitro-file-system';

const CameraCapture = () => {
    const cameraRef = useRef(null);
    const device = useCameraDevice('back',
        {
            physicalDevices: [
                'ultra-wide-angle-camera',
                'wide-angle-camera',
                'telephoto-camera'
            ]
        }
    )
    const { hasPermission } = useCameraPermission()
    const [showCamera, setShowCamera] = useState(false);


    async function askPermission() {

        const status = await Camera.requestCameraPermission();
        console.log(devices[0].back);

        setHasPermission(status === 'granthed');
    }


    if (!hasPermission) return <PermissionsPage />
    if (device == null) return <NoCameraDeviceError />
    return (
        <>
                <Button title="Open Camera" onPress={setShowCamera(!showCamera)} />

            {showCamera && (
                <>
                    <Camera
                        ref={cameraRef}
                        device={device}
                        isActive={true}
                        photo={true}
                    />
                    <Button title="Take Photo" onPress={takePhoto} />
                </>
            )}
        </>
    );
}

export default CameraCapture