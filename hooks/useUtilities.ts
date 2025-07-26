import { useCallback } from 'react';
import { Alert, Linking, Share } from 'react-native';

export const useUtilities = () => {
  const formatCurrency = useCallback((amount: number, currency: string = 'EUR'): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }, []);

  const formatDate = useCallback((date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, []);

  const formatDateTime = useCallback((date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const formatTime = useCallback((date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const formatRelativeTime = useCallback((date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Hace un momento';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `Hace ${days} día${days > 1 ? 's' : ''}`;
    } else {
      return formatDate(dateObj);
    }
  }, [formatDate]);

  const formatPercentage = useCallback((value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
  }, []);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const openURL = useCallback(async (url: string): Promise<void> => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `No se puede abrir el enlace: ${url}`);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el enlace');
    }
  }, []);

  const shareContent = useCallback(async (content: {
    title?: string;
    message?: string;
    url?: string;
  }): Promise<void> => {
    try {
      await Share.share({
        title: content.title,
        message: content.message || content.url || '',
        url: content.url,
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir el contenido');
    }
  }, []);

  const copyToClipboard = useCallback(async (text: string): Promise<void> => {
    // En React Native usaríamos @react-native-clipboard/clipboard
    // Por ahora solo mostramos un alert
    Alert.alert('Copiado', `Texto copiado: ${text}`);
  }, []);

  const generateId = useCallback((): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }, []);

  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: any;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  const truncateText = useCallback((text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }, []);

  const capitalizeFirstLetter = useCallback((text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }, []);

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validatePhone = useCallback((phone: string): boolean => {
    const phoneRegex = /^[\+]?[0-9\-\s\(\)]{8,15}$/;
    return phoneRegex.test(phone);
  }, []);

  const generateGroupCode = useCallback((): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }, []);

  const calculateSplitAmount = useCallback((
    totalAmount: number,
    participants: number,
    splitType: 'equal' | 'percentage' | 'custom' = 'equal'
  ): number => {
    if (splitType === 'equal') {
      return totalAmount / participants;
    }
    // Para otros tipos de división, necesitaríamos más parámetros
    return totalAmount / participants;
  }, []);

  return {
    // Formatters
    formatCurrency,
    formatDate,
    formatDateTime,
    formatTime,
    formatRelativeTime,
    formatPercentage,
    formatFileSize,
    
    // Actions
    openURL,
    shareContent,
    copyToClipboard,
    
    // Utilities
    generateId,
    debounce,
    truncateText,
    capitalizeFirstLetter,
    
    // Validators
    validateEmail,
    validatePhone,
    
    // KompaPay specific
    generateGroupCode,
    calculateSplitAmount,
  };
};
