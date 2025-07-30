// Utilidades para formateo de datos en KompaPay

/**
 * Formatea un número como moneda
 * @param amount - Cantidad a formatear
 * @param currency - Código de moneda (por defecto: 'COP')
 * @param locale - Configuración regional (por defecto: 'es-CO')
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'COP',
  locale: string = 'es-CO'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    // Fallback si hay error con Intl
    return `$${amount.toLocaleString()}`;
  }
};

/**
 * Formatea un número como moneda con decimales opcionales
 * Solo muestra decimales si son diferentes de .00
 * @param amount - Cantidad a formatear
 * @param showSign - Si mostrar el símbolo de moneda (por defecto: true)
 */
export const formatCurrencyOptional = (
  amount: number,
  showSign: boolean = true
): string => {
  const hasDecimals = amount % 1 !== 0;
  const formatted = Math.abs(amount).toLocaleString('es-CO', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });
  
  const sign = showSign ? '$' : '';
  const prefix = amount < 0 ? '-' : '';
  
  return `${prefix}${sign}${formatted}`;
};

/**
 * Formatea un número sin símbolo de moneda
 * @param amount - Cantidad a formatear
 * @param locale - Configuración regional (por defecto: 'es-CO')
 */
export const formatNumber = (
  amount: number,
  locale: string = 'es-CO'
): string => {
  try {
    return new Intl.NumberFormat(locale).format(amount);
  } catch (error) {
    return amount.toLocaleString();
  }
};

/**
 * Formatea una fecha de manera legible
 * @param date - Fecha a formatear (string o Date)
 * @param options - Opciones de formato
 */
export const formatDate = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('es-CO', options).format(dateObj);
  } catch (error) {
    return 'Fecha inválida';
  }
};

/**
 * Formatea una fecha de manera relativa (hace X días)
 * @param date - Fecha a formatear
 */
export const formatRelativeDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Hoy';
    } else if (diffInDays === 1) {
      return 'Ayer';
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays} días`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return `Hace ${years} año${years > 1 ? 's' : ''}`;
    }
  } catch (error) {
    return 'Fecha inválida';
  }
};

/**
 * Formatea el nombre de una persona (primera letra de cada palabra en mayúscula)
 * @param name - Nombre a formatear
 */
export const formatPersonName = (name: string): string => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Formatea un porcentaje
 * @param value - Valor decimal (0.15 = 15%)
 * @param decimals - Número de decimales a mostrar
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Trunca un texto a una longitud específica
 * @param text - Texto a truncar
 * @param maxLength - Longitud máxima
 * @param suffix - Sufijo a agregar (por defecto: '...')
 */
export const truncateText = (
  text: string,
  maxLength: number,
  suffix: string = '...'
): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Capitaliza la primera letra de una cadena
 * @param text - Texto a capitalizar
 */
export const capitalize = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Formatea un ID público para mostrar (solo últimos 6 caracteres)
 * @param publicId - ID público completo
 */
export const formatPublicId = (publicId: string): string => {
  if (!publicId || publicId.length < 6) return publicId;
  return `...${publicId.slice(-6)}`;
};

/**
 * Calcula el color basado en el balance (positivo/negativo)
 * @param amount - Cantidad a evaluar
 * @param positiveColor - Color para valores positivos
 * @param negativeColor - Color para valores negativos
 * @param zeroColor - Color para valor cero
 */
export const getBalanceColor = (
  amount: number,
  positiveColor: string = '#10B981',
  negativeColor: string = '#EF4444',
  zeroColor: string = '#6B7280'
): string => {
  if (amount > 0) return positiveColor;
  if (amount < 0) return negativeColor;
  return zeroColor;
};
