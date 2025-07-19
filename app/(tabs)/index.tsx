import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function TabIndexScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir automáticamente a la página explore
    router.replace('/(tabs)/explore');
  }, []);

  return null;
}
