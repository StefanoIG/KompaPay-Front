import { GlobalStyles, KompaColors, Spacing } from '@/constants/Styles';
import { Gasto, Grupo, User } from '@/hooks/types';
import { useAuth } from '@/hooks/useAuth';
import { useExpenses } from '@/hooks/useExpenses';
import { useGroups } from '@/hooks/useGroups';
import { formatCurrency } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { 
    groups, 
    loading: groupsLoading, 
    fetchGroups 
  } = useGroups();
  const { 
    expenses,
    debts,
    loading: expensesLoading, 
    fetchMyExpenses 
  } = useExpenses();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchGroups(),
        fetchMyExpenses(1, true),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: logout 
        },
      ]
    );
  };

  const calculateTotalBalance = (): number => {
    if (!debts) return 0;
    return debts.reduce((total: number, debt: any) => {
      return total + (debt.tipo === 'deuda' ? -debt.monto : debt.monto);
    }, 0);
  };

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <ScrollView
        style={GlobalStyles.containerPadded}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={[GlobalStyles.rowBetween, { marginTop: Spacing.md, marginBottom: Spacing.lg }]}>
          <View>
            <Text style={GlobalStyles.textHeading}>
              ¡Hola, {user?.nombre?.split(' ')[0]}!
            </Text>
            <Text style={GlobalStyles.textSecondary}>
              Gestiona tus gastos compartidos
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={KompaColors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={[GlobalStyles.card, { backgroundColor: KompaColors.primary }]}>
          <Text style={[GlobalStyles.textBody, { color: KompaColors.background, opacity: 0.9 }]}>
            Balance Total
          </Text>
          <Text style={[GlobalStyles.textTitle, { color: KompaColors.background, marginBottom: 0 }]}>
            {formatCurrency(calculateTotalBalance())}
          </Text>
          <Text style={[GlobalStyles.textSmall, { color: KompaColors.background, opacity: 0.8 }]}>
            {calculateTotalBalance() >= 0 ? 'Te deben' : 'Debes'}
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={{ marginVertical: Spacing.lg }}>
          <Text style={[GlobalStyles.textHeading, { marginBottom: Spacing.md }]}>
            Acciones Rápidas
          </Text>
          <View style={GlobalStyles.row}>
            <TouchableOpacity style={[styles.quickActionButton, { marginRight: Spacing.sm }]}>
              <Ionicons name="add" size={24} color={KompaColors.primary} />
              <Text style={styles.quickActionText}>Nuevo Gasto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickActionButton, { marginLeft: Spacing.sm }]}>
              <Ionicons name="people" size={24} color={KompaColors.primary} />
              <Text style={styles.quickActionText}>Nuevo Grupo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Expenses */}
        <View style={{ marginBottom: Spacing.lg }}>
          <View style={[GlobalStyles.rowBetween, { marginBottom: Spacing.md }]}>
            <Text style={GlobalStyles.textHeading}>Gastos Recientes</Text>
            <TouchableOpacity>
              <Text style={[GlobalStyles.textSmall, { color: KompaColors.primary }]}>
                Ver todos
              </Text>
            </TouchableOpacity>
          </View>
          
          {expensesLoading ? (
            <Text style={GlobalStyles.textSecondary}>Cargando gastos...</Text>
          ) : expenses && expenses.length > 0 ? (
            expenses.slice(0, 3).map((expense: Gasto) => (
              <ExpenseCard key={expense.id} expense={expense} currentUser={user || undefined} />
            ))
          ) : (
            <View style={GlobalStyles.card}>
              <Text style={[GlobalStyles.textSecondary, { textAlign: 'center' }]}>
                No hay gastos recientes
              </Text>
            </View>
          )}
        </View>

        {/* My Groups */}
        <View style={{ marginBottom: Spacing.xl }}>
          <View style={[GlobalStyles.rowBetween, { marginBottom: Spacing.md }]}>
            <Text style={GlobalStyles.textHeading}>Mis Grupos</Text>
            <TouchableOpacity>
              <Text style={[GlobalStyles.textSmall, { color: KompaColors.primary }]}>
                Ver todos
              </Text>
            </TouchableOpacity>
          </View>
          
          {groupsLoading ? (
            <Text style={GlobalStyles.textSecondary}>Cargando grupos...</Text>
          ) : groups && groups.length > 0 ? (
            groups.slice(0, 3).map((group) => (
              <GroupCard key={group.id} group={group} />
            ))
          ) : (
            <View style={GlobalStyles.card}>
              <Text style={[GlobalStyles.textSecondary, { textAlign: 'center' }]}>
                No perteneces a ningún grupo aún
              </Text>
              <TouchableOpacity style={[GlobalStyles.button, { marginTop: Spacing.md }]}>
                <Text style={GlobalStyles.buttonText}>Crear mi primer grupo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Componente para mostrar gastos individuales
const ExpenseCard: React.FC<{ expense: Gasto; currentUser?: User }> = ({ expense, currentUser }) => {
  const getStatusColor = (isPaid: boolean) => {
    return isPaid ? KompaColors.success : KompaColors.pending;
  };

  // Verificar si el usuario actual tiene este gasto pagado
  const userParticipant = expense.participantes?.find(p => p.id === currentUser?.id);
  const isPaid = userParticipant?.pivot?.pagado || false;

  return (
    <TouchableOpacity style={GlobalStyles.card}>
      <View style={GlobalStyles.rowBetween}>
        <View style={{ flex: 1 }}>
          <Text style={[GlobalStyles.textBody, { fontWeight: '600' }]}>
            {expense.descripcion}
          </Text>
          <Text style={GlobalStyles.textSecondary}>
            {new Date(expense.fecha_creacion).toLocaleDateString()}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[GlobalStyles.textBody, { fontWeight: '600' }]}>
            {formatCurrency(expense.monto)}
          </Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(isPaid) }
          ]}>
            <Text style={styles.statusText}>
              {isPaid ? 'Pagado' : 'Pendiente'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Componente para mostrar grupos
const GroupCard: React.FC<{ group: Grupo }> = ({ group }) => {
  return (
    <TouchableOpacity style={GlobalStyles.card}>
      <View style={GlobalStyles.rowBetween}>
        <View style={{ flex: 1 }}>
          <Text style={[GlobalStyles.textBody, { fontWeight: '600' }]}>
            {group.nombre}
          </Text>
          <Text style={GlobalStyles.textSecondary}>
            {group.miembros?.length || 0} miembros
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Ionicons name="chevron-forward" size={20} color={KompaColors.textSecondary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = {
  quickActionButton: {
    flex: 1,
    backgroundColor: KompaColors.background,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: KompaColors.gray200,
  },
  quickActionText: {
    marginTop: Spacing.xs,
    fontSize: 14,
    fontWeight: '500' as const,
    color: KompaColors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
    marginTop: Spacing.xs,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: KompaColors.background,
    textTransform: 'capitalize' as const,
  },
};
