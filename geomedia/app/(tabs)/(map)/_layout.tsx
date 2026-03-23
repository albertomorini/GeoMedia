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
            {/* USE A PROPS INSIDE POST WRITER */}
            {/* <Stack.Screen
                name="ExclusivityPicking"
                options={{
                    presentation: 'formSheet', //
                    title: 'Exclusive',
                    sheetAllowedDetents: [0.9, 1],      // 90% and 100% snap points
                    sheetInitialDetent: 0.9,            // start at 90%
                    sheetLargestUndimmedDetent: 0.9,    // background stays dimmed until fully expanded (optional)
                    sheetGrabberVisible: true,          // shows drag handle at top (nice UX)
                    sheetCornerRadius: 24,              // optional rounded corners
                    sheetExpandsWhenScrolledToEdge: false, // prevents auto-expand on scroll (optional)

                    animation: 'slide_from_bottom',
                }}
            /> */}
        </Stack>
    );
}