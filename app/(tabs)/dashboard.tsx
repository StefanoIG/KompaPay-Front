// app/(tabs)/dashboard.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 1. Importar nuestros hooks de datos reales
import { useDebts } from '@/hooks/useDebts';
import { useExpenses } from '@/hooks/useExpenses';
import { useGroups } from '@/hooks/useGroups';
import { useAuthContext } from '@/providers/AuthProvider';

// 2. Importar constantes y utilidades (SIN Shadows)
import { Grupo } from '@/config/config';
import { BorderRadius, FontSizes, KompaColors, Spacing } from '@/constants/Styles';
import { formatCurrency } from '@/utils/formatters';

// Types for component props
interface BalanceSummary {
    balance?: number;
    total_deudas?: number;
    total_acreencias?: number;
}

interface SummaryCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    value: string | number;
    description: string;
}

interface RecentGroupsProps {
    groups: Grupo[];
    router: any;
}

// --- Sub-Componentes para un código más limpio ---

const BalanceCard = ({ summary }: { summary: BalanceSummary }) => (
    <LinearGradient
        colors={[KompaColors.primary, KompaColors.primaryDark]}
        style={styles.balanceCard}
    >
        <View style={styles.balanceHeader}>
            <Text style={styles.balanceTitle}>Tu Balance</Text>
        </View>
        <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
                <View style={styles.balanceItemHeader}>
                    <Ionicons name="trending-up" size={16} color="#A7F3D0" />
                    <Text style={styles.balanceItemLabel}>Te deben</Text>
                </View>
                <Text style={styles.balanceAmount}>{formatCurrency(summary?.total_acreencias ?? 0)}</Text>
            </View>
            <View style={styles.balanceItem}>
                <View style={styles.balanceItemHeader}>
                    <Ionicons name="trending-down" size={16} color="#FECDD3" />
                    <Text style={styles.balanceItemLabel}>Debes</Text>
                </View>
                <Text style={styles.balanceAmount}>{formatCurrency(summary?.total_deudas ?? 0)}</Text>
            </View>
        </View>
        <View style={styles.netBalanceContainer}>
            <Text style={styles.balanceItemLabel}>Balance Neto</Text>
            <Text style={[styles.balanceAmount, { fontSize: FontSizes.lg }]}>{formatCurrency(summary?.balance ?? 0)}</Text>
        </View>
    </LinearGradient>
);

const SummaryCard = ({ icon, title, value, description }: SummaryCardProps) => (
    <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>{title}</Text>
            <Ionicons name={icon} size={16} color={KompaColors.textSecondary} />
        </View>
        <Text style={styles.summaryValue}>{value}</Text>
        <Text style={styles.summaryDescription}>{description}</Text>
    </View>
);

const RecentGroups = ({ groups, router }: RecentGroupsProps) => (
    <View style={styles.card}>
        <Text style={styles.cardTitle}>Grupos Recientes</Text>
        {groups && groups.length > 0 ? groups.slice(0, 3).map((group: Grupo) => (
            <TouchableOpacity key={group.id} style={styles.groupItem} onPress={() => router.push(`/boards?groupId=${group.id}`)}>
                <View style={styles.groupIcon}>
                    <Ionicons name="people-circle" size={24} color={KompaColors.primary} />
                </View>
                <View style={styles.groupItemInfo}>
                    <Text style={styles.groupItemName}>{group.nombre || 'Sin nombre'}</Text>
                    <Text style={styles.groupItemMembers}>{group.miembros?.length || 0} miembros</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={KompaColors.textSecondary} />
            </TouchableOpacity>
        )) : (
            <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color={KompaColors.gray300} />
                <Text style={styles.emptyText}>No hay grupos disponibles</Text>
                <Text style={styles.emptySubtext}>Crea tu primer grupo para comenzar</Text>
            </View>
        )}
    </View>
);

// --- Componente Principal del Dashboard ---

