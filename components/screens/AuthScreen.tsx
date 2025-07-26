import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { GlobalStyles, KompaColors, Spacing } from '@/constants/Styles';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { StatusBar } from 'expo-status-bar';

interface AuthScreenProps {
  onAuthSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { login, register, loading, error } = useAuth();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email no válido';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!isLogin) {
      if (!formData.nombre.trim()) {
        newErrors.nombre = 'El nombre es requerido';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        await register({
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
        });
      }
      
      if (onAuthSuccess) {
        onAuthSuccess();
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || `Error al ${isLogin ? 'iniciar sesión' : 'registrarse'}`
      );
    }
  };

  const updateFormData = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Limpiar error específico cuando el usuario empiece a escribir
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={GlobalStyles.containerPadded}>
            {/* Header */}
            <View style={{ alignItems: 'center', marginTop: Spacing.xxxl, marginBottom: Spacing.xl }}>
              <Text style={[GlobalStyles.textTitle, { fontSize: 32, color: KompaColors.primary }]}>
                KompaPay
              </Text>
              <Text style={[GlobalStyles.textSecondary, { textAlign: 'center', marginTop: Spacing.sm }]}>
                Gestiona tus gastos compartidos de forma fácil y transparente
              </Text>
            </View>

            {/* Form */}
            <View style={GlobalStyles.card}>
              {/* Toggle Login/Register */}
              <View style={[GlobalStyles.row, { marginBottom: Spacing.lg }]}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    isLogin && styles.toggleButtonActive,
                  ]}
                  onPress={() => {
                    setIsLogin(true);
                    setErrors({});
                  }}
                >
                  <Text style={[
                    styles.toggleButtonText,
                    isLogin && styles.toggleButtonTextActive,
                  ]}>
                    Iniciar Sesión
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    !isLogin && styles.toggleButtonActive,
                  ]}
                  onPress={() => {
                    setIsLogin(false);
                    setErrors({});
                  }}
                >
                  <Text style={[
                    styles.toggleButtonText,
                    !isLogin && styles.toggleButtonTextActive,
                  ]}>
                    Registrarse
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Nombre (solo en registro) */}
              {!isLogin && (
                <View style={{ marginBottom: Spacing.md }}>
                  <Text style={styles.label}>Nombre completo</Text>
                  <TextInput
                    style={[
                      GlobalStyles.input,
                      errors.nombre && GlobalStyles.inputError,
                    ]}
                    placeholder="Ingresa tu nombre completo"
                    value={formData.nombre}
                    onChangeText={(text) => updateFormData('nombre', text)}
                    autoCapitalize="words"
                  />
                  {errors.nombre && (
                    <Text style={styles.errorText}>{errors.nombre}</Text>
                  )}
                </View>
              )}

              {/* Email */}
              <View style={{ marginBottom: Spacing.md }}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[
                    GlobalStyles.input,
                    errors.email && GlobalStyles.inputError,
                  ]}
                  placeholder="ejemplo@email.com"
                  value={formData.email}
                  onChangeText={(text) => updateFormData('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              {/* Contraseña */}
              <View style={{ marginBottom: Spacing.md }}>
                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                  style={[
                    GlobalStyles.input,
                    errors.password && GlobalStyles.inputError,
                  ]}
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChangeText={(text) => updateFormData('password', text)}
                  secureTextEntry
                  autoComplete="password"
                />
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              {/* Confirmar contraseña (solo en registro) */}
              {!isLogin && (
                <View style={{ marginBottom: Spacing.md }}>
                  <Text style={styles.label}>Confirmar contraseña</Text>
                  <TextInput
                    style={[
                      GlobalStyles.input,
                      errors.confirmPassword && GlobalStyles.inputError,
                    ]}
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChangeText={(text) => updateFormData('confirmPassword', text)}
                    secureTextEntry
                    autoComplete="password"
                  />
                  {errors.confirmPassword && (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                  )}
                </View>
              )}

              {/* Submit button */}
              <LoadingButton
                title={isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                onPress={handleSubmit}
                loading={loading}
                style={{ marginTop: Spacing.lg }}
              />

              {/* Error general */}
              {error && (
                <View style={{ marginTop: Spacing.md }}>
                  <Text style={[styles.errorText, { textAlign: 'center' }]}>
                    {error}
                  </Text>
                </View>
              )}
            </View>

            {/* Footer */}
            <View style={{ alignItems: 'center', marginTop: Spacing.xl }}>
              <Text style={GlobalStyles.textSmall}>
                {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                <Text
                  style={[GlobalStyles.textSmall, { color: KompaColors.primary, fontWeight: '600' }]}
                  onPress={() => {
                    setIsLogin(!isLogin);
                    setErrors({});
                    setFormData({
                      nombre: '',
                      email: '',
                      password: '',
                      confirmPassword: '',
                    });
                  }}
                >
                  {isLogin ? 'Registrarse' : 'Iniciar Sesión'}
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = {
  toggleButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center' as const,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  toggleButtonActive: {
    borderBottomColor: KompaColors.primary,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: KompaColors.textSecondary,
  },
  toggleButtonTextActive: {
    color: KompaColors.primary,
    fontWeight: '600' as const,
  },
  label: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: KompaColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: 14,
    color: KompaColors.error,
    marginTop: Spacing.xs,
  },
};
