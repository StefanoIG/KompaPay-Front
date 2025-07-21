import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { Platform, View, TouchableOpacity, Text, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { KompaColors } from '@/constants/Styles';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [showQuickNavigation, setShowQuickNavigation] = useState(false);

  const QuickNavigationMenu = () => (
    showQuickNavigation && (
      <View style={styles.quickNavigationContainer}>
        <View style={styles.quickNavigationGrid}>
          <TouchableOpacity 
            style={styles.quickNavButton}
            onPress={() => {
              // Navegar a Dashboard
              setShowQuickNavigation(false);
            }}
          >
            <Ionicons name="home" size={20} color={KompaColors.primary} />
            <Text style={styles.quickNavText}>Dashboard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickNavButton}
            onPress={() => {
              // Navegar a Grupos  
              setShowQuickNavigation(false);
            }}
          >
            <Ionicons name="people" size={20} color={KompaColors.secondary} />
            <Text style={styles.quickNavText}>Grupos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickNavButton}
            onPress={() => {
              // Navegar a Gastos
              setShowQuickNavigation(false);
            }}
          >
            <Ionicons name="receipt" size={20} color={KompaColors.warning} />
            <Text style={styles.quickNavText}>Gastos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickNavButton}
            onPress={() => {
              // Navegar a Perfil
              setShowQuickNavigation(false);
            }}
          >
            <Ionicons name="person" size={20} color={KompaColors.info} />
            <Text style={styles.quickNavText}>Perfil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickNavButton}
            onPress={() => {
              // Cerrar sesión
              setShowQuickNavigation(false);
            }}
          >
            <Ionicons name="log-out" size={20} color={KompaColors.error} />
            <Text style={styles.quickNavText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  );

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
            ios: {
              position: 'absolute',
              backgroundColor: 'transparent',
            },
            default: {
              backgroundColor: KompaColors.background,
              borderTopColor: KompaColors.gray200,
              borderTopWidth: 1,
            },
          }),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, focused }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <IconSymbol size={28} name={focused ? 'house.fill' : 'house'} color={color} />
                <TouchableOpacity
                  onPress={() => setShowQuickNavigation(!showQuickNavigation)}
                  style={{ padding: 2 }}
                >
                  <Text style={{ fontSize: 16, color }}>⏷</Text>
                </TouchableOpacity>
              </View>
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
      </Tabs>
      <QuickNavigationMenu />
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
