// app/(map)/_layout.tsx
import { HapticTab } from '@/components/haptic-tab';
import { useLanguage } from '@/components/LanguageProvider';
import { ThemedText } from '@/components/themed-text';

import { Colors } from '@/constants/theme';
import { router, Stack } from 'expo-router';
import { TouchableOpacity, useColorScheme } from 'react-native';

export default function CollectionsLayout() {

    const colorScheme = useColorScheme();
    const { langselected } = useLanguage();


    return (
        <Stack
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                headerShown: true,
                tabBarButton: HapticTab,
                gestureEnabled: true
            }}
        >

            <Stack.Screen
                name="Collections"
                options={{
                    title: langselected?.collections,
                    headerRight: () => (
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel={langselected?.settings.settings}
                            onPress={() => {
                                router.push("/Settings")
                            }} // replace with your settings action
                            style={{ marginRight: 15, width: 60, alignItems: "flex-end" }}
                        >
                            <ThemedText style={{ fontSize: 24 }}>
                                ⋮
                            </ThemedText> {/* three-dot menu */}
                        </TouchableOpacity>
                    ),
                }}
            />
            <Stack.Screen
                name="CollectionCreator"
                options={{
                    title: langselected?.collections,
                    presentation: 'modal',       // 'fullScreenModal' or 'card' for push style
                    animation: 'slide_from_right',

                }}
            />
            <Stack.Screen
                name="CollectionViewer"
                options={{
                    presentation: 'modal',       // 'fullScreenModal' or 'card' for push style
                    animation: 'slide_from_right',
                }}
            />

        </Stack>
    );
}