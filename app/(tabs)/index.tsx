import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function TabIndexScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir automáticamente a la página explore
    router.replace('/(tabs)/explore');
  }, []);

  return null;
}
