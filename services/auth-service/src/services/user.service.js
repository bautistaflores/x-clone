import { UserRepository } from '../repositories/user.repository.js';
import AppError from '../utils/AppError.js';
import logger from '../libs/logger.js';
import redisClient from '../libs/redis.js';

const getAllUsers = async () => {
    const users = await UserRepository.getUsers();

    return users;
}

const verifyAuth = async (userId) => {
    const validuserId = parseInt(userId);
    if (isNaN(validuserId)) {
        throw new AppError('userId debe ser un número', 400);
    }

    const cacheKey = `profile:${validuserId}`;

    // intentamos leer desde cache
    try {
        const cachedUser = await redisClient.get(cacheKey);
        if (cachedUser) {
            logger.debug(`Cache HIT para el usuario: ${cacheKey}`);
            return JSON.parse(cachedUser);
        }
        logger.debug(`Cache MISS para el usuario: ${cacheKey}`);
    } catch (error) {
        logger.error('Error al leer de Redis (verifyAuth)', error);
    }

    // si no hay cache, leemos desde la base de datos
    const user = await UserRepository.getUserById(userId);

    if (!user) { throw new AppError('Usuario no encontrado', 404); }

    // Guardamos en cache
    try {
        // guardamos el usuario con perfil.
        await redisClient.set(cacheKey, JSON.stringify(user), {
            EX: 3600 
        });
    } catch (error) {
        logger.error('Error al guardar en Redis (verifyAuth)', error);
    }

    return user;
}

const getUsersByIds = async (userIds) => {
    if (!Array.isArray(userIds)) {
        throw new AppError('userIds debe ser un array', 400);
    }

    // Convierte los userIds a enteros
    const parsedUserIds = userIds.map(id => parseInt(id));

    const users = await UserRepository.getUsersByIds(parsedUserIds);

    // Transforma los datos para usar mas facil en frontend
    const usersMap = users.reduce((acc, user) => { // Accumulador para almacenar los usuarios
        acc[user.id] = {
            id: user.id,
            username: user.username,
            full_name: user.profile?.full_name || 'Usuario',
            profile_picture: user.profile?.profile_picture || null
        };
        return acc;
    }, {});

    return usersMap;
}

const getUserByUsername = async (username) => {
    const cacheKey = `user:${username}`;

    try {
        const cachedUserData = await redisClient.get(cacheKey);
        if (cachedUserData) {
            logger.debug(`Cache HIT para username->id: ${cacheKey}`);
            return JSON.parse(cachedUserData);
        }
        logger.debug(`Cache MISS para el usuario: ${cacheKey}`);
    } catch (error) {
        logger.error('Error al leer de Redis (getUserByUsername)', error);
    }

    const user = await UserRepository.getUserByUsername(username);

    if (!user) { throw new AppError('Usuario no encontrado', 404); }

    try {
        await redisClient.set(cacheKey, JSON.stringify(user), {
            EX: 3600
        });
    } catch (error) {
        logger.error('Error al guardar en Redis (getUserByUsername)', error);
    }

    return user;
}

export const UserService = {
    getAllUsers,
    verifyAuth,
    getUsersByIds,
    getUserByUsername,
}