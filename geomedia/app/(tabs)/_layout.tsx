import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { t } from "../../components/i18n";

import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarButton: HapticTab,
      }}>

      <Tabs.Screen
        name="map"
        options={{
          title: t.map,
          tabBarIcon: ({ color }) => (
            <Ionicons name="map-outline" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="account"
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