import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useSharedValue, withRepeat, withSequence, withSpring } from 'react-native-reanimated';

export const useDashboardUI = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'groups' | 'expenses' | 'profile'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [showCreateExpense, setShowCreateExpense] = useState(false);
  
  // Form states
  const [groupName, setGroupName] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [divisionType, setDivisionType] = useState<'equitativa' | 'porcentaje' | 'personalizada'>('equitativa');

  // Animations
  const pulseAnim = useSharedValue(1);
  const fadeAnim = useSharedValue(0);

  const initializeAnimations = useCallback(() => {
    fadeAnim.value = withSpring(1);
    pulseAnim.value = withRepeat(
      withSequence(
        withSpring(1.05),
        withSpring(1)
      ),
      -1,
      true
    );
  }, [fadeAnim, pulseAnim]);

  const switchTab = useCallback((tab: typeof activeTab) => {
    setActiveTab(tab);
  }, []);

  const openCreateGroupModal = useCallback(() => {
    setShowCreateGroup(true);
    setGroupName('');
  }, []);

  const closeCreateGroupModal = useCallback(() => {
    setShowCreateGroup(false);
    setGroupName('');
  }, []);

  const openJoinGroupModal = useCallback(() => {
    setShowJoinGroup(true);
    setGroupCode('');
  }, []);

  const closeJoinGroupModal = useCallback(() => {
    setShowJoinGroup(false);
    setGroupCode('');
  }, []);

  const openCreateExpenseModal = useCallback(() => {
    setShowCreateExpense(true);
    setExpenseDescription('');
    setExpenseAmount('');
    setDivisionType('equitativa');
  }, []);

  const closeCreateExpenseModal = useCallback(() => {
    setShowCreateExpense(false);
    setExpenseDescription('');
    setExpenseAmount('');
    setDivisionType('equitativa');
  }, []);

  const validateGroupForm = useCallback((): string | null => {
    if (!groupName.trim()) {
      return 'El nombre del grupo es obligatorio';
    }
    if (groupName.trim().length < 3) {
      return 'El nombre debe tener al menos 3 caracteres';
    }
    if (groupName.trim().length > 50) {
      return 'El nombre no puede tener más de 50 caracteres';
    }
    return null;
  }, [groupName]);

  const validateJoinGroupForm = useCallback((): string | null => {
    if (!groupCode.trim()) {
      return 'El código del grupo es obligatorio';
    }
    if (groupCode.trim().length < 6) {
      return 'El código debe tener al menos 6 caracteres';
    }
    return null;
  }, [groupCode]);

  const validateExpenseForm = useCallback((): string | null => {
    if (!expenseDescription.trim()) {
      return 'La descripción del gasto es obligatoria';
    }
    if (expenseDescription.trim().length < 3) {
      return 'La descripción debe tener al menos 3 caracteres';
    }
    if (!expenseAmount.trim()) {
      return 'El monto del gasto es obligatorio';
    }
    
    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      return 'Ingresa un monto válido mayor a 0';
    }
    if (amount > 999999) {
      return 'El monto no puede ser mayor a $999,999';
    }
    
    return null;
  }, [expenseDescription, expenseAmount]);

  const showValidationError = useCallback((message: string) => {
    Alert.alert('Error de Validación', message);
  }, []);

  const showSuccessAlert = useCallback((title: string, message: string) => {
    Alert.alert(title, message);
  }, []);

  const showErrorAlert = useCallback((title: string, message: string) => {
    Alert.alert(title, message);
  }, []);

  const createRefreshControl = useCallback((onRefresh: () => Promise<void>) => {
    return {
      refreshing,
      onRefresh: async () => {
        setRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
        }
      },
      colors: ['#2563EB'],
      tintColor: '#2563EB',
    };
  }, [refreshing]);

  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  }, []);

  const formatDate = useCallback((date: string): string => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, []);

  const formatDateTime = useCallback((date: string): string => {
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  return {
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
    formatDateTime,
  };
};

export const useExploreUI = () => {
  const [selectedDemo, setSelectedDemo] = useState(0);

  const demos = [
    {
      title: 'Crear un Grupo',
      description: 'Aprende cómo crear y gestionar grupos de gastos compartidos',
      icon: 'people-circle',
      color: '#2563EB',
      steps: [
        'Toca el botón "Nuevo Grupo"',
        'Agrega un nombre descriptivo',
        'Invita miembros por email',
        '¡Listo para empezar!',
      ],
    },
    {
      title: 'Agregar un Gasto',
      description: 'Descubre cómo registrar gastos y dividirlos automáticamente',
      icon: 'card',
      color: '#10B981',
      steps: [
        'Selecciona "Nuevo Gasto"',
        'Ingresa descripción y monto',
        'Elige cómo dividir (equitativo/personalizado)',
        'Los miembros reciben notificación',
      ],
    },
    {
      title: 'Resolver Conflictos',
      description: 'Sistema inteligente para manejar discrepancias automáticamente',
      icon: 'shield-checkmark',
      color: '#F59E0B',
      steps: [
        'Detecta discrepancias automáticamente',
        'Notifica a todos los involucrados',
        'Permite resolución colaborativa',
        'Mantiene historial de cambios',
      ],
    },
    {
      title: 'Modo Offline',
      description: 'Funciona perfectamente sin conexión a internet',
      icon: 'cloud-offline',
      color: '#3B82F6',
      steps: [
        'Todos los datos se guardan localmente',
        'Funciona sin internet',
        'Sincroniza al conectarse',
        'Resuelve conflictos automáticamente',
      ],
    },
  ];

  const features = [
    {
      title: 'Multi-plataforma',
      description: 'Disponible en iOS, Android y Web',
      icon: 'phone-portrait',
      value: '3 Plataformas',
    },
    {
      title: 'Tiempo Real',
      description: 'Sincronización instantánea entre dispositivos',
      icon: 'flash',
      value: '<1 seg',
    },
    {
      title: 'Seguridad',
      description: 'Encriptación end-to-end de todos tus datos',
      icon: 'lock-closed',
      value: '256-bit',
    },
    {
      title: 'Disponibilidad',
      description: 'Servicio confiable con alta disponibilidad',
      icon: 'checkmark-circle',
      value: '99.9%',
    },
  ];

  const handleDemoSelection = useCallback((index: number) => {
    setSelectedDemo(index);
  }, []);

  const startDemo = useCallback(() => {
    Alert.alert(
      'Demo Interactiva',
      `¿Te gustaría ver cómo ${demos[selectedDemo].title.toLowerCase()}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí, ver demo', onPress: () => Alert.alert('Demo en desarrollo', 'Esta funcionalidad estará disponible pronto') },
      ]
    );
  }, [selectedDemo, demos]);

  return {
    selectedDemo,
    demos,
    features,
    handleDemoSelection,
    startDemo,
  };
};
