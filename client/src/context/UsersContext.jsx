import { createContext, useState, useContext, useCallback } from "react"
import { getUsersByIdsRequest } from "../api/users"

export const UsersContext = createContext()

export const useUsers = () => {
    const context = useContext(UsersContext)
    if (!context) throw new Error('useUsers must be used within a UsersProvider')
    return context
}

export const UsersProvider = ({ children }) => {
    const [users, setUsers] = useState({})

    // Buscar users por ids
    const fetchUsers = useCallback(async (userIds) => {
        try {
            const response = await getUsersByIdsRequest(userIds)
            setUsers(prevUsers => ({
                ...prevUsers,
                ...response.data
            }))
        } catch (error) {
            console.error('Error al obtener usuarios:', error)
        }
    }, [])

    // Obtener user por id
    const getUser = (userId) => {
        return users[userId] || { username: 'Usuario', full_name: 'Usuario', profile_picture: null }
    }

    return (
        <UsersContext.Provider value={{
            users,
            fetchUsers,
            getUser
        }}>
            {children}
        </UsersContext.Provider>
    )
} 