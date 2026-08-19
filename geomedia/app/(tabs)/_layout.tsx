import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/components/LanguageProvider';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { langselected } = useLanguage();


  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false, //will be handled in subcomponent
        tabBarButton: HapticTab,
      }}>

      <Tabs.Screen name="index" options={{ href: null }} />

      <Tabs.Screen
        name="(map)"
        options={{
          title: langselected.map,
          tabBarIcon: ({ color }) => (
            <Ionicons name="map-outline" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(collections)"
        options={{
          title: langselected.collections,
          tabBarIcon: ({ color }) => (
            <Ionicons name="layers-outline" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(profile)"
        options={{
          title: langselected.account,
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="person-circle-outline" color={color} />
          ),
        }}
      />

    </Tabs>
  );
}