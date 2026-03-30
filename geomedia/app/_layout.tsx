import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { createContext, useEffect, useState } from 'react';
import LoginScreen from './login';
import { KeyboardAvoidingView, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { LanguageProvider } from '@/components/LanguageProvider';
import { ThemedView } from '@/components/themed-view';


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

  function showToast(data: Object) {
    Toast.show(data);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "padding"}>
      <LanguageProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
              <LoginScreen setuser={(user: Object) => { setUser(user) }} />
            }
          </MyContext.Provider>
          <StatusBar style={colorScheme === 'dark' ? "light" : "dark"} />
        </ThemeProvider>
      </LanguageProvider>
      <Toast />
    </KeyboardAvoidingView>
  );
}