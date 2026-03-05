import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';


export default function Account() {
  const [testo, setTesto] = useState("")
  return (
    <ThemedView>

      <ScrollView>
        <ThemedView>
          <ThemedText>your name:</ThemedText>
          <TextInput onChangeText={(s) => {
            setTesto(s)
          }}></TextInput>
          <Pressable onPress={() => {
            alert(testo)
          }}>
            <ThemedText>

              Daje tutta
            </ThemedText>
          </Pressable>
        </ThemedView>
        <ThemedText>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, earum, quia fugiat commodi incidunt alias corporis ipsum velit voluptates fugit numquam doloribus. Iste atque, similique doloremque ipsa reprehenderit excepturi minima.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, earum, quia fugiat commodi incidunt alias corporis ipsum velit voluptates fugit numquam doloribus. Iste atque, similique doloremque ipsa reprehenderit excepturi minima.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, earum, quia fugiat commodi incidunt alias corporis ipsum velit voluptates fugit numquam doloribus. Iste atque, similique doloremque ipsa reprehenderit excepturi minima.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, earum, quia fugiat commodi incidunt alias corporis ipsum velit voluptates fugit numquam doloribus. Iste atque, similique doloremque ipsa reprehenderit excepturi minima.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, earum, quia fugiat commodi incidunt alias corporis ipsum velit voluptates fugit numquam doloribus. Iste atque, similique doloremque ipsa reprehenderit excepturi minima.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, earum, quia fugiat commodi incidunt alias corporis ipsum velit voluptates fugit numquam doloribus. Iste atque, similique doloremque ipsa reprehenderit excepturi minima.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, earum, quia fugiat commodi incidunt alias corporis ipsum velit voluptates fugit numquam doloribus. Iste atque, similique doloremque ipsa reprehenderit excepturi minima.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, earum, quia fugiat commodi incidunt alias corporis ipsum velit voluptates fugit numquam doloribus. Iste atque, similique doloremque ipsa reprehenderit excepturi minima.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, earum, quia fugiat commodi incidunt alias corporis ipsum velit voluptates fugit numquam doloribus. Iste atque, similique doloremque ipsa reprehenderit excepturi minima.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, earum, quia fugiat commodi incidunt alias corporis ipsum velit voluptates fugit numquam doloribus. Iste atque, similique doloremque ipsa reprehenderit excepturi minima.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, earum, quia fugiat commodi incidunt alias corporis ipsum velit voluptates fugit numquam doloribus. Iste atque, similique doloremque ipsa reprehenderit excepturi minima.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, earum, quia fugiat commodi incidunt alias corporis ipsum velit voluptates fugit numquam doloribus. Iste atque, similique doloremque ipsa reprehenderit excepturi minima.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, earum, quia fugiat commodi incidunt alias corporis ipsum velit voluptates fugit numquam doloribus. Iste atque, similique doloremque ipsa reprehenderit excepturi minima.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, earum, quia fugiat commodi incidunt alias corporis ipsum velit voluptates fugit numquam doloribus. Iste atque, similique doloremque ipsa reprehenderit excepturi minima.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, earum, quia fugiat commodi incidunt alias corporis ipsum velit voluptates fugit numquam doloribus. Iste atque, similique doloremque ipsa reprehenderit excepturi minima.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, earum, quia fugiat commodi incidunt alias corporis ipsum velit voluptates fugit numquam doloribus. Iste atque, similique doloremque ipsa reprehenderit excepturi minima.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, earum, quia fugiat commodi incidunt alias corporis ipsum velit voluptates fugit numquam doloribus. Iste atque, similique doloremque ipsa reprehenderit excepturi minima.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, earum, quia fugiat commodi incidunt alias corporis ipsum velit voluptates fugit numquam doloribus. Iste atque, similique doloremque ipsa reprehenderit excepturi minima.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, earum, quia fugiat commodi incidunt alias corporis ipsum velit voluptates fugit numquam doloribus. Iste atque, similique doloremque ipsa reprehenderit excepturi minima.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, earum, quia fugiat commodi incidunt alias corporis ipsum velit voluptates fugit numquam doloribus. Iste atque, similique doloremque ipsa reprehenderit excepturi minima.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, earum, quia fugiat commodi incidunt alias corporis ipsum velit voluptates fugit numquam doloribus. Iste atque, similique doloremque ipsa reprehenderit excepturi minima.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, earum, quia fugiat commodi incidunt alias corporis ipsum velit voluptates fugit numquam doloribus. Iste atque, similique doloremque ipsa reprehenderit excepturi minima.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, earum, quia fugiat commodi incidunt alias corporis ipsum velit voluptates fugit numquam doloribus. Iste atque, similique doloremque ipsa reprehenderit excepturi minima.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, earum, quia fugiat commodi incidunt alias corporis ipsum velit voluptates fugit numquam doloribus. Iste atque, similique doloremque ipsa reprehenderit excepturi minima.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, earum, quia fugiat commodi incidunt alias corporis ipsum velit voluptates fugit numquam doloribus. Iste atque, similique doloremque ipsa reprehenderit excepturi minima.
        </ThemedText>
      </ScrollView>
    </ThemedView>

  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
