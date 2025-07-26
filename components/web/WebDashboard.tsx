import { useAuth } from '@/hooks/useAuth';
import { useExpenses } from '@/hooks/useExpenses';
import { useGroups } from '@/hooks/useGroups';
import { formatCurrency } from '@/hooks/useUtilities';
import { tabsStyles } from '@/styles/tabs.styles';
import { webLayoutStyles } from '@/styles/web.styles';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

export const WebDashboard: React.FC = () => {
  const { user } = useAuth();
  const { expenses, loading: expensesLoading } = useExpenses();
  const { groups, loading: groupsLoading } = useGroups();

  // Calcular métricas básicas
  const totalBalance = 10000; // Temporal
  const monthlySpent = expenses?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
  const monthlyBudget = 5000; // Temporal
  const recentExpenses = expenses?.slice(0, 5) || [];
  const userGroups = groups || [];

  const getProgressPercentage = () => {
    return Math.min((monthlySpent / monthlyBudget) * 100, 100);
  };

  return (
    <View style={webLayoutStyles.contentContainer}>
      <ScrollView style={tabsStyles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={tabsStyles.header}>
          <View>
            <Text style={tabsStyles.headerTitle}>
              ¡Hola, {user?.first_name || 'Usuario'}! 👋
            </Text>
            <Text style={tabsStyles.headerSubtitle}>
              Gestiona tus finanzas fácilmente
            </Text>
          </View>
        </View>

        {/* Balance Cards */}
        <View style={tabsStyles.dashboard}>
          <View style={[tabsStyles.card, { backgroundColor: '#2563EB' }]}>
            <Text style={[tabsStyles.cardTitle, { color: 'white' }]}>Balance Total</Text>
            <Text style={[tabsStyles.cardAmount, { color: 'white' }]}>
              {formatCurrency(totalBalance)}
            </Text>
          </View>

          <View style={tabsStyles.card}>
            <Text style={tabsStyles.cardTitle}>Gastado este mes</Text>
            <Text style={[tabsStyles.cardAmount, { color: '#EF4444' }]}>
              {formatCurrency(monthlySpent)}
            </Text>
          </View>
        </View>

        {/* Budget Progress */}
        <View style={tabsStyles.card}>
          <Text style={tabsStyles.cardTitle}>Presupuesto Mensual</Text>
          <Text style={tabsStyles.cardSubtitle}>
            {formatCurrency(monthlySpent)} / {formatCurrency(monthlyBudget)}
          </Text>
          <View style={tabsStyles.progressContainer}>
            <View 
              style={[
                tabsStyles.progressBar, 
                { width: `${getProgressPercentage()}%` }
              ]} 
            />
          </View>
          <Text style={tabsStyles.progressText}>
            {getProgressPercentage().toFixed(1)}% utilizado
          </Text>
        </View>

        {/* Recent Expenses */}
        <View style={tabsStyles.card}>
          <Text style={tabsStyles.cardTitle}>Gastos Recientes</Text>
          {recentExpenses.length === 0 ? (
            <View style={tabsStyles.emptyContainer}>
              <Text style={tabsStyles.emptyText}>
                No hay gastos recientes
              </Text>
            </View>
          ) : (
            recentExpenses.map((expense, index) => (
              <View key={expense.id || index} style={tabsStyles.expenseItem}>
                <View style={tabsStyles.expenseInfo}>
                  <Text style={tabsStyles.expenseTitle}>
                    {expense.description || 'Sin descripción'}
                  </Text>
                  <Text style={tabsStyles.expenseDate}>
                    {expense.date ? new Date(expense.date).toLocaleDateString() : 'Sin fecha'}
                  </Text>
                </View>
                <Text style={tabsStyles.expenseAmount}>
                  -{formatCurrency(expense.amount || 0)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* User Groups */}
        <View style={tabsStyles.card}>
          <Text style={tabsStyles.cardTitle}>Mis Grupos</Text>
          {userGroups.length === 0 ? (
            <View style={tabsStyles.emptyContainer}>
              <Text style={tabsStyles.emptyText}>
                No tienes grupos aún
              </Text>
            </View>
          ) : (
            userGroups.map((group, index) => (
              <View key={group.id || index} style={tabsStyles.groupItem}>
                <View style={tabsStyles.groupInfo}>
                  <Text style={tabsStyles.groupName}>
                    {group.name || 'Grupo sin nombre'}
                  </Text>
                  <Text style={tabsStyles.groupDescription}>
                    {group.member_count || 0} miembros
                  </Text>
                </View>
                <Text style={tabsStyles.groupAmount}>
                  {formatCurrency(group.total_expenses || 0)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};
