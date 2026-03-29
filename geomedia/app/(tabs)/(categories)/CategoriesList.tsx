import { MyContext } from "@/app/_layout";
import ListItem from "@/app/mycomponents/ListItem";
import { doRequest } from "@/app/utility";
import { router } from "expo-router";
import { useContext, useEffect, useState } from "react";


const CategoriesList = (props) => {

    const ctx = useContext(MyContext)
    const [categories, setCategories] = useState([])

    function getListCategories() {
        doRequest("collections_get", {
            uid: ctx?.getUID(),
            mode: "R"
        }).then(resQuery => {
            // let x = [, ...]
            setCategories(resQuery)
        })
    }

    useEffect(() => {
        getListCategories()
    }, [])

    return (
        <>
            <ListItem
                DATA={categories}
                pickedItem={(pickeditem) => {
                    /// on category lists/ profile show the post as lis
                    try {
                        props?.onSelect(pickeditem)
                    } catch (error) {
                        router.push({
                            pathname: '/CategoryCreator',
                            params: {
                                collectionid: pickeditem?.ID,
                            }
                        })
                    }
                }}
                isSelectable={props?.isSelectable}
                itemSelected={props?.itemSelected}
                isImage={false} //we render icons, not expo-image
                estimatedSize={80}
                allowCreation={props?.allowCreation ?? true}
                label="category"
            />
        </>
    )
}

export default CategoriesList;