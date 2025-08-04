// src/hooks/useNotifications.ts
import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useAPI';
import { Notification } from '@/config/config'; // Asumiremos que este tipo existe en tu config

/**
 * Gestiona la obtención y el estado de las notificaciones del usuario.
 */
export const useNotifications = () => {
    const { request, loading, error } = useApi();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const fetchNotifications = useCallback(async () => {
        // Asumiendo un endpoint /notifications en tu API
        const data = await request<Notification[]>('/notifications');
        if (data) {
            setNotifications(data);
        }
    }, [request]);

    const markAsRead = useCallback(async (notificationId: string) => {
        // Lógica para marcar una notificación como leída en la API
        setNotifications(prev =>
            prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
        );
        await request(`/notifications/${notificationId}/read`, { method: 'POST' });
    }, [request]);

    const markAllAsRead = useCallback(async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        await request('/notifications/mark-all-read', { method: 'POST' });
    }, [request]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return { 
        notifications, 
        loading, 
        error, 
        refetch: fetchNotifications,
        markAsRead,
        markAllAsRead 
    };
};