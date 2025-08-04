// src/components/boards/BoardColumn.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTareas } from '@/hooks/useTareas';
import { Tablero } from '@/config/config';
import { TaskCard } from './TaskCard';
import { KompaColors } from '@/constants/Styles';

export const BoardColumn = ({ tablero, groupId }: { tablero: Tablero, groupId: string }) => {
    // Usamos el hook para obtener las tareas de ESTE tablero
    const { tareas, loading } = useTareas(groupId, tablero.id);

    return (
        <View style={styles.column}>
            <View style={styles.header}>
                <Text style={styles.title}>{tablero.nombre}</Text>
                <TouchableOpacity>
                    <Ionicons name="add-circle-outline" size={24} color={KompaColors.primary} />
                </TouchableOpacity>
            </View>
            <ScrollView>
                {loading && tareas.length === 0 && <ActivityIndicator />}
                {tareas.map(tarea => <TaskCard key={tarea.id} tarea={tarea} />)}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    column: {
        width: 300,
        backgroundColor: KompaColors.gray100,
        borderRadius: 12,
        marginRight: 12,
        padding: 8,
        height: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 8,
        marginBottom: 8,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
    },
});