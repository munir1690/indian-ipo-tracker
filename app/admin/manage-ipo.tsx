import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, collection, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/AuthContext';
import { IPOListing } from '@/types';

export default function ManageIPOScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { role, loading: authLoading } = useAuth();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  
  // Minimal form state
  const [companyName, setCompanyName] = useState('');
  const [status, setStatus] = useState('Upcoming');
  const [expectedDate, setExpectedDate] = useState(new Date().toISOString().split('T')[0]);
  // Fundamentals
  const [issueSize, setIssueSize] = useState('');
  const [gmp, setGmp] = useState('');
  const [priceBand, setPriceBand] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState('');

  // Expert Take
  const [expertTag, setExpertTag] = useState<'Bull' | 'Bear' | 'Neutral'>('Neutral');
  const [expertRemarks, setExpertRemarks] = useState('');

  // Extended Details
  const [aboutCompany, setAboutCompany] = useState('');
  const [pros, setPros] = useState(''); // Comma separated for ease
  const [cons, setCons] = useState(''); // Comma separated for ease
  const [subQib, setSubQib] = useState('');
  const [subNii, setSubNii] = useState('');
  const [subRetail, setSubRetail] = useState('');
  const [subTotal, setSubTotal] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      const fetchIpo = async () => {
        try {
          const docRef = doc(db, 'ipos', id as string);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as IPOListing;
            setCompanyName(data.companyName);
            setStatus(data.status);
            setExpectedDate(new Date(data.expectedListingDate).toISOString().split('T')[0]);
            setIssueSize(data.fundamentals?.issueSize || '');
            setGmp(data.fundamentals?.gmp || '');
            setPriceBand(data.fundamentals?.priceBand || '');
            setSubscriptionStatus(data.fundamentals?.subscriptionStatus || '');
            
            setExpertTag(data.expertTake?.tag || 'Neutral');
            setExpertRemarks(data.expertTake?.remarks || '');

            setAboutCompany(data.extendedDetails?.aboutCompany || '');
            setPros(data.extendedDetails?.pros?.join('\n') || '');
            setCons(data.extendedDetails?.cons?.join('\n') || '');
            
            setSubQib(data.extendedDetails?.subscriptionRates?.qib || '');
            setSubNii(data.extendedDetails?.subscriptionRates?.nii || '');
            setSubRetail(data.extendedDetails?.subscriptionRates?.retail || '');
            setSubTotal(data.extendedDetails?.subscriptionRates?.total || '');
          }
        } catch (error) {
          Alert.alert("Error", "Could not load IPO details");
        } finally {
          setLoading(false);
        }
      };
      fetchIpo();
    }
  }, [id, isEditing]);

  if (authLoading || loading) {
    return (
      <View className="flex-1 bg-finance-dark items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (role !== 'admin') {
    router.replace('/');
    return null;
  }

  const handleSave = async () => {
    if (!companyName || !issueSize) {
      Alert.alert("Error", "Please fill required fields (Company Name, Issue Size)");
      return;
    }

    setSaving(true);
    try {
      const ipoData: Partial<IPOListing> = {
        companyName,
        status: status as any,
        expectedListingDate: new Date(expectedDate).toISOString(),
        fundamentals: {
          issueSize: issueSize || 'TBD',
          gmp: gmp || '0',
          subscriptionStatus: subscriptionStatus || 'Unknown',
          priceBand: priceBand || 'TBD'
        },
        expertTake: {
          tag: expertTag,
          remarks: expertRemarks || 'Expert analysis pending.'
        },
        extendedDetails: {
          aboutCompany,
          pros: pros.split('\n').map(p => p.trim()).filter(Boolean),
          cons: cons.split('\n').map(c => c.trim()).filter(Boolean),
          subscriptionRates: {
            qib: subQib || '0x',
            nii: subNii || '0x',
            retail: subRetail || '0x',
            total: subTotal || '0x'
          }
        }
      };

      if (isEditing) {
        await updateDoc(doc(db, 'ipos', id as string), ipoData);
      } else {
        await addDoc(collection(db, 'ipos'), ipoData);
      }
      
      router.back();
    } catch (error: any) {
      Alert.alert("Error saving IPO", error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;
    
    Alert.alert("Confirm Delete", "Are you sure you want to delete this IPO?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive",
        onPress: async () => {
          setSaving(true);
          try {
            await deleteDoc(doc(db, 'ipos', id as string));
            router.back();
          } catch (error: any) {
            Alert.alert("Error deleting", error.message);
          } finally {
            setSaving(false);
          }
        }
      }
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-finance-dark p-5">
      <View className="max-w-2xl w-full mx-auto pb-20 mt-4">
        <Pressable onPress={() => router.back()} className="mb-6 self-start active:opacity-70">
          <Text className="text-finance-accent font-semibold flex-row items-center">← Back</Text>
        </Pressable>

        <Text className="text-3xl font-extrabold text-finance-text mb-8 tracking-tight">
          {isEditing ? 'Edit IPO' : 'Add New IPO'}
        </Text>

        <View className="space-y-5 bg-finance-surface p-6 rounded-2xl border border-finance-border shadow-md">
          <View>
            <Text className="text-finance-textMuted text-xs font-bold uppercase tracking-wider mb-2">Company Name</Text>
            <TextInput
              className="bg-finance-dark text-finance-text p-4 rounded-xl border border-finance-border focus:border-finance-accent"
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="e.g. Acme Corp"
              placeholderTextColor="#666"
            />
          </View>
          
          <View className="mt-4">
            <Text className="text-finance-textMuted text-xs font-bold uppercase tracking-wider mb-2">Status</Text>
            <View className="flex-row space-x-2">
              {['Upcoming', 'Active', 'Listed'].map((s) => (
                <Pressable 
                  key={s} 
                  onPress={() => setStatus(s)}
                  className={`flex-1 py-3 rounded-xl border ${status === s ? 'bg-finance-accent border-finance-accent' : 'bg-finance-dark border-finance-border'} items-center mr-2`}
                >
                  <Text className={`font-bold ${status === s ? 'text-white' : 'text-finance-textMuted'}`}>{s}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="mt-4">
            <Text className="text-finance-textMuted text-xs font-bold uppercase tracking-wider mb-2">Listing Date (YYYY-MM-DD)</Text>
            <TextInput
              className="bg-finance-dark text-finance-text p-4 rounded-xl border border-finance-border focus:border-finance-accent"
              value={expectedDate}
              onChangeText={setExpectedDate}
              placeholder="e.g. 2024-12-01"
              placeholderTextColor="#666"
            />
          </View>

          <View className="mt-4 flex-row space-x-4">
            <View className="flex-1 mr-2">
              <Text className="text-finance-textMuted text-xs font-bold uppercase tracking-wider mb-2">Issue Size (₹)</Text>
              <TextInput
                className="bg-finance-dark text-finance-text p-4 rounded-xl border border-finance-border focus:border-finance-accent"
                value={issueSize}
                onChangeText={setIssueSize}
                placeholder="e.g. 1500 Cr"
                placeholderTextColor="#666"
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-finance-textMuted text-xs font-bold uppercase tracking-wider mb-2">Est. GMP (₹)</Text>
              <TextInput
                className="bg-finance-dark text-finance-text p-4 rounded-xl border border-finance-border focus:border-finance-accent"
                value={gmp}
                onChangeText={setGmp}
                placeholder="e.g. 120"
                placeholderTextColor="#666"
              />
            </View>
          </View>

          <View className="mt-4 flex-row space-x-4">
            <View className="flex-1 mr-2">
              <Text className="text-finance-textMuted text-xs font-bold uppercase tracking-wider mb-2">Price Band</Text>
              <TextInput
                className="bg-finance-dark text-finance-text p-4 rounded-xl border border-finance-border focus:border-finance-accent"
                value={priceBand}
                onChangeText={setPriceBand}
                placeholder="e.g. 110-120"
                placeholderTextColor="#666"
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-finance-textMuted text-xs font-bold uppercase tracking-wider mb-2">Sub Status</Text>
              <TextInput
                className="bg-finance-dark text-finance-text p-4 rounded-xl border border-finance-border focus:border-finance-accent"
                value={subscriptionStatus}
                onChangeText={setSubscriptionStatus}
                placeholder="e.g. 1.2x"
                placeholderTextColor="#666"
              />
            </View>
          </View>
          
          <View className="mt-6 mb-2">
            <Text className="text-lg font-bold text-finance-text border-b border-finance-border pb-2">Expert Analysis</Text>
          </View>

          <View className="mt-2 text-finance-textMuted text-xs font-bold uppercase tracking-wider mb-2">
            <Text className="text-finance-textMuted text-xs font-bold uppercase tracking-wider mb-2">Expert Tag</Text>
            <View className="flex-row space-x-2">
              {(['Bull', 'Neutral', 'Bear'] as const).map((tag) => (
                <Pressable 
                  key={tag} 
                  onPress={() => setExpertTag(tag)}
                  className={`flex-1 py-3 rounded-xl border items-center mr-2 ${
                    expertTag === tag 
                      ? tag === 'Bull' ? 'bg-green-500/20 border-green-500' 
                      : tag === 'Bear' ? 'bg-red-500/20 border-red-500' 
                      : 'bg-blue-500/20 border-blue-500'
                      : 'bg-finance-dark border-finance-border'
                  }`}
                >
                  <Text className={`font-bold ${
                    expertTag === tag 
                      ? tag === 'Bull' ? 'text-green-500' 
                      : tag === 'Bear' ? 'text-red-500' 
                      : 'text-blue-500'
                      : 'text-finance-textMuted'
                  }`}>{tag}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="mt-4">
            <Text className="text-finance-textMuted text-xs font-bold uppercase tracking-wider mb-2">Expert Remarks</Text>
            <TextInput
              className="bg-finance-dark text-finance-text p-4 rounded-xl border border-finance-border focus:border-finance-accent h-24"
              value={expertRemarks}
              onChangeText={setExpertRemarks}
              placeholder="Analysis summary..."
              placeholderTextColor="#666"
              multiline
              textAlignVertical="top"
            />
          </View>

          <View className="mt-6 mb-2">
            <Text className="text-lg font-bold text-finance-text border-b border-finance-border pb-2">Extended Details</Text>
          </View>

          <View className="mt-2">
            <Text className="text-finance-textMuted text-xs font-bold uppercase tracking-wider mb-2">About Company</Text>
            <TextInput
              className="bg-finance-dark text-finance-text p-4 rounded-xl border border-finance-border focus:border-finance-accent h-32"
              value={aboutCompany}
              onChangeText={setAboutCompany}
              placeholder="What does the company do?"
              placeholderTextColor="#666"
              multiline
              textAlignVertical="top"
            />
          </View>

          <View className="mt-4 flex-row space-x-4">
            <View className="flex-1 mr-2">
              <Text className="text-finance-textMuted text-xs font-bold uppercase tracking-wider mb-2">Pros (1 per line)</Text>
              <TextInput
                className="bg-finance-dark text-finance-text p-4 rounded-xl border border-finance-border focus:border-finance-accent h-32"
                value={pros}
                onChangeText={setPros}
                placeholder="Good financials&#10;Strong brand"
                placeholderTextColor="#666"
                multiline
                textAlignVertical="top"
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-finance-textMuted text-xs font-bold uppercase tracking-wider mb-2">Cons (1 per line)</Text>
              <TextInput
                className="bg-finance-dark text-finance-text p-4 rounded-xl border border-finance-border focus:border-finance-accent h-32"
                value={cons}
                onChangeText={setCons}
                placeholder="High debt&#10;Legal issues"
                placeholderTextColor="#666"
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          <View className="mt-6 mb-2">
            <Text className="text-sm font-bold text-finance-textMuted uppercase tracking-wider">Subscription Rates</Text>
          </View>

          <View className="mt-2 flex-row flex-wrap">
            <View className="w-1/2 pr-2 mb-4">
              <Text className="text-finance-textMuted text-xs font-bold mb-2">QIB</Text>
              <TextInput
                className="bg-finance-dark text-finance-text p-3 rounded-xl border border-finance-border focus:border-finance-accent"
                value={subQib}
                onChangeText={setSubQib}
                placeholder="0.00x"
                placeholderTextColor="#666"
              />
            </View>
            <View className="w-1/2 pl-2 mb-4">
              <Text className="text-finance-textMuted text-xs font-bold mb-2">NII</Text>
              <TextInput
                className="bg-finance-dark text-finance-text p-3 rounded-xl border border-finance-border focus:border-finance-accent"
                value={subNii}
                onChangeText={setSubNii}
                placeholder="0.00x"
                placeholderTextColor="#666"
              />
            </View>
            <View className="w-1/2 pr-2">
              <Text className="text-finance-textMuted text-xs font-bold mb-2">Retail</Text>
              <TextInput
                className="bg-finance-dark text-finance-text p-3 rounded-xl border border-finance-border focus:border-finance-accent"
                value={subRetail}
                onChangeText={setSubRetail}
                placeholder="0.00x"
                placeholderTextColor="#666"
              />
            </View>
            <View className="w-1/2 pl-2">
              <Text className="text-finance-textMuted text-xs font-bold mb-2">Total</Text>
              <TextInput
                className="bg-finance-dark text-finance-text p-3 rounded-xl border border-finance-border focus:border-finance-accent"
                value={subTotal}
                onChangeText={setSubTotal}
                placeholder="0.00x"
                placeholderTextColor="#666"
              />
            </View>
          </View>
        </View>

        <View className="mt-8 flex-row space-x-4">
          {isEditing && (
            <Pressable 
              onPress={handleDelete}
              disabled={saving}
              className={`flex-1 bg-red-500/10 border border-red-500/30 p-4 rounded-xl items-center mr-2 ${saving ? 'opacity-50' : 'active:opacity-70'}`}
            >
              <Text className="text-red-500 font-extrabold text-lg">Delete</Text>
            </Pressable>
          )}
          
          <Pressable 
            onPress={handleSave}
            disabled={saving}
            className={`flex-1 bg-finance-accent p-4 rounded-xl items-center ml-2 ${saving ? 'opacity-50' : 'active:opacity-80'}`}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-extrabold text-lg">Save IPO</Text>
            )}
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
