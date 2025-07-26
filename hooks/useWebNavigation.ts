import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

export type WebRoute = 'dashboard' | 'groups' | 'expenses' | 'explore' | 'profile' | 'auth';

export const useWebNavigation = (initialRoute: WebRoute = 'dashboard') => {
  const [currentRoute, setCurrentRoute] = useState<WebRoute>(initialRoute);
  const [isWebPlatform] = useState(Platform.OS === 'web');

  const navigateTo = useCallback((route: WebRoute) => {
    if (isWebPlatform) {
      setCurrentRoute(route);
      // Actualizar la URL sin recargar la página
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', `/${route}`);
      }
    }
  }, [isWebPlatform]);

  const navigateBack = useCallback(() => {
    if (isWebPlatform && typeof window !== 'undefined') {
      window.history.back();
    }
  }, [isWebPlatform]);

  const getRouteTitle = useCallback((route: WebRoute): string => {
    const titles: Record<WebRoute, string> = {
      dashboard: 'Dashboard',
      groups: 'Mis Grupos',
      expenses: 'Mis Gastos',
      explore: 'Explorar KompaPay',
      profile: 'Mi Perfil',
      auth: 'Autenticación',
    };
    return titles[route] || 'KompaPay';
  }, []);

  const isCurrentRoute = useCallback((route: WebRoute): boolean => {
    return currentRoute === route;
  }, [currentRoute]);

  return {
    currentRoute,
    isWebPlatform,
    navigateTo,
    navigateBack,
    getRouteTitle,
    isCurrentRoute,
  };
};
