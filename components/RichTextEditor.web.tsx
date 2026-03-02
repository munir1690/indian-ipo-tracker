import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useColorScheme } from 'nativewind';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function RichTextEditor({ value, onChange, placeholder = 'Write something...', minHeight = 200 }: RichTextEditorProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<View>(null);
  
  // Web Implementation using contentEditable
  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelection = useRef<Range | null>(null);

  // Sync initial value only once to avoid cursor jumping
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value && !focused) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value, focused]);

  if (Platform.OS !== 'web') {
     return (
       <View className="bg-finance-dark rounded-xl border border-finance-border overflow-hidden p-4">
         <Text className="text-finance-text text-base">{value || placeholder}</Text>
       </View>
     )
  }
  // Keep track of the current selection so we can restore it when clicking toolbar buttons

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelection.current = sel.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    if (savedSelection.current) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedSelection.current);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCmd = (cmd: string, value: string | undefined = undefined) => {
    // Restore selection first so command applies to correct text
    restoreSelection();
    editorRef.current?.focus();

    try {
      if (cmd === 'formatBlock' && value) {
        // Many modern browsers block formatBlock outright. Implement a manual manual DOM workaround.
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const tag = value.replace(/[<>]/g, '').toUpperCase();
          
          if (['H1', 'H2', 'P'].includes(tag)) {
            const el = document.createElement(tag);
            el.appendChild(range.extractContents());
            range.insertNode(el);
            
            // Clean up empty wrapping spans if they exist
            if (el.innerHTML === '') el.innerHTML = '<br>';
            
            // Re-select the new element's contents
            const newRange = document.createRange();
            newRange.selectNodeContents(el);
            selection.removeAllRanges();
            selection.addRange(newRange);
            saveSelection();
          } else {
            document.execCommand(cmd, false, value);
          }
        }
      } else {
         document.execCommand(cmd, false, value ?? '');
      }
    } catch (e) {
      console.log("Command failed", e);
    }
    
    // Force a React change event after execution
    if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  };

  const handleLink = () => {
    const url = window.prompt("Enter the link URL:");
    if (url) {
      execCmd("createLink", url);
    }
  };

  const handleImage = () => {
    const url = window.prompt("Enter the image URL:");
    if (url) {
      execCmd("insertImage", url);
    }
  };

  const IconButton = ({ icon, onPress, color = isDark ? "#F8FAFC" : "#1E293B", highlight = false }: { icon: any, onPress: () => void, color?: string, highlight?: boolean }) => (
    <button 
      type="button"
      onMouseDown={(e: any) => {
        e.preventDefault();
        // Return focus to editor if it was lost
        editorRef.current?.focus(); 
        onPress();
      }}
      style={{
        border: 'none',
        background: highlight ? 'rgba(234, 179, 8, 0.2)' : 'transparent',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '6px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '40px',
        height: '40px'
      }}
    >
      <MaterialCommunityIcons name={icon} size={20} color={highlight ? "#EAB308" : color} />
    </button>
  );

  return (
    <div
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
         // Check if the new focus target is outside this component
         if (!e.currentTarget.contains(e.relatedTarget as Node)) {
           setFocused(false);
         }
      }}
      tabIndex={-1}
      style={{ outline: 'none' }}
    >
      <View style={[styles.container, focused && styles.focused]}>
        
        {/* Custom Toolbar - Only visible when focused */}
        {focused && (
          <>
            <View style={styles.toolbar} className="bg-finance-surface flex-row flex-wrap border-b border-finance-border p-2 gap-1 gap-y-2">
              
              {/* Basic Formatting */}
              <IconButton icon="format-bold" onPress={() => execCmd('bold')} />
              <IconButton icon="format-italic" onPress={() => execCmd('italic')} />
              <IconButton icon="format-underline" onPress={() => execCmd('underline')} />
              <IconButton icon="format-strikethrough" onPress={() => execCmd('strikeThrough')} />
              
              <View className="w-[1px] bg-finance-border mx-1 my-1" />
              
              {/* Headings */}
              {/* Note: Web requires the tag format to be standard HTML, some browsers need <H1> others just H1. Our updated execCmd handles the fallback. */}
              <IconButton icon="format-header-1" onPress={() => execCmd('formatBlock', '<H1>')} />
              <IconButton icon="format-header-2" onPress={() => execCmd('formatBlock', '<H2>')} />
              <IconButton icon="format-paragraph" onPress={() => execCmd('formatBlock', '<P>')} />

              <View className="w-[1px] bg-finance-border mx-1 my-1" />

              {/* Lists & Alignment */}
              <IconButton icon="format-list-bulleted" onPress={() => execCmd('insertUnorderedList')} />
              <IconButton icon="format-list-numbered" onPress={() => execCmd('insertOrderedList')} />
              
              <View className="w-[1px] bg-finance-border mx-1 my-1" />

              {/* Media & Color */}
              <IconButton icon="link-variant" color="#3B82F6" onPress={handleLink} />
              <IconButton icon="image-outline" color="#3B82F6" onPress={handleImage} />
              
              <View className="w-[1px] bg-finance-border mx-1 my-1" />

              <IconButton icon="palette-outline" onPress={() => {
                const color = window.prompt("Enter an HTML color code (e.g. red or #FF0000):", "#3B82F6");
                if (color) execCmd('foreColor', color);
              }} />

              <IconButton icon="format-color-highlight" highlight onPress={() => {
                const color = window.prompt("Enter an HTML highlight color (e.g. yellow):", "yellow");
                if (color) execCmd('hiliteColor', color);
              }} />

            </View>

            {/* Helpful Note / Hint */}
            <View className={`p-2 px-3 border-b border-finance-border flex-row items-center ${isDark ? 'bg-[#131B2C]' : 'bg-[#F1F5F9]'}`}>
              <MaterialCommunityIcons name="information-outline" size={14} color={isDark ? "#94A3B8" : "#64748B"} />
              <Text className={`${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'} text-xs ml-2 font-medium`}>
                Tip: Select/Highlight text first, then tap an icon above to apply formatting.
              </Text>
            </View>
          </>
        )}

        {/* Editable Area */}
        <View 
          style={[styles.editorWrapper, { minHeight: focused ? minHeight - 60 : minHeight }]}
        >
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            data-placeholder={placeholder}
            style={{
              minHeight: focused ? `${minHeight - 80}px` : `${minHeight - 20}px`,
              outline: 'none',
              color: isDark ? '#F8FAFC' : '#0F172A',
              padding: '16px',
              fontSize: '16px',
              lineHeight: '1.5',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
            className="rich-text-content"
          />
        </View>
      </View>
    </div>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgb(var(--finance-dark))',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgb(var(--finance-border))',
    overflow: 'hidden',
    width: '100%'
  },
  focused: {
    borderColor: 'rgb(var(--finance-accent))',
  },
  toolbar: {
    width: '100%',
  },
  editorWrapper: {
    width: '100%',
    backgroundColor: 'rgb(var(--finance-dark))',
  }
});
