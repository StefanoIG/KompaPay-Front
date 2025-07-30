// app/(auth)/register.tsx

import React, { useState } from 'react';
import { useAuthContext } from '@/providers/AuthProvider'; // 1. Usar el nuevo AuthProvider
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterScreen() {
    const { register, isLoading: isAuthLoading } = useAuthContext(); // Usar el estado de carga del hook
    const router = useRouter();
    const insets = useSafeAreaInsets(); // Hook para manejar el notch/isla dinámica

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    
    const handleRegister = async () => {
        // Validaciones básicas
        if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }
        if (formData.password.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            const user = await register({
                // 2. Corregido: 'name' en lugar de 'nombre' para coincidir con la API
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password
            });

            if (user) {
                // 3. Redirección a dashboard_refactored al tener éxito
                router.replace('/(tabs)/dashboard_refactored');
            } else {
                // El error ya es manejado por el hook useApi, pero podemos poner un mensaje genérico
                Alert.alert('Error de Registro', 'No se pudo crear la cuenta. Por favor, intenta de nuevo.');
            }

        } catch (error: any) {
            // Este catch es por si la promesa del hook es rechazada (aunque useApi ya maneja errores)
            console.error('Register error:', error);
            Alert.alert('Error Inesperado', 'Ocurrió un error. Verifica tu conexión a internet.');
        }
    };

    const updateFormData = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#2563EB', '#10B981']}
                style={styles.background}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoidingView}
                >
                    <ScrollView
                        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 32, paddingBottom: insets.bottom }]}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* El resto del JSX (Vistas, TextInputs, etc.) permanece igual */}
                        {/* ... */}
                         <TouchableOpacity 
                             style={[styles.registerButton, isAuthLoading && styles.registerButtonDisabled]}
                             onPress={handleRegister}
                             disabled={isAuthLoading}
                         >
                             <Text style={styles.registerButtonText}>
                                 {isAuthLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                             </Text>
                         </TouchableOpacity>
                        {/* ... */}
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#F9FAFB',
    opacity: 0.8,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 32,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F3F4F6',
  },
  registerButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '600',
  },
  termsContainer: {
    marginTop: 16,
    paddingTop: 16,
  },
  termsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#2563EB',
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#F9FAFB',
    fontSize: 14,
  },
  loginLink: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
