// app/(tabs)/reportes.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Button, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 1. Importar los hooks de datos refactorizados
import { useReportes } from '@/hooks/useReportes';
import { FiltrosReporte, ResumenReporte } from '@/config/config'; 

// 2. Importar estilos y constantes
import { tabsStyles } from '@/styles/tabs.styles';
import { KompaColors } from '@/constants/Styles';

// (Opcional) Componentes de UI para filtros
// import { GroupSelector } from '@/components/GroupSelector';
// import { DateRangePicker } from '@/components/DateRangePicker';

export default function ReportesScreen() {
    // 3. Consumir los hooks de datos directamente
    const { obtenerResumenBalance, descargarBalancePdf, loading, error } = useReportes();
    const { groups } = useGroups(); // Obtiene la lista de grupos para el selector de filtros

    // 4. El estado de la UI (filtros y datos del reporte) vive en el componente
    const [resumen, setResumen] = useState<ResumenReporte | null>(null);
    const [filtros, setFiltros] = useState<FiltrosReporte>({});

    // 5. Los manejadores de eventos conectan la UI con la lógica de los hooks
    const handleGenerarReporte = useCallback(async () => {
        const resultado = await obtenerResumenBalance(filtros);
        if (!resultado) {
            Alert.alert('Error', error || 'No se pudo generar el reporte.');
        }
        setResumen(resultado);
    }, [obtenerResumenBalance, filtros, error]);
    
    const handleDescargarPDF = useCallback(async () => {
        const exito = await descargarBalancePdf(filtros);
        if (exito) {
            Alert.alert('Éxito', 'La descarga del PDF ha comenzado.');
        } else {
            Alert.alert('Error', error || 'No se pudo generar el PDF.');
        }
    }, [descargarBalancePdf, filtros, error]);
    
    const handleLimpiarFiltros = () => {
        setFiltros({});
        setResumen(null); // Limpia el reporte anterior
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <View style={tabsStyles.header}>
                    <Text style={tabsStyles.headerTitle}>Centro de Reportes</Text>
                    <Text style={tabsStyles.headerSubtitle}>Analiza tus gastos y balances</Text>
                </View>

                {/* Sección de Filtros */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Filtros</Text>
                    {/* Aquí irían tus componentes de UI para seleccionar grupo y fechas */}
                    {/* <GroupSelector 
                        groups={groups} 
                        selectedValue={filtros.grupo_id}
                        onValueChange={(id) => setFiltros(prev => ({...prev, grupo_id: id}))} 
                    /> */}
                    <View style={styles.buttonContainer}>
                        <Button title="Limpiar" onPress={handleLimpiarFiltros} color={KompaColors.textSecondary} />
                        <Button title="Generar Reporte" onPress={handleGenerarReporte} disabled={loading} />
                    </View>
                </View>

                {/* Sección de Resultados */}
                {loading && <ActivityIndicator size="large" color={KompaColors.primary} style={{ marginTop: 20 }}/>}

                {resumen && !loading && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Resumen de Balance</Text>
                            <TouchableOpacity onPress={handleDescargarPDF}>
                                <Text style={styles.downloadLink}>Descargar PDF</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text>Balance General:</Text>
                            <Text style={styles.summaryValue}>{resumen.resumen.balance_general}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text>Total Pagado:</Text>
                            <Text>{resumen.resumen.total_pagado}</Text>
                        </View>
                         <View style={styles.summaryItem}>
                            <Text>Total Adeudado:</Text>
                            <Text>{resumen.resumen.total_adeudado}</Text>
                        </View>
                        {/* Aquí puedes mapear y mostrar más detalles del objeto 'resumen' */}
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

// Estilos para la página de reportes
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: KompaColors.background,
    },
    container: {
        flex: 1,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    downloadLink: {
        color: KompaColors.primary,
        fontWeight: '600',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
        gap: 8,
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: KompaColors.gray100,
    },
    summaryValue: {
        fontWeight: 'bold',
        fontSize: 16,
    }
});