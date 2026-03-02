import { View, FlatList, Text, ActivityIndicator } from 'react-native';
import { IPOListCard } from '@/components/IPOListCard';
import { useIPOs } from '@/hooks/useFirestore';

// Mocking some saved items using IDs for now (until Auth is added)
const savedIds = ['2', '7', '18'];

export default function SavedScreen() {
  const { ipos, loading } = useIPOs();
  const savedIPOs = ipos.filter(ipo => savedIds.includes(ipo.id));

  return (
    <View className="flex-1 bg-finance-dark">
      <View className="p-5 flex-1 max-w-3xl w-full mx-auto">
        <View className="mb-6 mt-6">
          <Text className="text-4xl font-extrabold text-finance-text tracking-tight mb-2">Saved Watchlist</Text>
          <Text className="text-finance-textMuted font-medium">Your personalized tracking list</Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : (
          <FlatList
            data={savedIPOs}
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
        )}
      </View>
    </View>
  );
}
