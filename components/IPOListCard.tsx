import { View, Text, Pressable, Image } from 'react-native';
import { IPOListing } from '@/types';
import { Link } from 'expo-router';

interface IPOListCardProps {
  listing: IPOListing;
}

export function IPOListCard({ listing }: IPOListCardProps) {
  const tagColor =
    listing.expertTake.tag === 'Bull' ? 'text-finance-green bg-green-500/10 border-finance-green/50'
    : listing.expertTake.tag === 'Bear' ? 'text-finance-red bg-red-500/10 border-finance-red/50'
    : 'text-finance-accent bg-blue-500/10 border-finance-accent/50';

  return (
    <Link href={`/ipo/${listing.id}`} asChild>
      <Pressable className="bg-finance-surface rounded-2xl p-5 mb-4 border border-finance-border shadow-sm active:opacity-80">
        <View className="flex-row items-center mb-3">
          {listing.logoUrl && (
            <Image 
              source={{ uri: listing.logoUrl }} 
              className="w-10 h-10 rounded-full bg-finance-dark border border-finance-border mr-3" 
              resizeMode="contain" 
            />
          )}
          <Text className="text-xl font-extrabold text-finance-text flex-1 mr-3 tracking-tight">{listing.companyName}</Text>
          <View className={`px-3 py-1 rounded-full border ${tagColor}`}>
            <Text className={`text-[10px] uppercase tracking-wider font-bold ${tagColor.split(' ')[0]}`}>{listing.expertTake.tag}</Text>
          </View>
        </View>
        <Text className="text-xs font-semibold uppercase tracking-wider text-finance-textMuted mb-4">
          Expected: <Text className="text-finance-text">{new Date(listing.expectedListingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
        </Text>
        
        <View className="flex-row justify-between bg-finance-dark/50 p-3.5 rounded-xl border border-finance-border/30">
          <View className="flex-1">
            <Text className="text-[10px] uppercase tracking-wider text-finance-textMuted mb-1 font-medium">Issue Size</Text>
            <Text className="text-sm font-bold text-finance-text">{listing.fundamentals.issueSize}</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-[10px] uppercase tracking-wider text-finance-textMuted mb-1 font-medium">Sub Status</Text>
            <Text className="text-sm font-bold text-finance-text">{listing.fundamentals.subscriptionStatus}</Text>
          </View>
          <View className="flex-1 items-end">
            <Text className="text-[10px] uppercase tracking-wider text-finance-textMuted mb-1 font-medium">GMP</Text>
            <Text className="text-sm font-bold text-finance-green">{listing.fundamentals.gmp}</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
