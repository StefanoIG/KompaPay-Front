// app/(tabs)/expenses.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 1. Importar hooks de datos reales
import { useDebts } from '@/hooks/useExpenses'; // Cambiar de useExpenses a useDebts
import { useGroups } from '@/hooks/useGroups'; // Para el filtro de grupos
// 2. Importar tipos
import { Deuda, Acreencia } from '@/config/config';

// Tipo unión para el FlatList
type DebtOrCredit = Deuda | Acreencia;

// 2. Importar componentes y constantes
import { AddExpenseModal } from '@/components/modals/AddExpenseModal';
import { BorderRadius, FontSizes, KompaColors, Shadows, Spacing } from '@/constants/Styles';

// Componente para los filtros
interface ExpenseFiltersProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    groups: any[];
    selectedGroup: string;
    setSelectedGroup: (group: string) => void;
}

const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({ 
    searchQuery, 
    setSearchQuery, 
    groups, 
    selectedGroup, 
    setSelectedGroup 
}) => (
    <View style={styles.filtersContainer}>
        <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={KompaColors.textSecondary} style={styles.searchIcon} />
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar por descripción, pagador..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>
        
        {/* Selector de grupos simplificado */}
        <View style={styles.groupFilterContainer}>
            <Text style={styles.groupFilterLabel}>Filtrar por grupo:</Text>
            <TouchableOpacity 
                style={styles.groupFilterButton}
                onPress={() => {
                    // Rotar entre "Todos los grupos" y los nombres de grupos específicos
                    const groupNames = ['All Groups', ...Array.from(new Set([...groups.map(g => g.nombre)]))];
                    const currentIndex = groupNames.indexOf(selectedGroup);
                    const nextIndex = (currentIndex + 1) % groupNames.length;
                    setSelectedGroup(groupNames[nextIndex]);
                }}
            >
                <Text style={styles.groupFilterButtonText}>
                    {selectedGroup === 'All Groups' ? 'Todos los grupos' : selectedGroup}
                </Text>
                <Ionicons name="chevron-down" size={16} color={KompaColors.textSecondary} />
            </TouchableOpacity>
        </View>
    </View>
);

