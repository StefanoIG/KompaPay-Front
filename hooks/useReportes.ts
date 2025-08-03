// src/hooks/useReportes.ts

import { useState, useCallback } from 'react';
import { useApi } from './useAPI'; // Usaremos nuestra versión mejorada
import { ENDPOINTS, FiltrosReporte, ResumenReporte } from '../config/config';
import { Platform } from 'react-native';

// Importar librerías para descarga en móvil (ejemplo)
// import * as FileSystem from 'expo-file-system';
// import * as Sharing from 'expo-sharing';

/**
 * Hook para generar y gestionar reportes de la aplicación.
 */
export const useReportes = () => {
    // Usamos useApi que ya maneja loading y error.
    const { request, loading, error, clearError } = useApi();

    /**
     * Obtiene el resumen de balance en formato JSON.
     * @param filtros Opciones para filtrar el reporte (grupo, fechas).
     * @returns Un objeto con el resumen del reporte o null si hay un error.
     */
    const obtenerResumenBalance = useCallback(async (filtros?: FiltrosReporte): Promise<ResumenReporte | null> => {
        const params = new URLSearchParams(filtros as any).toString();
        const endpoint = `${ENDPOINTS.REPORTS.BALANCE_SUMMARY}${params ? `?${params}` : ''}`;
        
        // El hook useApi se encarga del estado de carga y error.
        return await request<ResumenReporte>(endpoint);
    }, [request]);

    /**
     * Descarga el reporte de balance en formato PDF.
     * @param filtros Opciones para filtrar el reporte.
     * @returns Un booleano indicando si la operación fue exitosa.
     */
    const descargarBalancePdf = useCallback(async (filtros?: FiltrosReporte): Promise<boolean> => {
        const params = new URLSearchParams(filtros as any).toString();
        const endpoint = `${ENDPOINTS.REPORTS.BALANCE_PDF}${params ? `?${params}` : ''}`;

        // Llamamos a nuestro useApi pidiendo una respuesta de tipo 'blob'
        const blob = await request<Blob>(endpoint, {});

        if (!blob) {
            return false; // El hook useApi ya habrá establecido el error.
        }

        try {
            if (Platform.OS === 'web') {
                // Lógica para descargar el archivo en el navegador
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `reporte-balance-${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                return true;
            } else {
                // Lógica para descargar y compartir en móvil (iOS/Android)
                // const uri = FileSystem.documentDirectory + 'reporte.pdf';
                // const base64 = await blobToBase64(blob); // Necesitarías una función auxiliar
                // await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
                // await Sharing.shareAsync(uri);
                console.warn('La descarga de PDF en móvil necesita implementación nativa.');
                return false;
            }
        } catch (downloadError) {
            console.error("Error al procesar el PDF:", downloadError);
            return false;
        }
    }, [request]);

    return {
        loading,
        error,
        clearError,
        obtenerResumenBalance,
        descargarBalancePdf,
    };
};

// Función auxiliar para convertir Blob a Base64 en móvil (si se necesita)
// function blobToBase64(blob: Blob): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onerror = reject;
//     reader.onload = () => {
//       const dataUrl = reader.result as string;
//       const base64 = dataUrl.split(',')[1];
//       resolve(base64);
//     };
//     reader.readAsDataURL(blob);
//   });
// }