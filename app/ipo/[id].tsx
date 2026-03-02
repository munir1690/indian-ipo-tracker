import { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Linking, Alert, Image, Dimensions } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useIPODetail } from '@/hooks/useFirestore';
import { useAuth } from '@/context/AuthContext';
import RichTextRenderer from '@/components/RichTextRenderer';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/firebase';
import Comments from '@/components/Comments';

export default function IPODetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const ipoId = typeof id === 'string' ? id : '';
  const { ipo: listing, loading } = useIPODetail(ipoId);
  const { user, role, savedIPOs } = useAuth();
  const screenWidth = Dimensions.get('window').width;
  
  const isSaved = savedIPOs.includes(ipoId);

  const [expandedSections, setExpandedSections] = useState({
    about: false,
    strengths: false,
    expert: false,
    discussion: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const allExpanded = Object.values(expandedSections).every(Boolean);
  const toggleAll = () => {
    const newState = !allExpanded;
    setExpandedSections({
      about: newState,
      strengths: newState,
      expert: newState,
      discussion: newState
    });
  };

  const ExpandableContent = ({ 
    children, 
    isExpanded, 
    onToggle, 
    initialHeight = 45 
  }: { 
    children: React.ReactNode, 
    isExpanded: boolean, 
    onToggle: () => void, 
    initialHeight?: number 
  }) => {
    const [contentHeight, setContentHeight] = useState(0);
    const needsExpansion = contentHeight > (initialHeight + 5);

    return (
      <View className="w-full">
        <View style={{ maxHeight: isExpanded ? undefined : initialHeight, overflow: 'hidden', width: '100%', position: 'relative' }}>
          <View onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)} style={{ width: '100%' }}>
             {children}
          </View>
          {needsExpansion && !isExpanded && (
            <View className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-finance-surface to-transparent" />
          )}
        </View>
        
        {needsExpansion && (
          <Pressable 
            onPress={onToggle} 
            className="mt-2 pt-2 border-t border-finance-border/30 flex-row justify-center items-center active:opacity-70 w-full"
          >
            <Text className="text-finance-accent font-bold mr-1 text-xs">
              {isExpanded ? 'Show Less' : 'Read More'}
            </Text>
            <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={14} color="#3B82F6" />
          </Pressable>
        )}
      </View>
    );
  };

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
    <>
      <Stack.Screen options={{ title: listing.companyName ? `${listing.companyName} IPO` : 'IPO Details' }} />
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
            <View className="flex-row items-center mb-2">
              {listing.logoUrl && (
                <Image 
                  source={{ uri: listing.logoUrl }} 
                  className="w-16 h-16 rounded-full bg-finance-dark border border-finance-border mr-4" 
                  resizeMode="contain" 
                />
              )}
              <Text className="text-4xl font-extrabold text-finance-text tracking-tight leading-tight flex-1">{listing.companyName}</Text>
            </View>
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
               {/* Subscription Chart */}
               <View className="mt-6 items-center overflow-hidden w-full">
                 <Text className="text-finance-textMuted text-xs font-bold uppercase tracking-widest mb-4 self-start">Subscription Trends</Text>
                 <BarChart
                   data={{
                     labels: ['QIB', 'NII', 'Retail', 'Total'],
                     datasets: [
                       {
                         data: [
                           parseFloat(listing.extendedDetails.subscriptionRates.qib || '') || 0,
                           parseFloat(listing.extendedDetails.subscriptionRates.nii || '') || 0,
                           parseFloat(listing.extendedDetails.subscriptionRates.retail || '') || 0,
                           parseFloat(listing.extendedDetails.subscriptionRates.total || '') || 0,
                         ],
                       },
                     ],
                   }}
                   width={Math.min(screenWidth - 80, 400)} // Adjust width based on screen size, add padding
                   height={220}
                   yAxisLabel=""
                   yAxisSuffix="x"
                   chartConfig={{
                     backgroundColor: '#1E293B',
                     backgroundGradientFrom: '#0F172A',
                     backgroundGradientTo: '#1E293B',
                     decimalPlaces: 2, 
                     color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // finance-accent
                     labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`, // finance-textMuted
                     style: {
                       borderRadius: 16,
                     },
                     propsForLabels: {
                       fontSize: 10,
                       fontWeight: 'bold',
                     }
                   }}
                   verticalLabelRotation={0}
                   showValuesOnTopOfBars={true}
                   withHorizontalLabels={true}
                   style={{
                     marginVertical: 8,
                     borderRadius: 16,
                   }}
                 />
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

        {/* Expand/Collapse All Toggle */}
        {(listing.extendedDetails?.aboutCompany || 
          listing.extendedDetails?.pros?.length || 
          listing.extendedDetails?.cons?.length || 
          listing.expertTake) ? (
          <View className="flex-row justify-end mb-4">
            <Pressable onPress={toggleAll} className="flex-row items-center active:opacity-70 bg-finance-surface px-4 py-2 rounded-full border border-finance-border">
              <Ionicons name={allExpanded ? "contract" : "expand"} size={16} color="#3B82F6" />
              <Text className="text-finance-accent font-bold text-sm ml-2">
                {allExpanded ? "Collapse All" : "Expand All"}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* About Company */}
        {listing.extendedDetails?.aboutCompany && (
           <View className="mb-4 bg-finance-surface rounded-2xl p-4 border border-finance-border shadow-sm">
             <Text className="text-xl font-extrabold text-finance-text tracking-tight mb-2">About {listing.companyName}</Text>
             <ExpandableContent isExpanded={expandedSections.about} onToggle={() => toggleSection('about')}>
               <View className="pt-2">
                 <RichTextRenderer 
                   content={typeof listing.extendedDetails.aboutCompany === 'string' 
                     ? listing.extendedDetails.aboutCompany 
                     : (listing.extendedDetails.aboutCompany as any)?.aboutCompany || JSON.stringify(listing.extendedDetails.aboutCompany)}
                 />
               </View>
             </ExpandableContent>
           </View>
        )}

        {/* Strengths & Risks */}
        {(listing.extendedDetails?.pros?.length || listing.extendedDetails?.cons?.length) && (
            <View className="mb-4 bg-finance-surface rounded-2xl p-4 border border-finance-border shadow-sm">
              <Text className="text-xl font-extrabold text-finance-text tracking-tight mb-2">Strengths & Risks</Text>
              <ExpandableContent isExpanded={expandedSections.strengths} onToggle={() => toggleSection('strengths')}>
                <View className="flex-col space-y-6 pt-2">
                    {listSection("🏭 Competitive Strengths", listing.extendedDetails.pros || [], "text-finance-green")}
                    {listSection("⚠️ Risk Factors", listing.extendedDetails.cons || [], "text-finance-red")}
                </View>
              </ExpandableContent>
            </View>
        )}

        {/* Expert Take */}
        {listing.expertTake?.remarks && listing.expertTake.remarks.trim().length > 0 && (
          <View className="mb-4 bg-finance-surface rounded-2xl p-4 border border-finance-border shadow-sm relative overflow-hidden">
            <View className="absolute top-0 right-0 h-1 w-full bg-finance-accent opacity-20" />
            <View className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl border-l border-b border-finance-border ${tagColor} z-10`}>
               <Text className={`text-xs font-extrabold uppercase tracking-widest ${tagColor.split(' ')[0]}`}>{listing.expertTake.tag}</Text>
            </View>
            <Text className="text-xl font-extrabold text-finance-text tracking-tight mt-2 mb-2">Alpha Expert Take</Text>
            <ExpandableContent isExpanded={expandedSections.expert} onToggle={() => toggleSection('expert')}>
              <View className="pt-2">
                <RichTextRenderer content={listing.expertTake.remarks} />
              </View>
            </ExpandableContent>
          </View>
        )}

        {/* Discussion */}
        <View className="mb-8 bg-finance-surface rounded-2xl p-4 border border-finance-border shadow-sm">
          <Text className="text-xl font-extrabold text-finance-text tracking-tight mb-2">Discussion</Text>
          <ExpandableContent isExpanded={expandedSections.discussion} onToggle={() => toggleSection('discussion')}>
            <Comments targetId={ipoId} targetType="ipo" hideTitle />
          </ExpandableContent>
        </View>
      </View>
    </ScrollView>
    </>
  );
}
