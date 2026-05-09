import { style } from "@/components/globalstyle";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { TextInput, TouchableOpacity } from "react-native";
import ItemIconizable from "./ItemIconizable";
import { ThemedText } from "@/components/themed-text";
import { useLanguage } from "@/components/LanguageProvider";
import { BottomSheetFlashList } from "@gorhom/bottom-sheet";

const ListItem = forwardRef((props: any, ref: any) => {
    const [searchText, setSearchText] = useState("")
    const [selectedItems, setSelectedItems] = useState([]);
    const { langselected } = useLanguage()


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
            // if (!props?.searchable) { //if not searchable there's no button for confirm, thus return the selected item on select
            try {
                props?.onSelect(selectedItems.filter((item) => item !== id))
            } catch (error) {

            }
            // }
        } else {
            setSelectedItems([...selectedItems, id]);
            // if (!props?.searchable) { //if not searchable there's no button for confirm, thus return the selected item on select
            try {
                props?.onSelect([...selectedItems, id])
            } catch (error) {
            }
            // }
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
                onPress={() => {
                    toggleSelect(item.ID)

                }}
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

    function filterData() {
        let og_data = props?.DATA
        let filtered = searchText.trim().length == 0 ? og_data : og_data.filter(i => i?.TITLE?.toLowerCase().includes(searchText?.toLowerCase()))
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
        <ThemedView style={[style?.container, { flex: 1 }]}>
            {
                props?.searchable ?
                    <ThemedView style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#f1f1f1",
                        borderRadius: 10,
                        paddingHorizontal: 10,
                        marginBottom: 16,
                        position: 'fixed'
                    }}>
                        <Ionicons name="search-outline" size={20} color="#888" style={{
                            marginRight: 8
                        }} />
                        <TextInput
                            style={{ flex: 1 }}
                            placeholder={langselected.search}
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
                    : null
            }
            <ThemedView style={{ flex: 1 }}>
                {
                    props?.isSelectable && props?.searchable ?
                        <ThemedView style={{
                            flexDirection: "row",
                            justifyContent: "flex-end",
                        }}>
                            {/* <TouchableOpacity style={[style.buttons.small, style.colors.geomedia_green]} onPress={() => {
                                try {
                                    props?.onSelect(selectedItems)
                                } catch (error) {

                                }
                            }}>
                                <ThemedText>{langselected.confirm}</ThemedText>
                            </TouchableOpacity> */}
                            <TouchableOpacity style={[style.buttons.small, style.colors.geomedia_blue]}
                                accessibilityRole="button"
                                accessibilityLabel={
                                    props?.DATA?.length == selectedItems?.length ?
                                        langselected?.empty : langselected?.all
                                }
                                onPress={() => {
                                    let alls = props?.DATA.map(s => s?.ID);
                                    if (selectedItems?.length == alls.length) {
                                        setSelectedItems([])
                                        props?.onSelect([])
                                    } else {
                                        setSelectedItems([...alls])
                                        props?.onSelect([...alls])
                                    }
                                }}>
                                {props?.DATA?.length == selectedItems?.length ?
                                    <ThemedText>
                                        {langselected?.empty}
                                    </ThemedText>
                                    :
                                    <ThemedText>
                                        {langselected?.all}
                                    </ThemedText>
                                }
                            </TouchableOpacity>
                        </ThemedView>
                        : null
                }
                {
                    props?.isBottomSheet ?
                        <BottomSheetFlashList
                            data={filterData()} //filtering on full data
                            renderItem={props?.isSelectable ? renderItemSelectable : renderItem}
                            keyExtractor={(item, index) => index.toString()}
                            estimatedItemSize={props?.estimatedSize}
                            contentContainerStyle={{ paddingBottom: 120 }}
                        />
                        :
                        <FlashList
                            data={filterData()} //filtering on full data
                            renderItem={props?.isSelectable ? renderItemSelectable : renderItem}
                            keyExtractor={(item, index) => index.toString()}
                            estimatedItemSize={props?.estimatedSize}
                            contentContainerStyle={{ paddingBottom: 120 }}
                        />
                }
            </ThemedView>
        </ThemedView >
    );
});

export default ListItem;