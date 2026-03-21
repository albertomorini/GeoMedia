import { useState } from "react";
import { View, Button } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ThemedText } from "@/components/themed-text";

export default function DateTimeRangePicker() {
    const [start, setStart] = useState(null); // Initially null, meaning no date selected
    const [end, setEnd] = useState(null);

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
        if (updated > end) {
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

    // ---- UI ----
    return (
        <View style={{ padding: 20 }}>
            <ThemedText>The post will be visible from:</ThemedText>
            {start ? (
                <ThemedText>{formatDateTime(start)}</ThemedText>
            ) : (
                <Button title="Select Start" onPress={() => setMode("startDate")} />
            )}


            <ThemedText>The Post will not be visible after:</ThemedText>
            {end ? (
                <ThemedText>{formatDateTime(end)}</ThemedText>
            ) : (
                <Button title="Select End" onPress={() => setMode("endDate")} />
            )}

            {/* START PICKERS */}
            {mode === "startDate" && (
                <DateTimePicker
                    value={start || new Date()} // Use current date as fallback
                    mode="date"
                    onChange={handleStartDate}
                    maximumDate={end || new Date()} // Prevent picking start date after end date
                />
            )}

            {mode === "startTime" && start && (
                <DateTimePicker
                    value={start}
                    mode="time"
                    is24Hour={true}
                    onChange={handleStartTime}
                />
            )}

            {/* END PICKERS */}
            {mode === "endDate" && (
                <DateTimePicker
                    value={end || new Date()} // Use current date as fallback
                    mode="date"
                    onChange={handleEndDate}
                    minimumDate={start || new Date()} // Prevent picking end date before start date
                />
            )}

            {mode === "endTime" && end && (
                <DateTimePicker
                    value={end}
                    mode="time"
                    is24Hour={true}
                    onChange={handleEndTime}
                />
            )}
        </View>
    );
}