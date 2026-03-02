import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { usePulseDetail } from '@/hooks/useFirestore';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import RichTextRenderer from '@/components/RichTextRenderer';
import Comments from '@/components/Comments';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function PulseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const postId = typeof id === 'string' ? id : '';
  const { post, loading } = usePulseDetail(postId);
  const { user, role } = useAuth();
  
  if (loading) {
    return (
      <View className="flex-1 bg-finance-dark items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!post) {
    return (
      <View className="flex-1 bg-finance-dark items-center justify-center">
        <Text className="text-finance-text text-lg font-medium">Post not found</Text>
        <Pressable onPress={() => router.back()} className="mt-4 px-4 py-2 bg-finance-surface border border-finance-border rounded-lg active:opacity-70">
          <Text className="text-finance-text font-medium">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const canEdit = user?.uid === post.authorId || role === 'admin';

  const handleDelete = () => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this insight?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'pulse', post.id));
            router.back();
          } catch (error) {
            console.error('Error deleting post:', error);
            Alert.alert('Error', 'Failed to delete the post.');
          }
        }
      }
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Market Insight' }} />
      <ScrollView className="flex-1 bg-finance-dark">
        <View className="max-w-3xl w-full mx-auto p-5 pb-10">
          <View className="flex-row justify-between items-center mb-6">
            <Pressable onPress={() => router.back()} className="active:opacity-70">
              <Text className="text-finance-accent font-semibold flex-row items-center">← Back</Text>
            </Pressable>
            {canEdit && (
              <View className="flex-row space-x-3">
                <Pressable 
                  onPress={() => router.push(`/admin/manage-insight?id=${post.id}`)} 
                  className="px-4 py-1.5 rounded-full border bg-finance-dark border-finance-border active:opacity-70 flex-row items-center space-x-1"
                >
                  <MaterialCommunityIcons name="pencil" size={14} color="#3B82F6" />
                  <Text className="text-finance-accent font-bold text-sm">Edit</Text>
                </Pressable>
                <Pressable 
                  onPress={handleDelete} 
                  className="px-4 py-1.5 rounded-full border bg-red-500/10 border-red-500/30 active:opacity-70 flex-row items-center space-x-1"
                >
                  <MaterialCommunityIcons name="delete" size={14} color="#EF4444" />
                  <Text className="text-red-500 font-bold text-sm">Delete</Text>
                </Pressable>
              </View>
            )}
          </View>
          
          <View className="bg-finance-surface rounded-2xl p-6 border border-finance-border shadow-sm mb-6">
            <View className="flex-row items-center justify-between mb-4">
               <View className="bg-finance-dark/50 px-3 py-1.5 rounded-full border border-finance-border/50 self-start">
                 <Text className="text-[10px] font-bold uppercase tracking-widest text-finance-accent">
                   {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                 </Text>
               </View>
               {post.author && (
                 <Text className="text-finance-textMuted text-xs font-medium">By {post.author}</Text>
               )}
            </View>

            <Text className="text-3xl font-extrabold text-finance-text tracking-tight leading-tight mb-6">{post.title}</Text>
            
            <RichTextRenderer content={post.content} />

            {/* If the post relates to an IPO, provide a link */}
            {post.relatedIpoId && (
              <View className="mt-6 pt-6 border-t border-finance-border/50">
                <Pressable 
                  onPress={() => router.push(`/ipo/${post.relatedIpoId}`)} 
                  className="bg-finance-accent/10 self-start px-4 py-2 flex-row items-center rounded-lg active:opacity-70 border border-finance-accent/20"
                >
                  <Text className="text-finance-accent font-bold text-sm tracking-wide">View Related IPO Details →</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Full Comments Section rendered independently */}
          <Comments targetId={post.id} targetType="pulse" />
        </View>
      </ScrollView>
    </>
  );
}
