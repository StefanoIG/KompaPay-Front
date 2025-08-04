// app/(tabs)/reportes.tsx
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Button,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// 1. Importar los hooks de datos que ya creamos
import { useReportes } from '@/hooks/useReportes';
import { FiltrosReporte, ResumenReporte } from '@/config/config';
import { useGroups } from '@/hooks/useGroups';

// 2. Importar constantes y utilidades
import { KompaColors, Shadows } from '@/constants/Styles';
import { formatCurrency } from '@/utils/formatters';

// --- Sub-Componentes para un código más limpio ---

const SummaryCard = ({ icon, title, value, trend }: { icon: any, title: string, value: any, trend?: string }) => (
    <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>{title}</Text>
            <Ionicons name={icon} size={16} color={KompaColors.textSecondary} />
        </View>
        <Text style={styles.summaryValue}>{value}</Text>
        {trend && <Text style={styles.summaryTrend}>{trend}</Text>}
    </View>
);

const ChartPlaceholder = ({ title, description }: { title: string, description: string }) => (
    <View style={[styles.card, Shadows.sm]}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
        <View style={styles.chartPlaceholder}>
            <Ionicons name="stats-chart" size={48} color={KompaColors.gray200} />
            <Text style={styles.chartText}>
                Gráfico no disponible. Integra una librería como 'react-native-svg-charts'.
            </Text>
        </View>
    </View>
);

// --- Componente Principal ---

export default function ReportsScreen() {
    // 3. Consumir los hooks de datos
    const { obtenerResumenBalance, descargarBalancePdf, loading, error } = useReportes();
    const { groups } = useGroups();

    // 4. Estado local de la UI
    const [resumen, setResumen] = useState<ResumenReporte | null>(null);
    const [filtros, setFiltros] = useState<FiltrosReporte>({});

    const handleGenerateReport = useCallback(async () => {
        const resultado = await obtenerResumenBalance(filtros);
        if (!resultado) {
            Alert.alert('Error', error || 'No se pudo generar el reporte.');
        }
        setResumen(resultado);
    }, [obtenerResumenBalance, filtros, error]);

    const handleDownloadPDF = useCallback(async () => {
        const exito = await descargarBalancePdf(filtros);
        if (exito) {
            Alert.alert('Éxito', 'La descarga del PDF ha comenzado.');
        } else {
            Alert.alert('Error', error || 'No se pudo generar el PDF.');
        }
    }, [descargarBalancePdf, filtros, error]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Centro de Reportes</Text>
                </View>

                {/* Filtros */}
                <View style={[styles.card, Shadows.sm]}>
                    <Text style={styles.cardTitle}>Filtros</Text>
                    {/* Aquí irían tus componentes de UI para seleccionar grupo y fechas */}
                    <Text style={styles.filterLabel}>Grupo</Text>
                    {/* <Picker ... /> */}
                    <Text style={styles.filterLabel}>Rango de Fechas</Text>
                    {/* <DateRangePicker ... /> */}
                    <View style={styles.buttonContainer}>
                        <Button title="Generar Reporte" onPress={handleGenerateReport} disabled={loading} />
                    </View>
                </View>

                {loading && <ActivityIndicator size="large" color={KompaColors.primary} style={{ marginVertical: 20 }}/>}

                {resumen && !loading && (
                    <>
                        {/* Tarjetas de Resumen */}
                        <View style={styles.summaryGrid}>
                            <SummaryCard icon="cash-outline" title="Gastos Totales" value={formatCurrency(resumen.resumen.total_pagado)} trend="+12.5% vs mes pasado" />
                            <SummaryCard icon="people-outline" title="Grupos Activos" value={resumen.grupos.length} trend="+2 este mes" />
                        </View>
                        
                        {/* Gráficos */}
                        <ChartPlaceholder title="Gastos por Categoría" description="Desglose de tus gastos" />
                        <ChartPlaceholder title="Tendencia Mensual" description="Evolución de tus gastos" />

                        {/* Tabla de Desglose por Grupo (convertida a lista de tarjetas) */}
                        <View style={[styles.card, Shadows.sm]}>
                            <Text style={styles.cardTitle}>Desglose por Grupo</Text>
                            {resumen.grupos.map((grupo, index) => (
                                <View key={index} style={styles.groupRow}>
                                    <Text style={styles.groupName}>{grupo.nombre}</Text>
                                    <Text>{formatCurrency(grupo.total_gastos)}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.downloadSection}>
                            <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadPDF}>
                                <Ionicons name="download-outline" size={20} color="white" />
                                <Text style={styles.downloadButtonText}>Descargar PDF</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: KompaColors.background },
    container: { padding: 16 },
    header: { marginBottom: 16 },
    headerTitle: { fontSize: 28, fontWeight: 'bold' },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    cardDescription: { color: KompaColors.textSecondary, marginBottom: 16 },
    filterLabel: { fontWeight: '500', marginTop: 8, marginBottom: 4 },
    buttonContainer: { marginTop: 16 },
    summaryGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
    },
    summaryHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    summaryTitle: { color: KompaColors.textSecondary, fontSize: 14, fontWeight: '500' },
    summaryValue: { fontSize: 22, fontWeight: 'bold', marginVertical: 8 },
    summaryTrend: { color: KompaColors.success, fontSize: 12 },
    chartPlaceholder: {
        height: 200,
        backgroundColor: KompaColors.gray50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    chartText: {
        marginTop: 8,
        color: KompaColors.textSecondary,
        textAlign: 'center',
        fontSize: 12,
    },
    groupRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: KompaColors.gray100,
    },
    groupName: {
        fontWeight: '500',
    },
    downloadSection: {
        marginTop: 16,
    },
    downloadButton: {
        backgroundColor: KompaColors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
    },
    downloadButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 8,
    },
});