import { View, Text, Pressable, Alert, Platform, Modal } from 'react-native';
import { MarketUpdate } from '@/types';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import RichTextRenderer from '@/components/RichTextRenderer';
import { useAuth } from '@/context/AuthContext';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Comments from '@/components/Comments';

interface PulsePostProps {
  post: MarketUpdate;
}

export function PulsePost({ post }: PulsePostProps) {
  const { user, role } = useAuth();
  const router = useRouter();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const canEdit = user?.uid === post.authorId || role === 'admin';

  const performDelete = async () => {
    try {
      await deleteDoc(doc(db, 'pulse', post.id));
    } catch (error) {
      console.error('Error deleting post:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to delete the post.');
      } else {
        Alert.alert('Error', 'Failed to delete the post.');
      }
    }
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      setShowDeleteModal(true);
    } else {
      Alert.alert('Delete Post', 'Are you sure you want to delete this insight?', [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: performDelete
        }
      ]);
    }
  };
  

  const [showComments, setShowComments] = useState(false);

  return (
    <View className="bg-finance-surface rounded-2xl p-6 mb-4 border border-finance-border shadow-sm">
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-finance-surface p-6 rounded-2xl w-11/12 max-w-sm border border-finance-border">
            <Text className="text-xl font-bold text-finance-text mb-2">Delete Post</Text>
            <Text className="text-finance-textMuted mb-6">Are you sure you want to delete this insight? This action cannot be undone.</Text>
            
            <View className="flex-row justify-end space-x-3">
              <Pressable 
                onPress={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl active:bg-finance-dark"
              >
                <Text className="text-finance-text font-bold">Cancel</Text>
              </Pressable>
              <Pressable 
                onPress={() => {
                  setShowDeleteModal(false);
                  performDelete();
                }}
                className="bg-red-500 px-4 py-2 rounded-xl active:opacity-80"
              >
                <Text className="text-white font-bold">Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <View className="flex-row justify-between items-start mb-3">
        <Text className="text-xl font-extrabold text-finance-text flex-1 pr-4 tracking-tight leading-tight">{post.title}</Text>
        <View className="flex-row items-center space-x-2">
          {canEdit && (
            <View className="flex-row space-x-3 mr-2">
              <Pressable onPress={() => router.push(`/admin/manage-insight?id=${post.id}`)} className="active:opacity-70 p-1">
                <MaterialCommunityIcons name="pencil" size={18} color="#94A3B8" />
              </Pressable>
              <Pressable onPress={handleDelete} className="active:opacity-70 p-1">
                <MaterialCommunityIcons name="delete" size={18} color="#EF4444" />
              </Pressable>
            </View>
          )}
          <View className="bg-finance-dark/50 px-3 py-1.5 rounded-full border border-finance-border/50">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-finance-accent">
              {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
        </View>
      </View>
      
      <Pressable onPress={() => router.push(`/pulse/${post.id}`)} className="active:opacity-80">
        <View style={{ maxHeight: 120, overflow: 'hidden' }}>
          <RichTextRenderer content={post.content} />
          {/* Fading gradient effect for long text */}
          {post.content.length > 200 && (
             <View className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-finance-surface to-transparent" />
          )}
        </View>
        
        <View className="flex-row items-center mt-3 pt-3 border-t border-finance-border/50">
          <Text className="text-finance-accent font-bold text-sm">Read full insight →</Text>
        </View>
      </Pressable>

      <View className="flex-row items-center mt-4 pt-4 border-t border-finance-border/50 space-x-4">
        <Pressable onPress={() => setShowComments(!showComments)} className="flex-row items-center space-x-2 active:opacity-70">
          <MaterialCommunityIcons name="comment-outline" size={18} color={showComments ? "#3B82F6" : "#A0AEC0"} />
          <Text className={`${showComments ? 'text-finance-accent' : 'text-finance-textMuted'} font-bold text-sm`}>
            {showComments ? 'Hide Comments' : 'Comment'}
          </Text>
        </Pressable>

        {post.relatedIpoId && (
          <Link href={`/ipo/${post.relatedIpoId}`} asChild>
            <Pressable className="bg-finance-accent/10 px-3 py-1.5 flex-row items-center rounded-lg active:opacity-70 border border-finance-accent/20">
              <Text className="text-finance-accent font-bold text-xs">IPO Details →</Text>
            </Pressable>
          </Link>
        )}
      </View>

      {showComments && (
        <View className="mt-2">
          <Comments targetId={post.id} targetType="pulse" />
        </View>
      )}
    </View>
  );
}
