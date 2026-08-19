import { default_account_profilepic } from "@/assets/images/default_pictures"
import { style } from "@/components/globalstyle"
import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { TouchableOpacity } from "react-native"

/// JUST THE GRAPHIC, NO LOGIC

const ItemIconizable = (props) => {
    return (
        <ThemedView style={{ flex: 1 }}>
            <TouchableOpacity
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: "#ddd",
                }}
                onPress={props?.onPress} //make it manage on parent
            >
                {
                    props?.isImage ?
                        <Image
                            source={{ uri: props?.item.ICON == null ? default_account_profilepic : `data:image/jpeg;base64,${props?.item.ICON}` }}
                            style={style.circleIcon}
                        />
                        :
                        <ThemedView style={[{ backgroundColor: props?.item?.COLOR ?? "#b9b5b5" }, style.circleIcon]}>
                            <Ionicons name={props?.item.ICON ?? 'alert-circle'} size={24} style={{ color: "#555" }} />
                        </ThemedView>
                }
                <ThemedView>
                    <ThemedText style={{ marginLeft: 12, fontSize: 16 }}>
                        {props?.item.TITLE}
                    </ThemedText>
                    {props?.item.SUBTITLE == null ? null :
                        <ThemedText style={{ marginLeft: 12, fontSize: 14, fontStyle: "italic" }}>
                            {props?.item.SUBTITLE}
                        </ThemedText>
                    }
                </ThemedView>
            </TouchableOpacity >
        </ThemedView >
    )
}

export default ItemIconizable;