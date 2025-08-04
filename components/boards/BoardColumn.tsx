// src/components/boards/BoardColumn.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTareas } from '@/hooks/useTareas';
import { Tablero } from '@/config/config';
import { TaskCard } from './TaskCard';
import { AddTaskModal } from '@/components/modals/AddTaskModal';
import { KompaColors } from '@/constants/Styles';

export const BoardColumn = ({ tablero, groupId }: { tablero: Tablero, groupId: string }) => {
    // Usamos el hook para obtener las tareas de ESTE tablero
    const { tareas, loading } = useTareas(groupId, tablero.id);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);

    return (
        <View style={styles.column}>
            <View style={styles.header}>
                <Text style={styles.title}>{tablero.nombre}</Text>
                <View style={styles.headerActions}>
                    <Text style={styles.taskCount}>{tareas.length}</Text>
                    <TouchableOpacity onPress={() => setShowAddTaskModal(true)}>
                        <Ionicons name="add-circle-outline" size={24} color={KompaColors.primary} />
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {loading && tareas.length === 0 && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={KompaColors.primary} />
                    </View>
                )}
                {tareas.map(tarea => (
                    <TaskCard key={tarea.id} tarea={tarea} />
                ))}
                {tareas.length === 0 && !loading && (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="list-outline" size={32} color={KompaColors.gray200} />
                        <Text style={styles.emptyText}>Sin tareas</Text>
                        <TouchableOpacity 
                            style={styles.addFirstTaskButton}
                            onPress={() => setShowAddTaskModal(true)}
                        >
                            <Text style={styles.addFirstTaskText}>Agregar primera tarea</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
            
            <AddTaskModal
                visible={showAddTaskModal}
                onClose={() => setShowAddTaskModal(false)}
                groupId={groupId}
                tableroId={tablero.id}
            />
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
        maxHeight: 600,
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
        flex: 1,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    taskCount: {
        fontSize: 12,
        color: KompaColors.textSecondary,
        backgroundColor: KompaColors.gray200,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 20,
        textAlign: 'center',
    },
    scrollContainer: {
        flex: 1,
    },
    loadingContainer: {
        padding: 16,
        alignItems: 'center',
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
    },
    emptyText: {
        color: KompaColors.textSecondary,
        fontSize: 14,
        marginTop: 8,
        marginBottom: 12,
    },
    addFirstTaskButton: {
        backgroundColor: KompaColors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    addFirstTaskText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
    },
});