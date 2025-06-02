import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "./context/AuthContext"

function ProtectedRoute() {
    const { loading, isAuthenticated } = useAuth()

    if (!loading && !isAuthenticated) return <Navigate to="/" replace />

    return (
        <div>
            <a href="/">Home</a>
            <a href="/notificaciones" className="ml-4">Notificaciones</a>
            <a href="/update-profile" className="ml-4">Update Profile</a>
            <Outlet />
        </div>
    )
}

export default ProtectedRoute