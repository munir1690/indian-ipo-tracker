import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native';
import { collection, query, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Stack, useRouter } from 'expo-router';

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'user';
  createdAt?: any;
}

export default function UserManagementScreen() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('email'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData: UserData[] = [];
      snapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as UserData);
      });
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      Alert.alert("Permission Denied", "Only administrators can access this page.");
      router.replace('/(tabs)');
    });

    return () => unsubscribe();
  }, [router]);

  const toggleRole = async (user: UserData) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    
    Alert.alert(
      "Confirm Role Change",
      `Are you sure you want to make ${user.email} a ${newRole}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, Change", 
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'users', user.id), { role: newRole });
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          }
        }
      ]
    );
  };

  const renderUser = ({ item }: { item: UserData }) => (
    <View className="bg-finance-surface p-4 rounded-xl mb-3 border border-finance-border flex-row justify-between items-center">
      <View className="flex-1">
        <Text className="text-finance-text font-bold text-lg">
          {item.firstName} {item.lastName}
        </Text>
        <Text className="text-finance-textMuted text-sm">{item.email}</Text>
        <View className={`mt-2 self-start px-2 py-1 rounded-full ${item.role === 'admin' ? 'bg-finance-accent/20' : 'bg-gray-500/20'}`}>
          <Text className={`text-xs font-bold uppercase ${item.role === 'admin' ? 'text-finance-accent' : 'text-gray-400'}`}>
            {item.role}
          </Text>
        </View>
      </View>
      
      <Pressable 
        onPress={() => toggleRole(item)}
        className={`p-2 rounded-lg border ${item.role === 'admin' ? 'border-red-500/50 bg-red-500/10' : 'border-finance-accent/50 bg-finance-accent/10'}`}
      >
        <Text className={`text-xs font-bold ${item.role === 'admin' ? 'text-red-500' : 'text-finance-accent'}`}>
          {item.role === 'admin' ? 'Demote' : 'Promote'}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <View className="flex-1 bg-finance-dark p-4">
      <Stack.Screen options={{ 
        title: 'User Management',
        headerStyle: { backgroundColor: '#0A0E17' },
        headerTintColor: '#fff',
      }} />

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#00C805" />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          ListEmptyComponent={
            <Text className="text-finance-textMuted text-center mt-10">No users found.</Text>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}
