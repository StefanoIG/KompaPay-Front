// src/hooks/useConflicts.ts
import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useAPI';
import { SyncConflicto, ResolveConflictRequest, ENDPOINTS } from '@/config/config';

/**
 * Gestiona la obtención y resolución de conflictos de sincronización.
 */
export const useConflicts = () => {
    const { request, loading, error } = useApi();
    const [conflicts, setConflicts] = useState<SyncConflicto[]>([]);

    const fetchConflicts = useCallback(async () => {
        const data = await request<SyncConflicto[]>(ENDPOINTS.SYNC.RESOLVE_CONFLICT);
        if (data) {
            setConflicts(data);
        }
    }, [request]);

    const resolveConflict = useCallback(async (
        conflictId: string, 
        resolution: ResolveConflictRequest
    ): Promise<boolean> => {
        const result = await request(`${ENDPOINTS.SYNC.RESOLVE_CONFLICT}/${conflictId}`, {
            method: 'POST',
            body: JSON.stringify(resolution),
        });

        if (result) {
            // Si se resolvió, lo quitamos de la lista local
            setConflicts(prev => prev.filter(c => c.id !== conflictId));
            return true;
        }
        return false;
    }, [request]);
    
    // Cargar conflictos al iniciar
    useEffect(() => {
        fetchConflicts();
    }, [fetchConflicts]);

    return { 
        conflicts, 
        loading, 
        error, 
        fetchConflicts, 
        resolveConflict,
        hasConflicts: conflicts.length > 0
    };
};