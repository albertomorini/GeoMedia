import { doRequest } from "@/app/utility";
import { style } from "@/components/globalstyle";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Switch, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import type { SortableGridRenderItem } from 'react-native-sortables';
import Sortable from 'react-native-sortables';


const CollectionPosts = (props) => {
    const [postList, setPostList] = useState(null)
    const [isSequential, setIsSequential] = useState(false)
    const [modalOrderVisible, setModalOrderVisible] = useState(false)

    const renderItem = useCallback<SortableGridRenderItem<string>>(
        ({ item }) => (
            <ThemedView style={styles.card} key={item?.ID}>
                <ThemedText key={item?.ID + "-" + item?.TITLE}>{item?.TITLE}</ThemedText>
            </ThemedView>
        ),
        []
    );

    function collection_posts_get(collectionid) {
        doRequest("collection_posts_get", {
            collectionid: collectionid
        }).then(resQuery => {
            setPostList(resQuery)
        })
    }

    function confirm_order() {
        let order = postList?.map((s, index) => {
            return { order_id: index, post_id: s.ID }
        })
        console.log("order", order)
        props?.sequentialConfirmed(order);
        setModalOrderVisible(false)
    }

    useFocusEffect(
        useCallback(() => {
            collection_posts_get(props?.collection?.ID)
            setIsSequential(props?.collection?.SEQUENTIALS?.length > 0)
        }, [])
    )

    return (
        <>
            <TouchableOpacity style={[style?.buttons?.full_screen, style?.colors?.geomedia_blue]} onPress={() => { setModalOrderVisible(true) }}>
                <ThemedText>Sequential posts</ThemedText>
            </TouchableOpacity>


            <Modal visible={modalOrderVisible}
                transparent={true}
                animationType="slide">

                <ThemedView style={{
                    flex: 1,
                    backgroundColor: "rgba(138, 138, 138, 0.2)",
                    // borderWidth: 3,\
                    height: "100%",
                    paddingTop: 10,
                    paddingBottom: 10,
                    paddingLeft: 5,
                    paddingRight: 5
                }}>
                    <ThemedView
                        style={{
                            borderRadius: 10,
                            justifyContent: "space-between",
                            top: 50,
                            height: "90%",
                        }}
                    >
                        {/* ---------------------------------------------------- */}

                        <ThemedView style={{
                            flexDirection: "row",
                            width: "100%",
                            height: 40,
                            justifyContent: "space-between",
                            backgroundColor: "#b4a5a5",
                            padding: 5
                        }}>
                            <ThemedText style={style.title}>Sequentiality</ThemedText>
                            <TouchableOpacity style={[style?.colors?.geomedia_red, { borderRadius: 7 }]} onPress={() => {
                                setModalOrderVisible(false)
                            }}>
                                <Ionicons name="close-outline" size={28} color={"#70726db9"} />
                            </TouchableOpacity>
                        </ThemedView>

                        <ScrollView style={{ marginTop: 10, padding: 10 }}>
                            {/* ---------------------------------------------------- */}
                            {/* TOGGLE TO ACTIVATE OR DEACTIVATE THE SEQUENTIALITY */}
                            <ThemedView style={{
                                flexDirection: "row",
                                width: "100%",
                                justifyContent: "space-between",
                            }}>
                                <ThemedText>Sequentiality?</ThemedText>
                                <Switch
                                    value={isSequential}
                                    onValueChange={(value) => {
                                        setIsSequential(value)
                                        if (!value) { 
                                            props?.sequentialConfirmed(null)
                                        }
                                    }}
                                />
                            </ThemedView>
                            {/* ---------------------------------------------------- */}
                            {
                                isSequential ?
                                    <>
                                        {
                                            postList == null ?
                                                <ActivityIndicator size={"large"} color={style?.colors?.geomedia_green} />

                                                :
                                                <ThemedView style={{ padding: 10, borderWidth: 2, borderStyle: "dashed", borderColor: "#6e6e6e", borderRadius: 5 }} >
                                                    <GestureHandlerRootView style={{ flex: 1 }}>
                                                        <Sortable.Grid
                                                            columns={3}
                                                            data={postList}
                                                            renderItem={renderItem}
                                                            rowGap={10}
                                                            keyExtractor={(item) => item.ID}
                                                            columnGap={10}
                                                            onDragEnd={({ data }) => setPostList(data)}
                                                        />
                                                    </GestureHandlerRootView>
                                                </ThemedView>
                                        }
                                        <TouchableOpacity style={[style?.colors?.geomedia_green, style?.buttons?.full_screen]} onPress={() => {
                                            confirm_order()
                                        }}>
                                            <ThemedText>Confirm</ThemedText>
                                        </TouchableOpacity>
                                    </>
                                    :
                                    <ThemedText style={{ top: 15, fontStyle: "italic" }}>All post will be visible, no sequence needed</ThemedText>
                            }

                        </ScrollView>

                    </ThemedView>
                </ThemedView>
            </Modal>

        </>
    )
}

export default CollectionPosts;

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#36877F',
        height: 100,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
