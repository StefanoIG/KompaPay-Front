import { useState } from 'react';
import { useAPI } from './useAPI';
import { BASE_URL, ENDPOINTS } from './config';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './config';

export interface ResumenReporte {
  periodo: {
    fecha_inicio: string;
    fecha_fin: string;
  };
  grupos: GrupoReporte[];
  resumen: {
    total_pagado: number;
    total_adeudado: number;
    total_acreedor: number;
    balance_general: number;
    cantidad_grupos: number;
    total_gastos_periodo: number;
  };
}

export interface GrupoReporte {
  nombre: string;
  total_gastos: number;
  gastos: GastoReporte[];
  pagado_por_usuario: number;
  deuda_usuario: number;
  acreencia_usuario: number;
  balance_usuario: number;
}

export interface GastoReporte {
  descripcion: string;
  monto: string;
  fecha: string;
  pagador: string;
  usuario_pago: boolean;
  participacion_usuario: number;
  usuario_pagado: number | boolean;
  id_publico: string;
}

export interface FiltrosReporte {
  grupo_id?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export const useReportes = () => {
  const { request } = useAPI();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerResumenBalance = async (filtros?: FiltrosReporte): Promise<ResumenReporte | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filtros?.grupo_id) params.append('grupo_id', filtros.grupo_id);
      if (filtros?.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
      if (filtros?.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
      
      const queryString = params.toString();
      const endpoint = `${ENDPOINTS.REPORTS.BALANCE_SUMMARY}${queryString ? `?${queryString}` : ''}`;
      
      const response = await request<ResumenReporte>(endpoint, { method: 'GET' });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError('Error al obtener el resumen de balance');
        return null;
      }
    } catch (err) {
      setError('Error de conexión al obtener reportes');
      console.error('Error en obtenerResumenBalance:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const descargarBalancePdf = async (filtros?: FiltrosReporte): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filtros?.grupo_id) params.append('grupo_id', filtros.grupo_id);
      if (filtros?.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
      if (filtros?.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
      
      const queryString = params.toString();
      const fullUrl = `${BASE_URL}${ENDPOINTS.REPORTS.BALANCE_PDF}${queryString ? `?${queryString}` : ''}`;
      
      // Obtener token de autenticación
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      if (Platform.OS === 'web') {
        // En web, hacemos fetch y creamos un blob para descargar
        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/pdf',
          },
        });
        
        if (!response.ok) {
          throw new Error('Error al obtener el PDF');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-balance-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        return true;
      } else {
        // En React Native móvil, por ahora mostramos un mensaje
        // En producción, aquí implementarías la descarga para móvil
        setError('Descarga de PDF no implementada en móvil aún');
        return false;
      }
    } catch (err) {
      setError('Error al descargar el PDF');
      console.error('Error en descargarBalancePdf:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    obtenerResumenBalance,
    descargarBalancePdf,
  };
};
