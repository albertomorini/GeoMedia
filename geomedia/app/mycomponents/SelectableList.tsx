import { useLanguage } from "@/components/LanguageProvider";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import React, { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

const SelectableList = (props: any) => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchText, setSearchText] = useState("")
    const { langselected } = useLanguage()

    const toggleSelect = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter((item) => item !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const renderItem = ({ item }) => {
        const isSelected = selectedItems.includes(item.id);
        return (
            <TouchableOpacity style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#ddd",
            }}
                onPress={() => toggleSelect(item.id)}

            >
                {(props?.isImage) ?
                    null
                    :
                    <Ionicons name={item.icon} size={24} style={{
                        marginRight: 16,
                        color: "#555",
                    }} />

                }

                <ThemedText style={{ flex: 1, fontSize: 16, }}>{item.title}</ThemedText>
                <Ionicons
                    name={isSelected ? "checkbox-outline" : "square-outline"}
                    size={24}
                    style={{
                        color: "#007AFF",
                    }}
                />
            </TouchableOpacity>
        );
    };

    function returnItems() {
        props?.pickedItem(selectedItems)
    }

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
                <TextInput
                    style={{ flex: 1, height: 40 }}
                    placeholder="Search..."
                    value={searchText}
                    onChangeText={setSearchText}
                />
                {searchText?.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchText("")}>
                        <Ionicons name="close-circle" size={20} color="#888" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                )}
            </View>
            <FlashList
                data={props?.DATA?.filter(i => i?.title.toLowerCase().includes(searchText?.toLowerCase()))}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                estimatedItemSize={props?.estimatedSize}
            />
            <TouchableOpacity onPress={() => returnItems()}>
                <ThemedText>{langselected.confirm}</ThemedText>
            </TouchableOpacity>
        </ThemedView>
    );
};

export default SelectableList;