import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring } from 'react-native-reanimated';
import { Grupo } from './types';
import { useAuth } from './useAuth';
import { useExpenses } from './useExpenses';
import { useGroups } from './useGroups';

export function useDashboardLogic() {
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
    findUserByPublicId,
  } = useGroups();
  const {
    myExpenses,
    debts,
    loading: expensesLoading,
    error: expensesError,
    success: expensesSuccess,
    fetchMyExpenses,
    fetchGroupExpenses,
    createExpense,
    fetchMyDebts,
  } = useExpenses();

  const [activeTab, setActiveTab] = useState<'overview' | 'groups' | 'expenses' | 'profile'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [showCreateExpense, setShowCreateExpense] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Grupo | null>(null);
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [divisionType, setDivisionType] = useState<'equitativa' | 'porcentaje' | 'personalizada'>('equitativa');

  // Animaciones
  const pulseAnim = useSharedValue(1);
  const fadeAnim = useSharedValue(0);

  useEffect(() => {
    loadInitialData();
    fadeAnim.value = withSpring(1);
    pulseAnim.value = withRepeat(
      withSequence(withSpring(1.05), withSpring(1)),
      -1,
      true
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        fetchGroups(),
        fetchMyExpenses(1, true),
        fetchMyDebts(),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para el grupo');
      return;
    }
    try {
      await createGroup({ nombre: groupName.trim() });
      setGroupName('');
      setShowCreateGroup(false);
      Alert.alert('Éxito', 'Grupo creado correctamente');
      await fetchGroups();
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el grupo');
    }
  };

  const handleJoinGroup = async () => {
    if (!groupCode.trim()) {
      Alert.alert('Error', 'Por favor ingresa el código del grupo');
      return;
    }
    try {
      await joinGroup({ id_publico: groupCode.trim() });
      setGroupCode('');
      setShowJoinGroup(false);
      Alert.alert('Éxito', 'Te has unido al grupo correctamente');
      await fetchGroups();
    } catch (error) {
      Alert.alert('Error', 'No se pudo unir al grupo. Verifica el código.');
    }
  };

  const handleCreateExpense = async () => {
    if (!selectedGroup || !expenseDescription.trim() || !expenseAmount.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }
    try {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      await createExpense({
        grupo_id: selectedGroup.id,
        descripcion: expenseDescription.trim(),
        monto_total: amount,
        pagado_por: user?.id || '',
        participantes: [
          {
            id_usuario: user?.id || '',
            monto_proporcional: amount,
          },
        ],
        estado_pago: 'pendiente',
        ultima_modificacion: now,
        modificado_por: user?.id || '',
      });
      setExpenseDescription('');
      setExpenseAmount('');
      setShowCreateExpense(false);
      Alert.alert('Éxito', 'Gasto creado correctamente');
      await fetchMyExpenses(1, true);
    } catch (error) {
      console.error('Error creating expense:', error);
      Alert.alert('Error', 'No se pudo crear el gasto');
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/');
        },
      },
    ]);
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ scale: fadeAnim.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  return {
    user,
    groups,
    currentGroup,
    groupsLoading,
    groupsError,
    groupsSuccess,
    fetchGroups,
    createGroup,
    joinGroup,
    findUserByPublicId,
    myExpenses,
    debts,
    expensesLoading,
    expensesError,
    expensesSuccess,
    fetchMyExpenses,
    fetchGroupExpenses,
    createExpense,
    fetchMyDebts,
    activeTab,
    setActiveTab,
    refreshing,
    setRefreshing,
    showCreateGroup,
    setShowCreateGroup,
    showJoinGroup,
    setShowJoinGroup,
    showCreateExpense,
    setShowCreateExpense,
    groupName,
    setGroupName,
    groupCode,
    setGroupCode,
    selectedGroup,
    setSelectedGroup,
    expenseDescription,
    setExpenseDescription,
    expenseAmount,
    setExpenseAmount,
    divisionType,
    setDivisionType,
    loadInitialData,
    onRefresh,
    handleCreateGroup,
    handleJoinGroup,
    handleCreateExpense,
    handleLogout,
    animatedCardStyle,
    pulseStyle,
  };
}
