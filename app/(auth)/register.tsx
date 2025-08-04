// app/(auth)/register.tsx

import React, { useState } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
// ✅ Importar sin Shadows
import { KompaColors, Spacing, FontSizes, BorderRadius } from '@/constants/Styles';

export default function RegisterScreen() {
    const { register, isLoading: isAuthLoading } = useAuthContext();
    const router = useRouter();
    const insets = useSafeAreaInsets();

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
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password
            });

            if (user) {
                router.replace('/(tabs)/dashboard');
            } else {
                Alert.alert('Error de Registro', 'No se pudo crear la cuenta. Por favor, intenta de nuevo.');
            }

        } catch (error: any) {
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
                colors={[KompaColors.primary, KompaColors.secondary]}
                style={styles.background}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoidingView}
                >
                    <ScrollView
                        contentContainerStyle={[
                            styles.scrollContent, 
                            { 
                                paddingTop: insets.top + Spacing.xl, 
                                paddingBottom: insets.bottom 
                            }
                        ]}
                        showsVerticalScrollIndicator={false}
                    >
                        <Animated.View 
                            entering={FadeInUp.delay(200).springify()}
                            style={styles.logoContainer}
                        >
                            <View style={styles.logoIcon}>
                                <Ionicons name="wallet" size={32} color="white" />
                            </View>
                            <Text style={styles.logo}>KompaPay</Text>
                            <Text style={styles.subtitle}>Únete a la comunidad financiera</Text>
                        </Animated.View>

                        <Animated.View 
                            entering={FadeInDown.delay(400).springify()}
                            style={styles.formContainer}
                        >
                            <Text style={styles.formTitle}>Crear Cuenta</Text>
                            <Text style={styles.formDescription}>
                                Completa los siguientes datos para comenzar
                            </Text>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Nombre completo</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Tu nombre completo"
                                    placeholderTextColor={KompaColors.gray400}
                                    value={formData.name}
                                    onChangeText={(value) => updateFormData('name', value)}
                                    autoCapitalize="words"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Correo electrónico</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="tu@email.com"
                                    placeholderTextColor={KompaColors.gray400}
                                    value={formData.email}
                                    onChangeText={(value) => updateFormData('email', value)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Contraseña</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Mínimo 6 caracteres"
                                    placeholderTextColor={KompaColors.gray400}
                                    value={formData.password}
                                    onChangeText={(value) => updateFormData('password', value)}
                                    secureTextEntry
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Confirmar contraseña</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Repite tu contraseña"
                                    placeholderTextColor={KompaColors.gray400}
                                    value={formData.confirmPassword}
                                    onChangeText={(value) => updateFormData('confirmPassword', value)}
                                    secureTextEntry
                                />
                            </View>

                            <TouchableOpacity 
                                style={[styles.registerButton, isAuthLoading && styles.registerButtonDisabled]}
                                onPress={handleRegister}
                                disabled={isAuthLoading}
                            >
                                {isAuthLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.registerButtonText}>Crear Cuenta</Text>
                                )}
                            </TouchableOpacity>

                            <View style={styles.termsContainer}>
                                <Text style={styles.termsText}>
                                    Al crear una cuenta, aceptas nuestros{' '}
                                    <Text style={styles.termsLink}>Términos de Servicio</Text>
                                    {' '}y{' '}
                                    <Text style={styles.termsLink}>Política de Privacidad</Text>
                                </Text>
                            </View>
                        </Animated.View>

                        <Animated.View 
                            entering={FadeInDown.delay(600).springify()}
                            style={styles.loginContainer}
                        >
                            <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
                            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                                <Text style={styles.loginLink}>Inicia Sesión</Text>
                            </TouchableOpacity>
                        </Animated.View>
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
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.xl,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xxxl,
    },
    logoIcon: {
        width: 64,
        height: 64,
        borderRadius: BorderRadius.full,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    logo: {
        fontSize: FontSizes.xxxl,
        fontWeight: 'bold',
        color: KompaColors.background,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: FontSizes.md,
        color: KompaColors.background,
        opacity: 0.9,
        textAlign: 'center',
    },
    formContainer: {
        backgroundColor: KompaColors.background,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        marginBottom: Spacing.xl,
        // Sombra sutil con borde en lugar de shadow
        borderWidth: 1,
        borderColor: KompaColors.gray100,
    },
    formTitle: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: KompaColors.textPrimary,
        textAlign: 'center',
        marginBottom: Spacing.xs,
    },
    formDescription: {
        fontSize: FontSizes.sm,
        color: KompaColors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    inputContainer: {
        marginBottom: Spacing.lg,
    },
    inputLabel: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: KompaColors.textPrimary,
        marginBottom: Spacing.sm,
    },
    input: {
        borderWidth: 1,
        borderColor: KompaColors.gray200,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        fontSize: FontSizes.md,
        color: KompaColors.textPrimary,
        backgroundColor: KompaColors.gray50,
        minHeight: 50,
    },
    registerButton: {
        backgroundColor: KompaColors.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.md,
        minHeight: 50,
        justifyContent: 'center',
    },
    registerButtonDisabled: {
        opacity: 0.7,
    },
    registerButtonText: {
        color: KompaColors.background,
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
    termsContainer: {
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
    },
    termsText: {
        fontSize: FontSizes.xs,
        color: KompaColors.textSecondary,
        textAlign: 'center',
        lineHeight: 18,
    },
    termsLink: {
        color: KompaColors.primary,
        fontWeight: '600',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        color: KompaColors.background,
        fontSize: FontSizes.sm,
        opacity: 0.9,
    },
    loginLink: {
        color: KompaColors.background,
        fontSize: FontSizes.sm,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});