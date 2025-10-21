import { AuthService } from '../services/auth.service.js';

// Registra un nuevo usuario con perfil
export const register = async (req, res) => {
    const { username, email, password} = req.body;

    const { newUser, token } = await AuthService.register(username, email, password);

    // Envia token al cliente
    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'Lax',
        maxAge: 3600000
    })

    // Envia datos del usuario al cliente
    res.status(201).json({
        token,
        user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email
        },
        profile: {
            full_name: newUser.profile.full_name
        }
    });
}

// Inicia sesión
export const login = async (req, res) => {
    const { userInput, password } = req.body;

    const { user, token } = await AuthService.login(userInput, password);

    // Envia token al cliente
    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'Lax',
        maxAge: 3600000
    })

    // Envia datos del usuario al cliente
    res.json({
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            profile: user.profile,
        },
    });
}

// Cierra sesión
export const logout = async (req, res) => {
    const { token } = req.cookies;

    await AuthService.logout(token);

    // Elimina el token del navegador
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'Lax',
    });

    res.status(200).json({ success: true, message: 'Logged out' });
}