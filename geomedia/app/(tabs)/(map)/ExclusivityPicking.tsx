import { ThemedText } from '@/components/themed-text';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Alert, Modal, Switch, TouchableOpacity } from 'react-native';

import SegmentedControl from '@react-native-community/segmented-control';
import { ThemedView } from '@/components/themed-view';
import { style } from '@/components/globalstyle';
import MapPicking from '../../mycomponents/MapPicking';
import { Ionicons } from '@expo/vector-icons';
import RangeTimePicker from '../../mycomponents/RangeTimePicker';
import { ThemedInput } from '@/components/themed-input';
import { useLocalSearchParams, router } from 'expo-router';

const ExclusivityPicking = () => {

    const params = useLocalSearchParams();
    let EXCLUSIVITY_PARAMS = null;
    try {
        EXCLUSIVITY_PARAMS = params.exclusivity ? JSON.parse(params.exclusivity as string) : null;
    } catch (e) {
        console.error("Failed to parse postData", e);
        EXCLUSIVITY_PARAMS = null;
    }

    console.log("ExclusivityPicking:", EXCLUSIVITY_PARAMS);

    const [selectedOptions, setSelectedOptions] = useState(0);
    const segmentsOptions = ['Date & Time', 'Location', 'Users']

    const refTimeRange = useRef()
    //////////
    const [ModalMapVisibity, setModalMapVisibility] = useState(false)
    const [coordinateChosen, setCoordinateChosen] = useState({
        latitude: EXCLUSIVITY_PARAMS?.LOCATION?.latitude,
        longitude: EXCLUSIVITY_PARAMS?.LOCATION?.longitude,
    })
    //////////

    return (
        <ThemedView style={style.container}>
            <TouchableOpacity style={[style.buttons?.full_screen, style.colors?.geomedia_green]} onPress={() => {
                /// return ours value
                let range = refTimeRange?.current?.getRanges()
                router.push({
                    pathname: '/PostWriter',
                    params: {
                        exclusivity: JSON.stringify({
                            LOCATION: {
                                latitude: coordinateChosen?.latitude,
                                longitude: coordinateChosen?.longitude,
                            },
                            DATERANGE: {
                                start: range?.start,
                                end: range?.end
                            },
                            USERS: {
                                viewer: ['chiara', 'dexter']
                            }
                        }), /// pass just the exclusivity sections
                    }
                });
            }}>
                <ThemedText>Confirm</ThemedText>
            </TouchableOpacity>
            <SegmentedControl
                values={segmentsOptions}
                selectedIndex={selectedOptions}
                onChange={(event) => setSelectedOptions(event.nativeEvent.selectedSegmentIndex)}
            />
            {(() => {
                switch (selectedOptions) {
                    case 0: //datetime
                        return <RangeTimePicker ref={refTimeRange} />

                    case 1: //map picking
                        return <>
                            {
                                coordinateChosen?.latitude == null ?
                                    <ThemedText style={style.label}>Currently using current location</ThemedText>
                                    :
                                    <>
                                        <ThemedText style={style.label}>Remote location setted:</ThemedText>
                                        <ThemedText>Latitude: {coordinateChosen?.latitude}</ThemedText>
                                        <ThemedText>longitude: {coordinateChosen?.longitude}</ThemedText>
                                    </>
                            }

                            <TouchableOpacity
                                style={[style.buttons.full_screen,
                                (coordinateChosen?.latitude == null ? style.colors.geomedia_blue : style.colors.geomedia_green), // blue if not chosen, green chosen
                                { flexDirection: "row" }]}
                                onPress={() => { setModalMapVisibility(true) }}>
                                <ThemedText>Choose the location</ThemedText>
                                <Ionicons name="map-outline" size={28} color={"white"} />
                            </TouchableOpacity>
                            <ThemedView>
                                <Modal
                                    animationType="slide"
                                    transparent={false}
                                    visible={ModalMapVisibity}
                                    onRequestClose={() => {
                                        setModalMapVisibility(false)
                                    }}
                                >
                                    <>
                                        <MapPicking
                                            coordinateChosen={coordinateChosen}
                                            returnLocationChoosen={(coords) => {
                                                setModalMapVisibility(false); // close map modal
                                                setCoordinateChosen(coords)
                                            }} />
                                    </>
                                </Modal>
                            </ThemedView>
                        </>
                    case 2:
                        return <>
                            <ThemedText>TO BE IMPLEMENTED, chose users</ThemedText>
                        </>
                }
            })()}

        </ThemedView>
    );
};

export default ExclusivityPicking;