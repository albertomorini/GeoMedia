import { StyleSheet, TextInput, type TextInputProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedInputProps = TextInputProps & {
    lightColor?: string;
    darkColor?: string;
    type?: 'default' | 'outlined' | 'filled';
    onBlur?: (value: string) => void;
    borderColor?: string;
};

export function ThemedInput({
    style,
    lightColor,
    darkColor,
    type = 'default',
    multiline = false,
    numberOfLines = 3,
    autoCapitalize = 'none',
    borderColor, // ✅ destructured
    onBlur,
    ...rest
}: ThemedInputProps) {

    const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
    const background = useThemeColor({}, 'background');

    const defaultBorderColor = color === '#ECEDEE' ? '#3a3a3a' : '#d0d0d0';

    let finalBorderColor = defaultBorderColor;

    if (borderColor) {
        if (borderColor === "error") finalBorderColor = "red";
        else if (borderColor === "success") finalBorderColor = "green";
        else finalBorderColor = borderColor; // allow custom colors
    }

    return (
        <TextInput
            multiline={multiline}
            numberOfLines={numberOfLines}
            onBlur={() => {
                onBlur?.(rest.value as string);
            }}
            autoCapitalize={autoCapitalize}
            style={[
                { color },
                type === 'default' ? styles.default : undefined,
                type === 'outlined'
                    ? [styles.default, { borderColor: finalBorderColor }]
                    : undefined,
                type === 'filled'
                    ? [styles.default, { backgroundColor: background }]
                    : undefined,
                style,
            ]}
            placeholderTextColor={finalBorderColor}
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

