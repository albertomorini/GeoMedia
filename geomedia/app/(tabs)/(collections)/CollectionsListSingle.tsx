import { MyContext } from "@/app/_layout";
import ListItem from "@/app/mycomponents/ListItem";
import { doRequest } from "@/app/utility";
import { useLanguage } from "@/components/LanguageProvider";
import { ThemedText } from "@/components/themed-text";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ScrollView } from "react-native";


const CollectionListSingle = (props) => {

    const ctx = useContext(MyContext)
    const refList = useRef()
    const { langselected } = useLanguage()
    const [collections, setCollections] = useState([])

    // function getCollectionsList() {
    //     try {
    //         doRequest("collection", {
    //             uid: ctx?.getUID(),
    //             mode: props?.postCreation ?? "R"
    //         }, "GET").then(resQuery => {
    //             setCollections(resQuery)
    //         }).catch(err => {
    //             ctx?.showToast({
    //                 type: "error",
    //                 text1: "Error",
    //                 text2: "Network error... are you offline?"
    //             })
    //         })
    //     } catch (error) {
    //         ctx?.showToast({
    //             type: "error",
    //             text1: "Something went wrong..try again"
    //         })
    //     }
    // }


    useFocusEffect( //to handle the back on routing
        useCallback(() => {
            try {
                refList?.current?.load_item_selected(props?.itemSelected)
            } catch (error) {

            }
            // getCollectionsList()
        }, [props?.itemSelected])
    )
    return (
        props?.collections == null ? <ThemedText>{langselected.collection.nocolfound}</ThemedText> :
            <ListItem
                ref={refList}
                DATA={props?.collections}
                onSelect={(pickeditem) => {
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
                            router.push({
                                pathname: '/ProfileViewer',
                                params: {
                                    username: pickeditem?.OWNERID,
                                }
                            })
                        }
                    }
                }}
                isSelectable={props?.isSelectable}
                isImage={false} //we render icons, not expo-image
                estimatedSize={80}
                allowCreation={props?.allowCreation ?? true}
                label={langselected?.collection.collectionf}
                isBottomSheet={props?.isBottomSheet}
            />
    )
}

export default CollectionListSingle;