import { View, Text, Pressable } from 'react-native';
import { MarketUpdate } from '@/types';
import { Link } from 'expo-router';
import { useState } from 'react';
import RichTextRenderer from '@/components/RichTextRenderer';

interface PulsePostProps {
  post: MarketUpdate;
}

export function PulsePost({ post }: PulsePostProps) {
  const [expanded, setExpanded] = useState(false);
  
  // HTML makes it hard to safely truncate via strings, so we will use a max height and hidden overflow

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
      
      <View style={{ maxHeight: expanded ? undefined : 120, overflow: 'hidden' }}>
        <RichTextRenderer content={post.content} />
      </View>
      
      {/* We'll always show the expand toggle if content is reasonably long (rough guess by character count) */}
      {post.content.length > 200 && (
        <Pressable onPress={() => setExpanded(!expanded)} className="mt-2 py-2 active:opacity-70 self-start">
          <Text className="text-finance-accent font-bold text-sm">
            {expanded ? 'Show less' : 'Read more'}
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
