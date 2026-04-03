import { useCallback, useContext, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { MyContext } from '../../_layout';
import { Image } from "expo-image"; // really, huge improveement
import { Text } from "re-native-ui";
import { style } from '@/components/globalstyle';

import * as SecureStore from 'expo-secure-store';
import { ThemedText } from '@/components/themed-text';
import { doRequest, SettingsConfig } from '../../utility';
import { default_account_profilepic } from '@/assets/images/default_pictures';
import { router, useFocusEffect } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { useLanguage } from '@/components/LanguageProvider';
import ModalPswReset from '@/app/mycomponents/ModalPswReset';

export default function Profile() {

  const { langselected } = useLanguage();

  const ctx = useContext(MyContext);
  const user = ctx?.User?.User
  const [ProfilePic, setProfilePic] = useState(default_account_profilepic)

  function getProfilePic() {

    doRequest("profile_getpfp", {
      USERNAME: user?.USERNAME
    }).then(res => {
      let pp = res[0].PROFILE_PICTURE
      if (pp != undefined) {
        setProfilePic(pp)
      }
    })
  }


  async function logout() {
    await SecureStore.deleteItemAsync("user");
    ctx?.User.setUser(null);
    // router.replace("/login");
  }

  useFocusEffect(
    useCallback(() => {

      getProfilePic()

    }, [])
  );

  return (
    <>
      <ThemedView style={[style.container, { height: "100%" }]}>
        <ThemedView
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 10,
          }}
        >
          <ThemedView style={{ flex: 1, paddingRight: 10 }}>
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
              {user?.EMAIL}
            </Text>
          </ThemedView>

          <Image
            source={{ uri: `data:image/jpeg;base64,${ProfilePic}` }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
            }}
          />
        </ThemedView>

        <ModalPswReset />
        <ThemedView
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingLeft:5,
            paddingRight:5
          }}
        >
          <TouchableOpacity
            onPress={() => {
              router.push('ProfileEditor')
            }}
            style={[style?.colors?.geomedia_blue, style.buttons.full_screen, { width: "47%" }]}
          >
            <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
              Edit profile
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => logout()}
            style={[style?.colors?.geomedia_red, style.buttons.full_screen, { width: "47%" }]}
          >
            <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
              Log out
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
        <ThemedView style={{ flex: 1, paddingRight: 10 }}>
          <ThemedText style={style.label}>Your post</ThemedText>
        </ThemedView>


      </ThemedView>
      <SettingsConfig />
    </>
  );
}