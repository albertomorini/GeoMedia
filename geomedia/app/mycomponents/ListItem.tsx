import { style } from "@/components/globalstyle";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { TextInput, TouchableOpacity } from "react-native";
import ItemIconizable from "./ItemIconizable";

const ListItem = (props: any) => {
    const [searchText, setSearchText] = useState("")
    const renderItem = ({ item }) => (
        <ItemIconizable item={item} onPress={() => {
            props?.pickedItem(item)
        }} />
    );
    return (
        <ThemedView style={[style?.container, { height: "100%" }]}>
            <ThemedView style={{
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
                <TextInput
                    style={{ flex: 1 }}
                    placeholder="Search..."
                    placeholderTextColor={"#000"}
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
            </ThemedView>
            <ThemedView style={{ flex: 1 }}>
                <FlashList
                    data={props?.DATA?.filter(i => searchText?.length == 0 ? i : i?.TITLE?.toLowerCase().includes(searchText?.toLowerCase()))} //filtering on full data
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    estimatedItemSize={props?.estimatedSize}
                />
            </ThemedView>
        </ThemedView>
    );
};

export default ListItem;