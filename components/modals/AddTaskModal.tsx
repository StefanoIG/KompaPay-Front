// src/components/modals/AddTaskModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTareas } from '@/hooks/useTareas';
import { useGroupDetails } from '@/hooks/useGroups'; // Para obtener los miembros del grupo
import { KompaColors } from '@/constants/Styles';

// Props que el modal recibirá
interface AddTaskModalProps {
    visible: boolean;
    onClose: () => void;
    groupId: string;
    tableroId: string; // La columna/tablero donde se creará la tarea
}

export const AddTaskModal = ({ visible, onClose, groupId, tableroId }: AddTaskModalProps) => {
    const insets = useSafeAreaInsets();
    const { createTarea, loading: isSubmitting } = useTareas(groupId, tableroId);
    const { group } = useGroupDetails(groupId); // Obtener los miembros del grupo actual

    const [title, setTitle] = useState('');
    const [assigneeId, setAssigneeId] = useState<string | null>(null);
    const [priority, setPriority] = useState<'baja' | 'media' | 'alta' | 'critica'>('media');

    // Resetea el formulario cuando se cierra el modal
    useEffect(() => {
        if (!visible) {
            setTitle('');
            setAssigneeId(null);
            setPriority('media');
        }
    }, [visible]);

    const handleSubmit = async () => {
        if (!title.trim()) {
            Alert.alert('Título requerido', 'Por favor, dale un título a tu tarea.');
            return;
        }

        const newTask = await createTarea({
            titulo: title.trim(),
            asignado_a: assigneeId || undefined,
            prioridad: priority,
        });

        if (newTask) {
            Alert.alert('Éxito', 'Tarea creada correctamente.');
            onClose();
        } else {
            Alert.alert('Error', 'No se pudo crear la tarea.');
        }
    };

    const priorities: { value: 'baja' | 'media' | 'alta' | 'critica'; label: string }[] = [
        { value: "baja", label: "Baja" },
        { value: "media", label: "Media" },
        { value: "alta", label: "Alta" },
        { value: "critica", label: "Crítica" },
    ];

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.container, { paddingTop: insets.top + 10, paddingBottom: insets.bottom }]}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Añadir Nueva Tarea</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={28} color={KompaColors.gray200} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Título de la Tarea *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ej: Reservar el hotel"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Asignar a</Text>
                            <View style={styles.chipContainer}>
                                {group?.miembros?.map(member => (
                                    <TouchableOpacity
                                        key={member.id}
                                        style={[styles.chip, assigneeId === member.id && styles.chipSelected]}
                                        onPress={() => setAssigneeId(member.id)}
                                    >
                                        <Text style={[styles.chipText, assigneeId === member.id && styles.chipTextSelected]}>{member.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Prioridad</Text>
                             <View style={styles.chipContainer}>
                                {priorities.map(p => (
                                    <TouchableOpacity
                                        key={p.value}
                                        style={[styles.chip, priority === p.value && styles.chipSelected]}
                                        onPress={() => setPriority(p.value)}
                                    >
                                        <Text style={[styles.chipText, priority === p.value && styles.chipTextSelected]}>{p.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.buttonText}>Crear Tarea</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: 'white',
        height: '75%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: KompaColors.gray100,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    form: {
        padding: 16,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        color: KompaColors.textSecondary,
    },
    input: {
        height: 50,
        backgroundColor: KompaColors.gray50,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        backgroundColor: KompaColors.gray100,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
    },
    chipSelected: {
        backgroundColor: KompaColors.primary,
    },
    chipText: {
        color: KompaColors.textPrimary,
    },
    chipTextSelected: {
        color: 'white',
        fontWeight: 'bold',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: KompaColors.gray100,
    },
    button: {
        height: 50,
        backgroundColor: KompaColors.primary,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});