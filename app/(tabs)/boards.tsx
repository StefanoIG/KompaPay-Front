// app/(tabs)/boards.tsx
import { BoardColumn } from '@/components/boards/BoardColumn';
import { KompaColors } from '@/constants/Styles';
import { useGroups } from '@/hooks/useGroups';
import { useTableros } from '@/hooks/useTableros';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Button, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BoardsScreen() {
    // Asumimos que el groupId se pasa como parámetro al navegar a esta pantalla
    const { groupId } = useLocalSearchParams<{ groupId: string }>();
    const router = useRouter();
    const [selectedGroupId, setSelectedGroupId] = useState<string>(groupId || '');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTableroName, setNewTableroName] = useState('');

    // Hook para obtener los grupos disponibles
    const { groups } = useGroups();
    
    // Usamos el hook para obtener las columnas (tableros)
    const { tableros, loading, error, fetchTableros, createTablero } = useTableros(selectedGroupId);

    const handleCreateBoard = () => {
        if (!selectedGroupId) {
            Alert.alert('Error', 'Primero selecciona un grupo para crear un tablero');
            return;
        }
        setShowCreateModal(true);
    };

    const handleCreateTableroConfirm = async () => {
        if (!newTableroName.trim()) {
            Alert.alert('Error', 'El nombre del tablero es obligatorio');
            return;
        }

        try {
            console.log('Creando tablero:', newTableroName.trim(), 'en grupo:', selectedGroupId);
            const nuevoTablero = await createTablero({
                nombre: newTableroName.trim(),
                descripcion: '',
                color: '#3B82F6'
            });
            console.log('Tablero creado:', nuevoTablero);
            
            setShowCreateModal(false);
            setNewTableroName('');
            fetchTableros(); // Refrescar la lista
            Alert.alert('Éxito', 'Tablero creado correctamente');
        } catch (error) {
            console.error('Error al crear tablero:', error);
            Alert.alert('Error', 'No se pudo crear el tablero');
        }
    };

    // Componente para seleccionar grupo
    const GroupSelector = () => (
        <View style={styles.groupSelectorContainer}>
            <Text style={styles.selectorTitle}>Selecciona un grupo para ver sus tableros:</Text>
            <View style={styles.groupGrid}>
                {groups.map(group => (
                    <TouchableOpacity
                        key={group.id}
                        style={[
                            styles.groupCard,
                            selectedGroupId === group.id && styles.groupCardSelected
                        ]}
                        onPress={() => setSelectedGroupId(group.id)}
                    >
                        <View style={styles.groupIconContainer}>
                            <Ionicons 
                                name="people" 
                                size={24} 
                                color={selectedGroupId === group.id ? 'white' : KompaColors.primary} 
                            />
                        </View>
                        <Text style={[
                            styles.groupName,
                            selectedGroupId === group.id && styles.groupNameSelected
                        ]}>
                            {group.nombre}
                        </Text>
                        {group.descripcion && (
                            <Text style={[
                                styles.groupDescription,
                                selectedGroupId === group.id && styles.groupDescriptionSelected
                            ]}>
                                {group.descripcion}
                            </Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    // Si no hay groupId seleccionado, mostrar selector de grupo
    if (!selectedGroupId) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Tableros de Tareas</Text>
                </View>
                <ScrollView style={styles.container} contentContainerStyle={styles.selectorContent}>
                    <GroupSelector />
                </ScrollView>
            </SafeAreaView>
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
                {selectedGroupId ? (
                    <>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => setSelectedGroupId('')}
                        >
                            <Ionicons name="arrow-back" size={24} color={KompaColors.primary} />
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerTitle}>Tableros de Tareas</Text>
                            <Text style={styles.headerSubtitle}>
                                {groups.find(g => g.id === selectedGroupId)?.nombre}
                            </Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.addButton}
                            onPress={handleCreateBoard}
                        >
                            <Ionicons name="add" size={24} color={KompaColors.primary} />
                        </TouchableOpacity>
                    </>
                ) : (
                    <Text style={styles.headerTitle}>Tableros de Tareas</Text>
                )}
            </View>
            
            {tableros.length === 0 && !loading ? (
                <View style={styles.emptyStateContainer}>
                    <Ionicons name="grid-outline" size={64} color={KompaColors.gray200} />
                    <Text style={styles.emptyStateTitle}>Sin tableros</Text>
                    <Text style={styles.emptyStateDescription}>
                        Crea tu primer tablero para organizar las tareas del grupo
                    </Text>
                    <TouchableOpacity 
                        style={styles.createFirstBoardButton}
                        onPress={handleCreateBoard}
                    >
                        <Ionicons name="add-circle" size={20} color="white" />
                        <Text style={styles.createFirstBoardText}>Iniciar Tablero</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    horizontal
                    style={styles.container}
                    contentContainerStyle={styles.contentContainer}
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled={false}
                    decelerationRate="fast"
                >
                    {tableros.map(tablero => (
                        <BoardColumn key={tablero.id} tablero={tablero} groupId={selectedGroupId} />
                    ))}
                    
                    {/* Add new board column */}
                    <TouchableOpacity 
                        style={styles.addColumnButton}
                        onPress={handleCreateBoard}
                    >
                        <Ionicons name="add-circle-outline" size={32} color={KompaColors.primary} />
                        <Text style={styles.addColumnText}>Agregar columna</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}
            
            {/* Modal para crear tablero */}
            <Modal
                visible={showCreateModal}
                animationType="slide"
                presentationStyle="pageSheet"
                transparent={false}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                            <Ionicons name="close" size={24} color={KompaColors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Nuevo Tablero</Text>
                        <TouchableOpacity onPress={handleCreateTableroConfirm}>
                            <Text style={styles.modalSaveButton}>Crear</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalLabel}>Nombre del tablero *</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={newTableroName}
                            onChangeText={setNewTableroName}
                            placeholder="Ej: To Do, En Progreso, Completado"
                            autoFocus
                        />
                    </View>
                </SafeAreaView>
            </Modal>
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
    selectorContent: {
        padding: 16,
        paddingBottom: 50,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: KompaColors.gray100,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: KompaColors.textPrimary,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: KompaColors.error,
        marginBottom: 16,
        textAlign: 'center',
        fontSize: 16,
    },
    // Group Selector Styles
    groupSelectorContainer: {
        flex: 1,
    },
    selectorTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: KompaColors.textPrimary,
        marginBottom: 20,
        textAlign: 'center',
    },
    groupGrid: {
        gap: 12,
    },
    groupCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: KompaColors.gray200,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    groupCardSelected: {
        backgroundColor: KompaColors.primary,
        borderColor: KompaColors.primaryDark,
    },
    groupIconContainer: {
        alignItems: 'center',
        marginBottom: 8,
    },
    groupName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: KompaColors.textPrimary,
        textAlign: 'center',
        marginBottom: 4,
    },
    groupNameSelected: {
        color: 'white',
    },
    groupDescription: {
        fontSize: 14,
        color: KompaColors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    groupDescriptionSelected: {
        color: 'rgba(255, 255, 255, 0.9)',
    },
    // New styles for improved boards screen
    backButton: {
        padding: 8,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerSubtitle: {
        fontSize: 12,
        color: KompaColors.textSecondary,
        marginTop: 2,
    },
    addButton: {
        padding: 8,
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: KompaColors.textPrimary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateDescription: {
        fontSize: 14,
        color: KompaColors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    createFirstBoardButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: KompaColors.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    createFirstBoardText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    addColumnButton: {
        width: 280,
        height: 120,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: KompaColors.gray200,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        gap: 8,
    },
    addColumnText: {
        color: KompaColors.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    // Estilos del modal
    modalContainer: {
        flex: 1,
        backgroundColor: KompaColors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: KompaColors.gray200,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: KompaColors.textPrimary,
    },
    modalSaveButton: {
        fontSize: 16,
        fontWeight: '600',
        color: KompaColors.primary,
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    modalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: KompaColors.textPrimary,
        marginBottom: 8,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: KompaColors.gray300,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
    },
});