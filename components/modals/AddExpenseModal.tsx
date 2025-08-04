// src/components/modals/AddExpenseModal.tsx
import { User } from '@/config/config';
import { KompaColors } from '@/constants/Styles';
import { useExpenses } from '@/hooks/useExpenses';
import { useGroups } from '@/hooks/useGroups';
import { useAuthContext } from '@/providers/AuthProvider';
import { formatCurrency } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Types for split functionality
type SplitType = 'equal' | 'percentage' | 'custom';

interface SplitMember {
    user: User;
    selected: boolean;
    amount: number;
    percentage: number;
}

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
    const [selectedCategory, setSelectedCategory] = useState<string>('Comida');
    const [splitType, setSplitType] = useState<SplitType>('equal');
    const [splitMembers, setSplitMembers] = useState<SplitMember[]>([]);

    // Categorías disponibles
    const categories = ['Comida', 'Transporte', 'Entretenimiento', 'Compras', 'Otros'];

    // Initialize split members when group is selected
    useEffect(() => {
        if (selectedGroupId) {
            const selectedGroup = groups.find(g => g.id === selectedGroupId);
            if (selectedGroup && selectedGroup.miembros && selectedGroup.miembros.length > 0) {
                console.log('Initializing split members for group:', selectedGroup.nombre, 'with', selectedGroup.miembros.length, 'members');
                const amountValue = parseFloat(amount) || 0;
                const equalAmount = amountValue / selectedGroup.miembros.length;
                const equalPercentage = 100 / selectedGroup.miembros.length;
                
                setSplitMembers(selectedGroup.miembros.map(member => ({
                    user: member,
                    selected: true,
                    amount: equalAmount,
                    percentage: equalPercentage,
                })));
            }
        } else {
            console.log('No group selected, clearing split members');
            setSplitMembers([]);
        }
    }, [selectedGroupId, groups]);

    // Update split when amount or split type changes
    useEffect(() => {
        if (splitMembers.length > 0 && amount) {
            const amountValue = parseFloat(amount) || 0;
            const selectedMembers = splitMembers.filter(m => m.selected);
            
            if (splitType === 'equal' && selectedMembers.length > 0) {
                const equalAmount = amountValue / selectedMembers.length;
                const equalPercentage = 100 / selectedMembers.length;
                
                setSplitMembers(prev => prev.map(member => ({
                    ...member,
                    amount: member.selected ? equalAmount : 0,
                    percentage: member.selected ? equalPercentage : 0,
                })));
            }
        }
    }, [amount, splitType, splitMembers.filter(m => m.selected).length]);

    const updateSplitAmount = (userId: string, newAmount: number) => {
        setSplitMembers(prev => prev.map(member => 
            member.user.id === userId 
                ? { ...member, amount: newAmount, percentage: (newAmount / parseFloat(amount || '1')) * 100 }
                : member
        ));
    };

    const updateSplitPercentage = (userId: string, newPercentage: number) => {
        const amountValue = parseFloat(amount) || 0;
        const newAmount = (newPercentage / 100) * amountValue;
        
        setSplitMembers(prev => prev.map(member => 
            member.user.id === userId 
                ? { ...member, percentage: newPercentage, amount: newAmount }
                : member
        ));
    };

    const toggleMemberSelection = (userId: string) => {
        setSplitMembers(prev => prev.map(member => 
            member.user.id === userId 
                ? { ...member, selected: !member.selected, amount: 0, percentage: 0 }
                : member
        ));
    };

    const getTotalSplit = () => {
        return splitMembers.filter(m => m.selected).reduce((sum, member) => sum + member.amount, 0);
    };

    const getRemainingAmount = () => {
        const amountValue = parseFloat(amount) || 0;
        return amountValue - getTotalSplit();
    };

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

        // Validate split amounts
        const selectedMembers = splitMembers.filter(m => m.selected);
        if (selectedMembers.length === 0) {
            Alert.alert('Sin participantes', 'Selecciona al menos un participante.');
            return;
        }

        const totalSplit = getTotalSplit();
        const remainingAmount = Math.abs(getRemainingAmount());
        
        // Allow small rounding differences (up to 0.01)
        if (remainingAmount > 0.01) {
            Alert.alert(
                'División incorrecta', 
                `La suma de las divisiones (${formatCurrency(totalSplit)}) no coincide con el monto total (${formatCurrency(numericAmount)})`
            );
            return;
        }

        const participants = selectedMembers.map(member => ({
            id_usuario: member.user.id,
            monto_proporcional: member.amount
        }));

        console.log('Creando gasto:', {
            descripcion: description.trim(),
            monto_total: numericAmount,
            grupo_id: selectedGroupId,
            pagado_por: user!.id,
            participantes: participants,
        });

        try {
            // Generar los campos adicionales requeridos por el backend
            const currentTimestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
            const publicId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            const expensePayload = {
                grupo_id: selectedGroupId,
                descripcion: description.trim(),
                monto_total: numericAmount,
                pagado_por: user!.id,
                id_publico: publicId,
                participantes: participants,
                estado_pago: 'pendiente' as const,
                ultima_modificacion: currentTimestamp,
                modificado_por: user!.id,
            };

            console.log('Payload completo para backend:', expensePayload);

            const newExpense = await createExpense(expensePayload);

            console.log('Respuesta del createExpense:', newExpense);

            if (newExpense) {
                Alert.alert('Éxito', 'Gasto creado correctamente');
                // Reset form
                setDescription('');
                setAmount('');
                setSelectedGroupId(null);
                setSplitMembers([]);
                setSplitType('equal');
                onClose();
            } else {
                Alert.alert('Error', 'No se pudo crear el gasto.');
            }
        } catch (error) {
            console.error('Error al crear gasto:', error);
            Alert.alert('Error', 'Ocurrió un error al crear el gasto.');
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
                    <ScrollView 
                        style={styles.scrollView}
                        contentContainerStyle={styles.form}
                        showsVerticalScrollIndicator={false}
                    >
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

                        {selectedGroupId && splitMembers.length > 0 && (
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Tipo de División</Text>
                                    <View style={styles.splitTypeContainer}>
                                        <TouchableOpacity
                                            style={[styles.splitTypeButton, splitType === 'equal' && styles.splitTypeButtonSelected]}
                                            onPress={() => {
                                                console.log('Setting split type to equal');
                                                setSplitType('equal');
                                            }}
                                        >
                                            <Ionicons name="pie-chart" size={18} color={splitType === 'equal' ? 'white' : KompaColors.primary} />
                                            <Text style={[styles.splitTypeText, splitType === 'equal' && styles.splitTypeTextSelected]}>
                                                Igual
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.splitTypeButton, splitType === 'percentage' && styles.splitTypeButtonSelected]}
                                            onPress={() => {
                                                console.log('Setting split type to percentage');
                                                setSplitType('percentage');
                                            }}
                                        >
                                            <Ionicons name="stats-chart" size={18} color={splitType === 'percentage' ? 'white' : KompaColors.primary} />
                                            <Text style={[styles.splitTypeText, splitType === 'percentage' && styles.splitTypeTextSelected]}>
                                                %
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.splitTypeButton, splitType === 'custom' && styles.splitTypeButtonSelected]}
                                            onPress={() => {
                                                console.log('Setting split type to custom');
                                                setSplitType('custom');
                                            }}
                                        >
                                            <Ionicons name="calculator" size={18} color={splitType === 'custom' ? 'white' : KompaColors.primary} />
                                            <Text style={[styles.splitTypeText, splitType === 'custom' && styles.splitTypeTextSelected]}>
                                                Manual
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Participantes ({splitMembers.filter(m => m.selected).length} seleccionados)</Text>
                                    <View style={styles.splitContainer}>
                                        {splitMembers.map((member, index) => (
                                            <View key={member.user.id} style={[styles.memberRow, index === splitMembers.length - 1 && { borderBottomWidth: 0 }]}>
                                                <TouchableOpacity
                                                    style={styles.memberToggle}
                                                    onPress={() => toggleMemberSelection(member.user.id)}
                                                >
                                                    <Ionicons
                                                        name={member.selected ? "checkbox" : "checkbox-outline"}
                                                        size={24}
                                                        color={member.selected ? KompaColors.primary : KompaColors.gray200}
                                                    />
                                                    <Text style={[styles.memberName, !member.selected && styles.memberNameDisabled]}>
                                                        {member.user.name}
                                                    </Text>
                                                </TouchableOpacity>
                                                
                                                {member.selected && (
                                                    <View style={styles.memberInputContainer}>
                                                        {splitType === 'percentage' ? (
                                                            <View style={styles.percentageInput}>
                                                                <TextInput
                                                                    style={styles.splitInput}
                                                                    value={member.percentage.toFixed(1)}
                                                                    onChangeText={(text) => {
                                                                        const percentage = parseFloat(text) || 0;
                                                                        updateSplitPercentage(member.user.id, percentage);
                                                                    }}
                                                                    keyboardType="decimal-pad"
                                                                    placeholder="0"
                                                                />
                                                                <Text style={styles.inputSuffix}>%</Text>
                                                            </View>
                                                        ) : (
                                                            <View style={styles.amountInput}>
                                                                <Text style={styles.currencySymbol}>$</Text>
                                                                <TextInput
                                                                    style={styles.splitInput}
                                                                    value={member.amount.toFixed(2)}
                                                                    onChangeText={(text) => {
                                                                        const amount = parseFloat(text) || 0;
                                                                        updateSplitAmount(member.user.id, amount);
                                                                    }}
                                                                    keyboardType="decimal-pad"
                                                                    placeholder="0.00"
                                                                    editable={splitType === 'custom'}
                                                                />
                                                            </View>
                                                        )}
                                                    </View>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                    
                                    {/* Split Summary */}
                                    <View style={styles.splitSummary}>
                                        <Text style={styles.splitSummaryTitle}>Resumen de División</Text>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Monto total:</Text>
                                            <Text style={styles.summaryValue}>{formatCurrency(parseFloat(amount) || 0)}</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Total asignado:</Text>
                                            <Text style={styles.summaryValue}>{formatCurrency(getTotalSplit())}</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Restante:</Text>
                                            <Text style={[
                                                styles.summaryValue,
                                                Math.abs(getRemainingAmount()) > 0.01 && styles.summaryValueError
                                            ]}>
                                                {formatCurrency(getRemainingAmount())}
                                            </Text>
                                        </View>
                                        {splitType === 'equal' && (
                                            <View style={styles.summaryRow}>
                                                <Text style={styles.summaryLabel}>Por persona:</Text>
                                                <Text style={styles.summaryValue}>
                                                    {formatCurrency((parseFloat(amount) || 0) / splitMembers.filter(m => m.selected).length || 0)}
                                                </Text>
                                            </View>
                                        )}
                                        {Math.abs(getRemainingAmount()) > 0.01 && (
                                            <Text style={styles.validationError}>
                                                ⚠️ El total debe coincidir con el monto del gasto
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </>
                        )}
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Categoría</Text>
                            <View style={styles.selectorContainer}>
                                {categories.map(category => (
                                    <TouchableOpacity
                                        key={category}
                                        style={[
                                            styles.chip,
                                            selectedCategory === category && styles.chipSelected,
                                        ]}
                                        onPress={() => setSelectedCategory(category)}
                                    >
                                        <Text style={[styles.chipText, selectedCategory === category && styles.chipTextSelected]}>
                                            {category}
                                        </Text>
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
        height: '95%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        flexDirection: 'column',
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
    scrollView: {
        flex: 1,
    },
    form: {
        padding: 16,
        paddingBottom: 120, // Más espacio para el botón fijo
        flexGrow: 1,
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
        color: KompaColors.textPrimary,
    },
    chipTextSelected: {
        color: 'white',
        fontWeight: 'bold',
    },
    footer: {
        padding: 16,
        paddingTop: 20,
        borderTopWidth: 2,
        borderTopColor: KompaColors.gray100,
        backgroundColor: 'white',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
    // Split functionality styles
    splitTypeContainer: {
        flexDirection: 'row',
        gap: 6,
    },
    splitTypeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: KompaColors.gray200,
        backgroundColor: 'white',
        gap: 4,
        minHeight: 44,
    },
    splitTypeButtonSelected: {
        backgroundColor: KompaColors.primary,
        borderColor: KompaColors.primary,
    },
    splitTypeText: {
        fontSize: 11,
        fontWeight: '600',
        color: KompaColors.textPrimary,
    },
    splitTypeTextSelected: {
        color: 'white',
    },
    splitContainer: {
        backgroundColor: KompaColors.gray50,
        borderRadius: 8,
        padding: 12,
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: KompaColors.gray100,
    },
    memberToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    memberName: {
        fontSize: 16,
        color: KompaColors.textPrimary,
    },
    memberNameDisabled: {
        color: KompaColors.textSecondary,
    },
    memberInputContainer: {
        minWidth: 100,
    },
    percentageInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 6,
        paddingHorizontal: 8,
    },
    amountInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 6,
        paddingHorizontal: 8,
    },
    splitInput: {
        flex: 1,
        height: 36,
        textAlign: 'right',
        fontSize: 14,
    },
    inputSuffix: {
        fontSize: 14,
        color: KompaColors.textSecondary,
        marginLeft: 4,
    },
    currencySymbol: {
        fontSize: 14,
        color: KompaColors.textSecondary,
        marginRight: 4,
    },
    splitSummary: {
        marginTop: 12,
        padding: 12,
        backgroundColor: KompaColors.gray100,
        borderRadius: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 14,
        color: KompaColors.textSecondary,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: KompaColors.textPrimary,
    },
    summaryValueError: {
        color: KompaColors.error,
    },
    splitSummaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: KompaColors.textPrimary,
        marginBottom: 8,
        textAlign: 'center',
    },
    validationError: {
        fontSize: 12,
        color: KompaColors.error,
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
    },
});