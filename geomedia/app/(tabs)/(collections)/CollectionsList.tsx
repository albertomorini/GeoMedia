import { MyContext } from "@/app/_layout";
import ListItem from "@/app/mycomponents/ListItem";
import { doRequest } from "@/app/utility";
import { useLanguage } from "@/components/LanguageProvider";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useColorScheme } from "react-native";

import {
    Button,
    Title,
    Paragraph,
    MD3DarkTheme,
    MD3LightTheme,
    PaperProvider,
} from 'react-native-paper';
import {
    TabsProvider,
    Tabs,
    TabScreen,
    useTabIndex,
    useTabNavigation,
} from 'react-native-paper-tabs';


const CollectionsList = (props) => {

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
            doRequest("collection", {
                uid: ctx?.getUID(),
                mode: props?.postCreation ?? modes[mode] //IF writing, do writing, otherwise let index of section decide
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
            getCollectionsList() //start with "For you" section
        }, [props?.itemSelected])
    )
    return (
        <>

            <PaperProvider theme={useColorScheme() == "dark" ? darkTheme : lightTheme}>
                <TabsProvider
                    defaultIndex={0}
                    onChangeIndex={(indx) => {
                        getCollectionsList(indx)
                    }}
                >
                    <Tabs
                        showLeadingSpace={true}
                        tabLabelStyle={{ fontSize: 13.5 }}
                        dark={true} // works the same as AppBar in react-native-paper
                    // showLeadingSpace={true} //  (default=true) show leading space in scrollable tabs inside the header
                    >
                        <TabScreen label={langselected?.collections_page?.foryou}

                        >
                            <ThemedText>Top</ThemedText>
                        </TabScreen>
                        <TabScreen label={langselected?.collections_page?.all} >

                            {collections == null ? <ThemedText>{langselected.collection.nocolfound}</ThemedText> :
                                <ListItem
                                    ref={refList}
                                    DATA={collections}
                                    onSelect={(pickeditem) => {
                                        /// on collection lists/ profile show the post as lis
                                        if (pickeditem.ID == "new_item") {
                                            router.push({
                                                pathname: '/CollectionCreator',
                                                params: {
                                                    collectionid: pickeditem?.ID,
                                                }
                                            })
                                        } else {
                                            try {
                                                props?.onSelect(pickeditem) //if exists is a child component, like collection picker for post creation
                                            } catch (error) {
                                                if (pickeditem?.OWNERID == ctx?.getUID()) { //editable only by the owner 
                                                    router.push({
                                                        pathname: '/CollectionCreator',
                                                        params: {
                                                            collectionid: pickeditem?.ID,
                                                        }
                                                    })
                                                } else {
                                                    ctx?.showToast({
                                                        type: "error",
                                                        text1: langselected.collection.colNotEditable
                                                    })
                                                    //TODO: redirect to profile of owner?
                                                    //TODO: PROFILE VIEWER
                                                }
                                            }
                                        }
                                    }}
                                    isSelectable={props?.isSelectable}
                                    isImage={false} //we render icons, not expo-image
                                    estimatedSize={80}
                                    allowCreation={props?.allowCreation ?? true}
                                    label={langselected?.collection.collectionf}
                                />
                            }

                        </TabScreen>
                        <TabScreen label={langselected?.collections_page?.popular} >

                            {collections == null ? <ThemedText>{langselected.collection.nocolfound}</ThemedText> :
                                <ListItem
                                    ref={refList}
                                    DATA={collections}
                                    onSelect={(pickeditem) => {
                                        /// on collection lists/ profile show the post as lis
                                        if (pickeditem.ID == "new_item") {
                                            router.push({
                                                pathname: '/CollectionCreator',
                                                params: {
                                                    collectionid: pickeditem?.ID,
                                                }
                                            })
                                        } else {
                                            try {
                                                props?.onSelect(pickeditem) //if exists is a child component, like collection picker for post creation
                                            } catch (error) {
                                                if (pickeditem?.OWNERID == ctx?.getUID()) { //editable only by the owner 
                                                    router.push({
                                                        pathname: '/CollectionCreator',
                                                        params: {
                                                            collectionid: pickeditem?.ID,
                                                        }
                                                    })
                                                } else {
                                                    ctx?.showToast({
                                                        type: "error",
                                                        text1: langselected.collection.colNotEditable
                                                    })
                                                    //TODO: redirect to profile of owner?
                                                    //TODO: PROFILE VIEWER
                                                }
                                            }
                                        }
                                    }}
                                    isSelectable={props?.isSelectable}
                                    isImage={false} //we render icons, not expo-image
                                    estimatedSize={80}
                                    allowCreation={props?.allowCreation ?? true}
                                    label={langselected?.collection.collectionf}
                                />
                            }


                        </TabScreen>
                        <TabScreen
                            label={langselected?.collections_page?.trending}
                            style={{ flex: 1 }}
                        >


                            {collections == null ? <ThemedText>{langselected.collection.nocolfound}</ThemedText> :
                                <ListItem
                                    ref={refList}
                                    DATA={collections}
                                    onSelect={(pickeditem) => {
                                        /// on collection lists/ profile show the post as lis
                                        if (pickeditem.ID == "new_item") {
                                            router.push({
                                                pathname: '/CollectionCreator',
                                                params: {
                                                    collectionid: pickeditem?.ID,
                                                }
                                            })
                                        } else {
                                            try {
                                                props?.onSelect(pickeditem) //if exists is a child component, like collection picker for post creation
                                            } catch (error) {
                                                if (pickeditem?.OWNERID == ctx?.getUID()) { //editable only by the owner 
                                                    router.push({
                                                        pathname: '/CollectionCreator',
                                                        params: {
                                                            collectionid: pickeditem?.ID,
                                                        }
                                                    })
                                                } else {
                                                    ctx?.showToast({
                                                        type: "error",
                                                        text1: langselected.collection.colNotEditable
                                                    })
                                                    //TODO: redirect to profile of owner?
                                                    //TODO: PROFILE VIEWER
                                                }
                                            }
                                        }
                                    }}
                                    isSelectable={props?.isSelectable}
                                    isImage={false} //we render icons, not expo-image
                                    estimatedSize={80}
                                    allowCreation={props?.allowCreation ?? true}
                                    label={langselected?.collection.collectionf}
                                />
                            }


                        </TabScreen>
                    </Tabs>
                </TabsProvider>
            </PaperProvider>
        </>
    )
}

export default CollectionsList;