import { MyContext } from "@/app/_layout";
import MyList from "@/app/mycomponents/MyList";
import { doRequest } from "@/app/utility";
import { style } from "@/components/globalstyle";
import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { router } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";


const CategoriesList = () => {

    const ctx = useContext(MyContext)
    const [categories, setCategories] = useState([])

    function getListCategories() {
        doRequest("collections_get", {
            uid: ctx?.getUID(),
            mode: "R"
        }).then(resQuery => {
            console.log(resQuery)
            setCategories(resQuery)
        })
    }

    useEffect(() => {
        getListCategories()
    }, [])

    return (
        <>
            <ThemedView style={{ height: "100%" }}>
                <ThemedView style={style.container}>
                    <MyList
                        DATA={categories}
                        pickedItem={(pickeditem) => {
                            console.log(pickeditem)
                        }}
                        estimatedSize={80}
                    />


                </ThemedView>
            </ThemedView>
            <TouchableOpacity
                style={[style.buttons.fab, style.colors.geomedia_blue, { bottom: 70 }]}
                onPress={() => {
                    router.push('CategoryCreator')

                }}
            >
                <ThemedText style={style.buttons.fabText}>+</ThemedText>
            </TouchableOpacity >
        </>
    )
}

export default CategoriesList;