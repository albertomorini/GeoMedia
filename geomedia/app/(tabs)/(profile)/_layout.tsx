// app/(map)/_layout.tsx
import { HapticTab } from '@/components/haptic-tab';
import { useLanguage } from '@/components/LanguageProvider';

import { Colors } from '@/constants/theme';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';


export default function ProfileLayout() {
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
            <Stack.Screen name="Profile"
                options={{
                    title: langselected.profile
                }} />

            <Stack.Screen
                name="ProfileEditor"
                options={{
                    presentation: 'fullScreenModal',       // 'fullScreenModal' or 'card' for push style
                    title: 'Edit profile',
                    animation: 'slide_from_right', // optional
                }}
            />
        </Stack>
    );
}