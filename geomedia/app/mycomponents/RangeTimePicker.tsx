import { forwardRef, useImperativeHandle, useState } from "react";
import { Alert, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ThemedText } from "@/components/themed-text";
import { style } from "@/components/globalstyle";
import { ThemedView } from "@/components/themed-view";
import SegmentedControl from "@react-native-community/segmented-control";
import { useLanguage } from "@/components/LanguageProvider";

const DateTimeRangePicker = forwardRef((props, ref) => {
    const [start, setStart] = useState(null); // Initially null, meaning no date selected
    const [end, setEnd] = useState(null);
    const [isRecurrent, setIsRecurrent] = useState(0)

    const { langselected } = useLanguage()

    const recurrencyOptions = langselected.rangeTimePicker.rec_values
    const [mode, setMode] = useState(null); // 'startDate', 'startTime', 'endDate', 'endTime'


    // ---- HANDLERS ----

    const handleStartDate = (event, selectedDate) => {
        if (!selectedDate) return setMode(null);

        // Ensure that only the start date is updated, not affecting end
        setStart(selectedDate);
        setMode("startTime");
    };

    const handleStartTime = (event, selectedTime) => {
        if (!selectedTime) return setMode(null);


        const now = new Date();

        const updated = new Date(start);
        if (selectedTime < now) {
            Alert.alert(langselected?.rangeTimePicker?.not_past_time);
            updated.setHours(now.getHours(), now.getMinutes());
        } else {
            updated.setHours(selectedTime.getHours(), selectedTime.getMinutes());
        }


        setStart(updated);

        // if start is greater than end, update end to start
        if (end && updated > end) {
            setEnd(updated);
        }

        setMode(null);
    };

    const handleEndDate = (event, selectedDate) => {
        if (!selectedDate) return setMode(null);

        // Ensure that only the end date is updated, not affecting start
        setEnd(selectedDate);
        setMode("endTime");
    };

    const handleEndTime = (event, selectedTime) => {
        if (!selectedTime) return setMode(null);

        const updated = new Date(end);
        updated.setHours(selectedTime.getHours(), selectedTime.getMinutes());

        // Validation: end must be >= start
        if (updated < start) {
            setMode(null);
            return;
        }

        setEnd(updated);
        setMode(null);
    };

    // Format date + time to a readable string
    const formatDateTime = (date) => {
        try {
            let d = new Date(date)
            return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
        } catch (error) {
            let d = new Date()
            return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
        }
    };
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    useImperativeHandle(ref, () => ({
        get_dates: () => {
            return {
                start: start,
                end: end,
                recurrent: isRecurrent
            }
        },
        load_dates: (start, end, recurrent) => {
            setStart(start);
            setEnd(end);
            setIsRecurrent(recurrent)
        }
    }), [start, end, isRecurrent]);


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    return (
        <ThemedView style={{ padding: 20, height: "100%" }}>
            <ThemedText style={style.label}>{langselected.rangeTimePicker.startTime}:</ThemedText>

            <TouchableOpacity style={[style.colors.geomedia_blue, style.buttons.full_screen]}

                onPress={() => setMode("startDate")}>
                {start != null ?
                    <ThemedText >{formatDateTime(start)}</ThemedText>
                    :
                    <ThemedText>{langselected.rangeTimePicker.fromnow}</ThemedText>
                }
            </TouchableOpacity>


            <ThemedText style={style.label}>{langselected.rangeTimePicker.endTime}:</ThemedText>

            <TouchableOpacity style={[style.colors.geomedia_blue, style.buttons.full_screen]} onPress={() => setMode("endDate")}>
                {end == null ?
                    <ThemedText>{langselected.rangeTimePicker.noexpiration}</ThemedText>
                    :
                    <ThemedText >{formatDateTime(end)}</ThemedText>
                }
            </TouchableOpacity>

            {/* ------------------------ PICKERS */}
            {mode === "startDate" && (
                <DateTimePicker
                    value={start || new Date()} // Use current date as fallback
                    mode="date"
                    onValueChange={handleStartDate}
                    minimumDate={new Date()}
                // maximumDate={end || new Date()} // Prevent picking start date after end date
                />
            )}

            {mode === "startTime" && start && (
                <DateTimePicker
                    value={start}
                    mode="time"
                    is24Hour={true}
                    minimumDate={new Date()}
                    onValueChange={handleStartTime}
                />
            )}

            {/* END PICKERS */}
            {mode === "endDate" && (
                <DateTimePicker
                    value={end || new Date()} // Use current date as fallback
                    mode="date"
                    onValueChange={handleEndDate}
                    onTouchCancel={() => {
                        setEnd(null)
                    }}
                    minimumDate={start || new Date()} // Prevent picking end date before start date
                />
            )}

            {mode === "endTime" && end && (
                <DateTimePicker
                    value={end}
                    mode="time"
                    is24Hour={true}
                    onValueChange={handleEndTime}
                />
            )}

            <ThemedText style={style?.label}>{langselected.rangeTimePicker?.reccurrent}?</ThemedText>
            <SegmentedControl
                values={recurrencyOptions}
                selectedIndex={isRecurrent}
                onChange={(event) => {
                    console.log(event.nativeEvent.selectedSegmentIndex)
                    setIsRecurrent(event.nativeEvent.selectedSegmentIndex);
                }}
            />

        </ThemedView>
    );
})

export default DateTimeRangePicker;