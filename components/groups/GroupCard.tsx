// src/components/groups/GroupCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Grupo } from '@/config/config';
import { KompaColors, Shadows } from '@/constants/Styles';
import { formatCurrency } from '@/utils/formatters';

// Componente para mostrar los avatares de los miembros
const MemberAvatars = ({ members }: { members: any[] }) => (
    <View style={styles.avatarContainer}>
        {members.slice(0, 4).map((member: any, index: number) => (
            <View key={member.id || index} style={[styles.avatar, { marginLeft: index > 0 ? -10 : 0 }]}>
                <Text style={styles.avatarFallback}>{member.name?.charAt(0) || 'M'}</Text>
            </View>
        ))}
        {members.length > 4 && (
            <View style={[styles.avatar, styles.avatarMore, { marginLeft: -10 }]}>
                <Text style={styles.avatarFallback}>+{members.length - 4}</Text>
            </View>
        )}
    </View>
);

export const GroupCard = ({ group, onPress }: { group: Grupo, onPress: () => void }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.header}>
                <View style={styles.headerInfo}>
                    <Text style={styles.title}>{group.nombre}</Text>
                    <Text style={styles.description}>{group.descripcion}</Text>
                </View>
                <TouchableOpacity style={styles.menuButton}>
                    <Ionicons name="ellipsis-horizontal" size={24} color={KompaColors.textSecondary} />
                </TouchableOpacity>
            </View>
            
            <View style={styles.membersSection}>
                <Text style={styles.sectionTitle}>Miembros</Text>
                <MemberAvatars members={group.miembros || []} />
            </View>

            <View style={styles.footer}>
                <View style={styles.balanceInfo}>
                    <Text style={styles.balanceLabel}>Tu Balance</Text>
                    <Text style={styles.balanceValue}>$0.00</Text> 
                </View>
                <View style={[styles.statusBadge, { backgroundColor: '#D1FAE5' }]}>
                    <Text style={[styles.statusText, { color: '#065F46' }]}>Activo</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    headerInfo: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: KompaColors.textPrimary,
    },
    description: {
        fontSize: 14,
        color: KompaColors.textSecondary,
        marginTop: 4,
    },
    menuButton: {
        padding: 4,
    },
    membersSection: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '500',
        color: KompaColors.textSecondary,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    avatarContainer: {
        flexDirection: 'row',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: KompaColors.gray100,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    avatarFallback: {
        color: KompaColors.textSecondary,
        fontWeight: 'bold',
        fontSize: 12,
    },
    avatarMore: {
        backgroundColor: KompaColors.gray200,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: KompaColors.gray100,
        paddingTop: 12,
    },
    balanceInfo: {},
    balanceLabel: {
        fontSize: 12,
        color: KompaColors.textSecondary,
    },
    balanceValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: KompaColors.success, // o KompaColors.error si es negativo
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
});