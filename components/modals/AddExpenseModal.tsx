// src/components/modals/AddExpenseModal.tsx
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
import { useExpenses } from '@/hooks/useExpenses';
import { useAuthContext } from '@/providers/AuthProvider';
import { KompaColors } from '@/constants/Styles';
import { formatCurrency } from '@/utils/formatters';

// Props que el modal recibirá
interface AddExpenseModalProps {
    visible: boolean;
    onClose: () => void;
}

export const AddExpenseModal = ({ visible, onClose }: AddExpenseModalProps) => {
    const insets = useSafeAreaInsets();
    const { user } = useAuthContext();
    const { groups } = useGroups();
    const { createExpense, loading: isSubmitting } = useExpenses();

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!description.trim() || !amount.trim() || !selectedGroupId) {
            Alert.alert('Campos incompletos', 'Por favor, rellena todos los campos.');
            return;
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            Alert.alert('Monto inválido', 'Por favor, introduce un número válido.');
            return;
        }

        const selectedGroup = groups.find(g => g.id === selectedGroupId);
        if (!selectedGroup) return;

        // Asumimos una división equitativa por ahora
        const participants = selectedGroup.miembros.map(m => ({
            id_usuario: m.id,
            monto_proporcional: numericAmount / selectedGroup.miembros.length
        }));

        const newExpense = await createExpense({
            descripcion: description.trim(),
            monto_total: numericAmount,
            grupo_id: selectedGroupId,
            pagado_por: user!.id,
            participantes: participants,
        });

        if (newExpense) {
            Alert.alert('Éxito', 'Gasto creado correctamente');
            onClose(); // Cierra el modal
        } else {
            Alert.alert('Error', 'No se pudo crear el gasto.');
        }
    };
    
    // Componente para seleccionar un grupo
    const GroupSelector = () => (
        <View style={styles.selectorContainer}>
            {groups.map(group => (
                <TouchableOpacity
                    key={group.id}
                    style={[
                        styles.chip,
                        selectedGroupId === group.id && styles.chipSelected,
                    ]}
                    onPress={() => setSelectedGroupId(group.id)}
                >
                    <Text style={[styles.chipText, selectedGroupId === group.id && styles.chipTextSelected]}>
                        {group.nombre}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.container, { paddingTop: insets.top + 10, paddingBottom: insets.bottom }]}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Añadir Nuevo Gasto</Text>
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
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Grupo *</Text>
                            <GroupSelector />
                        </View>
                        {/* Aquí podrías añadir la selección de participantes y tipo de división */}
                    </ScrollView>
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.buttonText}>Crear Gasto</Text>
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
    selectorContainer: {
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
        color: KompaColors.text,
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