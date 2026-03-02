import { View, FlatList, Text, ActivityIndicator } from 'react-native';
import { PulsePost } from '@/components/PulsePost';
import { usePulse } from '@/hooks/useFirestore';

export default function PulseScreen() {
  const { pulse, loading } = usePulse();

  return (
    <View className="flex-1 bg-finance-dark">
      <View className="p-5 flex-1 max-w-3xl w-full mx-auto">
        <View className="mb-6 mt-6">
          <Text className="text-4xl font-extrabold text-finance-text tracking-tight mb-2">Market Pulse</Text>
          <Text className="text-finance-textMuted font-medium">Alpha expert updates and macro insights</Text>
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
