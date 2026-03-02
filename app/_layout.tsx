import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth, AuthProvider } from '@/context/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { theme } = useAuth();
  const { colorScheme: nativeColorScheme, setColorScheme: setNativeColorScheme } = useNativewindColorScheme();
  // const colorScheme = useColorScheme(); // Removed as per instruction

  // Sync nativewind color scheme with AuthContext theme
  useEffect(() => {
    if (theme && theme !== nativeColorScheme) {
      setNativeColorScheme(theme);
    }
  }, [theme, nativeColorScheme, setNativeColorScheme]);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDark]);

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: isDark ? '#121212' : '#FFFFFF' },
          headerTintColor: isDark ? '#FFFFFF' : '#1E293B',
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
