import { MyContext } from "@/app/_layout";
import ListItem from "@/app/mycomponents/ListItem";
import { useLanguage } from "@/components/LanguageProvider";
import { ThemedText } from "@/components/themed-text";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useContext, useRef, useState } from "react";


const CollectionListSingle = (props) => {

    const ctx = useContext(MyContext)
    const refList = useRef()
    const { langselected } = useLanguage()
    const [collections, setCollections] = useState([])

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
                                type: "info",
                                text1: langselected.collection.colNotEditable
                            })
                            router.push({
                                pathname: '/ProfileViewer',
                                params: {
                                    uid: pickeditem?.OWNERID,
                                }
                            })
                        }
                    }
                }}
                searchable={props?.searchable}
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