import React from 'react';
import { useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';

interface RichTextRendererProps {
  content: string;
}

export default function RichTextRenderer({ content }: RichTextRendererProps) {
  const { width } = useWindowDimensions();

  // Define base styles matching the Finance Dark theme
  const tagsStyles = {
    body: {
      color: '#94A3B8', // text-finance-textMuted
      fontSize: 16,
      lineHeight: 24,
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    h1: { color: '#F8FAFC', fontSize: 28, fontWeight: 'bold' as any, marginBottom: 12 },
    h2: { color: '#F8FAFC', fontSize: 24, fontWeight: 'bold' as any, marginBottom: 10 },
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
