// ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import Header from "./components/Header"
import LogoIcon from "./components/Icons/LogoIcon"
import SearchProfiles from "./components/SearchProfiles"

function ProtectedRoute() {
    const { loading, isAuthenticated } = useAuth()

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <LogoIcon height={250} width={250} />
        </div>
    }

    if (!loading && !isAuthenticated) return <Navigate to="/" replace />

    return (
        <div className="min-h-screen flex">
            <div className="w-[31.23%]">
                <Header />
            </div>
            <div className="flex-1 max-w-[600px]">
                <Outlet />
            </div>

            <div className="w-[20%]">
                <div className="sticky top-0 pl-8 py-2">
                    <SearchProfiles />
                </div>
            </div>
        </div>
    )
}

export default ProtectedRoute