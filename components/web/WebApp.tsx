import LoginNew from '@/app/(auth)/login_new';
import { WebLayout } from '@/components/layout/WebLayout';
import { useAuth } from '@/hooks/useAuth';
import { useWebNavigation } from '@/hooks/useWebNavigation';
import { tabsStyles } from '@/styles/tabs.styles';
import React, { useEffect } from 'react';
import { Platform, Text, View } from 'react-native';

// Importar componentes refactorizados
import DashboardRefactored from '@/app/(tabs)/dashboard_refactored';
import ExploreRefactored from '@/app/(tabs)/explore_refactored';

// Componentes temporales para las rutas que aún no están refactorizadas
const GroupsComponent = () => (
  <View style={[tabsStyles.container, { padding: 20 }]}>
    <Text style={tabsStyles.headerTitle}>Mis Grupos</Text>
    <Text style={tabsStyles.headerSubtitle}>
      Gestiona tus grupos de gastos compartidos
    </Text>
  </View>
);

const ExpensesComponent = () => (
  <View style={[tabsStyles.container, { padding: 20 }]}>
    <Text style={tabsStyles.headerTitle}>Mis Gastos</Text>
    <Text style={tabsStyles.headerSubtitle}>
      Revisa y gestiona todos tus gastos
    </Text>
  </View>
);

const ProfileComponent = () => (
  <View style={[tabsStyles.container, { padding: 20 }]}>
    <Text style={tabsStyles.headerTitle}>Mi Perfil</Text>
    <Text style={tabsStyles.headerSubtitle}>
      Configuración de cuenta y preferencias
    </Text>
  </View>
);

export const WebApp: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const { currentRoute, navigateTo, getRouteTitle } = useWebNavigation();

  // Estado para manejar la hidratación inicial en web
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Marcar como hidratado después del primer render en web
  useEffect(() => {
    if (Platform.OS === 'web') {
      setIsHydrated(true);
    }
  }, []);

  // Actualizar el título de la página
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined' && isHydrated) {
      document.title = `${getRouteTitle(currentRoute)} - KompaPay`;
    }
  }, [currentRoute, getRouteTitle, isHydrated]);

  // Redirigir a auth si no está autenticado
  useEffect(() => {
    console.log('WebApp - Auth status:', { isAuthenticated, loading, currentRoute });
    if (!loading && !isAuthenticated && currentRoute !== 'auth') {
      navigateTo('auth');
    } else if (!loading && isAuthenticated && currentRoute === 'auth') {
      navigateTo('dashboard');
    }
  }, [isAuthenticated, loading, currentRoute, navigateTo]);

  // Mostrar loading mientras se carga la autenticación o no está hidratado
  if (loading || (Platform.OS === 'web' && !isHydrated)) {
    return (
      <View style={[tabsStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={tabsStyles.headerTitle}>Cargando...</Text>
      </View>
    );
  }

  // Mostrar pantalla de autenticación si no está logueado
  if (!isAuthenticated || currentRoute === 'auth') {
    return (
      <LoginNew onAuthSuccess={() => navigateTo('dashboard')} />
    );
  }

  // Renderizar el contenido según la ruta actual
  const renderCurrentRoute = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <DashboardRefactored />;
      case 'groups':
        return <GroupsComponent />;
      case 'expenses':
        return <ExpensesComponent />;
      case 'explore':
        return <ExploreRefactored />;
      case 'profile':
        return <ProfileComponent />;
      default:
        return <DashboardRefactored />;
    }
  };

  return (
    <WebLayout
      activeRoute={currentRoute}
      onNavigate={navigateTo}
    >
      {renderCurrentRoute()}
    </WebLayout>
  );
};
