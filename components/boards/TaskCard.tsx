// src/components/boards/TaskCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tarea } from '@/config/config'; // Importamos nuestro tipo Tarea
import { KompaColors, Shadows } from '@/constants/Styles';

const priorityMap = {
    alta: { icon: 'alert-circle-outline', color: KompaColors.error },
    media: { icon: 'time-outline', color: KompaColors.warning },
    baja: { icon: 'checkmark-circle-outline', color: KompaColors.success },
};

export const TaskCard = ({ tarea }: { tarea: Tarea }) => {
    const priority = priorityMap[tarea.prioridad] || priorityMap.baja;

    return (
        <TouchableOpacity style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>{tarea.titulo}</Text>
            </View>
            <View style={styles.footer}>
                <View style={[styles.priority, { backgroundColor: `${priority.color}20` }]}>
                    <Ionicons name={priority.icon as any} color={priority.color} size={14} />
                    <Text style={[styles.priorityText, { color: priority.color }]}>{tarea.prioridad}</Text>
                </View>
                {tarea.fecha_vencimiento && (
                    <Text style={styles.dueDate}>{tarea.fecha_vencimiento}</Text>
                )}
            </View>
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
        marginBottom: 8,
    },
    title: {
        fontWeight: '600',
        fontSize: 15,
        color: KompaColors.textPrimary,
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
});