import { useForm } from "react-hook-form"

function LoginPage() {

    const { register, handleSubmit } = useForm()

    return (
        <div>
            <form onSubmit={handleSubmit(values => {
                console.log(values)
            })}>
                <input type="text"
                    {...register("username", {required: true})}
                    className="border-2 border-gray-300 rounded-md p-2"
                    placeholder="Username"
                />
                <input type="password"
                    {...register("password", {required: true})}
                    className="border-2 border-gray-300 rounded-md p-2"
                    placeholder="Password"
                />
                <button type="submit">Login</button>
            </form>
        </div>
    )
}

export default LoginPage
