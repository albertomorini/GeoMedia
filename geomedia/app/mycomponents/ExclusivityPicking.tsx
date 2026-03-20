import { ThemedText } from '@/components/themed-text';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Button, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

import SegmentedControl from '@react-native-community/segmented-control';
import { ThemedView } from '@/components/themed-view';
import MapViewer from './MapViewer';
import { style } from '@/components/globalstyle';

export default function ExclusivityPicking() {
    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState(null); // 'date' | 'time'
    const [show, setShow] = useState(false);

    const [selectedIndex, setSelectedIndex] = useState(0);


    const showPicker = (currentMode) => {
        setMode(currentMode);
        setShow(true);
    };

    const onChange = (event, selectedDate) => {
        if (!selectedDate) {
            setShow(false);
            return;
        }

        let newDate = new Date(date);
        if (mode === 'date') {
            newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
            setDate(newDate);
            showPicker('time'); // show time after date
        } else if (mode === 'time') {
            newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
            setShow(false);
        }
        console.log("ISO: ", newDate, "Locale: ", newDate?.toLocaleString());
        setDate(newDate);
    };

    return (
        <ThemedView>
            <SegmentedControl
                values={['Date&Time', 'Location']}
                selectedIndex={selectedIndex}
                onChange={(event) => setSelectedIndex(event.nativeEvent.selectedSegmentIndex)}
            />
            <ThemedText>{selectedIndex}</ThemedText>
            {
                (selectedIndex == 1) ? //TODO: improve, maintainability 
                    <ThemedView style={{ height: "100%" }}>
                        <MapViewer isPicking={true} />
                    </ThemedView>
                    :
                    <View>
                        <TouchableOpacity style={[style?.buttons?.full_screen, style.colors.geomedia_green]} onPress={() => showPicker('date')}>
                            <ThemedText>Pick date & time</ThemedText>
                        </TouchableOpacity>


                        {show && (
                            <DateTimePicker
                                value={date}
                                mode={mode}
                                is24Hour={true}
                                display="default"
                                onValueChange={onChange}
                            />
                        )}


                    </View>
            }
            {/* 
            <ThemedText>ISO: {date.toString()}</ThemedText>
            <ThemedText>LOCALE: {date.toLocaleString()}</ThemedText> */}
            {/* 
            <ThemedText>Selected: {selectedIndex}</ThemedText>
 */}



        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',    // Put text and switch in a row
        alignItems: 'center',
        margin: 20,
    },
    label: {
        flex: 1,                 // Take remaining space
        fontSize: 16,
    },
});