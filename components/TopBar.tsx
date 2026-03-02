import { View, Text, Pressable, TextInput, useWindowDimensions } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from 'nativewind';
import { useState, useMemo } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useIPOs } from '@/hooks/useFirestore';

interface TopBarProps {
  onToggleSidebar?: () => void;
}

function SearchComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { ipos } = useIPOs();
  const router = useRouter();

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return ipos.filter(ipo => 
      ipo.companyName?.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [searchQuery, ipos]);

  return (
    <View className="relative z-50">
      <View className="relative hidden sm:flex z-50">
        <View className="absolute left-3 top-2.5 z-10">
          <MaterialCommunityIcons name="magnify" size={20} color="#64748B" />
        </View>
        <TextInput
          placeholder="Search IPOs..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay closing to allow clicks on search results
            setTimeout(() => setIsFocused(false), 200);
          }}
          className="bg-finance-dark text-finance-text pl-10 pr-4 py-2 rounded-full border border-finance-border w-48 focus:border-finance-accent focus:w-64 transition-all outline-none"
        />
        
        {isFocused && searchQuery.trim().length > 0 && (
          <View className="absolute top-12 left-0 w-64 bg-finance-surface border border-finance-border rounded-xl shadow-lg overflow-hidden z-[100]">
            {searchResults.length > 0 ? (
              searchResults.map(ipo => (
                <Pressable
                  key={ipo.id}
                  className="px-4 py-3 border-b border-finance-border active:bg-finance-dark"
                  onPress={() => {
                    setSearchQuery('');
                    setIsFocused(false);
                    router.push(`/ipo/${ipo.id}`);
                  }}
                >
                  <Text className="text-finance-text font-semibold">{ipo.companyName}</Text>
                  <Text className="text-finance-text/60 text-xs mt-0.5">{ipo.status}</Text>
                </Pressable>
              ))
            ) : (
              <View className="px-4 py-4">
                <Text className="text-finance-text/60 text-sm text-center">No IPOs found</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

export default function TopBar({ onToggleSidebar }: TopBarProps) {
  const { width } = useWindowDimensions();
  const { user, firstName, lastName } = useAuth();
  const { colorScheme } = useColorScheme();
  
  const isDark = colorScheme === 'dark';
  const isDesktop = width >= 768; // Tailwind md breakpoint

  const userInitials = firstName && lastName ? `${firstName[0]}${lastName[0]}` : (user?.email ? user.email[0].toUpperCase() : '?');

  return (
    <View className="flex-row items-center justify-between p-3 px-4 bg-finance-surface border-b border-finance-border z-50">
      <View className="flex-row items-center space-x-4">
        {isDesktop && onToggleSidebar && (
          <Pressable 
            onPress={onToggleSidebar} 
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
        <SearchComponent />
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
}
