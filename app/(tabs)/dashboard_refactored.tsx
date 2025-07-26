import { KompaColors } from '@/constants/Styles';
import { useDashboardUI } from '@/hooks/useUI';
import { tabsStyles } from '@/styles/tabs.styles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    Modal, Platform, RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    useAnimatedStyle,
} from 'react-native-reanimated';

import { Grupo } from '../../hooks/types';
import { useAuth } from '../../hooks/useAuth';
import { useExpenses } from '../../hooks/useExpenses';
import { useGroups } from '../../hooks/useGroups';

export default function Dashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { 
    groups,
    currentGroup,
    loading: groupsLoading,
    error: groupsError,
    success: groupsSuccess,
    fetchGroups, 
    createGroup, 
    joinGroup,
  } = useGroups();
  const { 
    myExpenses,
    debts,
    debtsSummary,
    acreencias,
    loading: expensesLoading,
    error: expensesError,
    success: expensesSuccess,
    fetchMyExpenses, 
    createExpense,
    fetchMyDebts 
  } = useExpenses();

  const {
    // State
    activeTab,
    refreshing,
    showCreateGroup,
    showJoinGroup,
    showCreateExpense,
    groupName,
    groupCode,
    expenseDescription,
    expenseAmount,
    divisionType,
    
    // Animations
    pulseAnim,
    fadeAnim,
    initializeAnimations,
    
    // Actions
    switchTab,
    setGroupName,
    setGroupCode,
    setExpenseDescription,
    setExpenseAmount,
    setDivisionType,
    
    // Modal management
    openCreateGroupModal,
    closeCreateGroupModal,
    openJoinGroupModal,
    closeJoinGroupModal,
    openCreateExpenseModal,
    closeCreateExpenseModal,
    
    // Validation
    validateGroupForm,
    validateJoinGroupForm,
    validateExpenseForm,
    
    // UI helpers
    showValidationError,
    showSuccessAlert,
    showErrorAlert,
    createRefreshControl,
    
    // Formatters
    formatCurrency,
    formatDate,
  } = useDashboardUI();

  useEffect(() => {
    loadInitialData();
    initializeAnimations();
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        fetchGroups(),
        fetchMyExpenses(1, true),
        fetchMyDebts()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const handleRefresh = async () => {
    await loadInitialData();
  };

  const handleCreateGroup = async () => {
    const validationError = validateGroupForm();
    if (validationError) {
      showValidationError(validationError);
      return;
    }

    try {
      await createGroup({ nombre: groupName.trim() });
      closeCreateGroupModal();
      showSuccessAlert('¡Éxito!', 'Grupo creado correctamente');
      await fetchGroups();
    } catch (error: any) {
      showErrorAlert('Error', error.message || 'No se pudo crear el grupo');
    }
  };

  const handleJoinGroup = async () => {
    const validationError = validateJoinGroupForm();
    if (validationError) {
      showValidationError(validationError);
      return;
    }

    try {
      await joinGroup({ id_publico: groupCode.trim() });
      closeJoinGroupModal();
      showSuccessAlert('¡Éxito!', 'Te has unido al grupo correctamente');
      await fetchGroups();
    } catch (error: any) {
      showErrorAlert('Error', error.message || 'No se pudo unir al grupo');
    }
  };

  const handleCreateExpense = async () => {
    if (!currentGroup) {
      showErrorAlert('Error', 'Debes seleccionar un grupo primero');
      return;
    }

    const validationError = validateExpenseForm();
    if (validationError) {
      showValidationError(validationError);
      return;
    }

    try {
      const expenseData = {
        grupo_id: currentGroup.id,
        descripcion: expenseDescription.trim(),
        monto_total: parseFloat(expenseAmount),
        pagado_por: user?.id || '',
        participantes: [{
          id_usuario: user?.id || '',
          monto_proporcional: parseFloat(expenseAmount),
        }],
        ultima_modificacion: new Date().toISOString(),
        modificado_por: user?.id || '',
      };

      await createExpense(expenseData);
      closeCreateExpenseModal();
      showSuccessAlert('¡Éxito!', 'Gasto creado correctamente');
      await fetchMyExpenses(1, true);
    } catch (error: any) {
      showErrorAlert('Error', error.message || 'No se pudo crear el gasto');
    }
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  const renderTabButton = (
    key: typeof activeTab,
    icon: string,
    label: string
  ) => (
    <TouchableOpacity
      key={key}
      style={[
        tabsStyles.tabButton,
        activeTab === key && tabsStyles.tabButtonActive,
      ]}
      onPress={() => switchTab(key)}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={activeTab === key ? 'white' : KompaColors.textSecondary}
      />
      <Text
        style={[
          tabsStyles.tabText,
          activeTab === key && tabsStyles.tabTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderOverviewContent = () => (
    <Animated.View style={fadeStyle}>
      <LinearGradient
        colors={[KompaColors.primary, KompaColors.primaryDark]}
        style={tabsStyles.overviewCardGradient}
      >
        <View style={tabsStyles.overviewHeader}>
          <Text style={tabsStyles.overviewTitle}>Balance Total</Text>
          <Ionicons name="wallet" size={24} color="white" />
        </View>
        <Text style={tabsStyles.overviewAmount}>
          {formatCurrency(debtsSummary?.balance ?? 0)}
        </Text>
        <Text style={tabsStyles.overviewSubtitle}>
          {debtsSummary?.total_deudas ?? 0} deudas pendientes
        </Text>
      </LinearGradient>

      <View style={tabsStyles.statsGrid}>
        <View style={tabsStyles.statItem}>
          <Text style={tabsStyles.statValue}>{groups?.length || 0}</Text>
          <Text style={tabsStyles.statLabel}>Grupos</Text>
        </View>
        <View style={tabsStyles.statItem}>
          <Text style={tabsStyles.statValue}>{myExpenses?.length || 0}</Text>
          <Text style={tabsStyles.statLabel}>Gastos</Text>
        </View>
        <View style={tabsStyles.statItem}>
          <Text style={tabsStyles.statValue}>{debtsSummary?.total_deudas ?? 0}</Text>
          <Text style={tabsStyles.statLabel}>Deudas</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderGroupsContent = () => (
    <View style={tabsStyles.groupsList}>
      {groups && groups.length > 0 ? (
        groups.map((group: Grupo) => (
          <View key={group.id} style={tabsStyles.groupCard}>
            <View style={tabsStyles.groupHeader}>
              <Text style={tabsStyles.groupName}>{group.nombre}</Text>
              <Text style={tabsStyles.groupMembers}>
                {group.miembros?.length || 0} miembros
              </Text>
            </View>
            <View style={tabsStyles.groupStats}>
              <View style={tabsStyles.groupStat}>
                <Text style={tabsStyles.groupStatValue}>
                  {formatCurrency(0)}
                </Text>
                <Text style={tabsStyles.groupStatLabel}>Total gastos</Text>
              </View>
              <View style={tabsStyles.groupStat}>
                <Text style={tabsStyles.groupStatValue}>
                  {group.id_publico || 'N/A'}
                </Text>
                <Text style={tabsStyles.groupStatLabel}>Código</Text>
              </View>
            </View>
          </View>
        ))
      ) : (
        <View style={tabsStyles.overviewCard}>
          <Text style={tabsStyles.headerSubtitle}>
            No tienes grupos aún. ¡Crea tu primer grupo!
          </Text>
        </View>
      )}
    </View>
  );

  // Agrupar deudas por grupo
  const groupedDebts = (debts ?? []).reduce((acc, deuda) => {
    const groupName = deuda.grupo_nombre || 'Sin grupo';
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(deuda);
    return acc;
  }, {} as Record<string, typeof debts>);

  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});
  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  // Agrupar gastos por grupo
  const groupedExpenses = (myExpenses ?? []).reduce((acc, gasto) => {
    const groupName = gasto.grupo?.nombre || 'Sin grupo';
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(gasto);
    return acc;
  }, {} as Record<string, typeof myExpenses>);

  const [expandedExpenseGroups, setExpandedExpenseGroups] = React.useState<Record<string, boolean>>({});
  const toggleExpenseGroup = (groupName: string) => {
    setExpandedExpenseGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const renderExpensesContent = () => (
    <View style={tabsStyles.expensesList}>
      {myExpenses && Object.keys(groupedExpenses).length > 0 ? (
        Object.entries(groupedExpenses).map(([groupName, groupExpenses]) => (
          <View key={groupName} style={tabsStyles.groupCard}>
            <TouchableOpacity style={tabsStyles.groupHeader} onPress={() => toggleExpenseGroup(groupName)}>
              <Text style={tabsStyles.groupName}>{groupName}</Text>
              <Ionicons
                name={expandedExpenseGroups[groupName] ? 'chevron-down' : 'chevron-forward'}
                size={20}
                color={KompaColors.textSecondary}
              />
            </TouchableOpacity>
            {expandedExpenseGroups[groupName] && (
              <View style={tabsStyles.groupsList}>
                {groupExpenses.map((expense, idx) => (
                  <View key={expense.id || idx} style={tabsStyles.expenseCard}>
                    <View style={tabsStyles.expenseHeader}>
                      <Text style={tabsStyles.expenseDescription}>{expense.descripcion}</Text>
                      <Text style={tabsStyles.expenseAmount}>{formatCurrency(expense.monto_total)}</Text>
                    </View>
                    <View style={tabsStyles.expenseInfo}>
                      <Text style={tabsStyles.expenseDate}>{formatDate(expense.fecha_creacion)}</Text>
                      <Text style={tabsStyles.expenseStatus}>{expense.estado_pago === 'pagado' ? 'Pagado' : 'Pendiente'}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))
      ) : (
        <View style={tabsStyles.overviewCard}>
          <Text style={tabsStyles.headerSubtitle}>
            No tienes gastos registrados aún.
          </Text>
        </View>
      )}
    </View>
  );

  const renderProfileContent = () => (
    <View>
      <View style={tabsStyles.profileHeader}>
        <View style={tabsStyles.profileAvatar}>
          <Ionicons name="person" size={40} color="white" />
        </View>
        <Text style={tabsStyles.profileName}>{user?.nombre || 'Usuario'}</Text>
        <Text style={tabsStyles.profileEmail}>{user?.email || 'No disponible'}</Text>
      </View>

      <View style={tabsStyles.profileSection}>
        <View style={tabsStyles.profileSectionHeader}>
          <Text style={tabsStyles.profileSectionTitle}>Configuración</Text>
        </View>
        <TouchableOpacity style={tabsStyles.profileOption}>
          <View style={tabsStyles.profileOptionLeft}>
            <Ionicons
              name="notifications"
              size={20}
              color={KompaColors.textSecondary}
              style={tabsStyles.profileOptionIcon}
            />
            <Text style={tabsStyles.profileOptionText}>Notificaciones</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={KompaColors.textSecondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={tabsStyles.logoutButton} onPress={logout}>
        <LinearGradient
          colors={[KompaColors.error, '#DC2626']}
          style={tabsStyles.logoutButtonGradient}
        >
          <Text style={tabsStyles.logoutButtonText}>Cerrar Sesión</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={tabsStyles.dashboardContainer}>
      {/* Tab Navigation */}
      {/* Tab Navigation solo en mobile, no en web */}
      {Platform.OS !== 'web' && (
        <View style={tabsStyles.tabContainer}>
          {renderTabButton('overview', 'home', 'Resumen')}
          {renderTabButton('groups', 'people', 'Grupos')}
          {renderTabButton('expenses', 'card', 'Gastos')}
          {renderTabButton('profile', 'person', 'Perfil')}
        </View>
      )}

      {/* Content */}
      <View style={tabsStyles.contentContainer}>
        <ScrollView
          style={tabsStyles.scrollContainer}
          refreshControl={
            <RefreshControl
              {...createRefreshControl(handleRefresh)}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'overview' && renderOverviewContent()}
          {activeTab === 'groups' && renderGroupsContent()}
          {activeTab === 'expenses' && renderExpensesContent()}
          {activeTab === 'profile' && renderProfileContent()}
        </ScrollView>
      </View>

      {/* FAB */}
      {(activeTab === 'groups' || activeTab === 'expenses') && (
        <Animated.View style={[tabsStyles.fab, pulseStyle]}>
          <TouchableOpacity
            style={tabsStyles.fabGradient}
            onPress={activeTab === 'groups' ? openCreateGroupModal : openCreateExpenseModal}
          >
            <LinearGradient
              colors={[KompaColors.primary, KompaColors.primaryDark]}
              style={tabsStyles.fabGradient}
            >
              <Ionicons name="add" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Modals */}
      <Modal
        visible={showCreateGroup}
        transparent
        animationType="fade"
        onRequestClose={closeCreateGroupModal}
      >
        <View style={tabsStyles.modalOverlay}>
          <View style={tabsStyles.modalContent}>
            <View style={tabsStyles.modalHeader}>
              <Text style={tabsStyles.modalTitle}>Crear Nuevo Grupo</Text>
              <Text style={tabsStyles.modalSubtitle}>
                Ingresa un nombre para tu grupo de gastos
              </Text>
            </View>
            <View style={tabsStyles.modalForm}>
              <TextInput
                style={tabsStyles.input}
                placeholder="Nombre del grupo"
                value={groupName}
                onChangeText={setGroupName}
                maxLength={50}
              />
            </View>
            <View style={tabsStyles.modalButtons}>
              <TouchableOpacity
                style={[tabsStyles.modalButton, tabsStyles.modalButtonSecondary]}
                onPress={closeCreateGroupModal}
              >
                <Text style={[tabsStyles.modalButtonText, tabsStyles.modalButtonTextSecondary]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[tabsStyles.modalButton, tabsStyles.modalButtonPrimary]}
                onPress={handleCreateGroup}
              >
                <Text style={[tabsStyles.modalButtonText, tabsStyles.modalButtonTextPrimary]}>
                  Crear
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showJoinGroup}
        transparent
        animationType="fade"
        onRequestClose={closeJoinGroupModal}
      >
        <View style={tabsStyles.modalOverlay}>
          <View style={tabsStyles.modalContent}>
            <View style={tabsStyles.modalHeader}>
              <Text style={tabsStyles.modalTitle}>Unirse a Grupo</Text>
              <Text style={tabsStyles.modalSubtitle}>
                Ingresa el código del grupo al que te quieres unir
              </Text>
            </View>
            <View style={tabsStyles.modalForm}>
              <TextInput
                style={tabsStyles.input}
                placeholder="Código del grupo"
                value={groupCode}
                onChangeText={setGroupCode}
                autoCapitalize="characters"
              />
            </View>
            <View style={tabsStyles.modalButtons}>
              <TouchableOpacity
                style={[tabsStyles.modalButton, tabsStyles.modalButtonSecondary]}
                onPress={closeJoinGroupModal}
              >
                <Text style={[tabsStyles.modalButtonText, tabsStyles.modalButtonTextSecondary]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[tabsStyles.modalButton, tabsStyles.modalButtonPrimary]}
                onPress={handleJoinGroup}
              >
                <Text style={[tabsStyles.modalButtonText, tabsStyles.modalButtonTextPrimary]}>
                  Unirse
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCreateExpense}
        transparent
        animationType="fade"
        onRequestClose={closeCreateExpenseModal}
      >
        <View style={tabsStyles.modalOverlay}>
          <View style={tabsStyles.modalContent}>
            <View style={tabsStyles.modalHeader}>
              <Text style={tabsStyles.modalTitle}>Crear Nuevo Gasto</Text>
              <Text style={tabsStyles.modalSubtitle}>
                Registra un gasto para dividir con tu grupo
              </Text>
            </View>
            <View style={tabsStyles.modalForm}>
              <TextInput
                style={tabsStyles.input}
                placeholder="Descripción del gasto"
                value={expenseDescription}
                onChangeText={setExpenseDescription}
                maxLength={100}
              />
              <TextInput
                style={tabsStyles.input}
                placeholder="Monto total"
                value={expenseAmount}
                onChangeText={setExpenseAmount}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={tabsStyles.modalButtons}>
              <TouchableOpacity
                style={[tabsStyles.modalButton, tabsStyles.modalButtonSecondary]}
                onPress={closeCreateExpenseModal}
              >
                <Text style={[tabsStyles.modalButtonText, tabsStyles.modalButtonTextSecondary]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[tabsStyles.modalButton, tabsStyles.modalButtonPrimary]}
                onPress={handleCreateExpense}
              >
                <Text style={[tabsStyles.modalButtonText, tabsStyles.modalButtonTextPrimary]}>
                  Crear Gasto
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
