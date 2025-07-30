// src/components/colaboracion/TableroColumn.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTareas } from '@/hooks/useTareas';
import { Tablero, Tarea } from '@/config/config';
import { useRouter } from 'expo-router';

// Componente para una sola tarjeta de tarea
const TareaCard = ({ tarea }: { tarea: Tarea }) => {
    const router = useRouter();
    return (
        <TouchableOpacity 
            style={styles.tareaCard} 
            onPress={() => router.push(`/colaboracion/tarea_detalle/${tarea.id}`)} // Navegar al detalle de la tarea
        >
            <Text style={styles.tareaTitulo}>{tarea.titulo}</Text>
            <Text style={styles.tareaEstado}>{tarea.estado}</Text>
        </TouchableOpacity>
    );
};

// Componente para una columna completa del tablero
export const TableroColumn = ({ tablero, groupId }: { tablero: Tablero, groupId: string }) => {
    // Este hook obtiene solo las tareas para ESTE tablero específico.
    const { tareas, loading, createTarea } = useTareas(groupId, tablero.id);

    const handleNuevaTarea = () => {
        // Lógica para abrir un modal y crear una nueva tarea
        // createTarea({ titulo: 'Nueva Tarea' });
    };

    return (
        <View style={styles.tablero}>
            <View style={styles.tableroHeader}>
                <Text style={styles.tableroTitulo}>{tablero.nombre}</Text>
                <TouchableOpacity onPress={handleNuevaTarea}>
                    <Ionicons name="add-circle" size={22} color="#2563eb" />
                </TouchableOpacity>
            </View>
            {loading && tareas.length === 0 
                ? <ActivityIndicator /> 
                : tareas.length > 0 
                    ? tareas.map(tarea => <TareaCard key={tarea.id} tarea={tarea} />)
                    : <Text style={styles.empty}>Sin tareas</Text>
            }
        </View>
    );
};

// Estilos para este componente
const styles = StyleSheet.create({
    tablero: { backgroundColor: '#fff', borderRadius: 10, marginRight: 18, padding: 12, width: 280, alignSelf: 'flex-start' },
    tableroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    tableroTitulo: { fontWeight: 'bold', fontSize: 17 },
    tareaCard: { backgroundColor: '#f0f3ff', borderRadius: 8, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e0e7ff' },
    tareaTitulo: { fontSize: 15, fontWeight: '500' },
    tareaEstado: { fontSize: 12, color: '#555', marginTop: 4, textTransform: 'capitalize' },
    empty: { color: '#aaa', fontStyle: 'italic', textAlign: 'center', marginVertical: 8 },
});