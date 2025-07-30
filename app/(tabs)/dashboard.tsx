// app/(tabs)/dashboard_refactored.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Platform, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// 1. Importar TODOS los hooks refactorizados
import { useAuthContext } from '@/providers/AuthProvider';
import { useGroups } from '@/hooks/useGroups';
import { useExpenses } from '@/hooks/useExpenses';
import { useDebts } from '@/hooks/useDebts'; // El hook que acabamos de crear

// 2. Importar estilos y utilidades
import { tabsStyles } from '@/styles/tabs.styles';
import { KompaColors } from '@/constants/Styles';
import { formatCurrency, formatDate } from '@/utils/formatters';

// --- Componente Principal del Dashboard ---

export default function DashboardRefactored() {
    // 3. Consumir los hooks de datos
    const { user, logout } = useAuthContext();
    const { groups, fetchGroups, createGroup } = useGroups();
    const { expenses, fetchMyExpenses } = useExpenses();
    const { summary, refetch: fetchMyDebts } = useDebts();
    
    // 4. El estado de la UI vive aquí, en el componente
    const [activeTab, setActiveTab] = useState<'overview' | 'groups' | 'expenses' | 'profile'>('overview');
    const [refreshing, setRefreshing] = useState(false);
    const [isCreateGroupModalVisible, setCreateGroupModalVisible] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    // 5. El manejador de refresh ahora llama a las funciones de cada hook
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            fetchGroups(),
            fetchMyExpenses(true),
            fetchMyDebts()
        ]);
        setRefreshing(false);
    }, [fetchGroups, fetchMyExpenses, fetchMyDebts]);

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) {
            Alert.alert('Error', 'El nombre del grupo no puede estar vacío.');
            return;
        }
        const newGroup = await createGroup({ nombre: newGroupName.trim() });
        if (newGroup) {
            setCreateGroupModalVisible(false);
            setNewGroupName('');
            Alert.alert('Éxito', '¡Grupo creado!');
        } else {
            Alert.alert('Error', 'No se pudo crear el grupo.');
        }
    };

    const handleLogout = () => {
        Alert.alert('Cerrar Sesión', '¿Estás seguro de que quieres salir?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Salir', style: 'destructive', onPress: logout },
        ]);
    };

    // Renderizado del contenido de cada pestaña
    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                     <View>
                        <LinearGradient colors={[KompaColors.primary, KompaColors.primaryDark]} style={tabsStyles.overviewCardGradient}>
                            <Text style={tabsStyles.overviewTitle}>Balance Total</Text>
                            <Text style={tabsStyles.overviewAmount}>{formatCurrency(summary?.balance ?? 0)}</Text>
                        </LinearGradient>
                        <View style={tabsStyles.statsGrid}>
                            <View style={tabsStyles.statItem}><Text style={tabsStyles.statValue}>{groups.length}</Text><Text style={tabsStyles.statLabel}>Grupos</Text></View>
                            <View style={tabsStyles.statItem}><Text style={tabsStyles.statValue}>{expenses.length}</Text><Text style={tabsStyles.statLabel}>Gastos</Text></View>
                            <View style={tabsStyles.statItem}><Text style={tabsStyles.statValue}>{formatCurrency(summary?.total_te_deben ?? 0)}</Text><Text style={tabsStyles.statLabel}>Te Deben</Text></View>
                        </View>
                    </View>
                );
            case 'groups':
                return (
                    <View style={tabsStyles.groupsList}>
                        {groups.map(group => (
                            <TouchableOpacity key={group.id} style={tabsStyles.groupCard}>
                                <Text style={tabsStyles.groupName}>{group.nombre}</Text>
                                <Text style={tabsStyles.groupMembers}>{group.miembros?.length || 0} miembros</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                );
            case 'expenses':
                 return (
                    <View>
                        {expenses.map(expense => (
                            <View key={expense.id} style={tabsStyles.expenseCard}>
                               <Text style={tabsStyles.expenseDescription}>{expense.descripcion}</Text>
                               <Text style={tabsStyles.expenseAmount}>{formatCurrency(expense.monto_total)}</Text>
                            </View>
                        ))}
                    </View>
                );
            case 'profile':
                return (
                     <View>
                        <View style={tabsStyles.profileHeader}>
                            <View style={tabsStyles.profileAvatar}><Ionicons name="person" size={40} color="white" /></View>
                            <Text style={tabsStyles.profileName}>{user?.name || 'Usuario'}</Text>
                            <Text style={tabsStyles.profileEmail}>{user?.email || 'No disponible'}</Text>
                        </View>
                        <TouchableOpacity style={tabsStyles.logoutButton} onPress={handleLogout}>
                            <LinearGradient colors={[KompaColors.error, '#DC2626']} style={tabsStyles.logoutButtonGradient}>
                                <Text style={tabsStyles.logoutButtonText}>Cerrar Sesión</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <View style={tabsStyles.dashboardContainer}>
            {/* ... Header y FAB ... */}
            <View style={tabsStyles.header}>
                <Text style={tabsStyles.headerTitle}>Hola, {user?.name?.split(' ')[0]}!</Text>
                <TouchableOpacity onPress={() => setCreateGroupModalVisible(true)}>
                    <Ionicons name="add-circle" size={32} color={KompaColors.primary} />
                </TouchableOpacity>
            </View>

            {/* Selector de Pestañas (si es necesario para móvil) */}
            {Platform.OS !== 'web' && (
                <View style={tabsStyles.tabContainer}>
                    {/* Botones para cambiar activeTab */}
                </View>
            )}

            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                {renderContent()}
            </ScrollView>

            {/* ... Modales ... */}
             <Modal visible={isCreateGroupModalVisible} transparent animationType="fade" onRequestClose={() => setCreateGroupModalVisible(false)}>
                <View style={tabsStyles.modalOverlay}>
                    <View style={tabsStyles.modalContent}>
                        <Text style={tabsStyles.modalTitle}>Crear Nuevo Grupo</Text>
                        <TextInput style={tabsStyles.input} placeholder="Nombre del grupo" value={newGroupName} onChangeText={setNewGroupName} />
                        <View style={tabsStyles.modalButtons}>
                            <TouchableOpacity style={tabsStyles.modalButtonSecondary} onPress={() => setCreateGroupModalVisible(false)}><Text>Cancelar</Text></TouchableOpacity>
                            <TouchableOpacity style={tabsStyles.modalButtonPrimary} onPress={handleCreateGroup}><Text style={{color: 'white'}}>Crear</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}