import { View, Text, ScrollView, Pressable, ActivityIndicator, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useIPODetail } from '@/hooks/useFirestore';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/firebase';

export default function IPODetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const ipoId = typeof id === 'string' ? id : '';
  const { ipo: listing, loading } = useIPODetail(ipoId);
  const { user, role, savedIPOs } = useAuth();
  
  const isSaved = savedIPOs.includes(ipoId);

  const toggleSave = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please log in to save IPOs to your watchlist", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => router.push('/(auth)/login') }
      ]);
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      if (isSaved) {
        await updateDoc(userRef, { savedIPOs: arrayRemove(ipoId) });
      } else {
        await updateDoc(userRef, { savedIPOs: arrayUnion(ipoId) });
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  const handleAddToCalendar = () => {
    if (!listing) return;
    const startDate = new Date(listing.expectedListingDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1); // Full day event

    // Google Calendar format string
    const startStr = startDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endStr = endDate.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const url = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(
      listing.companyName + " IPO Listing"
    )}&dates=${startStr}/${endStr}&details=${encodeURIComponent(
      "Track the IPO listing for " + listing.companyName + " via Indian IPO Tracker."
    )}`;

    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-finance-dark items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!listing) {
    return (
      <View className="flex-1 bg-finance-dark items-center justify-center">
        <Text className="text-finance-text text-lg font-medium">IPO not found</Text>
        <Pressable onPress={() => router.back()} className="mt-4 px-4 py-2 bg-finance-surface border border-finance-border rounded-lg active:opacity-70">
          <Text className="text-finance-text font-medium">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const listSection = (title: string, items: string[], bulletColor: string) => {
    if (!items || items.length === 0) return null;
    return (
      <View className="bg-finance-surface border border-finance-border p-5 rounded-2xl shadow-sm mb-4">
        <Text className="text-lg font-extrabold text-finance-text mb-4 border-b border-finance-border/40 pb-2">{title}</Text>
        {items.map((item, idx) => (
          <View key={idx} className="flex-row items-start mb-3">
            <Text className={`text-[10px] mr-2 mt-1.5 ${bulletColor}`}>●</Text>
            <Text className="text-finance-textMuted text-sm leading-relaxed flex-1">{item}</Text>
          </View>
        ))}
      </View>
    );
  };

  const tagColor =
    listing.expertTake.tag === 'Bull' ? 'text-finance-green bg-green-500/10 border-finance-green/50'
    : listing.expertTake.tag === 'Bear' ? 'text-finance-red bg-red-500/10 border-finance-red/50'
    : 'text-finance-accent bg-blue-500/10 border-finance-accent/50';

  return (
    <ScrollView className="flex-1 bg-finance-dark">
      <View className="max-w-3xl w-full mx-auto p-5 pb-10">
        <View className="flex-row justify-between items-center mb-6">
          <Pressable onPress={() => router.back()} className="active:opacity-70">
            <Text className="text-finance-accent font-semibold flex-row items-center">← Back</Text>
          </Pressable>
          <View className="flex-row space-x-3">
            {role === 'admin' && (
              <Pressable 
                onPress={() => router.push(`/admin/manage-ipo?id=${ipoId}`)} 
                className="px-4 py-1.5 rounded-full border bg-finance-dark border-finance-border active:opacity-70"
              >
                <Text className="text-finance-accent font-bold text-sm">Edit</Text>
              </Pressable>
            )}
            <Pressable onPress={toggleSave} className={`px-4 py-1.5 rounded-full border ${isSaved ? 'bg-finance-accent/20 border-finance-accent' : 'bg-transparent border-finance-border'} active:opacity-70`}>
              <Text className={`${isSaved ? 'text-finance-accent' : 'text-finance-textMuted'} font-bold text-sm`}>
                {isSaved ? '★ Saved' : '☆ Save'}
              </Text>
            </Pressable>
          </View>
        </View>
        
        <View className="flex-row justify-between items-start mb-8 border-b border-finance-border pb-6">
          <View className="flex-1 mr-4">
            <Text className="text-4xl font-extrabold text-finance-text mb-2 tracking-tight leading-tight">{listing.companyName}</Text>
            <View className="flex-row items-center space-x-3 mt-1">
              <Text className="text-finance-textMuted font-medium uppercase tracking-widest text-xs">Status:</Text>
              <View className="bg-finance-surface border border-finance-border px-3 py-1 rounded-full flex-row">
                <Text className="text-finance-accent font-bold text-xs uppercase tracking-wider">{listing.status}</Text>
              </View>
              <Text className="text-finance-textMuted font-medium uppercase tracking-widest text-xs ml-3 border-l border-finance-border pl-3">Date: {new Date(listing.expectedListingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
            </View>
            <Pressable onPress={handleAddToCalendar} className="mt-5 self-start bg-[#3B82F6]/10 border border-[#3B82F6]/30 py-2.5 px-5 rounded-xl flex-row items-center active:opacity-70">
              <Text className="text-finance-accent font-extrabold text-sm tracking-wide">📅 Add to Calendar</Text>
            </Pressable>
          </View>
        </View>

        {/* Enhanced Fundamentals Grid */}
        <View className="bg-finance-surface rounded-2xl p-6 mb-8 border border-finance-border shadow-sm">
          <Text className="text-xl font-extrabold text-finance-text mb-5 border-b border-finance-border/50 pb-3 tracking-tight">Core Details</Text>
          
          <View className="flex-row mb-6">
            <View className="flex-1">
              <Text className="text-finance-textMuted text-[11px] font-bold uppercase tracking-widest mb-1.5">Issue Size</Text>
              <Text className="text-finance-text text-xl font-bold">{listing.fundamentals.issueSize}</Text>
            </View>
            <View className="flex-1 border-l border-finance-border/50 pl-4">
              <Text className="text-finance-textMuted text-[11px] font-bold uppercase tracking-widest mb-1.5">Price Band</Text>
              <Text className="text-finance-text text-xl font-bold">{listing.fundamentals.priceBand}</Text>
            </View>
          </View>

          {/* Conditional Subscription Details */}
          {listing.extendedDetails?.subscriptionRates ? (
             <View className="pt-5 border-t border-finance-border/30">
               <Text className="text-finance-textMuted text-[11px] font-bold uppercase tracking-widest mb-3">Subscription Breakdown</Text>
               <View className="flex-row justify-between">
                 <View>
                   <Text className="text-finance-textMuted text-xs mb-1">QIB</Text>
                   <Text className="text-finance-text font-bold">{listing.extendedDetails.subscriptionRates.qib}</Text>
                 </View>
                 <View>
                   <Text className="text-finance-textMuted text-xs mb-1">NII</Text>
                   <Text className="text-finance-text font-bold">{listing.extendedDetails.subscriptionRates.nii}</Text>
                 </View>
                 <View>
                   <Text className="text-finance-textMuted text-xs mb-1">Retail</Text>
                   <Text className="text-finance-text font-bold">{listing.extendedDetails.subscriptionRates.retail}</Text>
                 </View>
                 <View>
                   <Text className="text-finance-textMuted text-xs mb-1">Total</Text>
                   <Text className="text-finance-accent font-extrabold">{listing.extendedDetails.subscriptionRates.total}</Text>
                 </View>
               </View>
             </View>
          ) : (
            <View className="flex-row pt-5 border-t border-finance-border/30">
              <View className="flex-1">
                <Text className="text-finance-textMuted text-[11px] font-bold uppercase tracking-widest mb-1.5">Subscription</Text>
                <Text className="text-finance-text text-xl font-bold">{listing.fundamentals.subscriptionStatus}</Text>
              </View>
              <View className="flex-1 border-l border-finance-border/50 pl-4">
                <Text className="text-finance-textMuted text-[11px] font-bold uppercase tracking-widest mb-1.5">Current GMP</Text>
                <Text className="text-finance-green text-xl font-extrabold">{listing.fundamentals.gmp}</Text>
              </View>
            </View>
          )}
        </View>

        {/* About Company */}
        {listing.extendedDetails?.aboutCompany && (
           <View className="mb-8 pl-2 border-l-2 border-finance-accent/50">
             <Text className="text-finance-text font-bold text-lg mb-2">About {listing.companyName}</Text>
             <Text className="text-finance-textMuted leading-relaxed text-[15px]">
               {typeof listing.extendedDetails.aboutCompany === 'string' 
                 ? listing.extendedDetails.aboutCompany 
                 : (listing.extendedDetails.aboutCompany as any)?.aboutCompany || JSON.stringify(listing.extendedDetails.aboutCompany)}
             </Text>
           </View>
        )}

        {/* Strengths & Risks */}
        {(listing.extendedDetails?.pros?.length || listing.extendedDetails?.cons?.length) && (
            <View className="mb-8 flex-col space-y-6">
                {listSection("🏭 Competitive Strengths", listing.extendedDetails.pros || [], "text-finance-green")}
                {listSection("⚠️ Risk Factors", listing.extendedDetails.cons || [], "text-finance-red")}
            </View>
        )}

        {/* Expert Take */}
        <View className="rounded-2xl p-6 border border-finance-border bg-finance-surface shadow-sm relative overflow-hidden">
          <View className="absolute top-0 right-0 h-1 w-full bg-finance-accent opacity-20" />
          <View className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl border-l border-b border-finance-border ${tagColor}`}>
             <Text className={`text-xs font-extrabold uppercase tracking-widest ${tagColor.split(' ')[0]}`}>{listing.expertTake.tag}</Text>
          </View>
          <Text className="text-2xl font-extrabold text-finance-text mb-4 mt-2 tracking-tight">
             Alpha Expert Take
          </Text>
          <Text className="text-finance-textMuted text-base leading-relaxed font-medium">
            {listing.expertTake.remarks}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
