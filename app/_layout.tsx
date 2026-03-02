import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import { useFonts } from 'expo-font';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import '../global.css';

import { useAuth, AuthProvider } from '@/context/AuthContext';
import TopBar from '@/components/TopBar';
import Sidebar from '@/components/Sidebar';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...MaterialCommunityIcons.font,
    ...MaterialIcons.font,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function GlobalLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768; // Tailwind md breakpoint
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  // Hide global nav on auth screens
  const isAuthScreen = pathname.includes('/(auth)');

  if (isAuthScreen) {
    return <View className="flex-1 bg-finance-dark">{children}</View>;
  }

  return (
    <View className="flex-1 bg-finance-dark">
      <TopBar onToggleSidebar={isDesktop ? () => setSidebarOpen(!sidebarOpen) : undefined} />
      <View className="flex-1 flex-row">
        {isDesktop && sidebarOpen && <Sidebar />}
        <View className="flex-1">
          {children}
        </View>
      </View>
    </View>
  );
}

function RootLayoutNav() {
  const { theme, loading } = useAuth();
  const { colorScheme: nativeColorScheme, setColorScheme: setNativeColorScheme } = useNativewindColorScheme();

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

  if (loading) return null;

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <GlobalLayoutWrapper>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: isDark ? '#121212' : '#FFFFFF' },
            headerTintColor: isDark ? '#FFFFFF' : '#1E293B',
            headerShadowVisible: false,
            headerShown: false, // Turn off default native stack headers universally
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="(auth)/login" options={{ presentation: 'modal' }} />
          <Stack.Screen name="(auth)/signup" options={{ presentation: 'modal' }} />
          {/* Note: dynamic routes like ipo/[id] are handled automatically by Expo Router's Stack */}
        </Stack>
      </GlobalLayoutWrapper>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
