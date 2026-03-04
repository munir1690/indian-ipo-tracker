import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/AuthContext';
import RichTextEditor from '@/components/RichTextEditor';
import { SegmentedControl } from '@/components/SegmentedControl';

export default function ManageInsightScreen() {
  const { firstName, lastName, user } = useAuth();
  const defaultAuthor = firstName && lastName ? `${firstName} ${lastName}` : 'Alpha Expert';
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState(defaultAuthor);
  const [isHtml, setIsHtml] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  useEffect(() => {
    async function fetchPost() {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'pulse', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || '');
          setContent(data.content || '');
          setAuthor(data.author || '');
          setIsHtml(!!data.isHtml);
        } else {
          Alert.alert('Error', 'Post not found');
          router.back();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  const handleSave = async () => {
    if (!title || !content || !author) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    setSaving(true);
    try {
      if (isEditing && id) {
        await updateDoc(doc(db, 'pulse', id), {
          title,
          content,
          author,
          isHtml,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'pulse'), {
          title,
          content,
          author,
          isHtml,
          authorId: user?.uid || null,
          date: new Date().toISOString(),
          timestamp: serverTimestamp(),
        });
      }
      router.back();
    } catch (error: any) {
      console.error("Error saving insight:", error);
      Alert.alert('Error', 'Failed to save insight. ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-finance-dark items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: isEditing ? 'Edit Post' : 'New Post' }} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-finance-dark"
      >
      <ScrollView className="flex-1 px-5 pt-6 pb-20 max-w-3xl w-full mx-auto">
        <View className="flex-row items-center justify-between mb-8">
          <Pressable onPress={() => router.back()} className="p-2 -ml-2">
            <Text className="text-finance-accent text-lg font-medium">Cancel</Text>
          </Pressable>
          <Text className="text-finance-text text-xl font-bold">{isEditing ? 'Edit Update' : 'New Update'}</Text>
          <Pressable onPress={handleSave} disabled={saving} className={`${saving ? 'opacity-50' : 'active:opacity-70'}`}>
            <Text className="text-finance-accent text-lg font-bold">{isEditing ? 'Save' : 'Post'}</Text>
          </Pressable>
        </View>

        <View className="bg-finance-surface rounded-2xl p-6 border border-finance-border shadow-sm mb-6 space-y-6">
          <View>
            <Text className="text-finance-textMuted text-xs font-bold uppercase tracking-widest mb-2">Headline</Text>
            <TextInput
              className="bg-finance-dark text-finance-text p-4 rounded-xl border border-finance-border focus:border-finance-accent font-bold text-lg"
              placeholder="e.g. Market surges on new tech IPOs"
              placeholderTextColor="#666"
              value={title}
              onChangeText={setTitle}
            />
          </View>
          
          <View className="mt-4">
            <Text className="text-finance-textMuted text-xs font-bold uppercase tracking-widest mb-2">Author</Text>
            <TextInput
              className="bg-finance-dark text-finance-text p-4 rounded-xl border border-finance-border focus:border-finance-accent"
              placeholder="e.g. Alpha Expert"
              placeholderTextColor="#666"
              value={author}
              onChangeText={setAuthor}
            />
          </View>

          <View className="mt-4">
            <Text className="text-finance-textMuted text-xs font-bold uppercase tracking-widest mb-2">Content Mode</Text>
            <SegmentedControl
              options={['Rich Text', 'Raw HTML']}
              selectedOption={isHtml ? 'Raw HTML' : 'Rich Text'}
              onOptionPress={(opt) => setIsHtml(opt === 'Raw HTML')}
            />
          </View>

          <View className="mt-4">
            <Text className="text-finance-textMuted text-xs font-bold uppercase tracking-widest mb-2">Content</Text>
            {isHtml ? (
              <TextInput
                className="bg-finance-dark text-finance-text p-4 rounded-xl border border-finance-border focus:border-finance-accent text-base"
                placeholder="<html><body><h1>Raw HTML here...</h1></body></html>"
                placeholderTextColor="#666"
                value={content}
                onChangeText={setContent}
                multiline
                style={{ minHeight: 300, textAlignVertical: 'top' }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            ) : (
              <RichTextEditor 
                value={content}
                onChange={setContent}
                placeholder="Write your market analysis or update here..."
                minHeight={300}
              />
            )}
          </View>
        </View>

        {saving && (
          <View className="items-center justify-center p-4">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-finance-textMuted mt-2">Publishing insight...</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
    </>
  );
}
