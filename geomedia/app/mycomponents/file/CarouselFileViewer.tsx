import { default_attached_file } from "@/assets/images/default_pictures";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Dimensions, TouchableOpacity } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Image } from 'expo-image'; //BETTER PERFORMANCE COMPARED TO NATIVE ONE
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "@/components/LanguageProvider";

const width = Dimensions.get('window').width;


async function file_share(base64Data: any, fileName: string, mimeType: string) {
    try {
        const path = `${RNFS.CachesDirectoryPath}/${fileName}`;

        await RNFS.writeFile(path, base64Data, 'base64'); //type base644, we pass that

        // Open share menu
        await Share.open({
            url: `file://${path}`,
            type: mimeType
        });

    } catch (error) {
        console.log('Error opening file:', error);
    }
};

const CarouselFileViewer = (props) => {
    const { langselected } = useLanguage()
    return (
        <Carousel
            width={props?.isEdit ? width / 1.5 : width}
            height={250}
            data={props?.attachments}
            pagingEnabled
            snapEnabled
            loop={props?.attachments?.length > 1}
            mode="parallax"
            modeConfig={{
                parallaxScrollingScale: 0.9,
                parallaxScrollingOffset: 52,
            }}
            windowSize={3}
            renderItem={({ item }) => (
                <ThemedView style={{ flex: 1 }}>
                    {
                        <Image
                            source={{
                                uri: (item?.MIME_TYPE == "image/jpeg") ? `data:image/jpeg;base64,${item?.BASE64}` :
                                    default_attached_file
                            }}
                            style={{ width: '100%', height: '100%', padding: 30, borderRadius: 20 }}
                            contentFit="cover"
                            transition={200}
                        />
                    }

                    {
                        (item?.MIME_TYPE == "image/jpeg") ? null :
                            <ThemedText style={{
                                position: "absolute",
                                bottom: 95,
                                left: 35,
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                paddingVertical: 8,
                                paddingHorizontal: 12,
                                borderRadius: 8,
                            }}>
                                {item?.FILENAME}
                            </ThemedText>
                    }

                    <TouchableOpacity //DOWNLOAD BUTTON
                        onPress={() => {
                            file_share(item.BASE64, item.FILENAME, item.MIME_TYPE)
                        }}
                        style={{
                            position: 'absolute',
                            bottom: 15,
                            right: 15,
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 8,
                        }}
                    >
                        <ThemedText style={{ color: 'white' }}>{langselected.share}
                            <Ionicons name="share-outline" size={28} color={"lightblue"} />
                        </ThemedText>

                    </TouchableOpacity>

                    {props?.isEdit ?
                        <TouchableOpacity //REMOVE BUTTON ONLY ON EDIT
                            onPress={() => props?.remove_attachment(item.FILENAME)}
                            style={{
                                position: 'absolute',
                                top: 15,
                                right: 15,
                                backgroundColor: 'rgba(206, 38, 38, 0.6)',
                                paddingVertical: 8,
                                paddingHorizontal: 12,
                                borderRadius: 8,
                            }}
                        >
                            <ThemedText style={{ color: 'white' }}>Remove</ThemedText>

                        </TouchableOpacity>
                        : null
                    }
                </ThemedView>
            )}
        />
    )
}

export default CarouselFileViewer;