import { ThemedText } from '@/components/themed-text';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Alert, Modal, Switch, TouchableOpacity } from 'react-native';

import SegmentedControl from '@react-native-community/segmented-control';
import { ThemedView } from '@/components/themed-view';
import { style } from '@/components/globalstyle';
import MapPicking from './MapPicking';
import { Ionicons } from '@expo/vector-icons';
import RangeTimePicker from './RangeTimePicker';
import { ThemedInput } from '@/components/themed-input';
import { Route } from 'expo-router/build/Route';

const ExclusivityPicking = forwardRef((props, ref) => {

    function HomeScreen() {
        const navigation = useNavigation();

    const [selectedOptions, setSelectedOptions] = useState(0);
    const segmentsOptions = ['Date & Time', 'Location']

    const refTimeRange = useRef()
    //////////
    const [ModalMapVisibity, setModalMapVisibility] = useState(false)
    const [areaKM, setAreaKM] = useState(null);
    const [isRemote, setIsRemote] = useState()
    const [coordinateChosen, setCoordinateChosen] = useState(null)
    //////////

    useImperativeHandle(ref, () => ({
        getExclusivities: () => {
            let range = refTimeRange?.current?.getRanges()
            console.log("Inside exclusivity handler", {
                area_km: areaKM,
                coordinate_chosen: coordinateChosen,
                is_remote: isRemote,
                date_start: range?.start,
                data_end: range?.end
            });

            return {
                area_km: areaKM,
                coordinate_chosen: coordinateChosen,
                is_remote: isRemote,
                date_start: range?.start,
                data_end: range?.end
            }
        }
    }), [areaKM,coordinateChosen,isRemote]);

    return (
        <ThemedView>
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

                            <ThemedInput type='outlined' placeholder='Area of visibility in KM' onChangeText={(txt) => {
                                if (isNaN(txt)) {
                                    Alert.alert("Must be a number")
                                } else {
                                    setAreaKM(txt)
                                }
                            }} />
                            <>
                                <ThemedView style={{
                                    flexDirection: 'row',    // Put text and switch in a row
                                    alignItems: 'center',
                                    margin: 20,
                                    width: "100%"
                                }}>
                                    <ThemedText>Using current location, is remote?</ThemedText>
                                    <Switch
                                        trackColor={{ false: style.switch.track_color_false, true: style.switch.track_color_true }}
                                        thumbColor={isRemote ? style.switch.thumb_color_true : style.switch.thumb_color_false}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={() => { setIsRemote(!isRemote) }}
                                        value={isRemote}
                                    />
                                </ThemedView>

                            </>


                            {isRemote &&
                                <TouchableOpacity style={[style.buttons.full_screen, style.colors.geomedia_blue, { flexDirection: "row" }]} onPress={() => { setModalMapVisibility(true) }}>
                                    <ThemedText>Choose the location</ThemedText>
                                    <Ionicons name="map-outline" size={28} color={"white"} />
                                </TouchableOpacity>
                            }
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
                                        <MapPicking returnLocationChoosen={(coords) => {
                                            setModalMapVisibility(false); // close the modal
                                            setCoordinateChosen(coords)
                                        }} />
                                    </>
                                </Modal>
                            </ThemedView>
                        </>
                }
            })()}
        </ThemedView>
    );
});

export default ExclusivityPicking;