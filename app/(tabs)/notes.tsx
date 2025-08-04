// app/(tabs)/notes.tsx
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
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

// 1. Importar hooks y componentes
import { useNotas } from '@/hooks/useNotas';
import { useGroups } from '@/hooks/useGroups';
import { NoteCard } from '@/components/notes/NoteCard';
import { KompaColors, Shadows, Spacing, FontSizes, BorderRadius } from '@/constants/Styles';

// --- Componente Principal ---
export default function NotesScreen() {
    const router = useRouter();
    // Obtener los grupos disponibles
    const { groups } = useGroups();
    
    // Para este componente, vamos a manejar múltiples grupos
    const [selectedGroupId, setSelectedGroupId] = useState<string>('');
    
    // 2. Consumir el hook de datos solo si hay un grupo seleccionado
    const { notas, loading, createNota } = useNotas(selectedGroupId);

    // 3. Estado local para la búsqueda y el modal
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const [newNote, setNewNote] = useState({
        titulo: '',
        contenido: '',
        grupo_id: '',
    });

    // 4. Lógica de filtrado
    const filteredNotes = useMemo(() => {
        if (!searchQuery) return notas;
        return notas.filter(note =>
            note.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.contenido.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [notas, searchQuery]);

    const handleNotePress = (noteId: string) => {
        // Navegar al detalle, pasando los IDs necesarios
        router.push(`/colaboracion/nota_detalle?groupId=${selectedGroupId}&noteId=${noteId}` as any);
    };

    // 5. Función para crear nota
    const handleCreateNote = async () => {
        if (!newNote.titulo.trim()) {
            Alert.alert('Error', 'El título de la nota es obligatorio');
            return;
        }

        if (!newNote.contenido.trim()) {
            Alert.alert('Error', 'El contenido de la nota es obligatorio');
            return;
        }

        if (!newNote.grupo_id) {
            Alert.alert('Error', 'Debes seleccionar un grupo');
            return;
        }

        try {
            await createNota({
                titulo: newNote.titulo.trim(),
                contenido: newNote.contenido.trim(),
            });
            setNewNote({ titulo: '', contenido: '', grupo_id: '' });
            setModalVisible(false);
            Alert.alert('Éxito', 'Nota creada correctamente');
        } catch (error) {
            Alert.alert('Error', 'No se pudo crear la nota');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notas Colaborativas</Text>
            </View>

            {/* Selector de grupo */}
            <View style={styles.groupSelector}>
                <Text style={styles.selectorLabel}>Selecciona un grupo:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupScroll}>
                    {groups.map((group) => (
                        <TouchableOpacity
                            key={group.id}
                            style={[
                                styles.groupChip,
                                selectedGroupId === group.id && styles.groupChipActive
                            ]}
                            onPress={() => setSelectedGroupId(group.id)}
                        >
                            <Text style={[
                                styles.groupChipText,
                                selectedGroupId === group.id && styles.groupChipTextActive
                            ]}>
                                {group.nombre}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={[styles.searchContainer, Shadows.sm]}>
                <Ionicons name="search" size={20} color={KompaColors.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar notas..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {loading && notas.length === 0 ? (
                <ActivityIndicator size="large" style={{ marginTop: 20 }} />
            ) : selectedGroupId ? (
                <FlatList
                    data={filteredNotes}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <NoteCard note={item} onPress={() => handleNotePress(item.id)} />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text>No hay notas en este grupo.</Text>
                            <Text style={{ marginTop: 8, color: KompaColors.textSecondary }}>¡Crea la primera!</Text>
                        </View>
                    }
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text>Selecciona un grupo para ver sus notas</Text>
                </View>
            )}

            {/* Botón flotante para agregar nota */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>

            {/* Modal para crear nueva nota */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Ionicons name="close" size={24} color={KompaColors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Nueva Nota</Text>
                        <TouchableOpacity onPress={handleCreateNote}>
                            <Text style={styles.saveButton}>Crear</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Grupo *</Text>
                            <View style={styles.groupContainer}>
                                {groups.map((group) => (
                                    <TouchableOpacity
                                        key={group.id}
                                        style={[
                                            styles.groupButton,
                                            newNote.grupo_id === group.id && styles.groupButtonActive
                                        ]}
                                        onPress={() => setNewNote({ ...newNote, grupo_id: group.id })}
                                    >
                                        <Text style={[
                                            styles.groupText,
                                            newNote.grupo_id === group.id && styles.groupTextActive
                                        ]}>
                                            {group.nombre}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Título *</Text>
                            <TextInput
                                style={styles.textInput}
                                value={newNote.titulo}
                                onChangeText={(text) => setNewNote({ ...newNote, titulo: text })}
                                placeholder="Título de la nota"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Contenido *</Text>
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                value={newNote.contenido}
                                onChangeText={(text) => setNewNote({ ...newNote, contenido: text })}
                                placeholder="Escribe el contenido de la nota..."
                                multiline
                                numberOfLines={10}
                            />
                        </View>
                    </ScrollView>
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
        backgroundColor: 'white',
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
        height: 120,
        textAlignVertical: 'top',
    },
    groupSelector: {
        padding: Spacing.md,
        backgroundColor: '#FFFFFF',
        marginHorizontal: Spacing.md,
        marginBottom: Spacing.md,
        borderRadius: BorderRadius.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    selectorLabel: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: KompaColors.textPrimary,
        marginBottom: Spacing.sm,
    },
    groupScroll: {
        flexDirection: 'row',
    },
    groupChip: {
        backgroundColor: KompaColors.gray100,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        marginRight: Spacing.sm,
        borderWidth: 1,
        borderColor: KompaColors.gray300,
    },
    groupChipActive: {
        backgroundColor: KompaColors.primary,
        borderColor: KompaColors.primary,
    },
    groupChipText: {
        fontSize: FontSizes.sm,
        color: KompaColors.textSecondary,
    },
    groupChipTextActive: {
        color: '#FFFFFF',
    },
    groupContainer: {
        gap: Spacing.sm,
    },
    groupButton: {
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: KompaColors.gray300,
        backgroundColor: '#FFFFFF',
    },
    groupButtonActive: {
        backgroundColor: KompaColors.secondary,
        borderColor: KompaColors.secondary,
    },
    groupText: {
        fontSize: FontSizes.md,
        color: KompaColors.textPrimary,
    },
    groupTextActive: {
        color: '#FFFFFF',
    },
});