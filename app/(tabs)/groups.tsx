// app/(tabs)/groups.tsx
import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
    Alert,
    Clipboard,
    Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// 1. Importar hooks de datos reales
import { useGroups } from '@/hooks/useGroups';

// 2. Importar componentes y constantes
import { GroupCard } from '@/components/groups/GroupCard';
import { KompaColors, Spacing, FontSizes, BorderRadius } from '@/constants/Styles';

// --- Componente Principal ---
export default function GroupsScreen() {
    const router = useRouter();

    // 3. Consumir el hook
    const { groups, loading, createGroup } = useGroups();
    
    // 4. Estado local para la búsqueda y modal
    const [searchQuery, setSearchQuery] = useState('');
    const [modalType, setModalType] = useState<'create' | 'join' | null>(null);
    const [newGroup, setNewGroup] = useState({
        nombre: '',
        descripcion: '',
    });
    const [joinCode, setJoinCode] = useState('');

    // 5. Lógica de filtrado
    const filteredGroups = useMemo(() => {
        if (!searchQuery) {
            return groups;
        }
        return groups.filter((group) =>
            group.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.descripcion?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [groups, searchQuery]);

    // 6. Función para crear grupo
    const handleCreateGroup = async () => {
        if (!newGroup.nombre.trim()) {
            Alert.alert('Error', 'El nombre del grupo es obligatorio');
            return;
        }

        try {
            await createGroup({
                nombre: newGroup.nombre.trim(),
                descripcion: newGroup.descripcion.trim() || undefined,
            });
            setNewGroup({ nombre: '', descripcion: '' });
            setModalType(null);
            Alert.alert('Éxito', 'Grupo creado correctamente');
        } catch (error) {
            Alert.alert('Error', 'No se pudo crear el grupo');
        }
    };

    // 7. Función para unirse a grupo
    const handleJoinGroup = async () => {
        if (!joinCode.trim()) {
            Alert.alert('Error', 'El código del grupo es obligatorio');
            return;
        }

        try {
            // Aquí iría la lógica para unirse al grupo usando el código
            Alert.alert('Éxito', 'Te has unido al grupo correctamente');
            setJoinCode('');
            setModalType(null);
        } catch (error) {
            Alert.alert('Error', 'No se pudo unir al grupo');
        }
    };

    // 8. Función para compartir código de grupo
    const handleShareGroup = async (group: any) => {
        try {
            await Share.share({
                message: `¡Únete a mi grupo "${group.nombre}" en KompaPay!\n\nCódigo: ${group.id_publico}`,
                title: 'Invitación a grupo'
            });
        } catch (error) {
            // Fallback a clipboard
            Clipboard.setString(group.id_publico);
            Alert.alert('Copiado', 'El código del grupo ha sido copiado al portapapeles');
        }
    };
    
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Tus Grupos</Text>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={KompaColors.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar grupos..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {loading && groups.length === 0 ? (
                <ActivityIndicator size="large" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filteredGroups}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <GroupCard 
                            group={item} 
                            onPress={() => router.push(`/boards?groupId=${item.id}`)}
                            onShare={handleShareGroup}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text>No se encontraron grupos.</Text>
                        </View>
                    }
                />
            )}
            
            {/* Botón flotante para agregar grupo */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalType('create')}
            >
                <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>

            {/* Botón secundario para unirse a grupo */}
            <TouchableOpacity
                style={styles.fabSecondary}
                onPress={() => setModalType('join')}
            >
                <Ionicons name="enter" size={20} color="white" />
            </TouchableOpacity>

            {/* Modal para crear nuevo grupo */}
            <Modal
                visible={modalType === 'create'}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModalType(null)}>
                            <Ionicons name="close" size={24} color={KompaColors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Nuevo Grupo</Text>
                        <TouchableOpacity onPress={handleCreateGroup}>
                            <Text style={styles.saveButton}>Crear</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContent}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Nombre del grupo *</Text>
                            <TextInput
                                style={styles.textInput}
                                value={newGroup.nombre}
                                onChangeText={(text) => setNewGroup({ ...newGroup, nombre: text })}
                                placeholder="Ej: Viaje a la playa"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Descripción (opcional)</Text>
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                value={newGroup.descripcion}
                                onChangeText={(text) => setNewGroup({ ...newGroup, descripcion: text })}
                                placeholder="Describe de qué trata este grupo..."
                                multiline
                                numberOfLines={3}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal para unirse a grupo */}
            <Modal
                visible={modalType === 'join'}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModalType(null)}>
                            <Ionicons name="close" size={24} color={KompaColors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Unirse a Grupo</Text>
                        <TouchableOpacity onPress={handleJoinGroup}>
                            <Text style={styles.saveButton}>Unirse</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContent}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Código del grupo *</Text>
                            <TextInput
                                style={styles.textInput}
                                value={joinCode}
                                onChangeText={setJoinCode}
                                placeholder="Ingresa el código del grupo"
                                autoCapitalize="none"
                            />
                        </View>
                        <Text style={styles.helpText}>
                            Pídele a un miembro del grupo que comparta contigo el código de invitación.
                        </Text>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: KompaColors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: KompaColors.gray100,
        borderRadius: 8,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    searchIcon: {
        marginLeft: 12,
    },
    searchInput: {
        height: 44,
        flex: 1,
        paddingHorizontal: 8,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 80, // Espacio para el FAB
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: KompaColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    fabSecondary: {
        position: 'absolute',
        bottom: 20,
        right: 90,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: KompaColors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: KompaColors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: KompaColors.gray200,
    },
    modalTitle: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: KompaColors.textPrimary,
    },
    saveButton: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: KompaColors.primary,
    },
    modalContent: {
        flex: 1,
        padding: Spacing.lg,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    inputLabel: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: KompaColors.textPrimary,
        marginBottom: Spacing.sm,
    },
    textInput: {
        borderWidth: 1,
        borderColor: KompaColors.gray300,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        fontSize: FontSizes.md,
        backgroundColor: '#FFFFFF',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    helpText: {
        fontSize: FontSizes.sm,
        color: KompaColors.textSecondary,
        fontStyle: 'italic',
        marginTop: Spacing.sm,
        lineHeight: 20,
    },
});