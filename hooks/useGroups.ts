// src/hooks/useGroups.ts

import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useAPI';
import {
    Grupo,
    User,
    CreateGrupoRequest,
    UpdateGrupoRequest,
    JoinGroupRequest,
    InviteMemberRequest,
    ENDPOINTS,
} from '../config/config';

// -----------------------------------------------------------------------------
// Hook 1: useGroups - Para la lista de grupos del usuario
// -----------------------------------------------------------------------------

/**
 * Gestiona la lista de grupos a los que pertenece un usuario.
 * Se encarga de obtener la lista, crear nuevos grupos y unirse a existentes.
 */
export const useGroups = () => {
    const { request, loading, error } = useApi();
    const [groups, setGroups] = useState<Grupo[]>([]);

    const fetchGroups = useCallback(async () => {
        const data = await request<any>(ENDPOINTS.GROUPS.LIST);
        if (data) {
            // La API devuelve un objeto con claves numéricas, convertirlo a array
            const groupsArray = Array.isArray(data) ? data : Object.values(data);
            setGroups(groupsArray as Grupo[]);
        }
    }, [request]);

    // Cargar los grupos automáticamente la primera vez que se usa el hook
    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    const createGroup = useCallback(async (groupData: CreateGrupoRequest) => {
        const newGroup = await request<Grupo>(ENDPOINTS.GROUPS.CREATE, {
            method: 'POST',
            body: JSON.stringify(groupData),
        });
        if (newGroup) {
            // Después de crear, recargamos la lista para tener el estado más reciente
            await fetchGroups();
        }
        return newGroup;
    }, [request, fetchGroups]);

    const joinGroup = useCallback(async (joinData: JoinGroupRequest) => {
        const joinedGroup = await request<Grupo>(ENDPOINTS.GROUPS.JOIN, {
            method: 'POST',
            body: JSON.stringify(joinData),
        });
        if (joinedGroup) {
            // Después de unirse, recargamos la lista
            await fetchGroups();
        }
        return joinedGroup;
    }, [request, fetchGroups]);
    
    // Función de utilidad que puede ser usada desde cualquier componente
    const findUserByPublicId = useCallback(async (publicId: string) => {
        return request<User>(ENDPOINTS.USERS.FIND_BY_PUBLIC_ID, {
            method: 'POST',
            body: JSON.stringify({ id_publico: publicId }),
        });
    }, [request]);

    return {
        groups,
        loading,
        error,
        fetchGroups, // Se expone por si se necesita un refresh manual
        createGroup,
        joinGroup,
        findUserByPublicId
    };
};

// -----------------------------------------------------------------------------
// Hook 2: useGroupDetails - Para un solo grupo
// -----------------------------------------------------------------------------

/**
 * Gestiona los detalles y miembros de un único grupo.
 * @param groupId El ID del grupo a gestionar.
 */
export const useGroupDetails = (groupId: string) => {
    const { request, loading, error } = useApi();
    const [group, setGroup] = useState<Grupo | null>(null);

    const fetchDetails = useCallback(async () => {
        if (!groupId) return;
        const data = await request<Grupo>(`${ENDPOINTS.GROUPS.SHOW}/${groupId}`);
        if (data) {
            setGroup(data);
        }
    }, [request, groupId]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const updateGroup = useCallback(async (updates: UpdateGrupoRequest) => {
        const updatedGroup = await request<Grupo>(`${ENDPOINTS.GROUPS.UPDATE}/${groupId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
        if (updatedGroup) {
            setGroup(updatedGroup); // Actualiza el estado local
        }
        return updatedGroup;
    }, [request, groupId]);
    
    const deleteGroup = useCallback(async () => {
        const result = await request<null>(`${ENDPOINTS.GROUPS.DELETE}/${groupId}`, {
            method: 'DELETE',
        });
        if (result !== null) {
            setGroup(null);
            return true;
        }
        return false;
    }, [request, groupId]);

    // --- Gestión de Miembros ---

    const addMember = useCallback(async (userId: string) => {
        const endpoint = ENDPOINTS.GROUPS.ADD_MEMBER.replace('{grupoId}', groupId);
        await request(endpoint, { method: 'POST', body: JSON.stringify({ user_id: userId }) });
        await fetchDetails(); // Recargar para ver al nuevo miembro
    }, [request, groupId, fetchDetails]);
    
    const removeMember = useCallback(async (userId: string) => {
        const endpoint = ENDPOINTS.GROUPS.REMOVE_MEMBER
            .replace('{grupoId}', groupId)
            .replace('{usuarioId}', userId);
        await request(endpoint, { method: 'DELETE' });
        await fetchDetails(); // Recargar para reflejar el cambio
    }, [request, groupId, fetchDetails]);

    const inviteMember = useCallback(async (inviteData: InviteMemberRequest) => {
        const endpoint = ENDPOINTS.GROUPS.INVITE_MEMBER.replace('{grupoId}', groupId);
        return request(endpoint, { method: 'POST', body: JSON.stringify(inviteData) });
    }, [request, groupId]);

    return {
        group,
        loading,
        error,
        refetch: fetchDetails,
        updateGroup,
        deleteGroup,
        addMember,
        removeMember,
        inviteMember,
    };
};