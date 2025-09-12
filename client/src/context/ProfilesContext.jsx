import { createContext, useState, useContext, useCallback } from "react" // <-- Importa useCallback
import { getProfileRequest, getProfileRequestById } from "../api/profiles"

export const ProfilesContext = createContext()

export const useProfiles = () => {
    const context = useContext(ProfilesContext)
    if (!context) throw new Error('useProfile must be used within a ProfileProvider')
    return context
}

export const ProfileProvider = ({ children }) => {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    
    const getProfile = useCallback(async (username) => {
        setLoading(true) // Inicia la carga en el contexto
        setError(null)   // Limpia errores anteriores
        try {
            const response = await getProfileRequest(username)
            setProfile(response.data)
            return response.data
        } catch (error) {
            console.error('Error al obtener el perfil:', error)
            setError(error.response?.data?.error || 'No se pudo cargar el perfil.')
            setProfile(null)
            throw error
        } finally {
            setLoading(false)
        }
    }, [])

    const getProfileById = useCallback(async (userId) => {
        setLoading(true)
        setError(null)
        try {
            const response = await getProfileRequestById(userId)
            setProfile(response.data)
            return response.data
        } catch (error) {
            console.error('Error al obtener el perfil:', error)
            setError(error.response?.data?.error || 'No se pudo cargar el perfil.')
            setProfile(null)
            throw error
        } finally {
            setLoading(false)
        }
    }, [])

    return (
        <ProfilesContext.Provider 
            value={{ 
                profile, 
                getProfile,
                getProfileById,
                loading,
                error
            }}>
            {children}
        </ProfilesContext.Provider>
    )
}