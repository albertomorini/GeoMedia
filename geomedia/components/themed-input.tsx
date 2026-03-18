import { StyleSheet, TextInput, type TextInputProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedInputProps = TextInputProps & {
    lightColor?: string;
    darkColor?: string;
    type?: 'default' | 'outlined' | 'filled';
};

export function ThemedInput({
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

    const borderColor = color === '#ECEDEE' ? '#3a3a3a' : '#d0d0d0';

    return (
        <TextInput
            multiline={multiline}
            numberOfLines={numberOfLines}
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
});

