// src/hooks/useExpenses.ts

import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useAPI';
import {
    Gasto,
    Deuda,
    Acreencia,
    DeudaResumen,
    CreateGastoRequest,
    UpdateGastoRequest,
    PayDebtRequest,
    ENDPOINTS,
    GroupExpensesParams,
} from '../config/config';

// Interfaz para la respuesta de deudas
interface DeudaResponse {
    deudas: Deuda[];
    acreencias: Acreencia[];
    resumen: DeudaResumen;
}

// -----------------------------------------------------------------------------
// Hook 1: useExpenses - Para listas de gastos y paginación
// -----------------------------------------------------------------------------

/**
 * Gestiona la obtención y manipulación de listas de gastos,
 * ya sean los gastos del usuario o los de un grupo específico.
 */
export const useExpenses = () => {
    const { request, loading, error } = useApi();
    const [expenses, setExpenses] = useState<Gasto[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchExpenses = useCallback(async (
        endpoint: string, 
        isRefreshing: boolean = false
    ) => {
        const currentPage = isRefreshing ? 1 : page;
        const url = `${endpoint}?page=${currentPage}`;
        
        const response = await request<{ data: Gasto[], last_page: number }>(url);

        if (response?.data) {
            setExpenses(prev => isRefreshing ? response.data : [...prev, ...response.data]);
            setHasMore(currentPage < response.last_page);
            setPage(currentPage);
        }
    }, [request, page]);

    const fetchMyExpenses = useCallback((refresh = false) => {
        return fetchExpenses(ENDPOINTS.EXPENSES.MY_EXPENSES, refresh);
    }, [fetchExpenses]);

    const fetchGroupExpenses = useCallback((groupId: string, params?: GroupExpensesParams, refresh = false) => {
        let endpoint = `${ENDPOINTS.GROUPS.EXPENSES.replace('{grupoId}', groupId)}`;
        if (params) {
            const queryParams = new URLSearchParams(params as any).toString();
            endpoint = `${endpoint}?${queryParams}`;
        }
        return fetchExpenses(endpoint, refresh);
    }, [fetchExpenses]);

    const createExpense = useCallback(async (expenseData: CreateGastoRequest) => {
        console.log('Hook createExpense - Datos enviados:', expenseData);
        console.log('Hook createExpense - Endpoint:', ENDPOINTS.EXPENSES.CREATE);
        
        try {
            const newExpense = await request<Gasto>(ENDPOINTS.EXPENSES.CREATE, {
                method: 'POST',
                body: JSON.stringify(expenseData),
            });
            
            console.log('Hook createExpense - Respuesta recibida:', newExpense);
            
            if (newExpense) {
                // Optimista: añade el gasto al inicio de la lista actual
                setExpenses(prev => [newExpense, ...prev]);
            }
            return newExpense;
        } catch (error) {
            console.error('Hook createExpense - Error:', error);
            throw error;
        }
    }, [request]);

    const loadMore = useCallback((fetcher: () => void) => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
            fetcher();
        }
    }, [loading, hasMore]);

    return {
        expenses,
        loading,
        error,
        hasMore,
        page,
        fetchMyExpenses,
        fetchGroupExpenses,
        createExpense,
        loadMore,
    };
};

// -----------------------------------------------------------------------------
// Hook 2: useExpenseDetails - Para un solo gasto
// -----------------------------------------------------------------------------

/**
 * Gestiona la obtención y actualización de los detalles de un único gasto.
 * @param expenseId El ID del gasto a gestionar.
 */
export const useExpenseDetails = (expenseId: string) => {
    const { request, loading, error } = useApi();
    const [expense, setExpense] = useState<Gasto | null>(null);

    const fetchDetails = useCallback(async () => {
        const data = await request<Gasto>(`${ENDPOINTS.EXPENSES.SHOW}/${expenseId}`);
        if (data) {
            setExpense(data);
        }
    }, [request, expenseId]);

    useEffect(() => {
        if (expenseId) {
            fetchDetails();
        }
    }, [expenseId, fetchDetails]);

    const updateExpense = useCallback(async (updates: UpdateGastoRequest) => {
        const updatedExpense = await request<Gasto>(`${ENDPOINTS.EXPENSES.UPDATE}/${expenseId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
        if (updatedExpense) {
            setExpense(updatedExpense);
        }
        return updatedExpense;
    }, [request, expenseId]);

    const deleteExpense = useCallback(async () => {
        const result = await request<null>(`${ENDPOINTS.EXPENSES.DELETE}/${expenseId}`, {
            method: 'DELETE',
        });
        if (result !== null) { // Si la petición no falló
            setExpense(null); // Limpia el estado local
            return true;
        }
        return false;
    }, [request, expenseId]);

    return {
        expense,
        loading,
        error,
        refetch: fetchDetails,
        updateExpense,
        deleteExpense,
    };
};

// -----------------------------------------------------------------------------
// Hook 3: useDebts - Para deudas y acreencias del usuario
// -----------------------------------------------------------------------------

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

    const payDebt = useCallback(async (debtData: PayDebtRequest) => {
        const result = await request<any>(ENDPOINTS.EXPENSES.PAY_DEBT, {
            method: 'POST',
            body: JSON.stringify(debtData),
        });
        if (result) {
            // Si el pago es exitoso, actualizamos toda la información de deudas
            await fetchMyDebts();
        }
        return result;
    }, [request, fetchMyDebts]);

    useEffect(() => {
        fetchMyDebts();
    }, [fetchMyDebts]);

    return { debts, credits, summary, loading, error, refetch: fetchMyDebts, payDebt };
};