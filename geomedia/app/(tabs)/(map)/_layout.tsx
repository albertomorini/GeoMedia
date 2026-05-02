// app/(map)/_layout.tsx
import { HapticTab } from '@/components/haptic-tab';
import { useLanguage } from '@/components/LanguageProvider';
import { ThemedText } from '@/components/themed-text';

import { Colors } from '@/constants/theme';
import { router, Stack } from 'expo-router';
import { TouchableOpacity, useColorScheme } from 'react-native';

export default function MapLayout() {

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
                name="MapViewer"
                options={{
                    title: langselected?.map,
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => {
                                router.push("/Settings")
                            }} // replace with your settings action
                            style={{ marginRight: 15 }}
                        >
                            <ThemedText style={{ fontSize: 24 }}>⋮</ThemedText> {/* three-dot menu */}
                        </TouchableOpacity>
                    ),
                }}
            />

            <Stack.Screen
                name="PostCreator"
                options={{
                    presentation: 'modal',       // 'fullScreenModal' or 'card' for push style
                    animation: 'slide_from_right',
                }}
            />
            <Stack.Screen
                name="PostViewer"
                options={{
                    presentation: 'modal',       // 'fullScreenModal' or 'card' for push style
                    animation: 'slide_from_bottom',
                    sheetAllowedDetents: [0.9, 1],
                    sheetInitialDetent: 0.9,
                    sheetLargestUndimmedDetent: 0.9,
                    sheetGrabberVisible: true,
                    sheetCornerRadius: 24,
                    sheetExpandsWhenScrolledToEdge: true,
                }}
            />

        </Stack>
    );
}