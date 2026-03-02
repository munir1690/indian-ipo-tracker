import { View, Text, Pressable } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();

  return (
    <View className="w-64 bg-finance-surface border-r border-finance-border pt-4 px-3 flex-col justify-between hidden md:flex h-full">
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
  );
}
