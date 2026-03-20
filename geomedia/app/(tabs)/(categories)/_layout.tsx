// app/(map)/_layout.tsx
import { HapticTab } from '@/components/haptic-tab';
import { t } from '@/components/i18n';
import { Colors } from '@/constants/theme';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function CategoriesLayout() {

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
                name="CategoriesList"
                options={{
                    title: t?.categories
                }}
            />

        </Stack>
    );
}