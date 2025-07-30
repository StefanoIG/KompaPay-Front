// app/_layout.tsx

import { AuthProvider, useAuthContext } from '@/providers/AuthProvider';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WebSocketProvider } from '@/providers/WebSocketProvider'; // Importar el nuevo provider

const InitialLayout = () => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Esperar a que termine la carga inicial

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated && inAuthGroup) {
      // Si está autenticado y en el grupo de login/registro, redirigir a la app
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !inAuthGroup) {
      // Si no está autenticado y fuera del grupo de auth, redirigir al login
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <WebSocketProvider> {/* Envolver aquí */}
        <InitialLayout />
      </WebSocketProvider>
    </AuthProvider>
  );
}