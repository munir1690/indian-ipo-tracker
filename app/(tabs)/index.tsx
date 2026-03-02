import { View, FlatList, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useColorScheme } from 'nativewind';
import { SegmentedControl } from '@/components/SegmentedControl';
import { IPOListCard } from '@/components/IPOListCard';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';
import { useIPOs } from '@/hooks/useFirestore';
import { useAuth } from '@/context/AuthContext';
import { seedFirestore } from '@/seed';
import { useRouter } from 'expo-router';

export default function PipelineScreen() {
  const [filter, setFilter] = useState('Upcoming');
  const [viewMode, setViewMode] = useState<'List' | 'Calendar'>('List');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const { ipos, loading } = useIPOs();
  const { role } = useAuth();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const filteredIPOs = ipos.filter((ipo) => ipo.status === filter);

  // Generate marked dates for the calendar
  const markedDates: any = {};
  filteredIPOs.forEach((ipo) => {
    const dateStr = format(new Date(ipo.expectedListingDate), 'yyyy-MM-dd');
    markedDates[dateStr] = {
      marked: true,
      dotColor: '#4CAF50', // finance-green
    };
  });

  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: '#3B82F6', // finance-accent
    };
  }

  const iposForSelectedDate = selectedDate
    ? filteredIPOs.filter((ipo) => format(new Date(ipo.expectedListingDate), 'yyyy-MM-dd') === selectedDate)
    : [];

  return (
    <View className="flex-1 bg-finance-dark">
      <View className="p-5 flex-1 max-w-3xl w-full mx-auto">
        <View className="mb-6 mt-6 flex-row justify-between items-start">
          <View className="flex-1 mr-4">
            <Text className="text-4xl font-extrabold text-finance-text tracking-tight mb-2">IPOs</Text>
            <Text className="text-finance-textMuted font-medium">Track and analyze upcoming offerings</Text>
          </View>
          {role === 'admin' && (
            <Pressable 
              onPress={() => router.push('/admin/manage-ipo')}
              className="bg-finance-accent px-4 py-2 rounded-xl active:opacity-80"
            >
              <Text className="text-white font-bold text-sm">+ New IPO</Text>
            </Pressable>
          )}
        </View>

        <View className="flex-row mb-6 bg-finance-surface rounded-xl p-1 border border-finance-border self-start">
          <Pressable onPress={() => setViewMode('List')} className={`px-4 py-2 rounded-lg ${viewMode === 'List' ? 'bg-finance-card shadow-sm' : ''}`}>
            <Text className={`text-sm font-bold ${viewMode === 'List' ? 'text-finance-text' : 'text-finance-textMuted'}`}>List View</Text>
          </Pressable>
          <Pressable onPress={() => setViewMode('Calendar')} className={`px-4 py-2 rounded-lg ${viewMode === 'Calendar' ? 'bg-finance-card shadow-sm' : ''}`}>
            <Text className={`text-sm font-bold ${viewMode === 'Calendar' ? 'text-finance-text' : 'text-finance-textMuted'}`}>Calendar</Text>
          </Pressable>
        </View>
        
        <SegmentedControl 
          options={['Upcoming', 'Active', 'Listed']} 
          selectedOption={filter} 
          onOptionPress={setFilter} 
        />

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : viewMode === 'List' ? (
          <FlatList
            data={filteredIPOs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <IPOListCard listing={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
            ListEmptyComponent={
              <View className="items-center justify-center mt-20">
                <Text className="text-finance-textMuted text-lg font-medium mb-4">No IPOs found in this category.</Text>
                <Pressable onPress={() => seedFirestore()} className="bg-finance-surface border border-finance-border px-4 py-2 rounded-lg active:opacity-70">
                  <Text className="text-finance-accent font-bold">Seed Initial Data</Text>
                </Pressable>
              </View>
            }
          />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}>
            <View className="rounded-2xl overflow-hidden border border-finance-border mb-6">
              <Calendar
                theme={{
                  backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                  calendarBackground: isDark ? '#1E1E1E' : '#FFFFFF',
                  textSectionTitleColor: isDark ? '#A0A0A0' : '#64748B',
                  selectedDayBackgroundColor: '#3B82F6',
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: '#3B82F6',
                  dayTextColor: isDark ? '#FFFFFF' : '#0F172A',
                  textDisabledColor: isDark ? '#333333' : '#CBD5E1',
                  dotColor: '#4CAF50',
                  selectedDotColor: '#ffffff',
                  arrowColor: '#3B82F6',
                  monthTextColor: isDark ? '#FFFFFF' : '#0F172A',
                  textDayFontWeight: '500',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '600'
                }}
                markedDates={markedDates}
                onDayPress={(day: any) => setSelectedDate(day.dateString)}
              />
            </View>
            
            {selectedDate && (
              <View>
                <Text className="text-xl font-extrabold text-finance-text tracking-tight mb-4">
                  IPOs on {format(new Date(selectedDate), 'MMM d, yyyy')}
                </Text>
                {iposForSelectedDate.length > 0 ? (
                  iposForSelectedDate.map(ipo => <IPOListCard key={ipo.id} listing={ipo} />)
                ) : (
                  <View className="p-4 bg-finance-surface rounded-xl border border-finance-border">
                    <Text className="text-finance-textMuted font-medium text-center">No IPOs scheduled for this date.</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
