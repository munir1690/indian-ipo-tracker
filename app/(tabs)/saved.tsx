import { View, FlatList, Text, ActivityIndicator, Pressable } from 'react-native';
import { IPOListCard } from '@/components/IPOListCard';
import { useIPOs } from '@/hooks/useFirestore';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function SavedScreen() {
  const { ipos, loading: iposLoading } = useIPOs();
  const { user, savedIPOs, loading: authLoading } = useAuth();
  const router = useRouter();

  if (authLoading || iposLoading) {
    return (
      <View className="flex-1 bg-finance-dark items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 bg-finance-dark items-center justify-center p-5">
        <Text className="text-finance-text text-xl font-bold mb-4 text-center">Login Required</Text>
        <Text className="text-finance-textMuted mb-6 text-center">Please log in or create an account to save IPOs to your watchlist.</Text>
        <Pressable onPress={() => router.push('/(auth)/login')} className="bg-finance-accent px-6 py-3 rounded-xl active:opacity-80">
          <Text className="text-white font-bold text-lg">Sign In</Text>
        </Pressable>
      </View>
    );
  }

  const savedIPOsList = ipos.filter(ipo => savedIPOs.includes(ipo.id));

  return (
    <View className="flex-1 bg-finance-dark">
      <View className="p-5 flex-1 max-w-3xl w-full mx-auto">
        <View className="mb-4 mt-2">
          <Text className="text-2xl font-extrabold text-finance-text tracking-tight mb-1">Saved Watchlist</Text>
        </View>

        <FlatList
          data={savedIPOsList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <IPOListCard listing={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Text className="text-finance-textMuted text-lg font-medium">No saved IPOs in your list.</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}
