import { useContext, useEffect } from 'react';
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { MyContext } from '../_layout';

import { Text, Box } from "re-native-ui";
import { style } from '@/components/globalstyle';
import { ThemedText } from '@/components/themed-text';

import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

export default function Account() {

  const ctx = useContext(MyContext);

  useEffect(() => {
    console.log(ctx);
  }, []);

  async function logout() {
    console.log("logging out");

    await SecureStore.deleteItemAsync("user");

    // optional: reset context if setter exists
    if (ctx?.setUser) {
      ctx.setUser(null);
    }
    // router.replace("/LoginScreen");
    //TODO: to redirect
  }

  const user = ctx?.User?.User;

  return (
    <Box p="md">

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 10,
        }}
      >
        <View style={{ flex: 1, paddingRight: 10 }}>
          <ThemedText className="text-lg font-bold">
            Hello {user?.NAME} {user?.SURNAME}
          </ThemedText>

          <Text variant="caption">
            Your logged as: {user?.USERNAME}
          </Text>

          <Text
            variant="caption"
            style={{ fontStyle: 'italic', marginTop: 2 }}
          >
            Mail address: {user?.EMAIL ?? 'Not provided'}
          </Text>
        </View>

        <Image
          source={{ uri: user?.PROFILE_PICTURE }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
          }}
        />
      </View>

      <TouchableOpacity
        onPress={() => console.log("PK")}
        style={[style?.buttons?.full_screen, style?.colors?.geomedia_blue]}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
          Edit profile
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => logout()}
        style={[style?.buttons?.full_screen, style?.colors?.geomedia_red]}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
          Log out
        </Text>
      </TouchableOpacity>

      <Text variant="heading">Your post</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
      </ScrollView>

    </Box>
  );
}