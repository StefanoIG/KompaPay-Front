// app/colaboracion/nota_detalle.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNotaDetails } from '@/hooks/useNotaDetails'; // 1. Importar el nuevo hook

export default function NotaDetalleScreen() {
    const router = useRouter();
    // 2. Obtener groupId y notaId de los parámetros de la ruta
    const { notaId, groupId } = useLocalSearchParams<{ notaId: string; groupId: string }>();
    
    // 3. Usar el hook especializado
    const { nota, loading, error, updateNota, refetch } = useNotaDetails(groupId, notaId);

    // 4. Estado local solo para el contenido del editor
    const [contenido, setContenido] = useState('');
    const [haCambiado, setHaCambiado] = useState(false);

    // Sincronizar el estado local cuando la nota se carga o actualiza desde el servidor
    useEffect(() => {
        if (nota) {
            setContenido(nota.contenido);
        }
    }, [nota]);

    const handleGuardar = async () => {
        if (!haCambiado) return;

        const updatedNota = await updateNota({ contenido });
        if (updatedNota) {
            Alert.alert('Éxito', 'Nota guardada correctamente.');
            setHaCambiado(false);
        } else {
            Alert.alert('Error', 'No se pudo guardar la nota.');
        }
    };

    if (loading && !nota) {
        return <ActivityIndicator size="large" style={styles.centered} />;
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text>Error al cargar la nota.</Text>
                <Button title="Reintentar" onPress={refetch} />
            </View>
        );
    }
    
    if (!nota) {
        return <Text style={styles.centered}>Nota no encontrada.</Text>;
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#222" />
                </TouchableOpacity>
                <Text style={styles.titulo}>{nota.titulo}</Text>
                <TouchableOpacity onPress={handleGuardar} disabled={!haCambiado || loading}>
                    <Ionicons name="save" size={24} color={haCambiado ? '#2563eb' : '#aaa'} />
                </TouchableOpacity>
            </View>
            <TextInput
                style={styles.textarea}
                multiline
                value={contenido}
                onChangeText={text => {
                    setContenido(text);
                    setHaCambiado(true);
                }}
                placeholder="Escribe tu nota..."
                textAlignVertical="top"
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#f9fafb' },
    titulo: { flex: 1, fontWeight: 'bold', fontSize: 18, marginLeft: 12 },
    textarea: { flex: 1, fontSize: 16, padding: 16, backgroundColor: '#fff', color: '#222' },
});