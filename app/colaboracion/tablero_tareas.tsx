// app/colaboracion/tablero_tareas.tsx

import React from 'react';
import { ScrollView, StyleSheet, ActivityIndicator, View, Text, Button } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTableros } from '@/hooks/useTableros'; // El hook que ya refactorizamos
import { TableroColumn } from '@/components/colaboracion/colaboracion'; // El nuevo componente

export default function TableroTareasScreen() {
    const { groupId } = useLocalSearchParams<{ groupId: string }>();
    
    // 1. Obtenemos solo la lista de tableros.
    const { tableros, loading, error, fetchTableros } = useTableros(groupId);

    if (loading && tableros.length === 0) {
        return <ActivityIndicator size="large" style={styles.centered} />;
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={{color: 'red'}}>{error}</Text>
                <Button title="Reintentar" onPress={() => fetchTableros()} />
            </View>
        );
    }

    return (
        <ScrollView horizontal style={styles.scroll} contentContainerStyle={{ padding: 12 }} showsHorizontalScrollIndicator={false}>
            {/* 2. Mapeamos los tableros y renderizamos una columna para cada uno. */}
            {tableros.map(tablero => (
                <TableroColumn key={tablero.id} tablero={tablero} groupId={groupId} />
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: { flex: 1, backgroundColor: '#f3f4f6' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});