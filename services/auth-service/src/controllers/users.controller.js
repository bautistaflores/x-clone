import { UserService } from '../services/user.service.js';

// Obtiene todos los usuarios
export const getUsers = async (req, res) => {
    const users = await UserService.getAllUsers();
    
    res.json(users);
}

// Verifica si el usuario está autenticado
export const verifyAuth = async (req, res) => {
    // El middleware authenticate ya verifica el token y asigna req.userId
    const user = await UserService.verifyAuth(req.userId);

    res.json({
        user,
        profile: user.profile,
        isAuthenticated: true
    });
};

// Obtiene los usuarios mediante sus ids
export const getUsersByIds = async (req, res) => {
    const { userIds } = req.body;

    const users = await UserService.getUsersByIds(userIds);

    res.json(users);
};

// Obtiene un usuario mediante su username
export const getUserByUsername = async (req, res) => {
    const { username } = req.params;

    const user = await UserService.getUserByUsername(username);

    res.json(user);
};