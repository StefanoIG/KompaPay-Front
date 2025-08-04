// src/components/modals/AddNoteModal.tsx
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
import { useGroups } from '@/hooks/useGroups';
import { useNotas } from '@/hooks/useNotas';
import { KompaColors } from '@/constants/Styles';

// Props que el modal recibirá
interface AddNoteModalProps {
    visible: boolean;
    onClose: () => void;
    // Pasamos el groupId para saber en qué grupo crear la nota
    groupId: string; 
}

export const AddNoteModal = ({ visible, onClose, groupId }: AddNoteModalProps) => {
    const insets = useSafeAreaInsets();
    // Usamos el hook useNotas específico para el grupo
    const { createNota, loading: isSubmitting } = useNotas(groupId);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = async () => {
        if (!title.trim()) {
            Alert.alert('Título requerido', 'Por favor, dale un título a tu nota.');
            return;
        }

        const newNote = await createNota({
            titulo: title.trim(),
            contenido: content,
        });

        if (newNote) {
            Alert.alert('Éxito', 'Nota creada correctamente.');
            onClose(); // Cierra el modal
        } else {
            Alert.alert('Error', 'No se pudo crear la nota.');
        }
    };

    // Resetea los campos cuando el modal se cierra
    useEffect(() => {
        if (!visible) {
            setTitle('');
            setContent('');
        }
    }, [visible]);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.container, { paddingTop: insets.top + 10, paddingBottom: insets.bottom }]}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Crear Nueva Nota</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={28} color={KompaColors.gray200} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Título *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ej: Planificación del viaje"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Contenido</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Comienza a escribir tu nota aquí..."
                                value={content}
                                onChangeText={setContent}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>
                    </ScrollView>
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.buttonText}>Crear Nota</Text>
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
    },
    form: {
        padding: 16,
    },
    inputGroup: {
        marginBottom: 20,
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
    textArea: {
        height: 200, // Altura mayor para el contenido
        paddingTop: 16,
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