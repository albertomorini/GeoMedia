import { MyContext } from "@/app/_layout";
import ListItem from "@/app/mycomponents/ListItem";
import { doRequest } from "@/app/utility";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";


const CollectionsList = (props) => {

    const ctx = useContext(MyContext)
    const [collections, setCollections] = useState([])

    function getCollectionsList() {
        doRequest("collections_get", {
            uid: ctx?.getUID(),
            mode: props?.postCreation ?? "R"
        }).then(resQuery => {
            setCollections(resQuery)
        })
    }


    useFocusEffect( //to handle the back on routing
        useCallback(() => {
            getCollectionsList()
        }, [props?.itemSelected])
    )
    return (
        <>
            <ListItem
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
                            // console.log(pickeditem)
                            // if (pickeditem.OWNER_ID == ctx?.getUID()) { //editable only by the owner (or cretors //TODO:)
                            router.push({
                                pathname: '/CollectionCreator',
                                params: {
                                    collectionid: pickeditem?.ID,
                                }
                            })
                            // }
                        }
                    }
                }}
                isSelectable={props?.isSelectable}
                itemSelected={props?.itemSelected}
                isImage={false} //we render icons, not expo-image
                estimatedSize={80}
                allowCreation={props?.allowCreation ?? true}
                label="collection"
            />
        </>
    )
}

export default CollectionsList;