// --- Componente Principal ---
export default function ExpensesScreen() {
    // 3. Consumir los hooks para deudas y grupos
    const { debts, credits, summary, loading: debtsLoading } = useDebts();
    const { groups, loading: groupsLoading } = useGroups();
    
    // 4. Estado local para los filtros y modal
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('All Groups');
    const [isModalVisible, setModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<'debts' | 'credits'>('debts');

    // 5. Lógica de filtrado para deudas
    const filteredDebts = useMemo(() => {
        return debts.filter((debt) => {
            const matchesSearch =
                debt.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
                debt.pagado_por.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesGroup = selectedGroup === 'All Groups' || debt.grupo === selectedGroup;

            return matchesSearch && matchesGroup;
        });
    }, [debts, searchQuery, selectedGroup]);

    // 6. Lógica de filtrado para acreencias
    const filteredCredits = useMemo(() => {
        return credits.filter((credit) => {
            const matchesSearch =
                credit.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
                credit.deudores.some(deudor => deudor.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const matchesGroup = selectedGroup === 'All Groups' || credit.grupo === selectedGroup;

            return matchesSearch && matchesGroup;
        });
    }, [credits, searchQuery, selectedGroup]);

    const handleEdit = (item: any) => {
        // Lógica para abrir modal de edición
        Alert.alert('Editar', `Editar gasto: ${item.descripcion}`);
    };

    const handleDelete = (item: any) => {
        // Lógica para confirmar y eliminar
        Alert.alert('Eliminar', `¿Eliminar gasto: ${item.descripcion}?`);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Gestión de Gastos</Text>
                {summary && (
                    <View style={styles.summaryContainer}>
                        <Text style={styles.summaryText}>
                            Balance: ${summary.balance.toFixed(2)}
                        </Text>
                        <Text style={styles.summarySubtext}>
                            Debes: ${summary.total_deudas.toFixed(2)} | Te deben: ${summary.total_acreencias.toFixed(2)}
                        </Text>
                    </View>
                )}
            </View>

            {/* Pestañas para cambiar entre deudas y acreencias */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'debts' && styles.activeTab]}
                    onPress={() => setActiveTab('debts')}
                >
                    <Text style={[styles.tabText, activeTab === 'debts' && styles.activeTabText]}>
                        Mis Deudas ({debts.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'credits' && styles.activeTab]}
                    onPress={() => setActiveTab('credits')}
                >
                    <Text style={[styles.tabText, activeTab === 'credits' && styles.activeTabText]}>
                        Me Deben ({credits.length})
                    </Text>
                </TouchableOpacity>
            </View>

            <ExpenseFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                groups={groups}
                selectedGroup={selectedGroup}
                setSelectedGroup={setSelectedGroup}
            />

            {debtsLoading ? (
                <ActivityIndicator size="large" style={{ marginTop: 20 }} />
            ) : (
                <FlatList<DebtOrCredit>
                    data={activeTab === 'debts' ? (filteredDebts as DebtOrCredit[]) : (filteredCredits as DebtOrCredit[])}
                    keyExtractor={(item) => item.gasto_id}
                    renderItem={({ item }) => {
                        const debt = item as any; // Tipo unión para manejar ambos casos
                        return (
                            <View style={styles.debtCard}>
                                <View style={styles.debtHeader}>
                                    <Text style={styles.debtDescription}>{debt.descripcion}</Text>
                                    <Text style={styles.debtAmount}>
                                        ${typeof debt.monto_adeudado === 'string' ? 
                                            parseFloat(debt.monto_adeudado).toFixed(2) : 
                                            debt.monto_adeudado?.toFixed(2) || '0.00'}
                                    </Text>
                                </View>
                                <Text style={styles.debtGroup}>{debt.grupo}</Text>
                                <Text style={styles.debtPayer}>
                                    {activeTab === 'debts' ? `Pagado por: ${debt.pagado_por}` : 
                                     `Deudores: ${debt.deudores?.join(', ') || 'N/A'}`}
                                </Text>
                                <Text style={styles.debtDate}>
                                    {new Date(debt.fecha_creacion).toLocaleDateString()}
                                </Text>
                            </View>
                        );
                    }}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text>
                                {activeTab === 'debts' ? 
                                 'No tienes deudas pendientes.' : 
                                 'No tienes acreencias pendientes.'}
                            </Text>
                        </View>
                    }
                />
            )}
            
            <TouchableOpacity style={[styles.fab, Shadows.lg]} onPress={() => setModalVisible(true)}>
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>

            {/* Modal para crear nuevo gasto usando el componente avanzado */}
            <AddExpenseModal 
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: KompaColors.background,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    summaryContainer: {
        marginTop: 8,
        padding: 12,
        backgroundColor: KompaColors.gray100,
        borderRadius: 8,
    },
    summaryText: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    summarySubtext: {
        fontSize: 14,
        color: KompaColors.textSecondary,
        textAlign: 'center',
        marginTop: 4,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: KompaColors.gray100,
        marginHorizontal: 4,
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: KompaColors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: KompaColors.textSecondary,
    },
    activeTabText: {
        color: 'white',
    },
    debtCard: {
        backgroundColor: 'white',
        padding: 16,
        marginVertical: 4,
        borderRadius: 8,
        ...Shadows.sm,
    },
    debtHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    debtDescription: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 8,
    },
    debtAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: KompaColors.primary,
    },
    debtGroup: {
        fontSize: 14,
        color: KompaColors.textSecondary,
        marginBottom: 4,
    },
    debtPayer: {
        fontSize: 14,
        color: KompaColors.textPrimary,
        marginBottom: 4,
    },
    debtDate: {
        fontSize: 12,
        color: KompaColors.textSecondary,
    },
    filtersContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: KompaColors.gray100,
        borderRadius: 8,
        marginBottom: 8,
    },
    searchIcon: {
        marginLeft: 12,
    },
    searchInput: {
        height: 44,
        flex: 1,
        paddingHorizontal: 8,
    },
    groupFilterContainer: {
        marginTop: 8,
    },
    groupFilterLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: KompaColors.textPrimary,
        marginBottom: 4,
    },
    groupFilterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: KompaColors.gray100,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    groupFilterButtonText: {
        fontSize: 14,
        color: KompaColors.textPrimary,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 80, // Espacio para el FAB
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: KompaColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
