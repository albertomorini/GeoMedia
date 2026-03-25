// app/(map)/index.tsx
import { router } from 'expo-router';
import { View, TouchableOpacity } from 'react-native';
import MapViewer from './MapViewer';
import { style } from '@/components/globalstyle';
import { ThemedText } from '@/components/themed-text';

export default function MapScreen() {
    return (
        <View style={{ flex: 1 }}>
            <MapViewer />
            <TouchableOpacity
                style={[style.buttons.fab, style.colors.geomedia_blue, { bottom: 70 }]}
                onPress={() => router.push('PostCreator')}
            >
                <ThemedText style={style.buttons.fabText}>+</ThemedText>
            </TouchableOpacity>
        </View>
    );
}
