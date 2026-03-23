import { forwardRef, useImperativeHandle, useState } from "react";
import { TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ThemedText } from "@/components/themed-text";
import { style } from "@/components/globalstyle";
import { ThemedView } from "@/components/themed-view";
import SegmentedControl from "@react-native-community/segmented-control";

const DateTimeRangePicker = forwardRef((props, ref) => {
    const [start, setStart] = useState(props?.start); // Initially null, meaning no date selected
    const [end, setEnd] = useState(props?.end);
    const [isRecurrent, setIsRecurrent] = useState(props?.isRecurrent)

    const recurrencyOptions = ["Never", "Monthly", "Yearly"]

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

        const updated = new Date(start);
        updated.setHours(selectedTime.getHours(), selectedTime.getMinutes());

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
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    useImperativeHandle(ref, () => ({
        getRanges: () => {
            return {
                start: start,
                end: end
            }
        }
    }), [start, end]);


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    return (
        <ThemedView style={{ padding: 20 }}>
            <ThemedText style={style.label}>The post will be visible from:</ThemedText>

            <TouchableOpacity style={[style.colors.geomedia_blue, style.buttons.full_screen]} onPress={() => setMode("startDate")}>
                {start != null ?
                    <ThemedText >{formatDateTime(start)}</ThemedText>
                    :
                    <ThemedText>From now</ThemedText>
                }
            </TouchableOpacity>


            <ThemedText style={style.label}>The Post will not be visible after:</ThemedText>

            <TouchableOpacity style={[style.colors.geomedia_blue, style.buttons.full_screen]} onPress={() => setMode("endDate")}>
                {end == null ?
                    <ThemedText>No expiration</ThemedText>
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
                    maximumDate={end || new Date()} // Prevent picking start date after end date
                />
            )}

            {mode === "startTime" && start && (
                <DateTimePicker
                    value={start}
                    mode="time"
                    is24Hour={true}
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
                        console.log("ANULLA");
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

            <ThemedText style={style?.label}>Recurrent?</ThemedText>
            <SegmentedControl
                values={recurrencyOptions}
                selectedIndex={isRecurrent}
                onChange={(event) => setIsRecurrent(event.nativeEvent.selectedSegmentIndex)}
            />

        </ThemedView>
    );
})

export default DateTimeRangePicker;