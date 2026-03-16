import { useContext, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import { MyContext } from '../../_layout';

import { Text, Box } from "re-native-ui";
import { style } from '@/components/globalstyle';

import * as SecureStore from 'expo-secure-store';
import { ThemedText } from '@/components/themed-text';
import { doRequest } from '../../utility';
import { default_account_profilepic } from '@/assets/images/account_icon';
import { router } from 'expo-router';

export default function Profile() {

  const ctx = useContext(MyContext);
  const user = ctx?.User?.User;
  const [ProfilePic, setProfilePic] = useState(default_account_profilepic)

  function getProfilePic() {
    doRequest("profile_getpfp", {
      USERNAME: user?.USERNAME
    }).then(res => {
      // console.log(res[0].substring(0, 10))
      let pp = res[0].PROFILE_PICTURE
      if (pp != undefined) {
        setProfilePic(pp)
      }
    })
  }


  async function logout() {
    // console.log("logging out");

    await SecureStore.deleteItemAsync("user");
    ctx?.User.setUser(null);
    router.replace("/login");
  }


  useEffect(() => {
    getProfilePic()
  }, []);

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
          <ThemedText className="text-lg font-bold" style={style.subtitle}>
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
          source={{ uri: `data:image/jpeg;base64,${ProfilePic}` }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
          }}
        />
      </View>

      <Pressable
        onPress={() => {
          router.push('ProfileEditor')
        }}
        style={[style?.buttons?.full_screen, style?.colors?.geomedia_blue]}
      >
        <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
          Edit profile
        </ThemedText>
      </Pressable>

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