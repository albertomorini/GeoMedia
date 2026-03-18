import { StyleSheet, TextInput, TouchableOpacity, type TextInputProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useState } from 'react';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export type ThemedInputProps = TextInputProps & {
    lightColor?: string;
    darkColor?: string;
    type?: 'default' | 'outlined' | 'filled';
};

export function ThemedPassword({
    style,
    lightColor,
    darkColor,
    type = 'default',
    multiline = false,
    numberOfLines = 3,
    ...rest
}: ThemedInputProps) {

    const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
    const background = useThemeColor({}, 'background');

    const [hidePassword, setHidePassword] = useState(true)
    const borderColor = color === '#ECEDEE' ? '#3a3a3a' : '#d0d0d0';

    return (
        <ThemedView style={styles.container}>
            <TextInput
                multiline={multiline}
                numberOfLines={numberOfLines}
                secureTextEntry={hidePassword}
                autoCapitalize='none'
                style={[
                    { color },
                    type === 'default' ? styles.default : undefined,
                    type === 'outlined' ? [styles.default, { borderColor }] : undefined,
                    type === 'filled'
                        ? [styles.default, { backgroundColor: background }]
                        : undefined,
                    style,
                ]}
                placeholderTextColor={borderColor}
                {...rest}
            />
            <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setHidePassword(!hidePassword)}
            >
                <ThemedText style={styles.toggleText}>
                    {hidePassword ? "Show" : "Hide"}
                </ThemedText>
            </TouchableOpacity>
        </ThemedView >
    );
}

const styles = StyleSheet.create({
    default: {
        fontSize: 16,
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
        lineHeight: 24,
        marginTop: 5,
        marginBottom: 5,
        width: "100%"
    },
    toggleButton: {
        position: 'absolute',
        right: 10,
        top: 10,
        height: '100%',
        justifyContent: 'center',
    },
    toggleText: {
        color: '#b8b8b8',
        fontWeight: '600',
    },
});

