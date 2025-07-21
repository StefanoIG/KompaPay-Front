import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
  TextInput,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import { useAuth } from '../../hooks/useAuth';
import { useGroups } from '../../hooks/useGroups';
import { useExpenses } from '../../hooks/useExpenses';
import { GlobalStyles, ComponentStyles, KompaColors, FontSizes, Spacing, BorderRadius, Shadows } from '../../constants/Styles';
import { Grupo, Gasto } from '../../hooks/types';
import { formatCurrencyOptional } from '../../utils/formatters';

export default function TabIndexScreen() {
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
    findUserByPublicId 
  } = useGroups();
  const { 
    myExpenses,
    groupedExpenses,
    debts,
    debtsSummary,
    loading: expensesLoading,
    error: expensesError,
    success: expensesSuccess,
    fetchMyExpenses, 
    fetchGroupExpenses,
    createExpense,
    fetchMyDebts 
  } = useExpenses();

  const [activeTab, setActiveTab] = useState<'overview' | 'groups' | 'expenses' | 'profile'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [showCreateExpense, setShowCreateExpense] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Grupo | null>(null);
  const [showQuickNavigation, setShowQuickNavigation] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Estados para crear gasto
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [divisionType, setDivisionType] = useState<'equitativa' | 'porcentaje' | 'personalizada'>('equitativa');

  // Animaciones
  const pulseAnim = useSharedValue(1);
  const fadeAnim = useSharedValue(0);

  useEffect(() => {
    // Inicializar datos
    loadInitialData();
    
    // Animaciones
    fadeAnim.value = withSpring(1);
    pulseAnim.value = withRepeat(
      withSequence(
        withSpring(1.05),
        withSpring(1)
      ),
      -1,
      true
    );
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

  // Función para validar y formatear el monto
  const handleAmountChange = (text: string) => {
    // Remover cualquier caracter que no sea número o punto decimal
    let cleanedText = text.replace(/[^0-9.]/g, '');
    
    // Asegurar que solo haya un punto decimal
    const parts = cleanedText.split('.');
    if (parts.length > 2) {
      cleanedText = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limitar a 2 decimales
    if (parts[1] && parts[1].length > 2) {
      cleanedText = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    // No permitir que empiece con punto
    if (cleanedText.startsWith('.')) {
      cleanedText = '0' + cleanedText;
    }
    
    // No permitir múltiples ceros al inicio
    if (cleanedText.match(/^0+\d/)) {
      cleanedText = cleanedText.replace(/^0+/, '');
    }
    
    setExpenseAmount(cleanedText);
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
      // Crear el objeto con el formato que espera el backend
      const now = new Date().toISOString().slice(0, 19).replace('T', ' '); // Formato: Y-m-d H:i:s
      
      // Generar un ID público único para el gasto
      const generatePublicId = () => {
        return Math.random().toString(36).substr(2, 8).toUpperCase();
      };
      
      await createExpense({
        grupo_id: selectedGroup.id,
        descripcion: expenseDescription.trim(),
        monto_total: amount, // Cambié de 'monto' a 'monto_total'
        pagado_por: user?.id || '', // Usuario que pagó
        id_publico: generatePublicId(), // Generar ID público único
        participantes: [{ 
          id_usuario: user?.id || '', // Cambié de 'user_id' a 'id_usuario'
          monto_proporcional: amount 
        }],
        estado_pago: 'pendiente', // Estado por defecto
        ultima_modificacion: now, // Fecha actual en formato correcto
        modificado_por: user?.id || '', // Usuario que creó/modificó
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
    console.log('Logout button pressed'); // Debug log
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: () => {
            console.log('Logout confirmed, executing immediately...'); // Debug log
            
            // Función asíncrona separada para manejar el logout
            const performLogout = async () => {
              try {
                console.log('Starting logout process...'); // Debug log
                
                // Intentar logout con timeout
                const logoutPromise = logout();
                const timeoutPromise = new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Logout timeout')), 5000)
                );
                
                await Promise.race([logoutPromise, timeoutPromise]);
                
                console.log('Logout completed successfully'); // Debug log
              } catch (error) {
                console.log('Logout failed or timed out, forcing logout...', error); // Debug log
              } finally {
                // Siempre redirigir al final
                console.log('Redirecting to login...'); // Debug log
                router.replace('/(auth)/login');
              }
            };
            
            // Ejecutar inmediatamente sin await para no bloquear el UI
            performLogout();
          }
        }
      ]
    );
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ scale: fadeAnim.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const renderOverview = () => (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header de bienvenida con flecha de navegación */}
      <Animated.View style={[ComponentStyles.card, animatedCardStyle]}>
        <LinearGradient
          colors={[KompaColors.primary, KompaColors.secondary]}
          style={[styles.gradientCard]}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.h2, { color: 'white', marginBottom: 4 }]}>
                ¡Hola {user?.nombre}! 👋
              </Text>
              <Text style={[styles.body, { color: 'rgba(255,255,255,0.8)' }]}>
                Gestiona tus gastos compartidos fácilmente
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Estadísticas rápidas */}
      <View style={styles.statsContainer}>
        <Animated.View style={[styles.statCard, animatedCardStyle]}>
          <Ionicons name="people" size={24} color={KompaColors.primary} />
          <Text style={styles.h3}>{groups?.length || 0}</Text>
          <Text style={styles.caption}>Grupos</Text>
        </Animated.View>
        
        <Animated.View style={[styles.statCard, animatedCardStyle]}>
          <Ionicons name="receipt" size={24} color={KompaColors.secondary} />
          <Text style={styles.h3}>{myExpenses?.length || 0}</Text>
          <Text style={styles.caption}>Gastos</Text>
        </Animated.View>
        
        <Animated.View style={[styles.statCard, animatedCardStyle]}>
          <Ionicons name="cash" size={24} color={KompaColors.warning} />
          <Text style={styles.h3}>
            {formatCurrencyOptional(debtsSummary?.resumen?.total_deudas || 0)}
          </Text>
          <Text style={styles.caption}>Deudas</Text>
        </Animated.View>
      </View>

      {/* Acciones rápidas */}
      <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
        <Text style={[styles.h3, { marginBottom: 12 }]}>Acciones Rápidas</Text>
        
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => setShowCreateGroup(true)}
          >
            <Ionicons name="add-circle" size={32} color={KompaColors.primary} />
            <Text style={styles.bodyBold}>Crear Grupo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => setShowJoinGroup(true)}
          >
            <Ionicons name="enter" size={32} color={KompaColors.secondary} />
            <Text style={styles.bodyBold}>Unirse a Grupo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => {
              if (groups && groups.length > 0) {
                setSelectedGroup(groups[0]);
                setShowCreateExpense(true);
              } else {
                Alert.alert('Info', 'Primero debes crear o unirte a un grupo');
              }
            }}
          >
            <Ionicons name="add" size={32} color={KompaColors.warning} />
            <Text style={styles.bodyBold}>Nuevo Gasto</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => router.push('/(tabs)/reportes')}
          >
            <Ionicons name="analytics" size={32} color={KompaColors.info} />
            <Text style={styles.bodyBold}>Ver Reportes</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Grupos recientes */}
      {groups && groups.length > 0 && (
        <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
          <Text style={[styles.h3, { marginBottom: 12 }]}>Mis Grupos</Text>
          {groups.slice(0, 3).map((group, index) => (
            <TouchableOpacity
              key={group.id}
              style={[ComponentStyles.card, { marginBottom: 8, marginHorizontal: 0 }]}
              onPress={() => {
                setSelectedGroup(group);
                setActiveTab('groups');
              }}
            >
              <View style={styles.groupItemHeader}>
                <View style={styles.groupInfo}>
                  <Text style={styles.bodyBold}>{group.nombre}</Text>
                  <Text style={styles.caption}>
                    ID: {group.id_publico}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={KompaColors.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderGroups = () => (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={{ margin: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={styles.h2}>Mis Grupos</Text>
          <TouchableOpacity
            style={ComponentStyles.button}
            onPress={() => setShowCreateGroup(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {groupsLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.body}>Cargando grupos...</Text>
          </View>
        ) : (!groups || groups.length === 0) ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={KompaColors.textSecondary} />
            <Text style={[styles.h3, { marginTop: 16, marginBottom: 8 }]}>
              No tienes grupos aún
            </Text>
            <Text style={styles.emptyStateText}>
              Crea un nuevo grupo o únete a uno existente para comenzar a compartir gastos
            </Text>
            <TouchableOpacity
              style={ComponentStyles.button}
              onPress={() => setShowCreateGroup(true)}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Crear mi primer grupo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          Array.isArray(groups) ? groups.map((group) => (
            <Animated.View
              key={group.id}
              style={[ComponentStyles.card, animatedCardStyle, { marginBottom: 12, marginVertical: 0 }]}
            >
              <View style={styles.groupItemHeader}>
                <View style={styles.groupInfo}>
                  <Text style={styles.bodyBold}>{group.nombre}</Text>
                  <Text style={styles.caption}>
                    Creado: {new Date(group.fecha_creacion).toLocaleDateString()}
                  </Text>
                  <Text style={[styles.caption, { color: KompaColors.primary }]}>
                    Código: {group.id_publico}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={{ padding: 8 }}
                    onPress={() => {
                      setSelectedGroup(group);
                      setShowCreateExpense(true);
                    }}
                  >
                    <Ionicons name="add" size={20} color={KompaColors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ padding: 8 }}
                    onPress={() => {
                      // Ver detalles del grupo
                      Alert.alert('Info', `Grupo: ${group.nombre}\nCódigo: ${group.id_publico}`);
                    }}
                  >
                    <Ionicons name="information-circle" size={20} color={KompaColors.secondary} />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          )) : null
        )}
      </View>
    </ScrollView>
  );

  const renderExpenses = () => (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={{ margin: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={styles.h2}>Mis Gastos</Text>
          <TouchableOpacity
            style={ComponentStyles.button}
            onPress={() => {
              if (groups && groups.length > 0) {
                setSelectedGroup(groups[0]);
                setShowCreateExpense(true);
              } else {
                Alert.alert('Info', 'Primero debes crear o unirte a un grupo');
              }
            }}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {expensesLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.body}>Cargando gastos...</Text>
          </View>
        ) : (!myExpenses || myExpenses.length === 0) && (!groupedExpenses || groupedExpenses.length === 0) ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={KompaColors.textSecondary} />
            <Text style={[styles.h3, { marginTop: 16, marginBottom: 8 }]}>
              No tienes gastos registrados
            </Text>
            <Text style={styles.emptyStateText}>
              Crea tu primer gasto para comenzar a dividir costos con tu grupo
            </Text>
            <TouchableOpacity
              style={ComponentStyles.button}
              onPress={() => {
                if (groups && groups.length > 0) {
                  setSelectedGroup(groups[0]);
                  setShowCreateExpense(true);
                } else {
                  Alert.alert('Info', 'Primero debes crear o unirte a un grupo');
                }
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Crear mi primer gasto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          Array.isArray(groupedExpenses) && groupedExpenses.length > 0 ? (
            groupedExpenses.map((grupoGastos) => {
              const isExpanded = expandedGroups.has(grupoGastos.grupo.id.toString());
              
              return (
                <View key={grupoGastos.grupo.id} style={{ marginBottom: 24 }}>
                  {/* Header del grupo - clickeable para expandir/colapsar */}
                  <TouchableOpacity 
                    style={[ComponentStyles.card, { marginBottom: 12, backgroundColor: KompaColors.primary }]}
                    onPress={() => {
                      const newExpandedGroups = new Set(expandedGroups);
                      const groupId = grupoGastos.grupo.id.toString();
                      if (newExpandedGroups.has(groupId)) {
                        newExpandedGroups.delete(groupId);
                      } else {
                        newExpandedGroups.add(groupId);
                      }
                      setExpandedGroups(newExpandedGroups);
                    }}
                  >
                    <View style={styles.groupHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.bodyBold, { color: 'white' }]}>{grupoGastos.grupo.nombre}</Text>
                        <Text style={[styles.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                          {grupoGastos.totalGastos} gasto{grupoGastos.totalGastos !== 1 ? 's' : ''}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Text style={[styles.h3, { color: 'white' }]}>
                          ${grupoGastos.montoTotal.toFixed(2)}
                        </Text>
                        <Ionicons 
                          name={isExpanded ? "chevron-up" : "chevron-down"} 
                          size={24} 
                          color="white" 
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                  
                  {/* Gastos del grupo - solo se muestran si está expandido */}
                  {isExpanded && grupoGastos.gastos.map((expense) => (
                    <Animated.View
                      key={expense.id}
                      style={[ComponentStyles.card, animatedCardStyle, { marginBottom: 8, marginVertical: 0, marginLeft: 16 }]}
                    >
                      <View style={styles.expenseHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.bodyBold}>{expense.descripcion}</Text>
                          <Text style={styles.caption}>
                            {new Date(expense.fecha_creacion).toLocaleDateString()}
                          </Text>
                          <Text style={[styles.caption, { color: KompaColors.primary }]}>
                            División: {expense.tipo_division || 'equitativa'}
                          </Text>
                          {expense.pagador && (
                            <Text style={[styles.caption, { color: KompaColors.textSecondary }]}>
                              Pagado por: {expense.pagador.nombre}
                            </Text>
                          )}
                          {expense.pivot && (
                            <Text style={[styles.caption, { 
                              color: expense.pivot.pagado ? KompaColors.success : KompaColors.warning 
                            }]}>
                              Tu parte: ${expense.pivot.monto_proporcional.toFixed(2)} - {expense.pivot.pagado ? 'Pagado' : 'Pendiente'}
                            </Text>
                          )}
                        </View>
                        <View>
                          <Text style={styles.expenseAmount}>
                            ${parseFloat(expense.monto.toString()).toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    </Animated.View>
                  ))}
                </View>
              );
            })
          ) : (
            Array.isArray(myExpenses) ? myExpenses.map((expense) => (
              <Animated.View
                key={expense.id}
                style={[ComponentStyles.card, animatedCardStyle, { marginBottom: 12, marginVertical: 0 }]}
              >
                <View style={styles.expenseHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bodyBold}>{expense.descripcion}</Text>
                    <Text style={styles.caption}>
                      {new Date(expense.fecha_creacion).toLocaleDateString()}
                    </Text>
                    <Text style={[styles.caption, { color: KompaColors.primary }]}>
                      División: {expense.tipo_division || 'equitativa'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.expenseAmount}>
                      ${parseFloat(expense.monto.toString()).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            )) : null
          )
        )}

        {/* Resumen de deudas */}
        {debtsSummary?.deudas && debtsSummary.deudas.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.h3, { marginBottom: 12 }]}>Resumen de Deudas</Text>
            {debtsSummary.deudas.slice(0, 5).map((debt, index: number) => (
              <View key={debt.gasto_id} style={[ComponentStyles.card, { marginBottom: 8, marginVertical: 0 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bodyBold}>{debt.descripcion}</Text>
                    <Text style={styles.caption}>Pagado por: {debt.pagado_por}</Text>
                    <Text style={styles.caption}>{debt.grupo}</Text>
                  </View>
                  <Text style={[styles.h3, { color: KompaColors.error }]}>
                    -{formatCurrencyOptional(debt.monto_adeudado)}
                  </Text>
                </View>
              </View>
            ))}
            {debtsSummary.deudas.length > 5 && (
              <Text style={[styles.caption, { textAlign: 'center', marginTop: 8 }]}>
                Y {debtsSummary.deudas.length - 5} deuda{debtsSummary.deudas.length - 5 > 1 ? 's' : ''} más...
              </Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderProfile = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ margin: 16 }}>
        <Animated.View style={[ComponentStyles.card, animatedCardStyle, { marginVertical: 0 }]}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: KompaColors.primary }}>
                {user?.nombre?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.profileName}>{user?.nombre}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <Text style={styles.caption}>
              ID: {user?.id_publico}
            </Text>
          </View>
        </Animated.View>

        <View style={styles.profileOptions}>
          <TouchableOpacity
            style={styles.profileOption}
            onPress={() => {
              console.log('Edit profile pressed'); // Debug log
              Alert.alert(
                'Editar Perfil', 
                'Esta función estará disponible en una próxima actualización.\n\nPor ahora puedes ver tu información básica en esta pantalla.',
                [{ text: 'Entendido', style: 'default' }]
              );
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="person" size={24} color={KompaColors.primary} />
            <Text style={styles.profileOptionText}>Editar Perfil</Text>
            <Ionicons name="chevron-forward" size={20} color={KompaColors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileOption}
            onPress={() => {
              console.log('Notifications pressed'); // Debug log
              Alert.alert(
                'Notificaciones', 
                'La configuración de notificaciones estará disponible próximamente.\n\nActualmente recibirás notificaciones importantes automáticamente.',
                [{ text: 'Entendido', style: 'default' }]
              );
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications" size={24} color={KompaColors.secondary} />
            <Text style={styles.profileOptionText}>Notificaciones</Text>
            <Ionicons name="chevron-forward" size={20} color={KompaColors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileOption}
            onPress={() => {
              console.log('Settings pressed'); // Debug log
              Alert.alert(
                'Configuración', 
                'Las opciones de configuración estarán disponibles próximamente.\n\nIncluirán temas, idioma y preferencias de la app.',
                [{ text: 'Entendido', style: 'default' }]
              );
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="settings" size={24} color={KompaColors.info} />
            <Text style={styles.profileOptionText}>Configuración</Text>
            <Ionicons name="chevron-forward" size={20} color={KompaColors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.profileOption, styles.logoutButton]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out" size={24} color="white" />
            <Text style={[styles.profileOptionText, styles.logoutText]}>Cerrar Sesión</Text>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'groups': return renderGroups();
      case 'expenses': return renderExpenses();
      case 'profile': return renderProfile();
      default: return renderOverview();
    }
  };

  return (
    <View style={styles.container}>
      {/* Contenido principal */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>

      {/* Navegación inferior */}
      <View style={styles.tabBarContainer}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('overview')}
        >
          <Ionicons 
            name={activeTab === 'overview' ? 'home' : 'home-outline'} 
            size={24} 
            color={activeTab === 'overview' ? KompaColors.primary : KompaColors.textSecondary} 
            style={styles.tabIcon}
          />
          <Text style={[styles.tabText, { color: activeTab === 'overview' ? KompaColors.primary : KompaColors.textSecondary }]}>
            Inicio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('groups')}
        >
          <Ionicons 
            name={activeTab === 'groups' ? 'people' : 'people-outline'} 
            size={24} 
            color={activeTab === 'groups' ? KompaColors.primary : KompaColors.textSecondary} 
            style={styles.tabIcon}
          />
          <Text style={[styles.tabText, { color: activeTab === 'groups' ? KompaColors.primary : KompaColors.textSecondary }]}>
            Grupos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('expenses')}
        >
          <Ionicons 
            name={activeTab === 'expenses' ? 'receipt' : 'receipt-outline'} 
            size={24} 
            color={activeTab === 'expenses' ? KompaColors.primary : KompaColors.textSecondary} 
            style={styles.tabIcon}
          />
          <Text style={[styles.tabText, { color: activeTab === 'expenses' ? KompaColors.primary : KompaColors.textSecondary }]}>
            Gastos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons 
            name={activeTab === 'profile' ? 'person' : 'person-outline'} 
            size={24} 
            color={activeTab === 'profile' ? KompaColors.primary : KompaColors.textSecondary} 
            style={styles.tabIcon}
          />
          <Text style={[styles.tabText, { color: activeTab === 'profile' ? KompaColors.primary : KompaColors.textSecondary }]}>
            Perfil
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal Crear Grupo */}
      <Modal
        visible={showCreateGroup}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateGroup(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 20 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 20 }}>
            <Text style={[styles.h3, { marginBottom: 20 }]}>Crear Nuevo Grupo</Text>
            
            <TextInput
              style={{ borderWidth: 1, borderColor: KompaColors.border, borderRadius: 8, padding: 12, marginBottom: 20 }}
              placeholder="Nombre del grupo"
              value={groupName}
              onChangeText={setGroupName}
              maxLength={50}
            />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
              <TouchableOpacity
                style={[ComponentStyles.buttonSecondary, { flex: 1 }]}
                onPress={() => {
                  setShowCreateGroup(false);
                  setGroupName('');
                }}
              >
                <Text style={{ color: KompaColors.textPrimary, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[ComponentStyles.button, { flex: 1, opacity: groupName.trim() ? 1 : 0.5 }]}
                onPress={handleCreateGroup}
                disabled={!groupName.trim()}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Unirse a Grupo */}
      <Modal
        visible={showJoinGroup}
        transparent
        animationType="slide"
        onRequestClose={() => setShowJoinGroup(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 20 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 20 }}>
            <Text style={[styles.h3, { marginBottom: 20 }]}>Unirse a Grupo</Text>
            
            <TextInput
              style={{ borderWidth: 1, borderColor: KompaColors.border, borderRadius: 8, padding: 12, marginBottom: 20 }}
              placeholder="Código del grupo"
              value={groupCode}
              onChangeText={setGroupCode}
              autoCapitalize="none"
              maxLength={20}
            />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
              <TouchableOpacity
                style={[ComponentStyles.buttonSecondary, { flex: 1 }]}
                onPress={() => {
                  setShowJoinGroup(false);
                  setGroupCode('');
                }}
              >
                <Text style={{ color: KompaColors.textPrimary, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[ComponentStyles.button, { flex: 1, opacity: groupCode.trim() ? 1 : 0.5 }]}
                onPress={handleJoinGroup}
                disabled={!groupCode.trim()}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Unirse</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Crear Gasto */}
      <Modal
        visible={showCreateExpense}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateExpense(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 20 }}>
          <ScrollView style={{ maxHeight: '80%' }}>
            <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 20 }}>
              <Text style={[styles.h3, { marginBottom: 20 }]}>Nuevo Gasto</Text>
              
              {selectedGroup && (
                <Text style={[styles.body, { marginBottom: 16, color: KompaColors.primary }]}>
                  Grupo: {selectedGroup.nombre}
                </Text>
              )}
              
              <TextInput
                style={{ borderWidth: 1, borderColor: KompaColors.border, borderRadius: 8, padding: 12, marginBottom: 16 }}
                placeholder="Descripción del gasto"
                value={expenseDescription}
                onChangeText={setExpenseDescription}
                maxLength={100}
              />
              
              <TextInput
                style={{ borderWidth: 1, borderColor: KompaColors.border, borderRadius: 8, padding: 12, marginBottom: 16 }}
                placeholder="Monto ($)"
                value={expenseAmount}
                onChangeText={handleAmountChange}
                keyboardType="decimal-pad"
              />
              
              <Text style={[styles.bodyBold, { marginTop: 16, marginBottom: 8 }]}>
                Tipo de División:
              </Text>
              
              <View style={{ marginBottom: 20 }}>
                {[
                  { key: 'equitativa', label: 'Equitativa' },
                  { key: 'porcentaje', label: 'Por Porcentaje' },
                  { key: 'personalizada', label: 'Personalizada' }
                ].map(type => (
                  <TouchableOpacity
                    key={type.key}
                    style={{
                      padding: 12,
                      borderWidth: 1,
                      borderColor: divisionType === type.key ? KompaColors.primary : KompaColors.border,
                      backgroundColor: divisionType === type.key ? KompaColors.primaryLight : 'white',
                      borderRadius: 8,
                      marginBottom: 8
                    }}
                    onPress={() => setDivisionType(type.key as any)}
                  >
                    <Text style={{
                      color: divisionType === type.key ? KompaColors.primary : KompaColors.textPrimary,
                      fontWeight: divisionType === type.key ? '600' : 'normal'
                    }}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                <TouchableOpacity
                  style={[ComponentStyles.buttonSecondary, { flex: 1 }]}
                  onPress={() => {
                    setShowCreateExpense(false);
                    setExpenseDescription('');
                    setExpenseAmount('');
                    setSelectedGroup(null);
                  }}
                >
                  <Text style={{ color: KompaColors.textPrimary, fontWeight: '600' }}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[ComponentStyles.button, { 
                    flex: 1,
                    opacity: expenseDescription.trim() && expenseAmount.trim() && parseFloat(expenseAmount) > 0 ? 1 : 0.5 
                  }]}
                  onPress={handleCreateExpense}
                  disabled={!expenseDescription.trim() || !expenseAmount.trim() || parseFloat(expenseAmount) <= 0 || isNaN(parseFloat(expenseAmount))}
                >
                  <Text style={{ color: 'white', fontWeight: '600' }}>Crear</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  gradientCard: {
    padding: 20,
    borderRadius: 12,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  body: {
    fontSize: 16,
    color: '#666',
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  caption: {
    fontSize: 12,
    color: '#999',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  groupItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupInfo: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyStateText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyStateSubtext: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  groupItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupMembers: {
    fontSize: 14,
    color: '#666',
  },
  expenseItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  expenseGroup: {
    fontSize: 14,
    color: '#666',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
  },
  profileOptions: {
    marginTop: 20,
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  profileOptionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    borderWidth: 0,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
  },
  quickNavigationContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  quickNavigationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  quickNavButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeQuickNavButton: {
    backgroundColor: KompaColors.primary,
    borderColor: KompaColors.primaryDark,
  },
  quickNavText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  globalQuickNavigationContainer: {
    position: 'absolute',
    bottom: 70, // Aparece justo arriba de la barra de navegación
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
