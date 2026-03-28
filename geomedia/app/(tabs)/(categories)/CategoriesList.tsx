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
                    if (pickeditem.ID == "new_item") {
                        router.push('CategoryCreator') //TODO: router on category creator to come back here and refreshing categories
                    }else{
                        props?.selectedCategory(pickeditem)
                    }
                }}
                isImage={false} //we render icons, not expo-image
                estimatedSize={80}
                label="category"
            />
        </>
    )
}

export default CategoriesList;