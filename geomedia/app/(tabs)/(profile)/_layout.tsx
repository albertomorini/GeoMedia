// app/(map)/_layout.tsx
import { Stack } from 'expo-router';

export default function ProfileLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false, // default no header; override per screen below
            }}
        >
            <Stack.Screen
                name="Profile"
            />

            <Stack.Screen
                name="ProfileEditor"
                options={{
                    presentation: 'modal',       // 'fullScreenModal' or 'card' for push style
                    title: 'New Post',
                    headerStyle: { backgroundColor: '#fff' },
                    headerTintColor: '#000',
                    animation: 'slide_from_right', // optional
                }}
            />
        </Stack>
    );
}