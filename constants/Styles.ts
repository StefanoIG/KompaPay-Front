// Sistema de estilos global para KompaPay
import { StyleSheet, Platform, Dimensions } from 'react-native';

// Obtener dimensiones de pantalla
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isLargeScreen = screenWidth > 768;

// Paleta de colores extendida para KompaPay
export const KompaColors = {
  // Colores primarios
  primary: '#2563EB',        // Azul principal
  primaryDark: '#1D4ED8',    // Azul oscuro
  primaryLight: '#3B82F6',   // Azul claro
  secondary: '#10B981',      // Verde secundario
  secondaryDark: '#059669',  // Verde oscuro
  secondaryLight: '#34D399', // Verde claro
  
  // Colores de estado
  success: '#10B981',        // Verde éxito
  warning: '#F59E0B',        // Amarillo advertencia
  error: '#EF4444',          // Rojo error
  info: '#3B82F6',           // Azul información
  
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
  expense: '#EF4444',        // Rojo para gastos
  income: '#10B981',         // Verde para ingresos/pagos
  pending: '#F59E0B',        // Amarillo para pendientes
  resolved: '#10B981',       // Verde para resueltos
  conflict: '#EF4444',       // Rojo para conflictos
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

// Sombras (con mejores efectos para web)
export const Shadows = {
  sm: isWeb ? {
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  } : {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: isWeb ? {
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  } : {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: isWeb ? {
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  } : {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: isWeb ? {
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  } : {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Estilos globales reutilizables
export const GlobalStyles = {
  // Sistema de espaciado
  spacing: Spacing,
  
  // Sistema de bordes
  borderRadius: BorderRadius,
  
  // Sistema de sombras
  shadow: Shadows,
  
  // Dimensiones de pantalla
  screen: {
    width: screenWidth,
    height: screenHeight,
    isWeb,
    isLargeScreen,
  },
  
  // Containers responsive
  container: {
    maxWidth: isWeb ? (isLargeScreen ? 1200 : 768) : '100%',
    marginHorizontal: 'auto' as const,
    paddingHorizontal: Spacing.md,
  },
  
  // Flex helpers
  flex: {
    row: { flexDirection: 'row' as const },
    column: { flexDirection: 'column' as const },
    center: { 
      justifyContent: 'center' as const, 
      alignItems: 'center' as const 
    },
    between: { 
      justifyContent: 'space-between' as const 
    },
    around: { 
      justifyContent: 'space-around' as const 
    },
  },
};

// Estilos específicos para componentes
export const ComponentStyles = StyleSheet.create({
  // Botones
  button: {
    backgroundColor: KompaColors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
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
  },
  
  // Cards
  card: {
    backgroundColor: KompaColors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.sm,
    ...Shadows.md,
  },
  
  cardFlat: {
    backgroundColor: KompaColors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: KompaColors.border,
  },
  
  // Texto
  textHero: {
    fontSize: FontSizes.hero,
    fontWeight: 'bold',
    color: KompaColors.textPrimary,
    textAlign: 'center',
    lineHeight: FontSizes.hero * 1.2,
  },
  
  textTitle: {
    fontSize: FontSizes.title,
    fontWeight: 'bold',
    color: KompaColors.textPrimary,
    marginBottom: Spacing.md,
  },
  
  textSubtitle: {
    fontSize: FontSizes.lg,
    color: KompaColors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSizes.lg * 1.4,
  },
  
  textBody: {
    fontSize: FontSizes.md,
    color: KompaColors.textPrimary,
    lineHeight: FontSizes.md * 1.5,
  },
  
  textSecondary: {
    fontSize: FontSizes.md,
    color: KompaColors.textSecondary,
    lineHeight: FontSizes.md * 1.4,
  },
  
  textCenter: {
    textAlign: 'center',
  },
});
