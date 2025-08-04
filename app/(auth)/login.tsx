// app/(auth)/login_new.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Importar desde el archivo de estilos correcto
import { KompaColors, Spacing, FontSizes, BorderRadius } from '@/constants/Styles';
import { useAuthContext } from '@/providers/AuthProvider';

export default function LoginScreen() {
    const { login, isLoading } = useAuthContext();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Campos incompletos', 'Por favor, introduce tu correo y contraseña.');
            return;
        }
        
        try {
            await login({ email: email.trim(), password });
            // Si el login es exitoso, el AuthProvider en _layout.tsx
            // se encargará de la redirección al dashboard automáticamente.
        } catch (error: any) {
            Alert.alert('Error de Inicio de Sesión', error.message || 'El correo o la contraseña son incorrectos.');
        }
    };

    return (
        <LinearGradient
            colors={['#E0E7FF', '#C7D2FE', '#A5B4FC']}
            style={styles.container}
        >
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <View style={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="wallet" size={32} color="white" />
                        </View>
                        <Text style={styles.title}>KompaPay</Text>
                        <Text style={styles.subtitle}>Colaboración financiera simplificada</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Bienvenido de vuelta</Text>
                        <Text style={styles.cardDescription}>Ingresa tus credenciales para acceder a tu cuenta</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="tu@email.com"
                                placeholderTextColor="#9CA3AF"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Contraseña</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[styles.input, styles.passwordInput]}
                                    placeholder="••••••••"
                                    placeholderTextColor="#9CA3AF"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#6B7280" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity onPress={handleLogin} style={[styles.button, isLoading && styles.buttonDisabled]} disabled={isLoading}>
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.buttonText}>Iniciar Sesión</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                            <Text style={styles.linkText}>Regístrate</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    logoContainer: {
        width: 64,
        height: 64,
        borderRadius: BorderRadius.full,
        backgroundColor: KompaColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: FontSizes.xxxl,
        fontWeight: 'bold',
        color: KompaColors.textPrimary,
    },
    subtitle: {
        fontSize: FontSizes.md,
        color: KompaColors.textSecondary,
        marginTop: Spacing.xs,
        textAlign: 'center',
    },
    card: {
        width: '100%',
        maxWidth: 400, // Límite para pantallas grandes
        backgroundColor: KompaColors.background,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        // Sombra sutil usando border en lugar de shadow
        borderWidth: 1,
        borderColor: KompaColors.gray200,
    },
    cardTitle: {
        fontSize: FontSizes.xl,
        fontWeight: '600',
        marginBottom: Spacing.xs,
        color: KompaColors.textPrimary,
    },
    cardDescription: {
        fontSize: FontSizes.sm,
        color: KompaColors.textSecondary,
        marginBottom: Spacing.lg,
    },
    inputGroup: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: FontSizes.sm,
        fontWeight: '500',
        color: KompaColors.textPrimary,
        marginBottom: Spacing.sm,
    },
    input: {
        height: 50,
        backgroundColor: KompaColors.gray50,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        fontSize: FontSizes.md,
        borderWidth: 1,
        borderColor: KompaColors.gray200,
        color: KompaColors.textPrimary,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    passwordInput: {
        flex: 1,
        paddingRight: 50, // Espacio para el ícono del ojo
    },
    eyeIcon: {
        position: 'absolute',
        right: Spacing.md,
        padding: Spacing.xs,
    },
    button: {
        height: 50,
        backgroundColor: KompaColors.primary,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: KompaColors.background,
        fontSize: FontSizes.md,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        marginTop: Spacing.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: KompaColors.textSecondary,
        fontSize: FontSizes.sm,
    },
    linkText: {
        color: KompaColors.primary,
        fontWeight: 'bold',
        fontSize: FontSizes.sm,
    },
});