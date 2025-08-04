// src/components/notifications/NotificationCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '@/config/config';
import { KompaColors } from '@/constants/Styles';

const notificationIcons = {
    expense_added: { name: 'add-circle', color: KompaColors.success },
    expense_approved: { name: 'checkmark-circle', color: KompaColors.primary },
    group_invite: { name: 'person-add', color: '#A855F7' }, // Purple
    payment_reminder: { name: 'alert-circle', color: KompaColors.error },
    default: { name: 'notifications', color: KompaColors.textSecondary },
};

export const NotificationCard = ({ notification, onPress }: { notification: Notification, onPress: () => void }) => {
    const icon = notificationIcons[notification.type] || notificationIcons.default;

    return (
        <TouchableOpacity 
            style={[styles.card, !notification.isRead && styles.unreadCard]} 
            onPress={onPress}
        >
            <View style={[styles.iconContainer, { backgroundColor: `${icon.color}20` }]}>
                <Ionicons name={icon.name} size={24} color={icon.color} />
            </View>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.title, !notification.isRead && styles.unreadTitle]}>{notification.title}</Text>
                    <Text style={styles.timestamp}>2h ago</Text> 
                </View>
                <Text style={styles.message} numberOfLines={2}>{notification.message}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    unreadCard: {
        backgroundColor: KompaColors.primary + '10', // Light blue tint
        borderLeftWidth: 4,
        borderLeftColor: KompaColors.primary,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 15,
        fontWeight: '500',
        color: KompaColors.text,
    },
    unreadTitle: {
        fontWeight: 'bold',
    },
    timestamp: {
        fontSize: 12,
        color: KompaColors.textSecondary,
    },
    message: {
        fontSize: 14,
        color: KompaColors.textSecondary,
        lineHeight: 20,
    },
});