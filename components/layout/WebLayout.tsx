import { FontSizes, KompaColors, Spacing } from '@/constants/Styles';
import { useAuth } from '@/hooks/useAuth';
import { WebRoute } from '@/hooks/useWebNavigation';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WebLayoutProps {
  children: React.ReactNode;
  activeRoute: WebRoute;
  onNavigate: (route: WebRoute) => void;
}

export const WebLayout: React.FC<WebLayoutProps> = ({ 
  children, 
  activeRoute, 
  onNavigate 
}) => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'home-outline' },
    { id: 'groups', label: 'Grupos', icon: 'people-outline' },
    { id: 'expenses', label: 'Gastos', icon: 'card-outline' },
    { id: 'explore', label: 'Explorar', icon: 'compass-outline' },
    { id: 'profile', label: 'Perfil', icon: 'person-outline' },
  ];

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      {/* Navbar lateral */}
      <View style={[styles.navbar, isCollapsed && styles.navbarCollapsed]}>
        {/* Header del navbar */}
        <View style={styles.navHeader}>
          <TouchableOpacity
            style={styles.collapseButton}
            onPress={() => setIsCollapsed(!isCollapsed)}
          >
            <Ionicons 
              name={isCollapsed ? 'menu-outline' : 'close-outline'} 
              size={24} 
              color={KompaColors.textPrimary} 
            />
          </TouchableOpacity>
          
          {!isCollapsed && (
            <View style={styles.logoContainer}>
              <Text style={styles.logo}>KompaPay</Text>
              <Text style={styles.logoSubtitle}>Gestión de Gastos</Text>
            </View>
          )}
        </View>

        {/* Información del usuario */}
        {!isCollapsed && user && (
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color="white" />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.nombre}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>
        )}

        {/* Navegación */}
        <View style={styles.navigation}>
          {navigationItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.navItem,
                activeRoute === item.id && styles.navItemActive,
                isCollapsed && styles.navItemCollapsed,
              ]}
              onPress={() => onNavigate(item.id as WebRoute)}
            >
              <Ionicons
                name={item.icon as any}
                size={20}
                color={
                  activeRoute === item.id 
                    ? KompaColors.primary 
                    : KompaColors.textSecondary
                }
              />
              {!isCollapsed && (
                <Text
                  style={[
                    styles.navItemText,
                    activeRoute === item.id && styles.navItemTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer del navbar */}
        <View style={styles.navFooter}>
          <TouchableOpacity
            style={[styles.navItem, isCollapsed && styles.navItemCollapsed]}
            onPress={logout}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color={KompaColors.error}
            />
            {!isCollapsed && (
              <Text style={[styles.navItemText, { color: KompaColors.error }]}>
                Cerrar Sesión
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido principal */}
      <View style={styles.mainContent}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: KompaColors.background,
  },
  navbar: {
    width: 280,
    backgroundColor: KompaColors.surface,
    borderRightWidth: 1,
    borderRightColor: KompaColors.gray200,
    flexDirection: 'column',
    paddingVertical: Spacing.md,
  },
  navbarCollapsed: {
    width: 70,
  },
  navHeader: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: KompaColors.gray200,
    marginBottom: Spacing.lg,
  },
  collapseButton: {
    alignSelf: 'flex-end',
    padding: Spacing.sm,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  logo: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: KompaColors.primary,
    marginBottom: Spacing.xs,
  },
  logoSubtitle: {
    fontSize: FontSizes.sm,
    color: KompaColors.textSecondary,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: KompaColors.gray50,
    marginHorizontal: Spacing.md,
    borderRadius: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: KompaColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: KompaColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: FontSizes.sm,
    color: KompaColors.textSecondary,
  },
  navigation: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.xs,
  },
  navItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  navItemActive: {
    backgroundColor: KompaColors.primary + '15',
    borderLeftWidth: 3,
    borderLeftColor: KompaColors.primary,
  },
  navItemText: {
    fontSize: FontSizes.md,
    color: KompaColors.textSecondary,
    marginLeft: Spacing.md,
    fontWeight: '500',
  },
  navItemTextActive: {
    color: KompaColors.primary,
    fontWeight: '600',
  },
  navFooter: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: KompaColors.gray200,
  },
  mainContent: {
    flex: 1,
    backgroundColor: KompaColors.background,
  },
});
