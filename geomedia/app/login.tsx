import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen(props: any) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Please log in</Text>
            <Button
                title="Login"
                onPress={() => {
                    props?.setutente()
                }}
            />
        </View>
    );
}