// app/(map)/_layout.tsx
import { HapticTab } from '@/components/haptic-tab';
import { useLanguage } from '@/components/LanguageProvider';

import { Colors } from '@/constants/theme';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function CategoriesLayout() {

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
                name="CategoriesList"
                options={{
                    title: t?.categories
                }}
            />
            <Stack.Screen
                name="CategoryCreator"
                options={{
                    title: t?.categories,
                    presentation: 'modal',       // 'fullScreenModal' or 'card' for push style
                    animation: 'slide_from_right',

                }}
            />

        </Stack>
    );
}