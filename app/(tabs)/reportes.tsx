import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useReportes, ResumenReporte, FiltrosReporte } from '@/hooks/useReportes';
import { useGroups } from '@/hooks/useGroups';
import { KompaColors } from '@/constants/Styles';
import { formatCurrency, formatCurrencyOptional } from '@/utils/formatters';

export default function ReportesScreen() {
  const { obtenerResumenBalance, descargarBalancePdf, loading, error } = useReportes();
  const { groups, fetchGroups } = useGroups();
  
  const [resumen, setResumen] = useState<ResumenReporte | null>(null);
  const [filtros, setFiltros] = useState<FiltrosReporte>({});
  const [showDatePicker, setShowDatePicker] = useState<'inicio' | 'fin' | null>(null);
  const [fechaInicio, setFechaInicio] = useState<Date>(new Date());
  const [fechaFin, setFechaFin] = useState<Date>(new Date());

  useEffect(() => {
    fetchGroups();
    cargarReporte();
  }, []);

  const cargarReporte = async (filtrosCustom?: FiltrosReporte) => {
    const filtrosAplicar = filtrosCustom || filtros;
    const resultado = await obtenerResumenBalance(filtrosAplicar);
    if (resultado) {
      setResumen(resultado);
    }
  };

  const aplicarFiltros = () => {
    const nuevosFiltros: FiltrosReporte = {};
    
    if (filtros.grupo_id) {
      nuevosFiltros.grupo_id = filtros.grupo_id;
    }
    
    if (showDatePicker) {
      nuevosFiltros.fecha_inicio = fechaInicio.toISOString().split('T')[0];
      nuevosFiltros.fecha_fin = fechaFin.toISOString().split('T')[0];
    }
    
    setFiltros(nuevosFiltros);
    cargarReporte(nuevosFiltros);
  };

  const limpiarFiltros = () => {
    setFiltros({});
    setFechaInicio(new Date());
    setFechaFin(new Date());
    cargarReporte({});
  };

  const descargarPDF = async () => {
    const exito = await descargarBalancePdf(filtros);
    if (exito) {
      Alert.alert('Éxito', 'PDF generado correctamente');
    } else {
      Alert.alert('Error', 'No se pudo generar el PDF');
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      if (showDatePicker === 'inicio') {
        setFechaInicio(selectedDate);
      } else if (showDatePicker === 'fin') {
        setFechaFin(selectedDate);
      }
    }
    setShowDatePicker(null);
  };

  if (loading && !resumen) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={KompaColors.primary} />
        <Text style={styles.loadingText}>Cargando reportes...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Reportes de Balance</Text>
        <Text style={styles.subtitle}>Análisis financiero de tus grupos</Text>
      </View>

      {/* Filtros */}
      <View style={styles.filtersSection}>
        <Text style={styles.sectionTitle}>Filtros</Text>
        
        {/* Selector de Grupo */}
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Grupo específico:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={filtros.grupo_id || ''}
              style={styles.picker}
              onValueChange={(itemValue) => 
                setFiltros(prev => ({ ...prev, grupo_id: itemValue || undefined }))
              }
            >
              <Picker.Item label="Todos los grupos" value="" />
              {groups.map((grupo) => (
                <Picker.Item key={grupo.id} label={grupo.nombre} value={grupo.id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Fechas */}
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Período:</Text>
          <View style={styles.dateContainer}>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker('inicio')}
            >
              <Ionicons name="calendar-outline" size={20} color={KompaColors.primary} />
              <Text style={styles.dateText}>
                Desde: {fechaInicio.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker('fin')}
            >
              <Ionicons name="calendar-outline" size={20} color={KompaColors.primary} />
              <Text style={styles.dateText}>
                Hasta: {fechaFin.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botones de filtros */}
        <View style={styles.filterButtons}>
          <TouchableOpacity style={styles.applyButton} onPress={aplicarFiltros}>
            <Ionicons name="filter" size={20} color="white" />
            <Text style={styles.buttonText}>Aplicar Filtros</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.clearButton} onPress={limpiarFiltros}>
            <Ionicons name="refresh" size={20} color={KompaColors.primary} />
            <Text style={styles.clearButtonText}>Limpiar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Resumen General */}
      {resumen && (
        <>
          <View style={styles.summarySection}>
            <View style={styles.summaryHeader}>
              <Text style={styles.sectionTitle}>Resumen General</Text>
              <TouchableOpacity style={styles.pdfButton} onPress={descargarPDF}>
                <Ionicons name="download" size={20} color="white" />
                <Text style={styles.buttonText}>PDF</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Pagado</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrencyOptional(resumen.resumen.total_pagado)}
                </Text>
              </View>
              
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Balance General</Text>
                <Text style={[
                  styles.summaryValue,
                  { color: resumen.resumen.balance_general >= 0 ? '#4CAF50' : '#F44336' }
                ]}>
                  {formatCurrencyOptional(resumen.resumen.balance_general)}
                </Text>
              </View>
              
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Grupos Activos</Text>
                <Text style={styles.summaryValue}>
                  {resumen.resumen.cantidad_grupos}
                </Text>
              </View>
              
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Gastos</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrencyOptional(resumen.resumen.total_gastos_periodo)}
                </Text>
              </View>
            </View>
          </View>

          {/* Detalles por Grupo */}
          <View style={styles.groupsSection}>
            <Text style={styles.sectionTitle}>Detalles por Grupo</Text>
            
            {resumen.grupos.map((grupo, index) => (
              <View key={index} style={styles.groupCard}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupName}>{grupo.nombre}</Text>
                  <Text style={[
                    styles.groupBalance,
                    { color: grupo.balance_usuario >= 0 ? '#4CAF50' : '#F44336' }
                  ]}>
                    {formatCurrencyOptional(grupo.balance_usuario)}
                  </Text>
                </View>
                
                <View style={styles.groupStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Pagado por ti:</Text>
                    <Text style={styles.statValue}>
                      {formatCurrencyOptional(grupo.pagado_por_usuario)}
                    </Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Tu deuda:</Text>
                    <Text style={styles.statValue}>
                      {formatCurrencyOptional(grupo.deuda_usuario)}
                    </Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Te deben:</Text>
                    <Text style={styles.statValue}>
                      {formatCurrencyOptional(grupo.acreencia_usuario)}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.expensesCount}>
                  {grupo.gastos.length} gasto{grupo.gastos.length !== 1 ? 's' : ''}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* DateTimePicker */}
      {showDatePicker && (
        <DateTimePicker
          value={showDatePicker === 'inicio' ? fechaInicio : fechaFin}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  filtersSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  filterItem: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  picker: {
    height: 50,
  },
  dateContainer: {
    gap: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  applyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: KompaColors.primary,
    borderRadius: 8,
    gap: 8,
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: KompaColors.primary,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  clearButtonText: {
    color: KompaColors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  summarySection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    gap: 4,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  groupsSection: {
    margin: 16,
  },
  groupCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  groupBalance: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  groupStats: {
    gap: 8,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  expensesCount: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
});
