import { useForm } from "react-hook-form"
import { useAuth } from "../context/AuthContext"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm()
    const { signin, isAuthenticated, errors: loginErrors } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/')
        }
    }, [isAuthenticated])

    const onSubmit = handleSubmit(values => {
        signin(values)
    })

    return (
        <div>
            {
                loginErrors.map((error, i) => (
                    <p className="text-red-500" key={i}>{error}</p>
                ))
            }

            <form onSubmit={onSubmit}>
                <input type="text"
                    {...register("userInput", {required: true})}
                    className="border-2 border-gray-300 rounded-md p-2"
                    placeholder="Username or Email"
                />
                {errors.userInput && <p className="text-red-500">Username or Email is required</p>}
                <input type="password"
                    {...register("password", {required: true})}
                    className="border-2 border-gray-300 rounded-md p-2"
                    placeholder="Password"
                />
                {errors.password && <p className="text-red-500">Password is required</p>}
                <button type="submit">Login</button>
            </form>
        </div>
    )
}

export default LoginPage
