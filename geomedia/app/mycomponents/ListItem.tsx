import { style } from "@/components/globalstyle";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { TextInput, TouchableOpacity } from "react-native";
import ItemIconizable from "./ItemIconizable";
import { ThemedText } from "@/components/themed-text";

const ListItem = forwardRef((props: any, ref: any) => {
    const [searchText, setSearchText] = useState("")
    const [selectedItems, setSelectedItems] = useState([]);


    const renderItem = ({ item }) => (
        <ItemIconizable item={item}
            isImage={props?.isImage}
            onPress={() => {
                props?.onSelect(item)
            }} />
    );

    const toggleSelect = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter((item) => item !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const renderItemSelectable = ({ item }) => {
        const isSelected = selectedItems.includes(item.ID);
        return (
            <TouchableOpacity
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 2,
                }}
                onPress={() => toggleSelect(item.ID)}
            >
                <ItemIconizable item={item}
                    isImage={props?.isImage}
                    onPress={() => {
                        toggleSelect(item.ID)
                    }} />

                <Ionicons
                    name={isSelected ? "checkbox-outline" : "square-outline"}
                    size={28}
                    style={{ color: "#6891bd" }}
                />
            </TouchableOpacity>
        );
    };

    function filterData(allowCreation = false) {
        let og_data = props?.DATA
        let filtered = searchText.trim().length == 0 ? og_data : og_data.filter(i => i?.TITLE?.toLowerCase().includes(searchText?.toLowerCase()))

        let new_item = {
            ID: "new_item",
            TITLE: "new " + props?.label,
            ICON: "add",
            COLOR: "#c4aaaa"
        }
        if (searchText?.length == 0 && allowCreation) {
            return [new_item, ...og_data]
        } else if (filtered?.length == 0 && allowCreation) {
            return [new_item]
        }
        return filtered
    }

    useImperativeHandle(ref, () => ({

        get_item_selected: () => {
            return selectedItems
        },
        load_item_selected: (items: Array) => {
            if (Array.isArray(items)) {
                setSelectedItems(items);
            }
        }

    }))

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
                {
                    props?.isSelectable ?
                        <ThemedView style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                        }}>
                            <TouchableOpacity style={[style.buttons.small, style.colors.geomedia_green]} onPress={() => {
                                try {
                                    props?.onSelect(selectedItems)
                                } catch (error) {

                                }
                            }}>
                                <ThemedText>Confirm</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity style={[style.buttons.small, style.colors.geomedia_blue]}
                                onPress={() => {
                                    let alls = props?.DATA.map(s => s?.ID);
                                    if (selectedItems?.length == alls.length) {
                                        setSelectedItems([])
                                    } else {
                                        setSelectedItems([...alls])
                                    }
                                }}>
                                <ThemedText>
                                    {props?.DATA?.length == selectedItems?.length ?
                                        "EMPTY" : "ALL"
                                    }
                                </ThemedText>
                            </TouchableOpacity>
                        </ThemedView>
                        : null
                }
                <FlashList
                    data={filterData(props?.allowCreation)} //filtering on full data
                    renderItem={props?.isSelectable ? renderItemSelectable : renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    estimatedItemSize={props?.estimatedSize}
                />
            </ThemedView>
        </ThemedView >
    );
});

export default ListItem;