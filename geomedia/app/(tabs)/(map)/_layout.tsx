// app/(map)/_layout.tsx
import { HapticTab } from '@/components/haptic-tab';
import { t } from '@/components/i18n';
import { Colors } from '@/constants/theme';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function MapLayout() {

    const colorScheme = useColorScheme();

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
                name="PostWriter"
                options={{
                    presentation: 'modal',       // 'fullScreenModal' or 'card' for push style
                    title: 'New Post',
                    animation: 'slide_from_right', // optional
                }}
            />
            <Stack.Screen
                name="ExclusivityPicking"
                options={{
                    presentation: 'modal',       // 'fullScreenModal' or 'card' for push style
                    title: 'New Post',
                    animation: 'slide_from_bottom', // optional
                }}
            />
        </Stack>
    );
}