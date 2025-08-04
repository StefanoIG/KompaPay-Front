// app/(tabs)/expenses.tsx
import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
    Alert,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// 1. Importar hooks de datos reales
import { useExpenses } from '@/hooks/useExpenses';
import { useGroups } from '@/hooks/useGroups'; // Para el filtro de grupos

// 2. Importar componentes y constantes
import { AddExpenseModal } from '@/components/modals/AddExpenseModal';
import { ExpenseCard } from '@/components/expenses/ExpenseCard';
import { KompaColors, Shadows, Spacing, FontSizes, BorderRadius } from '@/constants/Styles';

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
        {/* Aquí iría un componente de <Picker> o <Select> para el filtro de grupo */}
    </View>
);

// --- Componente Principal ---
export default function ExpensesScreen() {
    // 3. Consumir los hooks
    const { expenses, loading: expensesLoading } = useExpenses();
    const { groups, loading: groupsLoading } = useGroups();
    
    // 4. Estado local para los filtros y modal
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('All Groups');
    const [isModalVisible, setModalVisible] = useState(false);

    // 5. Lógica de filtrado
    const filteredExpenses = useMemo(() => {
        return expenses.filter((expense) => {
            const matchesSearch =
                expense.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
                expense.pagado_por.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesGroup = selectedGroup === 'All Groups' || expense.grupo?.id === selectedGroup;

            return matchesSearch && matchesGroup;
        });
    }, [expenses, searchQuery, selectedGroup]);

    const handleEdit = (expense: any) => {
        // Lógica para abrir modal de edición
        Alert.alert('Editar', `Editar gasto: ${expense.descripcion}`);
    };

    const handleDelete = (expense: any) => {
        // Lógica para confirmar y eliminar
        Alert.alert('Eliminar', `¿Eliminar gasto: ${expense.descripcion}?`);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Gestión de Gastos</Text>
            </View>

            <ExpenseFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                groups={groups}
                selectedGroup={selectedGroup}
                setSelectedGroup={setSelectedGroup}
            />

            {expensesLoading ? (
                <ActivityIndicator size="large" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filteredExpenses}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ExpenseCard 
                            expense={item} 
                            onEdit={() => handleEdit(item)}
                            onDelete={() => handleDelete(item)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text>No se encontraron gastos.</Text>
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
    filtersContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: KompaColors.gray100,
        borderRadius: 8,
    },
    searchIcon: {
        marginLeft: 12,
    },
    searchInput: {
        height: 44,
        flex: 1,
        paddingHorizontal: 8,
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
    modalContainer: {
        flex: 1,
        backgroundColor: KompaColors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: KompaColors.gray200,
    },
    modalTitle: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: KompaColors.textPrimary,
    },
    saveButton: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: KompaColors.primary,
    },
    modalContent: {
        flex: 1,
        padding: Spacing.lg,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    inputLabel: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: KompaColors.textPrimary,
        marginBottom: Spacing.sm,
    },
    textInput: {
        borderWidth: 1,
        borderColor: KompaColors.gray300,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        fontSize: FontSizes.md,
        backgroundColor: '#FFFFFF',
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    categoryButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: KompaColors.gray300,
        backgroundColor: '#FFFFFF',
    },
    categoryButtonActive: {
        backgroundColor: KompaColors.primary,
        borderColor: KompaColors.primary,
    },
    categoryText: {
        fontSize: FontSizes.sm,
        color: KompaColors.textSecondary,
    },
    categoryTextActive: {
        color: '#FFFFFF',
    },
    groupContainer: {
        gap: Spacing.sm,
    },
    groupButton: {
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: KompaColors.gray300,
        backgroundColor: '#FFFFFF',
    },
    groupButtonActive: {
        backgroundColor: KompaColors.secondary,
        borderColor: KompaColors.secondary,
    },
    groupText: {
        fontSize: FontSizes.md,
        color: KompaColors.textPrimary,
    },
    groupTextActive: {
        color: '#FFFFFF',
    },
});