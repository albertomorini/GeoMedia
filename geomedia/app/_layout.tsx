import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { createContext, useEffect, useState } from 'react';
import LoginScreen from './login';
import { ThemedView } from '@/components/themed-view';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';



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


  useEffect(() => {

  }, [User])

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} // adjust if you have a top header
    >
      <ScrollView contentContainerStyle={{ flex: 1 }}
        keyboardShouldPersistTaps="handled">
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>

          <>
            <MyContext.Provider
              value={{
                User: { User, setUser },
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
          </>
          <StatusBar style={colorScheme === 'dark' ? "light" : "dark"} />
        </ThemeProvider >
      </ScrollView>
    </ KeyboardAvoidingView >
  );
}