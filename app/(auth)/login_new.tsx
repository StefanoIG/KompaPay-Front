import { useAuth } from '@/hooks/useAuth';
import { useAuthValidation } from '@/hooks/useValidation';
import { authStyles } from '@/styles/auth.styles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

interface LoginScreenProps {
  onAuthSuccess?: () => void;
}

export default function LoginScreen({ onAuthSuccess }: LoginScreenProps = {}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const router = useRouter();
  const { login, isAuthenticated, error } = useAuth();
  const { validateLoginForm, showValidationAlert } = useAuthValidation();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      if (onAuthSuccess) {
        onAuthSuccess();
      } else if (Platform.OS !== 'web') {
        router.replace('/(tabs)/dashboard');
      }
    }
  }, [isAuthenticated, onAuthSuccess]);

  // Mostrar errores de autenticación
  useEffect(() => {
    if (error) {
      Alert.alert('Error de Autenticación', error);
      setIsLoading(false);
    }
  }, [error]);

  const handleLogin = async () => {
    const validationError = validateLoginForm(email, password);
    if (validationError) {
      showValidationAlert(validationError);
      return;
    }

    setIsLoading(true);
    
    try {
      await login({ email: email.trim(), password });
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Error de Autenticación', 
        error.message || 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRegister = () => {
    router.push('/(auth)/register');
  };

  return (
    <View style={authStyles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#2563EB', '#1D4ED8', '#1E40AF']}
        style={authStyles.gradient}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ width: '100%', alignItems: 'center' }}
        >
          <Animated.View 
            entering={FadeInUp.delay(200).duration(1000)} 
            style={authStyles.loginContainer}
          >
            {/* Welcome Section */}
            <View style={authStyles.welcomeContainer}>
              <Text style={authStyles.logo}>KompaPay</Text>
              <Text style={authStyles.welcomeText}>¡Bienvenido de vuelta!</Text>
              <Text style={authStyles.subtitleText}>
                Inicia sesión para continuar gestionando tus gastos compartidos
              </Text>
            </View>

            {/* Form Section */}
            <Animated.View 
              entering={FadeInDown.delay(400).duration(1000)} 
              style={authStyles.formContainer}
            >
              <View style={authStyles.inputContainer}>
                <Text style={authStyles.inputLabel}>Email</Text>
                <TextInput
                  style={[
                    authStyles.input,
                    focusedField === 'email' && authStyles.inputFocused
                  ]}
                  placeholder="tu@email.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={authStyles.inputContainer}>
                <Text style={authStyles.inputLabel}>Contraseña</Text>
                <TextInput
                  style={[
                    authStyles.input,
                    focusedField === 'password' && authStyles.inputFocused
                  ]}
                  placeholder="Tu contraseña"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </Animated.View>

            {/* Button Section */}
            <Animated.View 
              entering={FadeInDown.delay(600).duration(1000)} 
              style={authStyles.buttonContainer}
            >
              <TouchableOpacity 
                style={[authStyles.button, isLoading && authStyles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#2563EB', '#1D4ED8']}
                  style={authStyles.buttonGradient}
                >
                  <Text style={authStyles.buttonText}>
                    {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </Text>
                  {!isLoading && <Ionicons name="arrow-forward" size={20} color="white" />}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Footer Section */}
            <Animated.View 
              entering={FadeInDown.delay(800).duration(1000)} 
              style={authStyles.footerContainer}
            >
              <Text style={authStyles.footerText}>¿No tienes una cuenta?</Text>
              <TouchableOpacity style={authStyles.linkButton} onPress={navigateToRegister}>
                <Text style={authStyles.linkText}>Regístrate aquí</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}
