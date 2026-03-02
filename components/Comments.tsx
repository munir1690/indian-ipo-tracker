import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, Platform, Modal } from 'react-native';
import { collection, query, where, orderBy, limit, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/AuthContext';
import { UserComment } from '@/types';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useColorScheme } from 'nativewind';
import { useRouter } from 'expo-router';

interface CommentsProps {
  targetId: string;
  targetType: 'pulse' | 'ipo';
  hideTitle?: boolean;
}
export default function Comments({ targetId, targetType, hideTitle }: CommentsProps) {
  const [comments, setComments] = useState<UserComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [limitCount, setLimitCount] = useState(10);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  
  const { user, role, firstName, lastName } = useAuth();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    if (!targetId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'comments'),
      where('targetId', '==', targetId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as UserComment[];
      setComments(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching comments:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [targetId, limitCount]);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to leave a comment.');
      return;
    }
    
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const authorName = firstName && lastName ? `${firstName} ${lastName}` : (user.email?.split('@')[0] || 'Anonymous');
      
      await addDoc(collection(db, 'comments'), {
        targetId,
        targetType,
        text: newComment.trim(),
        authorName,
        authorId: user.uid,
        createdAt: new Date().toISOString(),
        timestamp: serverTimestamp()
      });
      
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      Alert.alert('Error', 'Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadMore = () => {
    setLimitCount(prev => prev + 10);
  };

  const handleDeleteComment = (commentId: string) => {
    const performDelete = async () => {
      try {
        await deleteDoc(doc(db, 'comments', commentId));
      } catch (error) {
        console.error('Error deleting comment:', error);
        if (Platform.OS === 'web') {
          setCommentToDelete(null); // Close modal if error via state
          window.alert('Failed to delete comment.');
        } else {
          Alert.alert('Error', 'Failed to delete comment.');
        }
      }
    };

    if (Platform.OS === 'web') {
      setCommentToDelete(commentId);
    } else {
      Alert.alert('Delete Comment', 'Are you sure you want to delete this comment?', [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: performDelete
        }
      ]);
    }
  };

  const confirmWebDelete = async () => {
    if (!commentToDelete) return;
    try {
      await deleteDoc(doc(db, 'comments', commentToDelete));
    } catch (error) {
      console.error('Error deleting comment:', error);
      window.alert('Failed to delete comment.');
    } finally {
      setCommentToDelete(null);
    }
  };

  if (loading && comments.length === 0) {
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View className="mt-6 pt-6 border-t border-finance-border">
      <Modal
        visible={!!commentToDelete}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-finance-surface p-6 rounded-2xl w-11/12 max-w-sm border border-finance-border">
            <Text className="text-xl font-bold text-finance-text mb-2">Delete Comment</Text>
            <Text className="text-finance-textMuted mb-6">Are you sure you want to delete this comment? This action cannot be undone.</Text>
            
            <View className="flex-row justify-end space-x-3">
              <Pressable 
                onPress={() => setCommentToDelete(null)}
                className="px-4 py-2 rounded-xl active:bg-finance-dark"
              >
                <Text className="text-finance-text font-bold">Cancel</Text>
              </Pressable>
              <Pressable 
                onPress={confirmWebDelete}
                className="bg-red-500 px-4 py-2 rounded-xl active:opacity-80"
              >
                <Text className="text-white font-bold">Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {!hideTitle && <Text className="text-finance-text font-bold text-lg mb-4">Comments</Text>}
      
      {/* Input Section */}
      <View className="flex-row items-end space-x-3 mb-6">
        <View className="flex-1 relative">
          <TextInput
            placeholder={user ? "Add a comment..." : "Log in to comment..."}
            placeholderTextColor="#64748B"
            multiline
            editable={!!user}
            value={newComment}
            onChangeText={setNewComment}
            className="bg-finance-dark text-finance-text px-4 py-3 rounded-xl border border-finance-border focus:border-finance-accent min-h-[60px]"
          />
          {!user && (
            <Pressable 
              className="absolute inset-0 z-10"
              onPress={() => {
                Alert.alert('Login Required', 'Please log in to leave a comment.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Login', onPress: () => router.push('/(auth)/login') }
                ]);
              }}
            />
          )}
        </View>
        <Pressable 
          onPress={() => {
             if (!user) {
                Alert.alert('Login Required', 'Please log in to leave a comment.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Login', onPress: () => router.push('/(auth)/login') }
                ]);
                return;
             }
             handleSubmit();
          }} 
          disabled={!!user && (!newComment.trim() || submitting)}
          className={`h-12 w-12 rounded-xl items-center justify-center bg-finance-accent ${(user && (!newComment.trim() || submitting)) ? 'opacity-50' : 'active:opacity-80'}`}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <MaterialCommunityIcons name="send" size={20} color="white" />
          )}
        </Pressable>
      </View>

      {/* Constraints List */}
      <View className="space-y-4">
        {comments.map(comment => (
          <View key={comment.id} className="bg-finance-surface p-4 rounded-xl border border-finance-border">
            <View className="flex-row justify-between mb-2">
              <Text className="text-finance-text font-bold text-sm tracking-tight">{comment.authorName}</Text>
              <View className="flex-row items-center space-x-2">
                {(user?.uid === comment.authorId || role === 'admin') && (
                  <Pressable 
                    onPress={() => handleDeleteComment(comment.id)}
                    className="active:opacity-70 p-1"
                  >
                    <MaterialCommunityIcons name="delete" size={16} color="#EF4444" />
                  </Pressable>
                )}
                <Text className="text-finance-textMuted text-xs">
                  {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
            </View>
            <Text className="text-finance-text text-sm leading-relaxed">{comment.text}</Text>
          </View>
        ))}
      </View>
      
      {comments.length === 0 && (
        <View className="py-4 items-center">
          <Text className="text-finance-textMuted">No comments yet. Be the first to start the conversation!</Text>
        </View>
      )}

      {comments.length >= limitCount && (
        <Pressable onPress={handleLoadMore} className="mt-4 py-3 items-center active:opacity-70">
          <Text className="text-finance-accent font-bold">Show more comments</Text>
        </Pressable>
      )}
    </View>
  );
}
