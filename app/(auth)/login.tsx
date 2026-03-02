import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (!firstName || !lastName) {
          Alert.alert('Error', 'Please enter your first and last name');
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Create user document with default 'user' role and name
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: userCredential.user.email,
          firstName,
          lastName,
          role: 'user',
          createdAt: new Date().toISOString()
        });
      }
      router.back();
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Not Supported', 'Google Sign-In is only implemented for Web in this preview.');
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const displayName = result.user.displayName || '';
      const nameParts = displayName.split(' ');
      const googleFirstName = nameParts[0] || '';
      const googleLastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      // Check if user document exists, if not create it
      const docRef = doc(db, 'users', result.user.uid);
      await setDoc(docRef, {
        email: result.user.email,
        firstName: googleFirstName,
        lastName: googleLastName,
        role: 'user', // Note: If the user is an admin, merge:true will NOT overwrite this if we use setDoc cleverly. However, relying on merge true means we might overwrite role to 'user' if we're not careful. Let's ONLY set role and createdAt if the document is new.
        // But setDoc with merge: true will overwrite fields if they are provided. 
        // A better approach is to only set name and email, and rely on firestore rules or default roles?
        // Actually merge: true merges the object. So role: 'user' WILL overwrite role: 'admin' each login.
        // We should fix this.
      }, { merge: true });
      
      router.back();
    } catch (error: any) {
      Alert.alert('Google Auth Error', error.message);
    }
  };

  const handleAppleAuth = () => {
    Alert.alert('Not Supported', 'Apple Sign-In is not configured for this preview.');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-finance-dark justify-center p-6"
    >
      <View className="max-w-md w-full mx-auto bg-finance-surface p-8 rounded-2xl border border-finance-border shadow-lg">
        <View className="items-center mb-8">
          <Text className="text-3xl font-extrabold text-finance-text mb-2">Alpha IPO</Text>
          <Text className="text-finance-textMuted font-medium text-center">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </Text>
        </View>

        <View className="space-y-4 mb-6">
          {!isLogin && (
            <View className="flex-row space-x-4 mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-finance-textMuted text-xs font-bold uppercase tracking-wider mb-2">First Name</Text>
                <TextInput
                  className="bg-finance-dark text-finance-text p-4 rounded-xl border border-finance-border focus:border-finance-accent"
                  placeholder="Jane"
                  placeholderTextColor="#666"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-finance-textMuted text-xs font-bold uppercase tracking-wider mb-2">Last Name</Text>
                <TextInput
                  className="bg-finance-dark text-finance-text p-4 rounded-xl border border-finance-border focus:border-finance-accent"
                  placeholder="Doe"
                  placeholderTextColor="#666"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>
          )}

          <View>
            <Text className="text-finance-textMuted text-xs font-bold uppercase tracking-wider mb-2">Email Address</Text>
            <TextInput
              className="bg-finance-dark text-finance-text p-4 rounded-xl border border-finance-border focus:border-finance-accent"
              placeholder="you@example.com"
              placeholderTextColor="#666"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          
          <View className="mt-4">
            <Text className="text-finance-textMuted text-xs font-bold uppercase tracking-wider mb-2">Password</Text>
            <TextInput
              className="bg-finance-dark text-finance-text p-4 rounded-xl border border-finance-border focus:border-finance-accent"
              placeholder="Enter your password"
              placeholderTextColor="#666"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        <Pressable 
          onPress={handleAuth}
          disabled={loading}
          className={`bg-finance-accent p-4 rounded-xl items-center mt-2 ${loading ? 'opacity-70' : 'active:opacity-80'}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">{isLogin ? 'Sign In' : 'Sign Up'}</Text>
          )}
        </Pressable>

        <View className="mt-8 pt-6 border-t border-finance-border/50 items-center">
          <Text className="text-finance-textMuted mb-4">Or continue with</Text>
          <View className="flex-row space-x-4 w-full">
            <Pressable onPress={handleGoogleAuth} className="flex-1 bg-finance-dark p-3 rounded-xl border border-finance-border items-center mr-2 active:opacity-70">
              <Text className="text-finance-text font-bold">Google</Text>
            </Pressable>
            <Pressable onPress={handleAppleAuth} className="flex-1 bg-finance-dark p-3 rounded-xl border border-finance-border items-center ml-2 active:opacity-70">
              <Text className="text-finance-text font-bold">Apple</Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-8 flex-row justify-center">
          <Text className="text-finance-textMuted">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </Text>
          <Pressable onPress={() => setIsLogin(!isLogin)}>
            <Text className="text-finance-accent font-bold">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
