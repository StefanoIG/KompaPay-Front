// src/components/modals/EditTaskModal.tsx
import React, { useState, useEffect } from 'react';
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
import { Tarea, UpdateTareaRequest } from '@/config/config';
import { useGroupDetails } from '@/hooks/useGroups';
import { KompaColors } from '@/constants/Styles';

interface EditTaskModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (updates: UpdateTareaRequest) => Promise<boolean>;
    task: Tarea;
    groupId: string;
    loading?: boolean;
}

export const EditTaskModal = ({ 
    visible, 
    onClose, 
    onSave, 
    task, 
    groupId, 
    loading: isSubmitting = false 
}: EditTaskModalProps) => {
    const insets = useSafeAreaInsets();
    const { group } = useGroupDetails(groupId);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assigneeId, setAssigneeId] = useState<string | null>(null);
    const [priority, setPriority] = useState<'baja' | 'media' | 'alta' | 'critica'>('media');
    const [status, setStatus] = useState<'pendiente' | 'en_progreso' | 'completada'>('pendiente');
    const [dueDate, setDueDate] = useState('');

    // Llenar el formulario con los datos de la tarea cuando se abre el modal
    useEffect(() => {
        if (visible && task) {
            setTitle(task.titulo || '');
            setDescription(task.descripcion || '');
            setAssigneeId(task.asignado_a || null);
            setPriority(task.prioridad || 'media');
            setStatus(task.estado || 'pendiente');
            setDueDate(task.fecha_vencimiento || '');
        }
    }, [visible, task]);

    // Resetear formulario cuando se cierra
    useEffect(() => {
        if (!visible) {
            setTitle('');
            setDescription('');
            setAssigneeId(null);
            setPriority('media');
            setStatus('pendiente');
            setDueDate('');
        }
    }, [visible]);

    const handleSubmit = async () => {
        if (!title.trim()) {
            Alert.alert('Título requerido', 'Por favor, dale un título a tu tarea.');
            return;
        }

        const updates: UpdateTareaRequest = {
            titulo: title.trim(),
            descripcion: description.trim() || undefined,
            asignado_a: assigneeId || undefined,
            prioridad: priority,
            estado: status,
            fecha_vencimiento: dueDate || undefined,
        };

        const success = await onSave(updates);
        if (success) {
            Alert.alert('Éxito', 'Tarea actualizada correctamente.');
            onClose();
        } else {
            Alert.alert('Error', 'No se pudo actualizar la tarea.');
        }
    };

    const priorities: { value: 'baja' | 'media' | 'alta' | 'critica'; label: string; color: string }[] = [
        { value: "baja", label: "Baja", color: KompaColors.success },
        { value: "media", label: "Media", color: KompaColors.warning },
        { value: "alta", label: "Alta", color: KompaColors.error },
        { value: "critica", label: "Crítica", color: '#DC2626' },
    ];

    const statuses: { value: 'pendiente' | 'en_progreso' | 'completada'; label: string; color: string }[] = [
        { value: "pendiente", label: "Pendiente", color: KompaColors.gray400 },
        { value: "en_progreso", label: "En Progreso", color: KompaColors.warning },
        { value: "completada", label: "Completada", color: KompaColors.success },
    ];

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.container, { paddingTop: insets.top + 10, paddingBottom: insets.bottom }]}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Editar Tarea</Text>
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
                            <Text style={styles.label}>Descripción</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Descripción detallada de la tarea..."
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Estado</Text>
                            <View style={styles.chipContainer}>
                                {statuses.map(s => (
                                    <TouchableOpacity
                                        key={s.value}
                                        style={[styles.chip, status === s.value && { backgroundColor: s.color }]}
                                        onPress={() => setStatus(s.value)}
                                    >
                                        <Text style={[styles.chipText, status === s.value && styles.chipTextSelected]}>{s.label}</Text>
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
                                        style={[styles.chip, priority === p.value && { backgroundColor: p.color }]}
                                        onPress={() => setPriority(p.value)}
                                    >
                                        <Text style={[styles.chipText, priority === p.value && styles.chipTextSelected]}>{p.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Asignar a</Text>
                            <View style={styles.chipContainer}>
                                <TouchableOpacity
                                    style={[styles.chip, !assigneeId && styles.chipSelected]}
                                    onPress={() => setAssigneeId(null)}
                                >
                                    <Text style={[styles.chipText, !assigneeId && styles.chipTextSelected]}>Sin asignar</Text>
                                </TouchableOpacity>
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
                            <Text style={styles.label}>Fecha de Vencimiento</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="YYYY-MM-DD (opcional)"
                                value={dueDate}
                                onChangeText={setDueDate}
                            />
                        </View>
                    </ScrollView>
                    
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.buttonText}>Guardar Cambios</Text>
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
        height: '85%',
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
        color: KompaColors.textPrimary,
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
        color: KompaColors.textPrimary,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
        paddingTop: 12,
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
        fontSize: 14,
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
