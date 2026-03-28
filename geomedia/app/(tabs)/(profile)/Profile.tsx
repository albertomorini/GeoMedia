import { useCallback, useContext, useState } from 'react';
import { Linking, Pressable, TouchableOpacity, View } from 'react-native';
import { MyContext } from '../../_layout';
import { Image } from "expo-image"; // really, huge improveement
import { Text, Box } from "re-native-ui";
import { style } from '@/components/globalstyle';

import * as SecureStore from 'expo-secure-store';
import { ThemedText } from '@/components/themed-text';
import { doRequest } from '../../utility';
import { default_account_profilepic } from '@/assets/images/default_pictures';
import { router, useFocusEffect } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { useLanguage } from '@/components/LanguageProvider';

export default function Profile() {

  const my_email = 'albmor.dev@gmail.com'
  const { changeLang } = useLanguage();

  const ctx = useContext(MyContext);
  const user = ctx?.User?.User
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

  const emailMe = () => {
    const url = `mailto:${my_email}?subject=${encodeURIComponent("GEOMEDIA")}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          console.warn("Can't handle mailto link:", url);
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };


  useFocusEffect(
    useCallback(() => {

      getProfilePic()

    }, [])
  );

  return (
    <ThemedView style={{ height: "100%" }}>
      <ThemedView style={style.container}>
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
          <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
            Log out
          </ThemedText>
        </TouchableOpacity>

        {/* <ThemedText variant="heading">Your post</ThemedText>

      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
      </ScrollView> */}

        <ThemedText style={{ textAlign: "right", fontStyle: "italic" }} onPress={() => { emailMe() }}>Contact me </ThemedText>

      </ThemedView>
      <ThemedView style={{
        position: "absolute",
        bottom: 40, // distance from bottom
        left: 5,
        right: 0,
        flexDirection: "row",
        justifyContent: "start",

        alignItems: "center",
        gap: 16,
        transform: [{ translateY: -10 }],
      }}>
        <ThemedText style={style?.label}>Change language:</ThemedText>

        <TouchableOpacity onPress={() => changeLang("IT")}>
          <ThemedText accessibilityLabel="Italian" style={{fontSize:20}}>🇮🇹</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => changeLang("EN")}>
          <ThemedText accessibilityLabel="English" style={{fontSize:20}}>🇬🇧</ThemedText>
        </TouchableOpacity>

      </ThemedView>
    </ThemedView>
  );
}