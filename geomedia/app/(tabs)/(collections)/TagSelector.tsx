import { doRequest } from "@/app/utility";
import { style } from "@/components/globalstyle";
import { useLanguage } from "@/components/LanguageProvider";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Modal, TouchableOpacity, TextInput } from "react-native";
import { ScrollView } from "react-native-gesture-handler";


export default function TagSelector(props) {
  const [selected, setSelected] = useState(props?.selected ?? []);
  const { langselected } = useLanguage()
  const [visible, setVisible] = useState(false)

  const [tags, setTags] = useState([]);
  const [searchText, setSearchText] = useState("")

  function collections_get_hashtags() {
    doRequest("collection/hashtags", {}, "GET").then(resQuery => {
      let x = resQuery.map(s => s?.TITLE)
      setTags([...x])
    }).catch(err => {
      ctx?.showToast({
        type: "error",
        text1: langselected.network.offline1,
        text2: langselected.network.offline2,
      })
    })
  }

  const toggle = (tag) => {
    setSelected((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  useFocusEffect(
    useCallback(() => {
      collections_get_hashtags()
      if (props?.selected != undefined) {
        setSelected(props?.selected)
      }
    }, [props])
  )

  return (
    <>
      <TouchableOpacity style={[style.buttons.full_screen, style.colors.geomedia_blue]} onPress={() => {
        setVisible(true)
      }}>
        <ThemedText>{langselected?.postCreator.modify} tag</ThemedText>
      </TouchableOpacity>

      <Modal transparent visible={visible} animationType="fade" allowSwipeDismissal={true}
        onRequestClose={() => {
          setVisible(false)
        }}
      >
        <ThemedView style={[styles.centered, styles.overlay]}>

          <ThemedView style={styles.modal}>


            <ThemedView style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#f1f1f1",
              borderRadius: 10,
              paddingHorizontal: 10,
              marginBottom: 16,
            }}>
              <Ionicons name="search-outline" size={20} color="#888" style={{
                marginRight: 8
              }} />
              <TextInput
                style={{ flex: 1 }}
                placeholder={langselected.search_create}
                placeholderTextColor={"#000"}
                value={searchText}
                onChangeText={setSearchText}
              />
              {searchText?.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText("")}>
                  <Ionicons name="close-circle" size={20} color="#888" style={{
                    marginLeft: 8
                  }} />
                </TouchableOpacity>
              )}
            </ThemedView>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
            >
              {searchText?.length == 0 ? null : //THE NEW TAG (made by searching)
                <Pressable
                  key={searchText}
                  onPress={() => {
                    tags.push(searchText)
                    setTags([...tags]);
                    toggle(searchText)
                    setSearchText("")
                  }}
                  style={[
                    styles.chip,
                    selected.includes(searchText) && style.colors.geomedia_green
                  ]}
                >
                  <ThemedText style={selected.includes(searchText) ? styles.activeText : styles.text}>
                    #{searchText}
                  </ThemedText>
                </Pressable>
              }
              {tags?.filter(tag => searchText?.length == 0 ? tag : tag?.includes(searchText?.toLowerCase()) ? tag : null).map((tag) => {
                const active = selected.includes(tag);
                return (
                  <Pressable
                    key={tag}
                    onPress={() => toggle(tag)}
                    style={[
                      styles.chip,
                      active && style.colors.geomedia_green
                    ]}
                  >
                    <ThemedText style={active ? styles.activeText : styles.text}>
                      #{tag}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={[style.buttons.full_screen, style.colors.geomedia_green]} onPress={() => {
              props?.onConfirm(selected);
              setVisible(false)
            }}>
              <ThemedText>{langselected.save}</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 20,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  modal: {
    width: '95%',
    height: '50%',
    borderRadius: 20,
    padding: 20,
  },
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#eee",
    margin: 4,
  },

  text: {
    color: "#333",
  },
  activeText: {
    color: "#fff",
  },
});