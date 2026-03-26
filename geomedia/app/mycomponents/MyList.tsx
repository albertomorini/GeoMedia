import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";

const MyList = (props: any) => {
    const [searchText, setSearchText] = useState("")
    const renderItem = ({ item }) => (
        <TouchableOpacity style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#ddd",
        }} onPress={() => {
            props?.pickedItem(item)
        }}>
            {(props?.isImage) ?
                null
                :
                <TouchableOpacity
                    key={item?.ID}
                    onPress={() => setIconSelected(icon)}
                    style={styles.item}
                >
                    <ThemedView
                        style={[
                            styles.circle, { backgroundColor: item?.COLOR },
                        ]}
                    >
                        <Ionicons name={item.ICON} size={24} style={{
                            marginRight: 16,
                            color: "#555",
                        }} />
                    </ThemedView>
                </TouchableOpacity>


            }
            <ThemedText style={{ flex: 1, fontSize: 16, }}>
                {item.TITLE}
            </ThemedText>
        </TouchableOpacity>
    );

    return (
        <ThemedView>
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#f1f1f1",
                borderRadius: 10,
                paddingHorizontal: 10,
                marginBottom: 16,
            }}>
                <Ionicons name="search-outline" size={20} color="#888" style={{
                    marginRight: 8
                }} />
                <ThemedInput
                    style={{ flex: 1, height: 40 }}
                    placeholder="Search..."
                    value={searchText}
                    onChangeText={setSearchText}
                />
                {searchText?.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchText("")}>
                        <Ionicons name="close-circle" size={20} color="#888" style={{
                            marginLeft: 8
                        }} />
                    </TouchableOpacity>
                )}
            </View>

            <FlashList
                data={props?.DATA?.filter(i => i?.TITLE?.toLowerCase().includes(searchText?.toLowerCase()))} //filtering on full data
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                estimatedItemSize={props?.estimatedSize}
            />
        </ThemedView>
    );
};

export default MyList;

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        width: '85%',
        borderRadius: 20,
        padding: 20,
    },

    // ICON GRID
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    item: {
        width: '25%',
        alignItems: 'center',
        marginBottom: 15,
    },
    circle: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selected: {
        borderWidth: 4,
    },

    // COLOR ROW
    colorRow: {
        paddingVertical: 10,
    },
    colorCircle: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        marginRight: 10,
    },
    colorSelected: {
        borderWidth: 1.5,
        borderColor: '#000',
    },
});