import { MyContext } from "@/app/_layout";
import { doRequest } from "@/app/utility";
import { useLanguage } from "@/components/LanguageProvider";
import { ThemedText } from "@/components/themed-text";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useContext, useRef, useState } from "react";
import { TouchableOpacity, useColorScheme } from "react-native";

import {
    MD3DarkTheme,
    MD3LightTheme,
    PaperProvider,
} from 'react-native-paper';
import {
    TabsProvider,
    Tabs,
    TabScreen,
} from 'react-native-paper-tabs';
import CollectionListSingle from "./CollectionsListSingle";
import { style } from "@/components/globalstyle";





const Collections = (props) => {

    const ctx = useContext(MyContext)
    const refList = useRef()
    const { langselected } = useLanguage()
    const [collections, setCollections] = useState([])
    const lightTheme = {
        ...MD3LightTheme,
        colors: {
            ...MD3LightTheme.colors,
            primary: "#272727", // blue instead of purple
            secondary: "#272727", // blue instead of purple,
            background: "#F5F7FA",
            surface: "#FFFFFF",
        },
    };

    const darkTheme = {
        ...MD3DarkTheme,
        colors: {
            ...MD3DarkTheme.colors,
            primary: "#F5F7FA",
            secondary: "#F5F7FA",
            background: "#272727",
            surface: "#272727",
        },
    };
    const modes = ["YOU", "R", "TOP", "HOT"]

    /////////////////////////////////////////////////////////

    function getCollectionsList(mode = 0) {
        try {
            doRequest("collections", {
                uid: ctx?.getUID(),
                // mode: props?.postCreation ?? modes[mode] //IF writing, do writing, otherwise let index of section decide
                mode: modes[mode] //IF writing, do writing, otherwise let index of section decide
            }, "GET").then(resQuery => {
                setCollections(resQuery)
            }).catch(err => {
                ctx?.showToast({
                    type: "error",
                    text1: "Error",
                    text2: "Network error... are you offline?"
                })
            })
        } catch (error) {
            ctx?.showToast({
                type: "error",
                text1: "Something went wrong..try again"
            })
        }
    }


    useFocusEffect( //to handle the back on routing
        useCallback(() => {
            try {
                refList?.current?.load_item_selected(props?.itemSelected)
            } catch (error) {

            }
            getCollectionsList(1) //start with "For you" section
        }, [props?.itemSelected])
    )


    return (

        <PaperProvider theme={useColorScheme() == "dark" ? darkTheme : lightTheme}>

            <TabsProvider
                defaultIndex={0}
                onChangeIndex={(indx) => {
                    getCollectionsList(indx)
                }}
            >
                <Tabs
                    tabLabelStyle={{ fontSize: 13.5 }}
                    dark={true} // works the same as AppBar in react-native-paper
                >
                    <TabScreen label={langselected?.collections_page?.foryou} >
                        <ThemedText>For you</ThemedText>
                    </TabScreen>
                    <TabScreen label={langselected?.collections_page?.all} >
                        <CollectionListSingle
                            style={{ flex: 1 }}
                            isSelectable={props?.isSelectable}
                            collections={collections}
                            allowCreation={props?.allowCreation}
                            itemSelected={props?.itemSelected}
                            isBottomSheet={props?.isBottomSheet}
                            onSelect={props?.onSelect} />
                    </TabScreen>
                    <TabScreen label={langselected?.collections_page?.popular} >
                        <CollectionListSingle
                            isSelectable={props?.isSelectable}
                            collections={collections}
                            allowCreation={props?.allowCreation}
                            itemSelected={props?.itemSelected}
                            isBottomSheet={props?.isBottomSheet}
                            onSelect={props?.onSelect} />

                    </TabScreen>
                    <TabScreen
                        label={langselected?.collections_page?.trending}

                    >
                        <CollectionListSingle collections={collections}
                            isSelectable={props?.isSelectable}
                            allowCreation={props?.allowCreation}
                            itemSelected={props?.itemSelected}
                            isBottomSheet={props?.isBottomSheet}
                            onSelect={props?.onSelect} />
                    </TabScreen>
                </Tabs>

            </TabsProvider>
            {props?.allowCreation ??
                <TouchableOpacity
                    style={[style.buttons.fab, style.colors.geomedia_blue, { bottom: 70 }]}
                    onPress={() => {
                        router.push({
                            pathname: '/CollectionCreator',
                            params: {
                                collectionid: null,
                            }
                        })
                    }}
                >
                    <ThemedText style={style.buttons.fabText}>+</ThemedText>
                </TouchableOpacity>
            }
        </PaperProvider>

    )
}

export default Collections;