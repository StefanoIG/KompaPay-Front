// src/components/navigation/Sidebar.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { KompaColors } from '@/constants/Styles';
import { useAuthContext } from '@/providers/AuthProvider';

// Definimos los elementos de navegación
const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: "home-outline" },
    { name: "Grupos", href: "/groups", icon: "people-outline" },
    { name: "Explorar", href: "/explore", icon: "sparkles-outline" },
    { name: "Reportes", href: "/reportes", icon: "stats-chart-outline" },
    { name: "Tableros", href: "/boards", icon: "grid-outline" },
];

interface NavigationItem {
    name: string;
    href: string;
    icon: string;
}

interface NavItemProps {
    item: NavigationItem;
    isActive: boolean;
}

const NavItem = ({ item, isActive }: NavItemProps) => (
    <Link href={item.href as any} asChild>
        <TouchableOpacity style={[styles.navItem, isActive && styles.navItemActive]}>
            <Ionicons 
                name={item.icon as any} 
                size={22} 
                color={isActive ? 'white' : KompaColors.textPrimary} 
            />
            <Text style={[styles.navText, isActive && styles.navTextActive]}>
                {item.name}
            </Text>
        </TouchableOpacity>
    </Link>
);

export const Sidebar = () => {
    const { user, logout } = useAuthContext();
    const segments = useSegments();
    // Construir la ruta actual
    const currentRoute = segments.length > 0 ? `/${segments[0]}` : '/';

    return (
        <View style={styles.sidebar}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logo}>
                    <Ionicons name="wallet" size={24} color="white" />
                </View>
                <Text style={styles.headerTitle}>KompaPay</Text>
            </View>

            {/* Navigation */}
            <View style={styles.nav}>
                {navigationItems.map((item) => (
                    <NavItem 
                        key={item.name} 
                        item={item} 
                        isActive={currentRoute === item.href} 
                    />
                ))}
            </View>

            {/* User Profile Section */}
            <View style={styles.footer}>
                <View style={styles.profile}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarFallback}>{user?.name?.charAt(0) || 'U'}</Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName} numberOfLines={1}>{user?.name}</Text>
                        <Text style={styles.profileEmail} numberOfLines={1}>{user?.email}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={logout}>
                    <Ionicons name="log-out-outline" size={24} color={KompaColors.error} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sidebar: {
        width: 280,
        backgroundColor: 'white',
        borderRightWidth: 1,
        borderRightColor: KompaColors.gray100,
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: KompaColors.gray100,
    },
    logo: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: KompaColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        marginLeft: 12,
        fontSize: 20,
        fontWeight: 'bold',
    },
    nav: {
        flex: 1,
        padding: 8,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 4,
    },
    navItemActive: {
        backgroundColor: KompaColors.primary,
    },
    navText: {
        marginLeft: 16,
        fontSize: 16,
        fontWeight: '500',
        color: KompaColors.textPrimary,
    },
    navTextActive: {
        color: 'white',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: KompaColors.gray100,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    profile: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: KompaColors.gray100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarFallback: {
        fontSize: 16,
        fontWeight: 'bold',
        color: KompaColors.primary,
    },
    profileInfo: {
        marginLeft: 12,
        flex: 1,
    },
    profileName: {
        fontWeight: 'bold',
    },
    profileEmail: {
        fontSize: 12,
        color: KompaColors.textSecondary,
    },
});