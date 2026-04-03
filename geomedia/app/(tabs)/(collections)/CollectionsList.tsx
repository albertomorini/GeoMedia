import { MyContext } from "@/app/_layout";
import ListItem from "@/app/mycomponents/ListItem";
import { doRequest } from "@/app/utility";
import { ThemedText } from "@/components/themed-text";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useContext, useEffect, useRef, useState } from "react";


const CollectionsList = (props) => {

    const ctx = useContext(MyContext)
    const refList = useRef()
    const [collections, setCollections] = useState([])

    function getCollectionsList() {
        doRequest("collections_get", {
            uid: ctx?.getUID(),
            mode: props?.postCreation ?? "R"
        }).then(resQuery => {
            setCollections(resQuery)
        }).catch(err => {
            ctx?.showToast({
                type: "error",
                text1: "Error",
                text2: "Network error... are you offline?"
            })
        })
    }


    useFocusEffect( //to handle the back on routing
        useCallback(() => {
            try {
                refList?.current?.load_item_selected(props?.itemSelected)
            } catch (error) {

            }
            getCollectionsList()
        }, [props?.itemSelected])
    )
    return (
        <>
            {collections == null ? <ThemedText>No collections found</ThemedText> :

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
                                        text1: "Collection editable only by the owner"
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
                    label="collection"
                />
            }
        </>
    )
}

export default CollectionsList;