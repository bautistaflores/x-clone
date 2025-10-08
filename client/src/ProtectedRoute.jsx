// ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import Header from "./components/Header"
import LogoIcon from "./components/Icons/LogoIcon"

function ProtectedRoute() {
    const { loading, isAuthenticated } = useAuth()

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <LogoIcon height={250} width={250} />
        </div>
    }

    if (!loading && !isAuthenticated) return <Navigate to="/" replace />

    return (
        <div className="min-h-screen">
            <Header />
            <div className="absolute left-[31.23%] top-0 right-0 w-[600px]">
                <Outlet />
            </div>
        </div>
    )
}

export default ProtectedRoute