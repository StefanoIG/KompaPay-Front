import { WebApp } from '@/components/web/WebApp';
import { Stack } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function RootLayout() {
  // Si es web, usar el layout de web con sidebar
  if (Platform.OS === 'web') {
    return <WebApp />;
  }

  // Si es móvil, usar el layout normal con tabs
  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
