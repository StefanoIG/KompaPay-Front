import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useApi } from '@/hooks/useAPI';
import { KompaColors, Spacing, FontSizes, BorderRadius } from '@/constants/Styles';
import { useAuthContext } from '@/providers/AuthProvider';

export default function APITest() {
  const { request, loading, error } = useApi();
  const { login } = useAuthContext();
  const [result, setResult] = useState<any>(null);

  const testConnection = async () => {
    try {
      // Test basic connection to API with login endpoint
      const response = await request('/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@test.com',
          password: '123456'
        })
      });
      
      if (response) {
        setResult(response);
        Alert.alert('Respuesta recibida', 'El servidor respondió (puede ser error 401, lo cual es normal)');
      } else {
        Alert.alert('Sin respuesta', 'No se recibió respuesta de la API');
      }
    } catch (err: any) {
      console.error('API Test Error:', err);
      console.error('Error type:', typeof err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      setResult({ error: err.message, type: typeof err, fullError: err.toString() });
      Alert.alert('Error detallado', `Tipo: ${typeof err}\nMensaje: ${err.message}\nCompleto: ${err.toString()}`);
    }
  };

  const testRealLogin = async () => {
    try {
      console.log('Testing real login...');
      const user = await login({
        email: 'test@example.com',
        password: 'test123'
      });
      
      if (user) {
        setResult({ success: true, user });
        Alert.alert('Login exitoso', 'Usuario logueado correctamente');
      } else {
        setResult({ success: false, message: 'No user returned' });
        Alert.alert('Login fallido', 'No se recibió usuario');
      }
    } catch (err: any) {
      console.error('Real Login Error:', err);
      console.error('Error type:', typeof err);
      console.error('Error message:', err.message);
      console.error('Error constructor:', err.constructor.name);
      setResult({ 
        error: err.message, 
        type: typeof err, 
        constructor: err.constructor.name,
        fullError: err.toString() 
      });
      Alert.alert('Error de login real', `Tipo: ${err.constructor.name}\nMensaje: ${err.message}`);
    }
  };

  const testNetworkDirect = async () => {
    try {
      console.log('Testing direct fetch...');
      const response = await fetch('https://kompapay.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@test.com',
          password: '123456'
        })
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', response.headers);
      
      const text = await response.text();
      console.log('Response text:', text);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { rawResponse: text };
      }
      
      setResult({ 
        status: response.status, 
        ok: response.ok, 
        data: data,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      Alert.alert('Direct fetch result', `Status: ${response.status}\nOK: ${response.ok}`);
    } catch (err: any) {
      console.error('Direct fetch error:', err);
      setResult({ 
        networkError: true, 
        error: err.message, 
        type: typeof err,
        name: err.name,
        fullError: err.toString() 
      });
      Alert.alert('Network Error', `${err.name}: ${err.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diagnóstico de API</Text>
      <Text style={styles.subtitle}>URL: https://kompapay.onrender.com/api</Text>
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={testConnection}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Probando...' : 'Probar useApi Hook'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.buttonSecondary, loading && styles.buttonDisabled]} 
        onPress={testRealLogin}
        disabled={loading}
      >
        <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
          {loading ? 'Probando...' : 'Probar Login Real'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.buttonTertiary, loading && styles.buttonDisabled]} 
        onPress={testNetworkDirect}
        disabled={loading}
      >
        <Text style={[styles.buttonText, styles.buttonTextTertiary]}>
          {loading ? 'Probando...' : 'Fetch Directo'}
        </Text>
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error del Hook: {error}</Text>
        </View>
      )}

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Resultado:</Text>
          <Text style={styles.resultText}>{JSON.stringify(result, null, 2)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    backgroundColor: KompaColors.background,
    borderRadius: BorderRadius.lg,
    margin: Spacing.md,
    borderWidth: 1,
    borderColor: KompaColors.gray200,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: KompaColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: KompaColors.textSecondary,
    marginBottom: Spacing.lg,
  },
  button: {
    backgroundColor: KompaColors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: KompaColors.primary,
  },
  buttonTertiary: {
    backgroundColor: KompaColors.success,
    borderWidth: 0,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: KompaColors.primary,
  },
  buttonTextTertiary: {
    color: 'white',
  },
  errorContainer: {
    backgroundColor: KompaColors.error,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: 'white',
    fontSize: FontSizes.sm,
  },
  resultContainer: {
    backgroundColor: KompaColors.gray50,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    maxHeight: 200,
  },
  resultTitle: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: KompaColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  resultText: {
    fontSize: FontSizes.xs,
    color: KompaColors.textSecondary,
    fontFamily: 'monospace',
  },
});
