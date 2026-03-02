import React from 'react';
import { View, TextInput, Text } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

// Minimal fallback for Native (iOS/Android) 
// In a full production app, you would use a webview package like react-native-pell-rich-editor
export default function RichTextEditor({ value, onChange, placeholder = 'Write something...', minHeight = 200 }: RichTextEditorProps) {
  return (
    <View className="bg-finance-dark rounded-xl border border-finance-border overflow-hidden">
      {/* Fake Toolbar just to show it's a rich field fallback */}
      <View className="bg-finance-surface p-2 border-b border-finance-border flex-row items-center gap-2">
         <MaterialCommunityIcons name="format-bold" size={20} color="#64748B" />
         <MaterialCommunityIcons name="format-italic" size={20} color="#64748B" />
         <MaterialCommunityIcons name="format-list-bulleted" size={20} color="#64748B" />
         <Text className="text-finance-textMuted text-xs font-bold uppercase tracking-wider ml-auto">Formatting (Web Only)</Text>
      </View>
      <TextInput
        className="p-4 text-finance-text text-base"
        style={{ minHeight: minHeight - 34 }}
        placeholder={placeholder}
        placeholderTextColor="#666"
        value={value}
        onChangeText={onChange}
        multiline
        textAlignVertical="top"
      />
    </View>
  );
}
