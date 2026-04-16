import { useCallback, useContext, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { MyContext } from '../../_layout';
import { Image } from "expo-image"; // really, huge improveement
import { Text } from "re-native-ui";
import { style } from '@/components/globalstyle';

import * as SecureStore from 'expo-secure-store';
import { ThemedText } from '@/components/themed-text';
import SettingsConfig, { doRequest } from '../../utility';
import { default_account_profilepic } from '@/assets/images/default_pictures';
import { router, useFocusEffect } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { useLanguage } from '@/components/LanguageProvider';
import ModalPswReset from '@/app/mycomponents/ModalPswReset';
import ListItem from '@/app/mycomponents/ListItem';

export default function Profile() {

  const { langselected } = useLanguage();

  const ctx = useContext(MyContext);
  const user = ctx?.User?.User
  const [ProfilePic, setProfilePic] = useState(default_account_profilepic)
  const [Posts, setPosts] = useState([])

  function getProfilePic() {

    doRequest("profile_getpfp", {
      USERNAME: user?.USERNAME
    }).then(res => {
      let pp = res[0].PROFILE_PICTURE
      if (pp != undefined) {
        setProfilePic(pp)
      }
    }).catch(err => {
      ctx?.showToast({
        type: "error",
        text1: "Error",
        text2: "Network error... try later"
      })
    })
  }


  async function logout() {
    //remove preferences
    await SecureStore.deleteItemAsync("collection_selected_map");
    // remove saved info
    await SecureStore.deleteItemAsync("user");
    ctx?.User.setUser(null);
  }

  function post_get_authorid() {
    doRequest("post_get_authorid", {
      uid: ctx?.getUID(),
      authorid: ctx?.getUID()
    }).then(posts => {
      setPosts([...posts])
    }).catch(err => {
      ctx?.showToast({
        type: "error",
        text1: "Network error",
        text2: JSON.stringify(err)
      })
    })
  }

  useFocusEffect(
    useCallback(() => {

      getProfilePic()
      post_get_authorid()
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
              {langselected?.profile?.hello} {user?.NAME} {user?.SURNAME}
            </ThemedText>

            <Text variant="caption">
              {langselected?.profile?.loggedAs}: {user?.USERNAME}
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
            paddingLeft: 5,
            paddingRight: 5
          }}
        >
          <TouchableOpacity
            onPress={() => {
              router.push('ProfileEditor')
            }}
            style={[style?.colors?.geomedia_blue, style.buttons.full_screen, { width: "47%" }]}
          >
            <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
              {langselected?.profile?.editProfile}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => logout()}
            style={[style?.colors?.geomedia_red, style.buttons.full_screen, { width: "47%" }]}
          >
            <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
              {langselected?.profile?.logout}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
        <ThemedView style={{ flex: 1, paddingRight: 10, marginBottom: 120 }}>
          <ThemedText style={style.label}>{langselected?.profile?.yourPosts}</ThemedText>
          <ListItem
            isImage={false} //we render icons, not expo-image
            isSelectable={false}
            estimatedSize={80}
            allowCreation={false}
            label="Posts"
            onSelect={(pickedItem) => {
              console.log(pickedItem)
              router.push({
                pathname: '/PostViewer',
                params: {
                  postid: pickedItem?.ID,
                }
              });

            }}
            DATA={Posts}

          />
        </ThemedView>

      </ThemedView>
      <SettingsConfig />
    </>
  );
}