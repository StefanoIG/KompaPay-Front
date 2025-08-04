// app/_layout.tsx

import { AuthProvider, useAuthContext } from '@/providers/AuthProvider';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View, Platform, StyleSheet } from 'react-native';
import { WebSocketProvider } from '@/providers/WebSocketProvider';
import { Sidebar } from '@/components/navigation/Sidebar';
import { KompaColors, Spacing } from '@/constants/Styles';

// Estilos completamente básicos y seguros
const layoutStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: KompaColors.background,
  },
  
  fullContainer: {
    flex: 1,
  },
  
  webMainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  
  webContentArea: {
    flex: 1,
    backgroundColor: KompaColors.backgroundSecondary,
  },
});

const InitialLayout = () => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)/dashboard' as any); // Redirigir específicamente al dashboard
    } else if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login' as any);
    }
  }, [isAuthenticated, isLoading, segments]);

  // Pantalla de carga
  if (isLoading) {
    return (
      <View style={layoutStyles.loadingContainer}>
        <ActivityIndicator size="large" color={KompaColors.primary} />
      </View>
    );
  }

  const inAuthGroup = segments[0] === '(auth)';
  
  // Layout para web autenticado con sidebar
  if (isAuthenticated && !inAuthGroup && Platform.OS === 'web') {
    return (
      <View style={layoutStyles.webMainContainer}>
        <Sidebar />
        <View style={layoutStyles.webContentArea}>
          <Slot />
        </View>
      </View>
    );
  }

  // Layout básico para móvil o autenticación
  return (
    <View style={layoutStyles.fullContainer}>
      <Slot />
    </View>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <InitialLayout />
      </WebSocketProvider>
    </AuthProvider>
  );
}