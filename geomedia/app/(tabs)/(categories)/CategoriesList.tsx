import { MyContext } from "@/app/_layout";
import ListItem from "@/app/mycomponents/ListItem";
import { doRequest } from "@/app/utility";
import { style } from "@/components/globalstyle";
import { ThemedText } from "@/components/themed-text";
import { router } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";


const CategoriesList = (props) => {

    const ctx = useContext(MyContext)
    const [categories, setCategories] = useState([])

    function getListCategories() {
        doRequest("collections_get", {
            uid: ctx?.getUID(),
            mode: "R"
        }).then(resQuery => {
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
                        props?.selectedCategory(pickeditem)
                    } catch (error) {
                        
                    }
                }}
                isImage={false} //we render icons, not expo-image
                estimatedSize={80}
            />

            {props?.isPicking ? null : // in picking (from post) hide button creation //TODO: OR MAYBE NOT??
                <TouchableOpacity
                    style={[style.buttons.fab, style.colors.geomedia_blue, { bottom: 70 }]}
                    onPress={() => {
                        router.push('CategoryCreator')

                    }}
                >
                    <ThemedText style={style.buttons.fabText}>+</ThemedText>
                </TouchableOpacity >
            }

        </>
    )
}

export default CategoriesList;