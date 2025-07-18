import { Tabs, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { SafeAreaView } from 'react-native-safe-area-context';
import MoreActionSheet from '../components/MoreActionSheet';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [showMore, setShowMore] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={["top", "bottom"]}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarStyle: {
            height: 72,
            paddingBottom: 18,
            paddingTop: 10,
            borderTopWidth: 0.5,
            borderTopColor: '#eee',
            backgroundColor: '#fff',
          },
          tabBarLabelStyle: {
            fontSize: 14,
            marginBottom: 2,
            flexWrap: 'nowrap',
            width: 90,
            textAlign: 'center',
          },
          tabBarIconStyle: {
            marginBottom: -2,
          },
        }}
      >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="warranties"
        options={{
          title: 'Warranties',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="shield.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="subscriptions"
        options={{
          title: 'Subscriptions',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="creditcard.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="ellipsis.circle.fill" color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            setShowMore(true);
          }
        }}
      />
    </Tabs>
    <MoreActionSheet
      visible={showMore}
      onClose={() => setShowMore(false)}
      onNavigate={route => {
        setShowMore(false);
        router.push(route as any);
      }}
    />
    </SafeAreaView>
  );
}
