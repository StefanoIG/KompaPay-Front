// hooks/secureStorage.ts
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Secure Storage universal que funciona tanto en web como en móvil
class UniversalSecureStorage {
  async getItemAsync(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        // En web, usamos localStorage con prefijo para "simular" seguridad
        // NOTA: En producción web deberías usar una solución más segura
        return localStorage.getItem(`secure_${key}`);
      } catch (error) {
        console.error('Error accessing secure localStorage:', error);
        return null;
      }
    } else {
      try {
        return await SecureStore.getItemAsync(key);
      } catch (error) {
        console.error('Error accessing SecureStore:', error);
        return null;
      }
    }
  }

  async setItemAsync(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(`secure_${key}`, value);
      } catch (error) {
        console.error('Error setting secure localStorage:', error);
        throw error;
      }
    } else {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch (error) {
        console.error('Error setting SecureStore:', error);
        throw error;
      }
    }
  }

  async deleteItemAsync(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(`secure_${key}`);
      } catch (error) {
        console.error('Error removing from secure localStorage:', error);
      }
    } else {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        console.error('Error deleting from SecureStore:', error);
      }
    }
  }

  async isAvailableAsync(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return typeof Storage !== 'undefined';
    } else {
      return await SecureStore.isAvailableAsync();
    }
  }
}

export const secureStorage = new UniversalSecureStorage();
