import { useGroups } from '@/hooks/useGroups';
import { FiltrosReporte, ResumenReporte, useReportes } from '@/hooks/useReportes';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export function useReportesPageLogic() {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return {
    resumen,
    filtros,
    setFiltros,
    showDatePicker,
    setShowDatePicker,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    groups,
    loading,
    error,
    aplicarFiltros,
    limpiarFiltros,
    descargarPDF,
    onDateChange,
  };
}
