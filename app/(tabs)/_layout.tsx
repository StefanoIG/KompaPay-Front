// app/(tabs)/_layout.tsx

import React, { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { KompaColors } from '@/constants/Styles';
import { useAuthContext } from '@/providers/AuthProvider'; // 1. Importar el contexto de Auth

export default function TabLayout() {
  const [showQuickNavigation, setShowQuickNavigation] = useState(false);
  const router = useRouter();
  const { logout } = useAuthContext(); // 2. Obtener la función de logout

  // He movido el menú a su propio componente para mayor claridad
  const QuickNavigationMenu = () => {
    const handleNavigate = (path: string) => {
      router.push(path as any);
      setShowQuickNavigation(false);
    };

    const handleLogout = () => {
      logout();
      // El AuthProvider se encargará de la redirección
      setShowQuickNavigation(false);
    };

    return (
      <View style={styles.quickNavigationContainer}>
        <View style={styles.quickNavigationGrid}>
          {/* 3. Añadida la navegación real a cada botón */}
          <TouchableOpacity style={styles.quickNavButton} onPress={() => handleNavigate('/(tabs)/dashboard')}>
            <Ionicons name="home" size={20} color={KompaColors.primary} />
            <Text style={styles.quickNavText}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickNavButton} onPress={() => handleNavigate('/(tabs)/reportes')}>
            <Ionicons name="analytics" size={20} color={KompaColors.info} />
            <Text style={styles.quickNavText}>Reportes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickNavButton} onPress={() => handleNavigate('/colaboracion/tablero_tareas')}>
            <Ionicons name="albums" size={20} color={KompaColors.secondary} />
            <Text style={styles.quickNavText}>Tableros</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickNavButton} onPress={() => handleNavigate('/colaboracion/tablero_tareas')}>
            <Ionicons name="albums-outline" size={20} color={KompaColors.secondary} />
            <Text style={styles.quickNavText}>Tableros</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickNavButton} onPress={() => handleNavigate('/colaboracion/notas')}>
            <Ionicons name="document-text-outline" size={20} color={KompaColors.warning} />
            <Text style={styles.quickNavText}>Notas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickNavButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color={KompaColors.error} />
            <Text style={styles.quickNavText}>Cerrar Sesión</Text>
          </TouchableOpacity>

        </View>
      </View>
    );
  };

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: KompaColors.primary,
          tabBarInactiveTintColor: KompaColors.textSecondary,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: { position: 'absolute', backgroundColor: 'transparent' },
            default: { backgroundColor: KompaColors.background, borderTopColor: KompaColors.gray200 },
          }),
        }}
      >
        {/* 4. La pestaña principal ahora es el dashboard refactorizado */}
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color, focused }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <IconSymbol size={28} name={focused ? 'house.fill' : 'house'} color={color} />
                {Platform.OS === 'web' && (
                  <TouchableOpacity
                    onPress={() => setShowQuickNavigation(!showQuickNavigation)}
                    style={{ padding: 2 }}
                  >
                    <Text style={{ fontSize: 16, color, transform: [{ rotate: showQuickNavigation ? '180deg' : '0deg' }] }}>⏷</Text>
                  </TouchableOpacity>
                )}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="reportes"
          options={{
            title: 'Reportes',
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol size={28} name={focused ? 'chart.bar.fill' : 'chart.bar'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explorar',
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol size={28} name={focused ? 'sparkles' : 'sparkles'} color={color} />
            ),
          }}
        />

        {/* 5. Ocultar la pantalla 'index' y otras que no queramos en la barra de pestañas */}
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="explore2" options={{ href: null }} />
        <Tabs.Screen name="dashboard" options={{ href: null }} />
        <Tabs.Screen name="explore_refactored" options={{ href: null }} />

      </Tabs>
      {Platform.OS === 'web' && showQuickNavigation && <QuickNavigationMenu />}
    </>
  );
}

const styles = StyleSheet.create({
  quickNavigationContainer: {
    position: 'absolute',
    bottom: 70,
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
  quickNavText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
    color: '#1a1a1a',
  },
});
