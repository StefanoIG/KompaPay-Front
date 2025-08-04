// src/components/modals/EditBoardModal.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Tablero, UpdateTableroRequest } from '@/config/config';
import { KompaColors } from '@/constants/Styles';

interface EditBoardModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (updates: UpdateTableroRequest) => Promise<boolean>;
    board: Tablero;
    loading?: boolean;
}

export const EditBoardModal = ({ 
    visible, 
    onClose, 
    onSave, 
    board, 
    loading: isSubmitting = false 
}: EditBoardModalProps) => {
    const insets = useSafeAreaInsets();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('');

    // Llenar el formulario con los datos del tablero cuando se abre el modal
    useEffect(() => {
        if (visible && board) {
            setName(board.nombre || '');
            setDescription(board.descripcion || '');
            setColor(board.color || '');
        }
    }, [visible, board]);

    // Resetear formulario cuando se cierra
    useEffect(() => {
        if (!visible) {
            setName('');
            setDescription('');
            setColor('');
        }
    }, [visible]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Nombre requerido', 'Por favor, dale un nombre al tablero.');
            return;
        }

        const updates: UpdateTableroRequest = {
            nombre: name.trim(),
            descripcion: description.trim() || undefined,
            color: color.trim() || undefined,
        };

        const success = await onSave(updates);
        if (success) {
            Alert.alert('Éxito', 'Tablero actualizado correctamente.');
            onClose();
        } else {
            Alert.alert('Error', 'No se pudo actualizar el tablero.');
        }
    };

    const predefinedColors = [
        { name: 'Azul', value: '#3B82F6' },
        { name: 'Verde', value: '#10B981' },
        { name: 'Rojo', value: '#EF4444' },
        { name: 'Amarillo', value: '#F59E0B' },
        { name: 'Púrpura', value: '#8B5CF6' },
        { name: 'Rosa', value: '#EC4899' },
        { name: 'Gris', value: '#6B7280' },
        { name: 'Naranja', value: '#F97316' },
    ];

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.container, { paddingTop: insets.top + 10, paddingBottom: insets.bottom }]}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Editar Tablero</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={28} color={KompaColors.gray200} />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nombre del Tablero *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ej: Por Hacer"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Descripción</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Descripción del tablero..."
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Color</Text>
                            <View style={styles.colorContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.colorChip,
                                        { backgroundColor: KompaColors.gray200 },
                                        !color && styles.colorChipSelected
                                    ]}
                                    onPress={() => setColor('')}
                                >
                                    <Text style={styles.colorChipText}>Sin color</Text>
                                </TouchableOpacity>
                                {predefinedColors.map(c => (
                                    <TouchableOpacity
                                        key={c.value}
                                        style={[
                                            styles.colorChip,
                                            { backgroundColor: c.value },
                                            color === c.value && styles.colorChipSelected
                                        ]}
                                        onPress={() => setColor(c.value)}
                                    >
                                        {color === c.value && (
                                            <Ionicons name="checkmark" size={16} color="white" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Color personalizado (Hex)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="#3B82F6"
                                value={color}
                                onChangeText={setColor}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>
                    
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
        height: '70%',
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
        flex: 1,
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
    colorContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    colorChip: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorChipSelected: {
        borderColor: KompaColors.primary,
        borderWidth: 3,
    },
    colorChipText: {
        fontSize: 10,
        color: KompaColors.textPrimary,
        textAlign: 'center',
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
