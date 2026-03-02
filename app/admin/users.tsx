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
  status?: 'active' | 'disabled';
  createdAt?: any;
}

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { deleteDoc } from 'firebase/firestore';

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

  const toggleStatus = async (user: UserData) => {
    const isCurrentlyDisabled = user.status === 'disabled';
    const newStatus = isCurrentlyDisabled ? 'active' : 'disabled';
    const actionText = isCurrentlyDisabled ? 'Enable' : 'Disable';
    
    Alert.alert(
      `Confirm ${actionText}`,
      `Are you sure you want to ${actionText.toLowerCase()} access for ${user.email}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: `Yes, ${actionText}`, 
          style: isCurrentlyDisabled ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'users', user.id), { status: newStatus });
            } catch (error: any) {
              Alert.alert("Error", "Could not change user status: " + error.message);
            }
          }
        }
      ]
    );
  };

  const deleteUser = async (user: UserData) => {
    Alert.alert(
      "Confirm Deletion",
      `Are you ABSOLUTELY sure you want to delete ${user.email}? This action cannot be undone and deletes their profile from Firestore.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, Delete", 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', user.id));
            } catch (error: any) {
              Alert.alert("Error", "Could not delete user: " + error.message);
            }
          }
        }
      ]
    );
  };

  const renderUser = ({ item }: { item: UserData }) => {
    const isDisabled = item.status === 'disabled';
    return (
      <View className={`bg-finance-surface p-4 rounded-xl mb-3 border border-finance-border flex-row justify-between items-center ${isDisabled ? 'opacity-60' : ''}`}>
        <View className="flex-1 mr-2">
          <Text className="text-finance-text font-bold text-lg" numberOfLines={1}>
            {item.firstName} {item.lastName}
          </Text>
          <Text className="text-finance-textMuted text-sm" numberOfLines={1}>{item.email}</Text>
          
          <View className="flex-row mt-2 space-x-2">
            <View className={`px-2 py-1 rounded-full ${item.role === 'admin' ? 'bg-finance-accent/20' : 'bg-gray-500/20'}`}>
              <Text className={`text-[10px] font-bold uppercase ${item.role === 'admin' ? 'text-finance-accent' : 'text-gray-400'}`}>
                {item.role}
              </Text>
            </View>
            {isDisabled && (
              <View className="px-2 py-1 rounded-full bg-red-500/20">
                <Text className="text-[10px] font-bold uppercase text-red-500">Disabled</Text>
              </View>
            )}
          </View>
        </View>
        
        <View className="flex-row items-center space-x-2">
          <Pressable 
            onPress={() => toggleRole(item)}
            className="p-2 rounded-lg border border-finance-border bg-finance-dark active:opacity-70"
            hitSlop={8}
          >
            <MaterialCommunityIcons 
              name={item.role === 'admin' ? 'shield-account-outline' : 'shield-half-full'} 
              size={20} 
              color={item.role === 'admin' ? '#94A3B8' : '#3B82F6'} 
            />
          </Pressable>

          <Pressable 
            onPress={() => toggleStatus(item)}
            className={`p-2 rounded-lg border border-finance-border ${isDisabled ? 'bg-finance-accent/10 border-finance-accent/30' : 'bg-finance-dark'} active:opacity-70`}
            hitSlop={8}
          >
            <MaterialCommunityIcons 
              name={isDisabled ? 'account-check' : 'account-cancel'} 
              size={20} 
              color={isDisabled ? '#3B82F6' : '#F59E0B'} 
            />
          </Pressable>

          <Pressable 
            onPress={() => deleteUser(item)}
            className="p-2 rounded-lg border border-red-500/30 bg-red-500/10 active:opacity-70"
            hitSlop={8}
          >
            <MaterialCommunityIcons name="delete-outline" size={20} color="#EF4444" />
          </Pressable>
        </View>
      </View>
    );
  };

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
