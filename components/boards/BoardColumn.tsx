// src/components/boards/BoardColumn.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTareas } from '@/hooks/useTareas';
import { Tablero, UpdateTableroRequest, Tarea, UpdateTareaRequest } from '@/config/config';
import { TaskCard } from './TaskCard';
import { AddTaskModal } from '@/components/modals/AddTaskModal';
import { EditTaskModal } from '@/components/modals/EditTaskModal';
import { EditBoardModal } from '@/components/modals/EditBoardModal';
import { KompaColors } from '@/constants/Styles';

interface BoardColumnProps {
    tablero: Tablero;
    groupId: string;
    onUpdateBoard?: (tableroId: string, updates: UpdateTableroRequest) => Promise<boolean>;
    onDeleteBoard?: (tableroId: string) => Promise<boolean>;
}

export const BoardColumn = ({ tablero, groupId, onUpdateBoard, onDeleteBoard }: BoardColumnProps) => {
    // Usamos el hook para obtener las tareas de ESTE tablero
    const { tareas, loading, updateTarea, deleteTarea } = useTareas(groupId, tablero.id);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [showEditTaskModal, setShowEditTaskModal] = useState(false);
    const [showEditBoardModal, setShowEditBoardModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Tarea | null>(null);
    const [showBoardActions, setShowBoardActions] = useState(false);

    const handleEditTask = (tarea: Tarea) => {
        setSelectedTask(tarea);
        setShowEditTaskModal(true);
    };

    const handleUpdateTask = async (updates: UpdateTareaRequest) => {
        if (!selectedTask) return false;
        const success = await updateTarea(selectedTask.id, updates);
        return !!success;
    };

    const handleDeleteTask = async (tareaId: string) => {
        const success = await deleteTarea(tareaId);
        return success;
    };

    const handleUpdateBoard = async (updates: UpdateTableroRequest) => {
        if (!onUpdateBoard) return false;
        return await onUpdateBoard(tablero.id, updates);
    };

    const handleDeleteBoard = () => {
        Alert.alert(
            'Eliminar Tablero',
            `¿Estás seguro de que quieres eliminar el tablero "${tablero.nombre}"? Todas las tareas se eliminarán también.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Eliminar', 
                    style: 'destructive',
                    onPress: () => onDeleteBoard?.(tablero.id)
                },
            ]
        );
    };

    return (
        <View style={[styles.column, tablero.color && { borderTopColor: tablero.color }]}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{tablero.nombre}</Text>
                    <View style={styles.counter}>
                        <Text style={styles.counterText}>{tareas.length}</Text>
                    </View>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => setShowAddTaskModal(true)}>
                        <Ionicons name="add-circle-outline" size={20} color={KompaColors.primary} />
                    </TouchableOpacity>
                    {(onUpdateBoard || onDeleteBoard) && (
                        <TouchableOpacity 
                            style={styles.menuButton}
                            onPress={() => setShowBoardActions(!showBoardActions)}
                        >
                            <Ionicons name="ellipsis-horizontal" size={18} color={KompaColors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {tablero.descripcion && (
                <Text style={styles.description}>{tablero.descripcion}</Text>
            )}

            {showBoardActions && (
                <View style={styles.actionsContainer}>
                    {onUpdateBoard && (
                        <TouchableOpacity style={styles.actionButton} onPress={() => setShowEditBoardModal(true)}>
                            <Ionicons name="pencil" size={16} color={KompaColors.primary} />
                            <Text style={styles.actionText}>Editar Tablero</Text>
                        </TouchableOpacity>
                    )}
                    {onDeleteBoard && (
                        <TouchableOpacity style={styles.actionButton} onPress={handleDeleteBoard}>
                            <Ionicons name="trash" size={16} color={KompaColors.error} />
                            <Text style={[styles.actionText, { color: KompaColors.error }]}>Eliminar</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {loading && tareas.length === 0 && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={KompaColors.primary} />
                    </View>
                )}
                {tareas.map(tarea => (
                    <TaskCard 
                        key={tarea.id} 
                        tarea={tarea}
                        onEdit={() => handleEditTask(tarea)}
                        onDelete={() => handleDeleteTask(tarea.id)}
                    />
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

            {selectedTask && (
                <EditTaskModal
                    visible={showEditTaskModal}
                    onClose={() => {
                        setShowEditTaskModal(false);
                        setSelectedTask(null);
                    }}
                    onSave={handleUpdateTask}
                    task={selectedTask}
                    groupId={groupId}
                />
            )}

            <EditBoardModal
                visible={showEditBoardModal}
                onClose={() => setShowEditBoardModal(false)}
                onSave={handleUpdateBoard}
                board={tablero}
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
        borderTopWidth: 4,
        borderTopColor: KompaColors.primary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 8,
        marginBottom: 8,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 8,
        color: KompaColors.textPrimary,
    },
    counter: {
        backgroundColor: KompaColors.gray200,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        minWidth: 24,
        alignItems: 'center',
    },
    counterText: {
        fontSize: 12,
        fontWeight: '600',
        color: KompaColors.textSecondary,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    menuButton: {
        padding: 4,
        marginLeft: 4,
    },
    description: {
        fontSize: 13,
        color: KompaColors.textSecondary,
        paddingHorizontal: 8,
        paddingBottom: 8,
    },
    actionsContainer: {
        backgroundColor: 'white',
        marginHorizontal: 8,
        marginBottom: 8,
        borderRadius: 8,
        padding: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    actionText: {
        marginLeft: 8,
        fontSize: 14,
        color: KompaColors.textSecondary,
        fontWeight: '500',
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