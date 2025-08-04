// src/components/expenses/ExpenseCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gasto } from '@/config/config';
import { KompaColors, Shadows } from '@/constants/Styles';
import { formatCurrency, formatDate } from '@/utils/formatters';

const statusMap = {
    pending: { label: 'Pendiente', color: KompaColors.warning },
    approved: { label: 'Aprobado', color: KompaColors.primary },
    settled: { label: 'Pagado', color: KompaColors.success },
};

export const ExpenseCard = ({ expense, onEdit, onDelete }: { expense: Gasto, onEdit: () => void, onDelete: () => void }) => {
    const status = statusMap[expense.estado_pago] || { label: 'Desconocido', color: KompaColors.textSecondary };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>{expense.descripcion}</Text>
                <Text style={styles.amount}>{formatCurrency(expense.monto_total)}</Text>
            </View>
            <Text style={styles.groupName}>{expense.grupo?.nombre || 'Grupo desconocido'}</Text>
            
            <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={14} color={KompaColors.textSecondary} />
                    <Text style={styles.detailText}>{formatDate(expense.fecha)}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="person-outline" size={14} color={KompaColors.textSecondary} />
                    <Text style={styles.detailText}>Pagado por: {expense.pagado_por}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={[styles.statusBadge, { backgroundColor: `${status.color}20` }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                        <Ionicons name="pencil-outline" size={20} color={KompaColors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
                        <Ionicons name="trash-outline" size={20} color={KompaColors.error} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: KompaColors.textPrimary,
        flex: 1,
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: KompaColors.primary,
    },
    groupName: {
        fontSize: 12,
        color: KompaColors.textSecondary,
        marginBottom: 12,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        marginLeft: 4,
        fontSize: 12,
        color: KompaColors.textSecondary,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: KompaColors.gray100,
        paddingTop: 12,
    },
    statusBadge: {
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    actions: {
        flexDirection: 'row',
    },
    actionButton: {
        marginLeft: 16,
    },
});
