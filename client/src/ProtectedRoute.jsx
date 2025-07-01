import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import Header from "./components/Header"

function ProtectedRoute() {
    const { loading, isAuthenticated } = useAuth()

    if (!loading && !isAuthenticated) return <Navigate to="/" replace />

    return (
        <div className="flex w-full min-h-screen">
            <Header />
            <Outlet />
        </div>
    )
}

export default ProtectedRoute