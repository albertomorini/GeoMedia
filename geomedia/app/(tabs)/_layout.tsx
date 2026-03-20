import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { t } from "../../components/i18n";

import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

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
          title: t.map,
          tabBarIcon: ({ color }) => (
            <Ionicons name="map-outline" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(categories)"
        options={{
          title: t.categories,
          tabBarIcon: ({ color }) => (
            <Ionicons name="layers-outline" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(profile)"
        options={{
          title: t.account,
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="person-circle-outline" color={color} />
          ),
        }}
      />

    </Tabs>
  );
}