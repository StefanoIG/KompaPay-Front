// app/colaboracion/notas.tsx

import React, { useState } from 'react';
import { View, Text, ActivityIndicator, Alert, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

// 1. Importar el hook especializado y el componente de la UI
import { useNotas } from '@/hooks/useNotas';
import { NotasBoard } from '@/components/colaboracion/NotasBoard'; // Asumiendo que este es el componente de la UI
// import { CreateNotaModal } from '@/components/modals/CreateNotaModal'; // Necesitarás un modal para crear notas

export default function NotasScreen() {
    const router = useRouter();
    // 2. Obtener el groupId de los parámetros de la ruta
    const { groupId } = useLocalSearchParams<{ groupId: string }>();

    // 3. Usar el hook especializado. ¡Así de simple!
    const { notas, loading, error, createNota, fetchNotas } = useNotas(groupId);

    // Estado local para el modal de creación
    const [isCreateModalVisible, setCreateModalVisible] = useState(false);

    const handleNotaPress = (notaId: string) => {
        // 4. Navegación funcional al detalle de la nota
        router.push({
            pathname: '/colaboracion/nota_detalle',
            params: { notaId, groupId }
        });
    };

    const handleCreateNota = async (titulo: string) => {
        if (!titulo.trim()) {
            Alert.alert('Error', 'El título no puede estar vacío.');
            return;
        }
        const nuevaNota = await createNota({ titulo, contenido: '' });
        if (nuevaNota) {
            setCreateModalVisible(false);
            // Navegar a la nueva nota creada
            handleNotaPress(nuevaNota.id);
        } else {
            Alert.alert('Error', 'No se pudo crear la nota.');
        }
    };

    // 5. Renderizado limpio basado en el estado del hook
    if (loading && notas.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
                <Button title="Reintentar" onPress={() => fetchNotas()} />
            </View>
        );
    }

    return (
        <>
            <NotasBoard
                notas={notas}
                onNotaPress={(nota) => handleNotaPress(nota.id)}
                onNuevaNota={() => setCreateModalVisible(true)}
            />

            {/* Aquí iría tu componente de Modal para crear una nueva nota.
            <CreateNotaModal
                visible={isCreateModalVisible}
                onClose={() => setCreateModalVisible(false)}
                onSubmit={handleCreateNota}
            />
            */}
        </>
    );
}