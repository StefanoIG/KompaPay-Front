// constants/Styles.ts - Compatible con React Native Web
import { Dimensions, Platform, StyleSheet } from 'react-native';

// Obtener dimensiones de pantalla
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isLargeScreen = screenWidth > 768;

// Paleta de colores extendida para KompaPay
export const KompaColors = {
  // Colores primarios
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#3B82F6',
  secondary: '#10B981',
  secondaryDark: '#059669',
  secondaryLight: '#34D399',
  
  // Colores de estado
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Grises
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Colores de fondo
  background: '#FFFFFF',
  backgroundDark: '#111827',
  backgroundSecondary: '#F3F4F6',
  surface: '#F9FAFB',
  surfaceDark: '#1F2937',
  
  // Colores de texto
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textDark: '#FFFFFF',
  textSecondaryDark: '#9CA3AF',
  
  // Colores de bordes
  border: '#E5E7EB',
  borderDark: '#374151',
  
  // Colores específicos de KompaPay
  expense: '#EF4444',
  income: '#10B981',
  pending: '#F59E0B',
  resolved: '#10B981',
  conflict: '#EF4444',
};

// Espaciado consistente (responsive)
export const Spacing = {
  xs: isWeb && isLargeScreen ? 6 : 4,
  sm: isWeb && isLargeScreen ? 12 : 8,
  md: isWeb && isLargeScreen ? 24 : 16,
  lg: isWeb && isLargeScreen ? 36 : 24,
  xl: isWeb && isLargeScreen ? 48 : 32,
  xxl: isWeb && isLargeScreen ? 72 : 48,
  xxxl: isWeb && isLargeScreen ? 96 : 64,
};

// Tamaños de fuente (responsive)
export const FontSizes = {
  xs: isWeb && isLargeScreen ? 14 : 12,
  sm: isWeb && isLargeScreen ? 16 : 14,
  md: isWeb && isLargeScreen ? 18 : 16,
  lg: isWeb && isLargeScreen ? 22 : 18,
  xl: isWeb && isLargeScreen ? 26 : 20,
  xxl: isWeb && isLargeScreen ? 32 : 24,
  xxxl: isWeb && isLargeScreen ? 42 : 32,
  title: isWeb && isLargeScreen ? 38 : 28,
  heading: isWeb && isLargeScreen ? 48 : 36,
  hero: isWeb && isLargeScreen ? 64 : 48,
};

// Radios de borde
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

// Función para crear sombras compatibles con web
const createShadow = (elevation: number) => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `0px ${Math.ceil(elevation * 0.5)}px ${elevation * 2}px rgba(0, 0, 0, 0.1)`,
    };
  }
  
  return {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: Math.ceil(elevation * 0.5),
    },
    shadowOpacity: 0.1,
    shadowRadius: elevation,
    elevation: elevation,
  };
};

// Sombras para usar como style arrays: <View style={[styles.card, Shadows.sm]}>
export const Shadows = {
  sm: createShadow(2),
  md: createShadow(4),
  lg: createShadow(8),
  xl: createShadow(16),
};

// IMPORTANTE: Usa Shadows como arrays de estilos, NO dentro de StyleSheet.create()
// ✅ Correcto: <View style={[styles.card, Shadows.sm]}>
// ❌ Incorrecto: styles: StyleSheet.create({ card: { ...Shadows.sm } })

// Estilos básicos para componentes
export const ComponentStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: KompaColors.background,
  },
  
  containerPadded: {
    flex: 1,
    backgroundColor: KompaColors.background,
    paddingHorizontal: Spacing.md,
  },
  
  button: {
    backgroundColor: KompaColors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  
  buttonSecondary: {
    backgroundColor: KompaColors.surface,
    borderWidth: 1,
    borderColor: KompaColors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  
  card: {
    backgroundColor: KompaColors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: KompaColors.gray100,
  },
  
  input: {
    borderWidth: 1,
    borderColor: KompaColors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSizes.md,
    color: KompaColors.textPrimary,
    backgroundColor: KompaColors.background,
    minHeight: 44,
  },
  
  textTitle: {
    fontSize: FontSizes.title,
    fontWeight: 'bold',
    color: KompaColors.textPrimary,
    marginBottom: Spacing.md,
  },
  
  textBody: {
    fontSize: FontSizes.md,
    color: KompaColors.textPrimary,
  },
  
  textSecondary: {
    fontSize: FontSizes.md,
    color: KompaColors.textSecondary,
  },
});

// Función para combinar estilos de forma segura
export const combineStyles = (...styles: any[]) => {
  return StyleSheet.flatten(styles);
};

// Helpers para layout responsive
export const Layout = {
  container: (paddingHorizontal: number = Spacing.md) => ({
    width: '100%',
    maxWidth: isWeb ? (isLargeScreen ? 1200 : 768) : screenWidth,
    marginHorizontal: 'auto' as const,
    paddingHorizontal,
  }),
  
  row: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
  },
  
  col: (flex: number = 1) => ({
    flex,
    paddingHorizontal: Spacing.xs,
  }),
};

// Sistema responsive
export const responsive = {
  getValue: (mobileValue: any, webValue?: any, largeScreenValue?: any) => {
    if (isWeb) {
      if (isLargeScreen && largeScreenValue !== undefined) {
        return largeScreenValue;
      }
      return webValue !== undefined ? webValue : mobileValue;
    }
    return mobileValue;
  },
  
  isWeb,
  isLargeScreen,
  screenWidth,
  screenHeight,
};

// Exportar todo para compatibilidad
export const GlobalStyles = {
  colors: KompaColors,
  spacing: Spacing,
  fontSize: FontSizes,
  borderRadius: BorderRadius,
  components: ComponentStyles,
  layout: Layout,
  responsive,
};