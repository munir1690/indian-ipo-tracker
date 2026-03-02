import { Tabs } from 'expo-router';
import { Platform, View, Text, Pressable } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from 'nativewind';

export default function TabLayout() {
  const pathname = usePathname();
  const isWeb = Platform.OS === 'web';
  const { user, role, firstName, lastName } = useAuth();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const profileLabel = firstName && lastName ? `${firstName} ${lastName}` : (user ? 'Profile' : 'Sign In');

  // Custom top nav for web
  if (isWeb) {
    return (
      <View className="flex-1 bg-finance-dark">
        <View className="flex-row items-center justify-between p-4 bg-finance-surface border-b border-finance-border">
          <Link href="/" asChild>
            <Pressable>
              <Text className="text-xl font-bold text-finance-text">Alpha IPO</Text>
            </Pressable>
          </Link>
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
            {role === 'admin' && (
              <Link href="/admin/users" asChild>
                <Pressable>
                  <Text className={`text-base ${pathname === '/admin/users' ? 'text-finance-green font-bold' : 'text-finance-textMuted'}`}>Users</Text>
                </Pressable>
              </Link>
            )}
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
        headerStyle: { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' },
        headerTintColor: isDark ? '#FFFFFF' : '#1E293B',
        tabBarStyle: {
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          borderTopColor: isDark ? '#333333' : '#E2E8F0',
        },
        tabBarActiveTintColor: '#10B981', // finance-green
        tabBarInactiveTintColor: isDark ? '#A0A0A0' : '#64748B',
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
