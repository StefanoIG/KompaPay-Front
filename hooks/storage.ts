import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Storage universal que funciona tanto en web como en móvil
class UniversalStorage {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('Error accessing localStorage:', error);
        return null;
      }
    } else {
      return await AsyncStorage.getItem(key);
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Error setting localStorage:', error);
      }
    } else {
      await AsyncStorage.setItem(key, value);
    }
  }

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing from localStorage:', error);
      }
    } else {
      await AsyncStorage.removeItem(key);
    }
  }

  async clear(): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.clear();
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    } else {
      await AsyncStorage.clear();
    }
  }

  async getAllKeys(): Promise<string[]> {
    if (Platform.OS === 'web') {
      try {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) keys.push(key);
        }
        return keys;
      } catch (error) {
        console.error('Error getting all keys from localStorage:', error);
        return [];
      }
    } else {
      return [...await AsyncStorage.getAllKeys()];
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        keys.forEach(key => localStorage.removeItem(key));
      } catch (error) {
        console.error('Error removing multiple items from localStorage:', error);
      }
    } else {
      await AsyncStorage.multiRemove(keys);
    }
  }
}

export const storage = new UniversalStorage();
