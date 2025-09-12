import { useState, useEffect, useCallback } from 'react';
import { useProfiles } from '../context/ProfilesContext';

/**
 * Hook personalizado para manejar los perfiles de usuarios en notificaciones
 * @param {Array} notifications - Array de notificaciones
 * @returns {Object} - Objeto con userProfiles, loading, y función para obtener perfil
 */
export const useNotificationProfiles = (notifications = []) => {
    const { getProfileById, loading: profileLoading } = useProfiles();
    const [userProfiles, setUserProfiles] = useState({});
    const [loadingProfiles, setLoadingProfiles] = useState({});

    // Función para obtener el perfil de un usuario
    const fetchUserProfile = useCallback(async (userId) => {
        if (userProfiles[userId] || loadingProfiles[userId]) return; // Ya tenemos el perfil o está cargando
        
        setLoadingProfiles(prev => ({ ...prev, [userId]: true }));
        
        try {
            const profile = await getProfileById(userId);
            setUserProfiles(prev => ({
                ...prev,
                [userId]: profile
            }));
        } catch (error) {
            console.error(`Error al obtener perfil del usuario ${userId}:`, error);
            // Opcional: podrías manejar el error de manera más específica aquí
        } finally {
            setLoadingProfiles(prev => ({ ...prev, [userId]: false }));
        }
    }, [getProfileById, userProfiles, loadingProfiles]);

    // Función para obtener el perfil de un usuario específico
    const getUserProfile = useCallback((userId) => {
        return userProfiles[userId] || null;
    }, [userProfiles]);

    // Función para obtener el nombre de visualización de un usuario
    const getDisplayName = useCallback((userId) => {
        const profile = userProfiles[userId];
        if (!profile) return `Usuario ${userId}`;
        
        return profile.profile?.full_name || profile.username || `Usuario ${userId}`;
    }, [userProfiles]);

    // Función para obtener la foto de perfil de un usuario
    const getProfilePicture = useCallback((userId) => {
        const profile = userProfiles[userId];
        return profile?.profile?.profile_picture || null;
    }, [userProfiles]);

    // Función para verificar si un perfil está cargando
    const isProfileLoading = useCallback((userId) => {
        return loadingProfiles[userId] || false;
    }, [loadingProfiles]);

    // Efecto para obtener perfiles de usuarios únicos en las notificaciones
    useEffect(() => {
        if (!notifications || notifications.length === 0) return;

        const uniqueUserIds = [...new Set(
            notifications
                .map(notification => notification.fromUserId)
                .filter(userId => userId) // Filtrar IDs nulos o undefined
        )];
        
        uniqueUserIds.forEach(userId => {
            fetchUserProfile(userId);
        });
    }, [notifications, fetchUserProfile]);

    return {
        userProfiles,
        fetchUserProfile,
        getUserProfile,
        getDisplayName,
        getProfilePicture,
        isProfileLoading,
        isLoading: profileLoading
    };
};

export default useNotificationProfiles;

