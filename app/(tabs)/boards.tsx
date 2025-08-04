// app/(tabs)/boards.tsx
import React from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Text, Button } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTableros } from '@/hooks/useTableros';
import { BoardColumn } from '@/components/boards/BoardColumn';
import { KompaColors } from '@/constants/Styles';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BoardsScreen() {
    // Asumimos que el groupId se pasa como parámetro al navegar a esta pantalla
    const { groupId } = useLocalSearchParams<{ groupId: string }>();

    // Usamos el hook para obtener las columnas (tableros)
    const { tableros, loading, error, fetchTableros } = useTableros(groupId);

    // Si no hay groupId, mostrar mensaje informativo
    if (!groupId) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Selecciona un grupo para ver sus tableros</Text>
            </View>
        );
    }

    if (loading && tableros.length === 0) {
        return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
                <Button title="Reintentar" onPress={fetchTableros} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Tableros de Tareas</Text>
            </View>
            <ScrollView
                horizontal
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                showsHorizontalScrollIndicator={false}
            >
                {tableros.map(tablero => (
                    <BoardColumn key={tablero.id} tablero={tablero} groupId={groupId} />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: KompaColors.background,
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        height: '100%',
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: KompaColors.error,
        marginBottom: 16,
    },
});