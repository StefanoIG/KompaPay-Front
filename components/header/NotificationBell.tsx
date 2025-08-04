// src/components/header/NotificationBell.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotifications } from '@/hooks/useNotifications';
import { KompaColors } from '@/constants/Styles';

export const NotificationBell = () => {
    const router = useRouter();
    const { notifications } = useNotifications();

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <TouchableOpacity onPress={() => router.push('/(tabs)/notifications')} style={styles.container}>
            <Ionicons name="notifications-outline" size={24} color={KompaColors.text} />
            {unreadCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 8,
    },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: KompaColors.error,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
});