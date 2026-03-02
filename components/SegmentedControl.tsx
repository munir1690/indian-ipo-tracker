import { View, Text, Pressable } from 'react-native';

interface SegmentedControlProps {
  options: string[];
  selectedOption: string;
  onOptionPress: (option: string) => void;
}

export function SegmentedControl({ options, selectedOption, onOptionPress }: SegmentedControlProps) {
  return (
    <View className="flex-row bg-finance-surface rounded-lg p-1 mb-4 border border-finance-border">
      {options.map((option) => {
        const isSelected = selectedOption === option;
        return (
          <Pressable
            key={option}
            onPress={() => onOptionPress(option)}
            className={`flex-1 py-2 items-center justify-center rounded-md ${
              isSelected ? 'bg-finance-card' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                isSelected ? 'text-finance-text' : 'text-finance-textMuted'
              }`}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
