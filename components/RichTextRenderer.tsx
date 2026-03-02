import React from 'react';
import { useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { useColorScheme } from 'nativewind';

interface RichTextRendererProps {
  content: string;
}

export default function RichTextRenderer({ content }: RichTextRendererProps) {
  const { width } = useWindowDimensions();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Define base styles matching the Finance Dark/Light theme
  const tagsStyles = {
    body: {
      color: isDark ? '#94A3B8' : '#475569', // text-finance-textMuted
      fontSize: 16,
      lineHeight: 24,
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    h1: { color: isDark ? '#F8FAFC' : '#0F172A', fontSize: 28, fontWeight: 'bold' as any, marginBottom: 12 },
    h2: { color: isDark ? '#F8FAFC' : '#0F172A', fontSize: 24, fontWeight: 'bold' as any, marginBottom: 10 },
    p: { marginBottom: 12 },
    a: { color: '#3B82F6', textDecorationLine: 'underline' as any },
    ul: { paddingLeft: 20, marginBottom: 12 },
    ol: { paddingLeft: 20, marginBottom: 12 },
    li: { marginBottom: 4 }
  };

  return (
    <RenderHtml
      contentWidth={width - 40} // Account for padding
      source={{ html: content || '' }}
      tagsStyles={tagsStyles}
      enableExperimentalMarginCollapsing={true}
    />
  );
}
