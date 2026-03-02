import { View, Text, Pressable } from 'react-native';
import { MarketUpdate } from '@/types';
import { Link } from 'expo-router';
import { useState } from 'react';

interface PulsePostProps {
  post: MarketUpdate;
}

export function PulsePost({ post }: PulsePostProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Truncate logic
  const isLongText = post.content.length > 150;
  const displayText = !expanded && isLongText 
    ? post.content.substring(0, 150) + '...'
    : post.content;

  return (
    <View className="bg-finance-surface rounded-2xl p-6 mb-4 border border-finance-border shadow-sm">
      <View className="flex-row justify-between items-start mb-3">
        <Text className="text-xl font-extrabold text-finance-text flex-1 pr-4 tracking-tight leading-tight">{post.title}</Text>
        <View className="bg-finance-dark/50 px-3 py-1.5 rounded-full border border-finance-border/50">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-finance-accent">
            {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
      </View>
      
      <Text className="text-finance-textMuted text-[15px] leading-relaxed font-medium">
        {displayText}
      </Text>
      
      {isLongText && (
        <Pressable onPress={() => setExpanded(!expanded)} className="mt-2 py-2 active:opacity-70 self-start">
          <Text className="text-finance-accent font-bold text-sm">
            {expanded ? 'Show less' : 'Read full text'}
          </Text>
        </Pressable>
      )}

      {post.relatedIpoId && (
        <View className="mt-4 pt-4 border-t border-finance-border/50">
          <Link href={`/ipo/${post.relatedIpoId}`} asChild>
            <Pressable className="bg-finance-accent/10 self-start px-4 py-2 flex-row items-center rounded-lg active:opacity-70 border border-finance-accent/20">
              <Text className="text-finance-accent font-bold text-sm tracking-wide">View IPO Details →</Text>
            </Pressable>
          </Link>
        </View>
      )}
    </View>
  );
}
