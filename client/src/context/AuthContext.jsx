import { createContext, useState, useContext, useEffect } from "react"
import { registerRequest, loginRequest, logoutRequest, verifyAuthRequest } from "../api/auth"
import Cookies from 'js-cookie'

export const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within an AuthProvider')
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [errors, setErrors] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const res = await verifyAuthRequest()
                setUser(res.data.user)
                setIsAuthenticated(true)
            } catch (error) {
                console.log('No hay sesión activa')
                setIsAuthenticated(false)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        verifyAuth()
    }, [])

    const signup = async (user) => {
        try {
            const res = await registerRequest(user)
            console.log(res.data)
            setUser(res.data.user)
            setIsAuthenticated(true)
        } catch (error) {
            setErrors(error.response.data)
        }
    }

    const signin = async (user) => {
        try {
            const res = await loginRequest(user)
            console.log('Respuesta del login:', res.data)
            setUser(res.data.user)
            setIsAuthenticated(true)
        } catch (error) {
            console.log(error)
            setErrors(error.response.data)
        }
    }

    const logout = async () => {
        try {
            const res = await logoutRequest()
            console.log(res.data)
            Cookies.remove('token')
            setUser(null)
            setIsAuthenticated(false)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (errors.length > 0) {
            const timer = setTimeout(() => {
                setErrors([])
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [errors])

    return (
        <AuthContext.Provider value={{
            signup,
            signin,
            logout,
            user,
            isAuthenticated,
            errors,
            loading,
        }}>
            {children}
        </AuthContext.Provider>
    )
}
