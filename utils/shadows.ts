// utils/shadows.ts

import { Platform } from 'react-native';

export const createShadow = (elevation: number) => {
  if (Platform.OS === 'web') {
    const opacity = Math.min(elevation * 0.02, 0.2);
    const blur = elevation * 2;
    const offset = Math.min(elevation, 10);
    
    return {
      boxShadow: `0 ${offset}px ${blur}px -3px rgba(0, 0, 0, ${opacity}), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`,
    };
  }
  
  return {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: Math.min(elevation / 2, 10),
    },
    shadowOpacity: Math.min(elevation * 0.02, 0.2),
    shadowRadius: Math.min(elevation, 15),
    elevation: elevation,
  };
};

export const Shadows = {
  sm: createShadow(2),
  md: createShadow(4),
  lg: createShadow(8),
  xl: createShadow(12),
  '2xl': createShadow(16),
};

// Uso en componentes:
// const styles = StyleSheet.create({
//   card: {
//     ...Shadows.lg,
//     backgroundColor: 'white',
//     borderRadius: 8,
//   },
// });