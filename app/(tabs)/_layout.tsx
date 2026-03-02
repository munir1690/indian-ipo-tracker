import { Tabs } from 'expo-router';
import { View, useWindowDimensions } from 'react-native';
import { useColorScheme } from 'nativewind';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const { colorScheme } = useColorScheme();
  
  const isDark = colorScheme === 'dark';
  const isDesktop = width >= 768; // Tailwind md breakpoint

  // Desktop Layout (Content inside Tabs, tab bar hidden since sidebar handles nav)
  if (isDesktop) {
    return (
      <View className="flex-1 bg-finance-dark">
        <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
          <Tabs.Screen name="index" />
          <Tabs.Screen name="pulse" />
          <Tabs.Screen name="saved" />
          <Tabs.Screen name="profile" />
        </Tabs>
      </View>
    );
  }

  // Mobile / Mobile-Web Layout
  return (
    <View className="flex-1 bg-finance-dark">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
            borderTopColor: isDark ? '#333333' : '#E2E8F0',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: '#3B82F6', // finance-accent
          tabBarInactiveTintColor: isDark ? '#64748B' : '#94A3B8',
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'IPOs',
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="view-dashboard" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="pulse"
          options={{
            title: 'Pulse',
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="chart-timeline-variant" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="saved"
          options={{
            title: 'Saved',
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="bookmark" size={24} color={color} />,
          }}
        />
        {/* Profile tab is completely hidden from bottom bar since it's in the top bar */}
        <Tabs.Screen
          name="profile"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </View>
  );
}
