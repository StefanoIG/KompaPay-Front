// src/components/modals/EditExpenseModal.tsx
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
import { useExpenseDetails } from '@/hooks/useExpenses'; // Usamos el hook de detalles
import { KompaColors } from '@/constants/Styles';
import { Gasto } from '@/config/config';

// Props que el modal recibirá
interface EditExpenseModalProps {
    visible: boolean;
    onClose: () => void;
    expenseId: string | null; // El ID del gasto a editar
}

export const EditExpenseModal = ({ visible, onClose, expenseId }: EditExpenseModalProps) => {
    const insets = useSafeAreaInsets();
    // Usamos el hook de detalles para obtener y actualizar el gasto
    const { expense, updateExpense, loading: isSubmitting, refetch } = useExpenseDetails(expenseId || '');

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');

    // Cuando el gasto se carga desde el hook, poblamos el formulario
    useEffect(() => {
        if (expense && visible) {
            setDescription(expense.descripcion);
            setAmount(expense.monto_total.toString());
        }
    }, [expense, visible]);

    const handleUpdate = async () => {
        if (!description.trim() || !amount.trim()) {
            Alert.alert('Campos incompletos', 'Por favor, rellena todos los campos.');
            return;
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            Alert.alert('Monto inválido', 'Por favor, introduce un número válido.');
            return;
        }

        const updatedExpense = await updateExpense({
            descripcion: description.trim(),
            monto_total: numericAmount,
            // Aquí se podrían añadir más campos si la API los permite
        });

        if (updatedExpense) {
            Alert.alert('Éxito', 'Gasto actualizado correctamente.');
            refetch(); // Opcional: Volver a cargar los datos para confirmar
            onClose(); // Cierra el modal
        } else {
            Alert.alert('Error', 'No se pudo actualizar el gasto.');
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.container, { paddingTop: insets.top + 10, paddingBottom: insets.bottom }]}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Editar Gasto</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={28} color={KompaColors.gray200} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Descripción *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ej: Cena en el restaurante"
                                value={description}
                                onChangeText={setDescription}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Monto Total *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="decimal-pad"
                            />
                        </View>
                        {/* Aquí podrías añadir la edición de participantes y tipo de división */}
                    </ScrollView>
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={isSubmitting}>
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

// Los estilos son muy similares al de AddExpenseModal
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