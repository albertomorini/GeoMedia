import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { createContext, useEffect, useState } from 'react';
import LoginScreen from './login';
import { ThemedView } from '@/components/themed-view';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';


interface UserContextType {
  User: {
    value: string | null; // could be user id, username, etc.
    setUser: (user: string | null) => void;
  };
}
export const MyContext = createContext<UserContextType | undefined>(undefined);

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [User, setUser] = useState(null)
  //TODO: exec the login and use context

  function showToast(data: Object) {
    Toast.show(data);
  }

  useEffect(() => {

  }, [User])

  return (

    <ScrollView contentContainerStyle={{ flex: 1 }} keyboardShouldPersistTaps="never">
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <ThemedView style={{
          width: "100%", height: "100%", flex: 1
        }}>

          <Toast
            config={{
            }}
          />
          <MyContext.Provider
            value={{
              User: { User, setUser },
              getUID: () => { return User?.UID },
              showToast: (data: Object) => showToast(data)
            }}
          >

            {User != null ?
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>

              :
              <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "padding"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} // adjust if you have a top header
              >
                <LoginScreen setuser={(user: Object) => { setUser(user) }} />
              </ KeyboardAvoidingView >
            }
          </MyContext.Provider>
        </ThemedView>
        <StatusBar style={colorScheme === 'dark' ? "light" : "dark"} />
      </ThemeProvider>
    </ScrollView>
  );
}