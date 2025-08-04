// app/(tabs)/notifications.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { KompaColors } from '@/constants/Styles';

export default function NotificationsScreen() {
    const router = useRouter();
    const { notifications, loading, markAsRead, markAllAsRead, refetch } = useNotifications();
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const filteredNotifications = filter === 'unread' 
        ? notifications.filter(n => !n.isRead) 
        : notifications;

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleNotificationPress = (notification: any) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        // Navegar a la pantalla correspondiente, ej:
        // router.push(notification.actionUrl);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notificaciones</Text>
                {unreadCount > 0 && (
                    <TouchableOpacity onPress={markAllAsRead}>
                        <Text style={styles.markAllRead}>Marcar todas como leídas</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.filterContainer}>
                <TouchableOpacity onPress={() => setFilter('all')} style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}>
                    <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Todas</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFilter('unread')} style={[styles.filterButton, filter === 'unread' && styles.filterButtonActive]}>
                    <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>No leídas</Text>
                    {unreadCount > 0 && <View style={styles.unreadBadge}><Text style={styles.unreadBadgeText}>{unreadCount}</Text></View>}
                </TouchableOpacity>
            </View>

            {loading && notifications.length === 0 ? (
                <ActivityIndicator size="large" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={filteredNotifications}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <NotificationCard notification={item} onPress={() => handleNotificationPress(item)} />
                    )}
                    onRefresh={refetch}
                    refreshing={loading}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Estás al día.</Text>
                            <Text style={styles.emptySubtext}>No tienes notificaciones {filter === 'unread' ? 'no leídas' : 'nuevas'}.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: KompaColors.background },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerTitle: { fontSize: 28, fontWeight: 'bold' },
    markAllRead: { color: KompaColors.primary, fontWeight: '500' },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: KompaColors.gray100,
    },
    filterButton: {
        paddingVertical: 12,
        marginRight: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterButtonActive: { borderBottomWidth: 2, borderBottomColor: KompaColors.primary },
    filterText: { fontSize: 16, color: KompaColors.textSecondary },
    filterTextActive: { color: KompaColors.primary, fontWeight: 'bold' },
    unreadBadge: {
        backgroundColor: KompaColors.primary,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        paddingHorizontal: 6,
    },
    unreadBadgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    listContent: { paddingHorizontal: 16 },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: { fontSize: 18, fontWeight: '600', color: KompaColors.textPrimary },
    emptySubtext: { color: KompaColors.textSecondary, marginTop: 8 },
});