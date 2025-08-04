// src/components/groups/GroupCard.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
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

export const GroupCard = ({ group, onPress, onShare }: { 
    group: Grupo, 
    onPress: () => void,
    onShare?: (group: Grupo) => void 
}) => {
    const [showMenu, setShowMenu] = useState(false);

    const handleShare = () => {
        setShowMenu(false);
        onShare?.(group);
    };

    const handleViewDetails = () => {
        setShowMenu(false);
        onPress();
    };

    return (
        <>
            <TouchableOpacity style={styles.card} onPress={onPress}>
                <View style={styles.header}>
                    <View style={styles.headerInfo}>
                        <Text style={styles.title}>{group.nombre}</Text>
                        <Text style={styles.description}>{group.descripcion}</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.menuButton}
                        onPress={() => setShowMenu(true)}
                    >
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

            {/* Menú contextual */}
            <Modal
                visible={showMenu}
                transparent
                animationType="fade"
                onRequestClose={() => setShowMenu(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    onPress={() => setShowMenu(false)}
                >
                    <View style={styles.menuContainer}>
                        <TouchableOpacity style={styles.menuItem} onPress={handleViewDetails}>
                            <Ionicons name="eye" size={20} color={KompaColors.textPrimary} />
                            <Text style={styles.menuText}>Ver detalles</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
                            <Ionicons name="share" size={20} color={KompaColors.primary} />
                            <Text style={styles.menuText}>Compartir código</Text>
                        </TouchableOpacity>
                        
                        <View style={styles.menuDivider} />
                        
                        <TouchableOpacity style={styles.menuItem}>
                            <Ionicons name="settings" size={20} color={KompaColors.textSecondary} />
                            <Text style={styles.menuText}>Configuración</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        paddingVertical: 8,
        marginHorizontal: 32,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    menuText: {
        fontSize: 16,
        color: KompaColors.textPrimary,
        marginLeft: 12,
    },
    menuDivider: {
        height: 1,
        backgroundColor: KompaColors.gray100,
        marginVertical: 4,
        marginHorizontal: 16,
    },
});