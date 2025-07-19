import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function AuthIndex() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir automáticamente al login
    router.replace('/(auth)/login');
  }, []);

  return null;
}
