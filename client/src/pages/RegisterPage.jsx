import { useForm } from "react-hook-form"
import { useAuth } from "../context/AuthContext"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

function RegisterPage() {
    const { register, handleSubmit, formState: { errors } } = useForm()
    const { signup, isAuthenticated, errors: registerErrors } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home')
        }
    }, [isAuthenticated])

    const onSubmit = handleSubmit(async values => {
        signup(values)
    })

    return (
        <div>
            {
                registerErrors.map((error, i) => (
                    <p className="text-red-500" key={i}>{error}</p>
                ))
            }

            <form onSubmit={onSubmit}>
                <input type="text" 
                    {...register("username", {required: true})}
                    className="border-2 border-gray-300 rounded-md p-2"
                    placeholder="Username"
                />
                {errors.username && <p className="text-red-500">Username is required</p>}
                <input type="email"
                    {...register("email", {required: true})}
                    className="border-2 border-gray-300 rounded-md p-2"
                    placeholder="Email"
                />
                {errors.email && <p className="text-red-500">Email is required</p>}
                <input type="password"
                    {...register("password", {required: true})}
                    className="border-2 border-gray-300 rounded-md p-2"
                    placeholder="Password"
                />
                {errors.password && <p className="text-red-500">Password is required</p>}

                <button type="submit">Register</button>
            </form>
        </div>
    )
}

export default RegisterPage
