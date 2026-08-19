// app/(map)/_layout.tsx
import { HapticTab } from '@/components/haptic-tab';
import { useLanguage } from '@/components/LanguageProvider';
import { ThemedText } from '@/components/themed-text';

import { Colors } from '@/constants/theme';
import { router, Stack } from 'expo-router';
import { Alert, TouchableOpacity, useColorScheme } from 'react-native';


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
                    title: langselected?.account,
                    headerRight: () => (
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel={langselected.settings.settings}
                            onPress={() => {
                                router.push("/Settings")
                            }} // replace with your settings action
                            style={{ marginRight: 15, width: 60, alignItems: "flex-end" }}
                        >
                            <ThemedText style={{ fontSize: 24 }}>⋮</ThemedText> {/* three-dot menu */}
                        </TouchableOpacity>
                    ),
                }} />

            <Stack.Screen
                name="ProfileEditor"
                options={{
                    presentation: 'fullScreenModal',       // 'fullScreenModal' or 'card' for push style
                    title: 'Edit profile',
                    animation: 'slide_from_right', // optional
                }}
            />
            {/* <Stack.Screen
                name="ProfileViewer"
                options={{
                    presentation: 'modal',       // 'fullScreenModal' or 'card' for push style
                    animation: 'slide_from_bottom', // optional
                }}
            /> */}
        </Stack>
    );
}