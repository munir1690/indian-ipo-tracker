import { Tabs } from 'expo-router';
import { View, Text, Pressable, useWindowDimensions, TextInput } from 'react-native';
import { Link, usePathname, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function TabLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user, role, firstName, lastName } = useAuth();
  const { colorScheme } = useColorScheme();
  
  const isDark = colorScheme === 'dark';
  const isDesktop = width >= 768; // Tailwind md breakpoint
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const profileLabel = firstName && lastName ? `${firstName} ${lastName}` : (user ? 'Profile' : 'Sign In');
  const userInitials = firstName && lastName ? `${firstName[0]}${lastName[0]}` : (user?.email ? user.email[0].toUpperCase() : '?');

  // Shared TopBar Component
  const TopBar = () => (
    <View className="flex-row items-center justify-between p-3 px-4 bg-finance-surface border-b border-finance-border z-50">
      <View className="flex-row items-center space-x-4">
        {isDesktop && (
          <Pressable 
            onPress={() => setSidebarOpen(!sidebarOpen)} 
            className="p-2 -ml-2 rounded-lg active:bg-finance-dark"
          >
            <MaterialCommunityIcons name="menu" size={24} color={isDark ? '#F8FAFC' : '#0F172A'} />
          </Pressable>
        )}
        <Link href="/" asChild>
          <Pressable className="flex-row items-center space-x-2">
            <View className="bg-finance-accent w-8 h-8 rounded-lg items-center justify-center">
              <MaterialCommunityIcons name="finance" size={20} color="white" />
            </View>
            <Text className="text-xl font-extrabold text-finance-text tracking-tight hidden sm:flex">Alpha IPO</Text>
          </Pressable>
        </Link>
      </View>

      <View className="flex-row items-center space-x-3 sm:space-x-5">
        <View className="relative hidden sm:flex">
          <View className="absolute left-3 top-2.5 z-10">
            <MaterialCommunityIcons name="magnify" size={20} color="#64748B" />
          </View>
          <TextInput
            placeholder="Search IPOs..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="bg-finance-dark text-finance-text pl-10 pr-4 py-2 rounded-full border border-finance-border w-48 focus:border-finance-accent focus:w-64 transition-all"
          />
        </View>
        <Pressable className="p-2 sm:hidden relative">
           <MaterialCommunityIcons name="magnify" size={24} color={isDark ? '#F8FAFC' : '#0F172A'} />
        </Pressable>
        
        <Link href="/profile" asChild>
          <Pressable className="flex-row items-center space-x-2 pl-2 border-l border-finance-border">
            <View className="bg-finance-accent/20 border border-finance-accent/30 w-9 h-9 rounded-full items-center justify-center">
               <Text className="text-finance-accent font-bold text-sm">{userInitials}</Text>
            </View>
          </Pressable>
        </Link>
      </View>
    </View>
  );

  // Desktop Layout (Sidebar + Content inside Tabs)
  if (isDesktop) {
    return (
      <View className="flex-1 bg-finance-dark">
        <TopBar />
        <View className="flex-1 flex-row">
          
          {/* Collapsible Sidebar */}
          {sidebarOpen && (
            <View className="w-64 bg-finance-surface border-r border-finance-border pt-4 px-3 flex-col justify-between hidden md:flex">
              <View className="space-y-1">
                <Text className="text-finance-textMuted text-xs font-bold uppercase tracking-wider mb-2 ml-3">Menu</Text>
                <Link href="/" asChild>
                  <Pressable className={`flex-row items-center space-x-3 px-3 py-3 rounded-xl ${pathname === '/' ? 'bg-finance-accent/10 border border-finance-accent/20' : 'active:bg-finance-dark border border-transparent'}`}>
                    <MaterialCommunityIcons name="view-dashboard-outline" size={22} color={pathname === '/' ? '#3B82F6' : '#94A3B8'} />
                    <Text className={`font-semibold ${pathname === '/' ? 'text-finance-accent' : 'text-finance-text'}`}>IPO Pipeline</Text>
                  </Pressable>
                </Link>
                <Link href="/pulse" asChild>
                   <Pressable className={`flex-row items-center space-x-3 px-3 py-3 rounded-xl ${pathname === '/pulse' ? 'bg-finance-accent/10 border border-finance-accent/20' : 'active:bg-finance-dark border border-transparent'}`}>
                    <MaterialCommunityIcons name="chart-timeline-variant" size={22} color={pathname === '/pulse' ? '#3B82F6' : '#94A3B8'} />
                    <Text className={`font-semibold ${pathname === '/pulse' ? 'text-finance-accent' : 'text-finance-text'}`}>Market Pulse</Text>
                  </Pressable>
                </Link>
                <Link href="/saved" asChild>
                   <Pressable className={`flex-row items-center space-x-3 px-3 py-3 rounded-xl ${pathname === '/saved' ? 'bg-finance-accent/10 border border-finance-accent/20' : 'active:bg-finance-dark border border-transparent'}`}>
                    <MaterialCommunityIcons name="bookmark-outline" size={22} color={pathname === '/saved' ? '#3B82F6' : '#94A3B8'} />
                    <Text className={`font-semibold ${pathname === '/saved' ? 'text-finance-accent' : 'text-finance-text'}`}>Saved Picks</Text>
                  </Pressable>
                </Link>
              </View>

              {role === 'admin' && (
                <View className="space-y-1 mb-6 border-t border-finance-border pt-4">
                  <Text className="text-finance-textMuted text-[10px] font-bold uppercase tracking-widest mb-2 ml-3">Admin Tools</Text>
                  <Link href="/admin/users" asChild>
                    <Pressable className={`flex-row items-center space-x-3 px-3 py-3 rounded-xl ${pathname === '/admin/users' ? 'bg-finance-accent/10 border border-finance-accent/20' : 'active:bg-finance-dark border border-transparent'}`}>
                      <MaterialCommunityIcons name="shield-account-outline" size={22} color={pathname === '/admin/users' ? '#3B82F6' : '#94A3B8'} />
                      <Text className={`font-semibold ${pathname === '/admin/users' ? 'text-finance-accent' : 'text-finance-text'}`}>Manage Users</Text>
                    </Pressable>
                  </Link>
                </View>
              )}
            </View>
          )}

          {/* Main Content Area */}
          <View className="flex-1">
             <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
              <Tabs.Screen name="index" />
              <Tabs.Screen name="pulse" />
              <Tabs.Screen name="saved" />
              <Tabs.Screen name="profile" />
            </Tabs>
          </View>
        </View>
      </View>
    );
  }

  // Mobile / Mobile-Web Layout
  return (
    <View className="flex-1">
      <TopBar />
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
        {/* Hide profile tab from bottom bar since it's in the top bar */}
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
