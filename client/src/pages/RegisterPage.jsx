import { useForm } from "react-hook-form"
import { useAuth } from "../context/AuthContext"
import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import CloseIcon from "../components/Icons/CloseIcon"
import LogoIcon from "../components/Icons/LogoIcon"

function RegisterPage() {
    const { register, handleSubmit, formState: { errors } } = useForm()
    const { signup, isAuthenticated, errors: registerErrors } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const handleCloseModal = () => {
        if (location.state && location.state.background) {
            navigate(-1)
        } else {
            navigate('/home')
        }
    }

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home')
        }
    }, [isAuthenticated])

    const onSubmit = handleSubmit(async values => {
        signup(values)
    })

    return (
        <div 
            style={{ backgroundColor: 'rgba(91, 112, 131, 0.4)' }} 
            className="fixed inset-0 flex items-center justify-center"
        >
            <div className="bg-black rounded-2xl w-full max-w-xl">
                {/* boton cerrar */}
                <div className="flex items-center">
                    <input type="file" accept="image/*" className="hidden" />
                    <button onClick={handleCloseModal} className="cursor-pointer hover:bg-[#1e1e1e] rounded-full p-2 m-2">
                        <CloseIcon />
                    </button>

                    <LogoIcon height={28} width={28} className="absolute left-1/2 transform -translate-x-1/2"/>
                </div>

                <div className="flex flex-col items-center p-4">
                    <span className="text-3xl font-bold mb-4">Crea tu cuenta</span>

                    {
                        registerErrors.map((error, i) => (
                            <p className="text-red-500" key={i}>{error}</p>
                        ))
                    }

                    <form onSubmit={onSubmit} className="flex flex-col gap-2">
                        <div className={`relative border border-gray-500 rounded-sm py-2 px-2 ${errors.username ? 'border-red-500' : 'focus-within:border-blue-400'}`}>
                            <input 
                                type="text" 
                                id="username"
                                {...register("username", {required: true})}
                                className="peer bg-transparent outline-none w-full placeholder-transparent pt-4"
                                placeholder="Username"
                            />
                            <label
                                htmlFor="username"
                                className={`absolute left-2 top-1 text-gray-400 text-sm transition-all duration-150 ease-out pointer-events-none peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-400 hover:cursor-text ${errors.username ? 'peer-focus:text-red-500' : ''}`}
                            >
                                Nombre de usuario
                            </label>
                        </div>

                        <div className={`relative border border-gray-500 rounded-sm py-2 px-2 ${errors.email ? 'border-red-500' : 'focus-within:border-blue-400'}`}>
                            <input 
                                type="email"
                                id="email"
                                {...register("email", {required: true})}
                                className="peer bg-transparent outline-none w-full placeholder-transparent pt-4"
                                placeholder="Email"
                            />
                            <label
                                htmlFor="email"
                                className={`absolute left-2 top-1 text-gray-400 text-sm transition-all duration-150 ease-out pointer-events-none peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-400 hover:cursor-text ${errors.email ? 'peer-focus:text-red-500' : ''}`}
                            >
                                Correo electrónico
                            </label>
                        </div>

                        <div className={`relative border border-gray-500 rounded-sm py-2 px-2 ${errors.password ? 'border-red-500' : 'focus-within:border-blue-400'}`}>
                            <input 
                                type="password"
                                id="password"
                                {...register("password", {required: true})}
                                className="peer bg-transparent outline-none w-full placeholder-transparent pt-4"
                                placeholder="Password"
                            />
                            <label
                                htmlFor="password"
                                className={`absolute left-2 top-1 text-gray-400 text-sm transition-all duration-150 ease-out pointer-events-none peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-400 hover:cursor-text ${errors.password ? 'peer-focus:text-red-500' : ''}`}
                            >
                                Contraseña
                            </label>
                        </div>

                        <button type="submit" className="mt-4 mb-15 bg-white text-black font-bold px-25 py-2 rounded-full hover:bg-gray-100 cursor-pointer">Registrarse</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage
