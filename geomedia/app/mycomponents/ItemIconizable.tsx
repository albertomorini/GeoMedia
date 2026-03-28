import { style } from "@/components/globalstyle"
import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { Ionicons } from "@expo/vector-icons"
import { TouchableOpacity } from "react-native"

/// JUST THE GRAPHIC, NO LOGIC

const ItemIconizable = (props) => {
    return (
        <ThemedView style={{ flex: 1 }}>
            <TouchableOpacity
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: "#ddd",
                }}
                onPress={props?.onPress} //make it manage on parent
            >
                <ThemedView style={[style.circleIcon, { backgroundColor: props?.item?.COLOR }]}>
                    <Ionicons name={props?.item.ICON} size={24} style={{ color: "#555" }} />
                </ThemedView>

                <ThemedText style={{ marginLeft: 12, fontSize: 16 }}>
                    {props?.item.TITLE}
                </ThemedText>
            </TouchableOpacity>
        </ThemedView>
    )
}

export default ItemIconizable;