import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { GlobalStyles, KompaColors } from '@/constants/Styles';

interface LoadingButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  loadingColor?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  loadingColor,
}) => {
  const isDisabled = loading || disabled;

  const getButtonStyle = (): ViewStyle => {
    let baseStyle = GlobalStyles.button;
    
    if (variant === 'secondary') {
      baseStyle = GlobalStyles.buttonSecondary;
    } else if (variant === 'outline') {
      baseStyle = GlobalStyles.buttonOutline;
    }

    if (size === 'small') {
      baseStyle = { ...baseStyle, ...GlobalStyles.buttonSmall };
    } else if (size === 'large') {
      baseStyle = { ...baseStyle, ...GlobalStyles.buttonLarge };
    }

    const disabledStyle = isDisabled ? {
      opacity: 0.6,
      backgroundColor: variant === 'primary' ? KompaColors.gray400 : baseStyle.backgroundColor,
    } : {};

    return {
      ...baseStyle,
      ...disabledStyle,
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    let baseStyle = GlobalStyles.buttonText;
    
    if (variant === 'secondary') {
      baseStyle = GlobalStyles.buttonTextSecondary;
    } else if (variant === 'outline') {
      baseStyle = GlobalStyles.buttonTextOutline;
    }

    const disabledTextStyle = isDisabled && variant !== 'primary' ? {
      color: KompaColors.gray500,
    } : {};

    return {
      ...baseStyle,
      ...disabledTextStyle,
      ...textStyle,
    };
  };

  const getLoadingColor = (): string => {
    if (loadingColor) return loadingColor;
    
    if (variant === 'primary') return KompaColors.background;
    if (variant === 'secondary') return KompaColors.textPrimary;
    if (variant === 'outline') return KompaColors.primary;
    
    return KompaColors.primary;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : 0.7}
    >
      {loading ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator 
            size="small" 
            color={getLoadingColor()} 
            style={{ marginRight: 8 }} 
          />
          <Text style={getTextStyle()}>Cargando...</Text>
        </View>
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
