import { View, FlatList, Text, ActivityIndicator, Pressable } from 'react-native';
import { PulsePost } from '@/components/PulsePost';
import { usePulse } from '@/hooks/useFirestore';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function PulseScreen() {
  const { pulse, loading } = usePulse();
  const { role } = useAuth();
  const router = useRouter();

  return (
    <View className="flex-1 bg-finance-dark">
      <View className="p-5 flex-1 max-w-3xl w-full mx-auto">
        <View className="mb-4 mt-2 flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-extrabold text-finance-text tracking-tight mb-1">Market Pulse</Text>
          </View>
          {role === 'admin' && (
            <Pressable 
              onPress={() => router.push('/admin/manage-insight')}
              className="bg-finance-accent px-4 py-2 rounded-xl active:opacity-80"
            >
              <Text className="text-white font-bold text-sm">+ New Insight</Text>
            </Pressable>
          )}
        </View>
        
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : (
          <FlatList
            data={pulse}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PulsePost post={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyComponent={
              <View className="items-center justify-center mt-20">
                <Text className="text-finance-textMuted text-lg font-medium">No updates available.</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}
