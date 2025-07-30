// src/hooks/useDebts.ts
import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useAPI';
import { Deuda, Acreencia, DeudaResumen, ENDPOINTS } from '../config/config';

interface DeudaResponse {
    deudas: Deuda[];
    acreencias: Acreencia[];
    resumen: DeudaResumen;
}

/**
 * Gestiona las deudas, acreencias y el resumen de saldos del usuario.
 */
export const useDebts = () => {
    const { request, loading, error } = useApi();
    const [debts, setDebts] = useState<Deuda[]>([]);
    const [credits, setCredits] = useState<Acreencia[]>([]);
    const [summary, setSummary] = useState<DeudaResumen | null>(null);

    const fetchMyDebts = useCallback(async () => {
        const response = await request<DeudaResponse>(ENDPOINTS.EXPENSES.MY_DEBTS);
        if (response) {
            setDebts(response.deudas || []);
            setCredits(response.acreencias || []);
            setSummary(response.resumen || null);
        }
    }, [request]);

    useEffect(() => {
        fetchMyDebts();
    }, [fetchMyDebts]);

    return { debts, credits, summary, loading, error, refetch: fetchMyDebts };
};