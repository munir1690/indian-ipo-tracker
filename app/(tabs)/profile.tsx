import { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import RichTextEditor from '@/components/RichTextEditor';
import RichTextRenderer from '@/components/RichTextRenderer';
import { useColorScheme } from 'nativewind';

export default function ProfileScreen() {
  const { user, role, firstName, lastName, theme, loading, updateTheme } = useAuth();
  const router = useRouter();
  const { colorScheme, toggleColorScheme: toggleNativewindScheme } = useColorScheme();

  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState(firstName || '');
  const [editLastName, setEditLastName] = useState(lastName || '');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch bio when user is loaded

  useEffect(() => {
    if (user) {
      const fetchBio = async () => {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            if (docSnap.data().bio) setBio(docSnap.data().bio);
            if (docSnap.data().avatarUrl) setAvatarUrl(docSnap.data().avatarUrl);
          }
        } catch (error) {
          console.error("Error fetching bio:", error);
        }
      };
      fetchBio();
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      Alert.alert('Error Output', error.message);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, {
        firstName: editFirstName,
        lastName: editLastName,
        avatarUrl: avatarUrl,
        bio: bio
      }, { merge: true });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
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

  if (!user) {
    return (
      <View className="flex-1 bg-finance-dark items-center justify-center p-5">
        <Text className="text-finance-text text-2xl font-extrabold mb-4 text-center">Your Profile</Text>
        <Text className="text-finance-textMuted mb-8 text-center max-w-sm">Sign in to manage your watchlist, update your settings, and secure your account.</Text>
        <Pressable onPress={() => router.push('/(auth)/login')} className="bg-finance-accent px-8 py-3.5 rounded-xl active:opacity-80">
          <Text className="text-white font-bold text-lg">Sign In</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-finance-dark">
      <View className="p-5 flex-1 max-w-3xl w-full mx-auto">
        <View className="mb-6 mt-2">
          <Text className="text-2xl font-extrabold text-finance-text tracking-tight mb-1">Account & Settings</Text>
        </View>

        <View className="bg-finance-surface rounded-2xl p-6 mb-6 border border-finance-border shadow-sm flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-16 h-16 bg-finance-surface rounded-full items-center justify-center mr-5 border border-finance-border overflow-hidden">
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <View className="w-full h-full bg-finance-accent/20 items-center justify-center">
                  <Text className="text-finance-accent text-2xl font-bold uppercase">
                    {firstName ? firstName[0] : (user.email ? user.email[0] : 'U')}
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-finance-text mb-1" numberOfLines={1}>
                {firstName && lastName ? `${firstName} ${lastName}` : user.email}
              </Text>
              {firstName && lastName && (
                <Text className="text-sm text-finance-textMuted mb-2" numberOfLines={1}>
                  {user.email}
                </Text>
              )}
              <View className="flex-row items-center">
                <View className="bg-finance-dark px-2.5 py-1 rounded-md border border-finance-border">
                  <Text className="text-finance-textMuted text-[10px] font-bold uppercase tracking-widest">Role: {role}</Text>
                </View>
              </View>
            </View>
          </View>
          <Pressable onPress={() => {
            setEditFirstName(firstName || '');
            setEditLastName(lastName || '');
            setIsEditing(!isEditing);
          }} className="bg-finance-dark p-2 rounded-lg border border-finance-border active:opacity-70">
            <Text className="text-finance-accent font-bold text-xs uppercase">{isEditing ? 'Cancel' : 'Edit'}</Text>
          </Pressable>
        </View>

        {isEditing && (
          <View className="bg-finance-surface rounded-2xl p-6 mb-6 border border-finance-border shadow-sm">
            <Text className="text-finance-text font-bold mb-4">Edit Profile Details</Text>
            <View className="space-y-4 mb-4">
              <View>
                <Text className="text-finance-textMuted text-xs font-bold uppercase mb-2">First Name</Text>
                <TextInput
                  value={editFirstName}
                  onChangeText={setEditFirstName}
                  className="bg-finance-dark text-finance-text p-3 rounded-xl border border-finance-border focus:border-finance-accent"
                  placeholder="First Name"
                  placeholderTextColor="#666"
                />
              </View>
              <View className="mt-4">
                <Text className="text-finance-textMuted text-xs font-bold uppercase mb-2">Last Name</Text>
                <TextInput
                  value={editLastName}
                  onChangeText={setEditLastName}
                  className="bg-finance-dark text-finance-text p-3 rounded-xl border border-finance-border focus:border-finance-accent"
                  placeholder="Last Name"
                  placeholderTextColor="#666"
                />
              </View>
              <View className="mt-4">
                <Text className="text-finance-textMuted text-xs font-bold uppercase mb-2">Avatar URL (Optional)</Text>
                <TextInput
                  value={avatarUrl}
                  onChangeText={setAvatarUrl}
                  className="bg-finance-dark text-finance-text p-3 rounded-xl border border-finance-border focus:border-finance-accent"
                  placeholder="https://example.com/avatar.png"
                  placeholderTextColor="#666"
                />
              </View>
              <View className="mt-4">
                <Text className="text-finance-textMuted text-xs font-bold uppercase mb-2">Bio</Text>
                <RichTextEditor 
                  value={bio}
                  onChange={setBio}
                  placeholder="Tell us about your investment journey, strategy, and background..."
                  minHeight={250}
                />
              </View>
            </View>
            <Pressable onPress={handleSaveProfile} disabled={saving} className={`bg-finance-accent p-3 rounded-xl items-center ${saving ? 'opacity-50' : 'active:opacity-80'}`}>
              {saving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Save Changes</Text>}
            </Pressable>
          </View>
        )}
        
        {!isEditing && bio && (
          <View className="bg-finance-surface rounded-2xl p-6 mb-6 border border-finance-border shadow-sm">
            <Text className="text-finance-textMuted text-xs font-bold uppercase tracking-wider mb-3">Your Bio</Text>
            <RichTextRenderer content={bio} />
          </View>
        )}

        <View className="space-y-4 mb-8">
          <Text className="text-finance-textMuted text-xs font-bold uppercase tracking-wider mb-2">Settings</Text>
          
          <Pressable className="bg-finance-surface p-4 rounded-xl border border-finance-border flex-row justify-between items-center active:opacity-70">
            <Text className="text-finance-text font-medium">Notifications</Text>
            <Text className="text-finance-textMuted">Enabled ›</Text>
          </Pressable>

          <Pressable 
            onPress={() => {
              const newScheme = colorScheme === 'dark' ? 'light' : 'dark';
              toggleNativewindScheme();
              updateTheme(newScheme);
            }} 
            className="bg-finance-surface p-4 rounded-xl border border-finance-border flex-row justify-between items-center active:opacity-70"
          >
            <Text className="text-finance-text font-medium">Appearance</Text>
            <Text className="text-finance-textMuted">{colorScheme === 'dark' ? 'Dark' : 'Light'} ›</Text>
          </Pressable>

          <Pressable className="bg-finance-surface p-4 rounded-xl border border-finance-border flex-row justify-between items-center active:opacity-70">
            <Text className="text-finance-text font-medium">Help & Support</Text>
            <Text className="text-finance-textMuted">›</Text>
          </Pressable>
        </View>

        <Pressable 
          onPress={handleSignOut}
          className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl items-center active:opacity-70 mt-auto mb-10"
        >
          <Text className="text-red-500 font-bold text-lg">Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
}
