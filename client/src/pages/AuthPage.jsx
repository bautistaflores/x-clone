import { useAuth } from "../context/AuthContext"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import LogoIcon from "../components/Icons/LogoIcon"

function AuthPage() {
    const { isAuthenticated } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home')
        }
    }, [isAuthenticated])

    return (
        <div className="flex h-screen">
            <div className="flex-1 flex justify-center items-center p-8">
                <LogoIcon height={380} width={380}/>
            </div>

            <div className="w-[879px] flex flex-col justify-center">
                <div className="mb-25">
                    <span className="text-7xl font-bold">Lo que está <br /> pasando ahora</span>
                </div>

                <div className="mb-8">
                    <span className="text-4xl font-bold">Únete Hoy</span>
                </div>

                <div className="mb-9">
                    <Link to="/register" state={{ background: location }} className="bg-white text-black font-bold px-25 py-2.5 rounded-full hover:bg-gray-100">
                        <span>Crear cuenta</span>
                    </Link>
                    <div className="text-[11.5px] text-gray-500 mt-5 w-[300px] block">
                        Al registrarte, aceptas los
                        <span className="text-blue-400 hover:cursor-pointer"> Términos de servicio </span> 
                        y la
                        <span className="text-blue-400 hover:cursor-pointer"> Política de privacidad </span>
                        incluida la política de
                        <span className="text-blue-400 hover:cursor-pointer"> Uso de Cookies.</span>
                    </div>
                </div>

                <div className="">
                    <div>
                        <span className="text-lg font-bold">¿Ya tienes una cuenta?</span>
                    </div>
                    <div className="mt-7">
                        <Link to="/login" state={{ background: location }} className="font-bold px-25 py-2.5 rounded-full border border-gray-500 hover:bg-gray-500/20">
                            <span>Iniciar sesión</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthPage