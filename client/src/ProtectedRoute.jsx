// ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import Header from "./components/Header"

function ProtectedRoute() {
    const { loading, isAuthenticated } = useAuth()

    if (!loading && !isAuthenticated) return <Navigate to="/" replace />

    return (
        <div className="min-h-screen">
            <Header />
            <div className="absolute left-3/10 top-0 right-0 overflow-y-auto">
                <Outlet />
            </div>
        </div>
    )
}

export default ProtectedRoute