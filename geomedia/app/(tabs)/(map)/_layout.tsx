// app/(map)/_layout.tsx
import { HapticTab } from '@/components/haptic-tab';
import { useLanguage } from '@/components/LanguageProvider';

import { Colors } from '@/constants/theme';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function MapLayout() {

    const colorScheme = useColorScheme();
    const { t } = useLanguage();


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
                name="index"
                options={{
                    title: t?.map
                }}
            />

            <Stack.Screen
                name="PostCreator"
                options={{
                    presentation: 'modal',       // 'fullScreenModal' or 'card' for push style
                    title: 'New Post',
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