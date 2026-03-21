import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"

const MyItem = (props) =>{
    return(
        <ThemedView>
            <ThemedText>
                {props?.name}
            </ThemedText>
        </ThemedView>
    )
}