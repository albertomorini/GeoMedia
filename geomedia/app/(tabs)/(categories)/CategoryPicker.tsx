import ListItem from "@/app/mycomponents/ListItem";
import SelectableList from "@/app/mycomponents/SelectableList";
import { style } from "@/components/globalstyle";
import { ThemedText } from "@/components/themed-text";
import { TouchableOpacity } from "react-native";


const CategoryPicker = (props) => {
    return (
        <>
        <TouchableOpacity style={[style.colors.geomedia_blue, style.buttons.full_screen]}>
            <ThemedText>Select category</ThemedText>
        </TouchableOpacity>

            <ListItem
                DATA={categories}
                pickedItem={(pickeditem) => {
                    console.log(pickeditem)
                }}
                isImage={false} //we render icons, not expo-image
                estimatedSize={80}
            />

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

export default CategoryPicker;