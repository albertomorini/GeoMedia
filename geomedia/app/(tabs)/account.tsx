import { useContext, useEffect } from 'react';
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { MyContext } from '../_layout';

import { Text, Box } from "re-native-ui";
import { style } from '@/components/globalstyle';
import { ThemedText } from '@/components/themed-text';

export default function Account() {

  const ctx = useContext(MyContext);


  return (
    <Box p="md">

      <>
        <ThemedText className="text-lg font-bold">
          Styled text with proper theme colors
        </ThemedText>

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
              Hello {ctx?.User?.User?.NAME} {ctx?.User?.User?.SURNAME}
            </ThemedText>

            <Text variant="caption">
              Your logged as: {ctx?.User?.User?.USERNAME}
            </Text>

            <Text variant="caption" style={{ fontStyle: 'italic', marginTop: 2 }}>
              Mail address: {ctx?.User?.User?.EMAIL ?? 'Not provided'}
            </Text>
          </View>

          <Image
            source={{ uri: ctx?.User?.User?.PROFILE_PICTURE }}
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
      </>

      <Text variant="heading">Your post</Text>

      <ScrollView>
      </ScrollView>

    </Box>
  );
}