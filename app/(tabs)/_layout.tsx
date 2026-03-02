import { Tabs } from 'expo-router';
import { Platform, View, Text, Pressable } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function TabLayout() {
  const pathname = usePathname();
  const isWeb = Platform.OS === 'web';
  const { role, firstName, lastName } = useAuth();
  
  const profileLabel = firstName && lastName ? `${firstName} ${lastName}` : 'Profile';

  // Custom top nav for web
  if (isWeb) {
    return (
      <View className="flex-1 bg-finance-dark">
        <View className="flex-row items-center justify-between p-4 bg-finance-surface border-b border-finance-border">
          <Text className="text-xl font-bold text-finance-text">Alpha IPO</Text>
          <View className="flex-row space-x-6">
            <Link href="/" asChild>
              <Pressable>
                <Text className={`text-base ${pathname === '/' ? 'text-finance-green font-bold' : 'text-finance-textMuted'}`}>IPO</Text>
              </Pressable>
            </Link>
            <Link href="/pulse" asChild>
              <Pressable>
                <Text className={`text-base ${pathname === '/pulse' ? 'text-finance-green font-bold' : 'text-finance-textMuted'}`}>Pulse</Text>
              </Pressable>
            </Link>
            <Link href="/saved" asChild>
              <Pressable>
                <Text className={`text-base ${pathname === '/saved' ? 'text-finance-green font-bold' : 'text-finance-textMuted'}`}>Saved</Text>
              </Pressable>
            </Link>
            <Link href="/profile" asChild>
              <Pressable>
                <Text className={`text-base ${pathname === '/profile' ? 'text-finance-green font-bold' : 'text-finance-textMuted'}`}>{profileLabel}</Text>
              </Pressable>
            </Link>
          </View>
        </View>
        <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
          <Tabs.Screen name="index" />
          <Tabs.Screen name="pulse" />
          <Tabs.Screen name="saved" />
          <Tabs.Screen name="profile" />
        </Tabs>
      </View>
    );
  }

  // Bottom tabs for mobile
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#1E1E1E' },
        headerTintColor: '#FFFFFF',
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopColor: '#333333',
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#A0A0A0',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'IPO',
        }}
      />
      <Tabs.Screen
        name="pulse"
        options={{
          title: 'Pulse',
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: profileLabel,
        }}
      />
    </Tabs>
  );
}
