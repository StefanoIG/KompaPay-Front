// src/components/boards/TaskCard.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tarea } from '@/config/config'; // Importamos nuestro tipo Tarea
import { KompaColors, Shadows } from '@/constants/Styles';

const priorityMap = {
    critica: { icon: 'warning-outline', color: '#DC2626' }, // Rojo más intenso
    alta: { icon: 'alert-circle-outline', color: KompaColors.error },
    media: { icon: 'time-outline', color: KompaColors.warning },
    baja: { icon: 'checkmark-circle-outline', color: KompaColors.success },
};

interface TaskCardProps {
    tarea: Tarea;
    onEdit?: () => void;
    onDelete?: () => void;
    onMove?: () => void;
}

export const TaskCard = ({ tarea, onEdit, onDelete, onMove }: TaskCardProps) => {
    const [showActions, setShowActions] = useState(false);
    const priority = priorityMap[tarea.prioridad] || priorityMap.baja;

    const handleDelete = () => {
        Alert.alert(
            'Eliminar Tarea',
            '¿Estás seguro de que quieres eliminar esta tarea?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Eliminar', 
                    style: 'destructive',
                    onPress: onDelete 
                },
            ]
        );
    };

    return (
        <TouchableOpacity 
            style={[styles.card, Shadows.sm]} 
            onLongPress={() => setShowActions(!showActions)}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <Text style={styles.title}>{tarea.titulo}</Text>
                {(onEdit || onDelete || onMove) && (
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={() => setShowActions(!showActions)}
                    >
                        <Ionicons name="ellipsis-vertical" size={16} color={KompaColors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            {tarea.descripcion && (
                <Text style={styles.description} numberOfLines={2}>
                    {tarea.descripcion}
                </Text>
            )}

            <View style={styles.footer}>
                <View style={[styles.priority, { backgroundColor: `${priority.color}20` }]}>
                    <Ionicons name={priority.icon as any} color={priority.color} size={14} />
                    <Text style={[styles.priorityText, { color: priority.color }]}>{tarea.prioridad}</Text>
                </View>
                {tarea.fecha_vencimiento && (
                    <Text style={styles.dueDate}>{tarea.fecha_vencimiento}</Text>
                )}
                {tarea.asignado && (
                    <Text style={styles.assignee}>{tarea.asignado.name}</Text>
                )}
            </View>

            {showActions && (
                <View style={styles.actionsContainer}>
                    {onEdit && (
                        <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
                            <Ionicons name="pencil" size={16} color={KompaColors.primary} />
                            <Text style={styles.actionText}>Editar</Text>
                        </TouchableOpacity>
                    )}
                    {onMove && (
                        <TouchableOpacity style={styles.actionButton} onPress={onMove}>
                            <Ionicons name="swap-horizontal" size={16} color={KompaColors.warning} />
                            <Text style={styles.actionText}>Mover</Text>
                        </TouchableOpacity>
                    )}
                    {onDelete && (
                        <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
                            <Ionicons name="trash" size={16} color={KompaColors.error} />
                            <Text style={[styles.actionText, { color: KompaColors.error }]}>Eliminar</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    title: {
        fontWeight: '600',
        fontSize: 15,
        color: KompaColors.textPrimary,
        flex: 1,
    },
    menuButton: {
        padding: 4,
        marginLeft: 8,
    },
    description: {
        fontSize: 13,
        color: KompaColors.textSecondary,
        marginBottom: 8,
        lineHeight: 18,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priority: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 12,
    },
    priorityText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    dueDate: {
        fontSize: 12,
        color: KompaColors.textSecondary,
    },
    assignee: {
        fontSize: 12,
        color: KompaColors.primary,
        fontWeight: '500',
    },
    actionsContainer: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: KompaColors.gray100,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    actionText: {
        marginLeft: 4,
        fontSize: 12,
        color: KompaColors.textSecondary,
        fontWeight: '500',
    },
});