export default function DashboardScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    
    // 3. Consumir los hooks para obtener datos reales
    const { user, logout } = useAuthContext();
    const { groups, fetchGroups, loading: groupsLoading } = useGroups();
    const { expenses, fetchMyExpenses, createExpense, loading: expensesLoading } = useExpenses();
    const { summary, refetch: fetchMyDebts, loading: debtsLoading } = useDebts();
    
    // 4. Estado local de la UI
    const [refreshing, setRefreshing] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);
    const [expenseDescription, setExpenseDescription] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([fetchGroups(), fetchMyExpenses(true), fetchMyDebts()]);
        setRefreshing(false);
    }, [fetchGroups, fetchMyExpenses, fetchMyDebts]);

    const handleCreateExpense = async () => {
        if (!expenseDescription.trim() || !expenseAmount.trim() || !selectedGroupId || !user) {
            Alert.alert('Error', 'Completa todos los campos, incluyendo un grupo.');
            return;
        }
        
        const success = await createExpense({
            id: `${Date.now()}_${Math.random()}`, // ID temporal para offline
            grupo_id: selectedGroupId,
            descripcion: expenseDescription,
            monto_total: parseFloat(expenseAmount),
            pagado_por: user.id,
            id_publico: `gasto_${Date.now()}`,
            participantes: [{ id_usuario: user.id, monto_proporcional: parseFloat(expenseAmount) }],
            ultima_modificacion: new Date().toISOString(),
            modificado_por: user.id
        });

        if (success) {
            Alert.alert('Éxito', 'Gasto creado correctamente');
            setModalVisible(false);
            setExpenseDescription('');
            setExpenseAmount('');
            setSelectedGroupId(null);
            onRefresh(); // Refrescar los datos
        } else {
            Alert.alert('Error', 'No se pudo crear el gasto');
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que quieres cerrar sesión?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Cerrar Sesión',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                            // El AuthProvider se encargará de la redirección automática
                        } catch (error) {
                            console.error('Error durante logout:', error);
                            Alert.alert('Error', 'No se pudo cerrar la sesión correctamente');
                        }
                    }
                }
            ]
        );
    };
    
    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={{ 
                    paddingTop: insets.top + Spacing.md, 
                    paddingBottom: 100 
                }}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh} 
                        tintColor={KompaColors.primary}
                    />
                }
            >
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerText}>
                            <Text style={styles.headerTitle}>
                                Hola, {user?.name?.split(' ')[0] || 'Usuario'}!
                            </Text>
                            <Text style={styles.headerSubtitle}>
                                Aquí tienes un resumen de tus finanzas
                            </Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.logoutButton}
                            onPress={handleLogout}
                        >
                            <Ionicons name="log-out-outline" size={24} color={KompaColors.error} />
                        </TouchableOpacity>
                    </View>
                </View>

                {debtsLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={KompaColors.primary} />
                        <Text style={styles.loadingText}>Cargando balance...</Text>
                    </View>
                ) : summary && <BalanceCard summary={summary} />}

                <View style={styles.summaryGrid}>
                    <SummaryCard 
                        icon="people" 
                        title="Grupos Activos" 
                        value={groups.length} 
                        description="+2 este mes" 
                    />
                    <SummaryCard 
                        icon="card" 
                        title="Gastos del Mes" 
                        value={formatCurrency(2140.75)} 
                        description="+12% vs mes anterior" 
                    />
                    <SummaryCard 
                        icon="calendar" 
                        title="Pagos Pendientes" 
                        value={3} 
                        description="2 vencen esta semana" 
                    />
                </View>

                <RecentGroups groups={groups} router={router} />
                
                {/* Botones de acciones rápidas */}
                <View style={styles.quickActionsContainer}>
                    <TouchableOpacity 
                        style={styles.quickActionButton}
                        onPress={() => router.push('/(tabs)/groups')}
                    >
                        <Ionicons name="people-outline" size={24} color={KompaColors.primary} />
                        <Text style={styles.quickActionText}>Ver Grupos</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.quickActionButton}
                        onPress={() => router.push('/(tabs)/expenses')}
                    >
                        <Ionicons name="receipt-outline" size={24} color={KompaColors.primary} />
                        <Text style={styles.quickActionText}>Mis Gastos</Text>
                    </TouchableOpacity>

                   
                </View>
            </ScrollView>

            {/* FAB sin sombra problemática */}
            <TouchableOpacity 
                style={styles.fab} 
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>

            {/* Modal mejorado */}
            <Modal 
                visible={isModalVisible} 
                transparent 
                animationType="fade" 
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Crear Gasto</Text>
                            <TouchableOpacity 
                                onPress={() => setModalVisible(false)}
                                style={styles.modalCloseButton}
                            >
                                <Ionicons name="close" size={24} color={KompaColors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.modalForm}>
                            <Text style={styles.inputLabel}>Descripción</Text>
                            <TextInput 
                                style={styles.modalInput}
                                placeholder="Ej: Cena en restaurante" 
                                value={expenseDescription} 
                                onChangeText={setExpenseDescription}
                            />
                            
                            <Text style={styles.inputLabel}>Monto</Text>
                            <TextInput 
                                style={styles.modalInput}
                                placeholder="0.00" 
                                value={expenseAmount} 
                                onChangeText={setExpenseAmount} 
                                keyboardType="numeric"
                            />
                            
                            <TouchableOpacity 
                                style={styles.createButton}
                                onPress={handleCreateExpense}
                            >
                                <Text style={styles.createButtonText}>Crear Gasto</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// --- Estilos actualizados ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: KompaColors.background,
    },
    scrollContainer: {
        flex: 1,
    },
    header: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerText: {
        flex: 1,
    },
    logoutButton: {
        padding: Spacing.sm,
        borderRadius: BorderRadius.md,
        backgroundColor: KompaColors.gray50,
        marginLeft: Spacing.md,
    },
    headerTitle: {
        fontSize: FontSizes.title,
        fontWeight: 'bold',
        color: KompaColors.textPrimary,
    },
    headerSubtitle: {
        fontSize: FontSizes.md,
        color: KompaColors.textSecondary,
        marginTop: Spacing.xs,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
    },
    loadingText: {
        marginTop: Spacing.md,
        color: KompaColors.textSecondary,
    },
    balanceCard: {
        marginHorizontal: Spacing.lg,
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        marginBottom: Spacing.lg,
    },
    balanceHeader: {
        marginBottom: Spacing.md,
    },
    balanceTitle: {
        color: 'white',
        fontSize: FontSizes.lg,
        fontWeight: '600',
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
        paddingBottom: Spacing.md,
    },
    balanceItem: {
        flex: 1,
    },
    balanceItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        opacity: 0.8,
    },
    balanceItemLabel: {
        color: 'white',
        marginLeft: Spacing.xs,
        fontSize: FontSizes.sm,
    },
    balanceAmount: {
        color: 'white',
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        marginTop: Spacing.xs,
    },
    netBalanceContainer: {
        marginTop: Spacing.md,
        alignItems: 'flex-end',
    },
    summaryGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: KompaColors.background,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: KompaColors.gray100,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryTitle: {
        fontSize: FontSizes.sm,
        fontWeight: '500',
        color: KompaColors.textSecondary,
    },
    summaryValue: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        marginVertical: Spacing.sm,
        color: KompaColors.textPrimary,
    },
    summaryDescription: {
        fontSize: FontSizes.xs,
        color: KompaColors.success,
    },
    card: {
        backgroundColor: KompaColors.background,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: KompaColors.gray100,
    },
    cardTitle: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        marginBottom: Spacing.md,
        color: KompaColors.textPrimary,
    },
    groupItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: KompaColors.gray100,
    },
    groupIcon: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        backgroundColor: KompaColors.gray50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    groupItemInfo: {
        marginLeft: Spacing.md,
        flex: 1,
    },
    groupItemName: {
        fontWeight: '600',
        fontSize: FontSizes.md,
        color: KompaColors.textPrimary,
    },
    groupItemMembers: {
        color: KompaColors.textSecondary,
        fontSize: FontSizes.sm,
        marginTop: Spacing.xs,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
    },
    emptyText: {
        color: KompaColors.textSecondary,
        fontSize: FontSizes.md,
        textAlign: 'center',
        marginTop: Spacing.md,
        fontWeight: '500',
    },
    emptySubtext: {
        color: KompaColors.gray400,
        fontSize: FontSizes.sm,
        textAlign: 'center',
        marginTop: Spacing.xs,
    },
    quickActionsContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        gap: Spacing.md,
        marginBottom: Spacing.lg,
    },
    quickActionButton: {
        flex: 1,
        backgroundColor: KompaColors.background,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: KompaColors.gray200,
    },
    quickActionText: {
        fontSize: FontSizes.sm,
        color: KompaColors.primary,
        fontWeight: '500',
        marginTop: Spacing.xs,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 56,
        height: 56,
        borderRadius: BorderRadius.full,
        backgroundColor: KompaColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        // Sombra sutil usando border
        borderWidth: 1,
        borderColor: KompaColors.primaryDark,
    },
    // Estilos del Modal
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: Spacing.lg,
    },
    modalContent: {
        backgroundColor: KompaColors.background,
        borderRadius: BorderRadius.xl,
        width: '100%',
        maxWidth: 400,
        padding: 0,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: KompaColors.gray100,
    },
    modalTitle: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: KompaColors.textPrimary,
    },
    modalCloseButton: {
        padding: Spacing.xs,
    },
    modalForm: {
        padding: Spacing.lg,
    },
    inputLabel: {
        fontSize: FontSizes.sm,
        fontWeight: '500',
        color: KompaColors.textPrimary,
        marginBottom: Spacing.sm,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: KompaColors.gray200,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        fontSize: FontSizes.md,
        color: KompaColors.textPrimary,
        backgroundColor: KompaColors.gray50,
        marginBottom: Spacing.md,
        minHeight: 44,
    },
    createButton: {
        backgroundColor: KompaColors.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    createButtonText: {
        color: KompaColors.background,
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
});