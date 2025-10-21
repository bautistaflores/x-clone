import { UserRepository } from '../repositories/user.repository.js';
import bcryptjs from 'bcryptjs';
import redisClient from '../libs/redis.js';
import { generateToken } from '../libs/jwt.js';
import AppError from '../utils/AppError.js';
import logger from '../libs/logger.js';

const register = async (username, email, password) => {
    // Verifica si el usuario ya existe
    const existingUser = await UserRepository.findExistingUser(email, username);

    if (existingUser) {
        throw new AppError('El usuario ya existe', 400);
    }

    // Nombre por defecto del perfil
    const randomId = Math.floor(Math.random() * 1000000); // Genera un id random
    const defaultProfile = {
        full_name: `user${randomId}`,
        profile_picture: `/profile_pictures/default_profile.webp`
    }

    // Encriptar contraseña
    const hashedPassword = await bcryptjs.hash(password, 12);

    const userData = {
        username,
        email,
        password: hashedPassword,
        profile: {
            create: defaultProfile
        }
    }

    // Crea el usuario
    const newUser = await UserRepository.create(userData);

    logger.info(`Nuevo usuario creado: ${newUser.username} (ID: ${newUser.id})`);

    // Generar token
    const token = generateToken(newUser.id);

    // Guardar token en Redis
    await redisClient.set(`jwt:${token}`, 'valid', { EX: 3600 });

    return {newUser, token};
}

const login = async (userInput, password) => {
    // Verifica si el usuario existe
    const user = await UserRepository.findByEmailOrUsername(userInput);
    if (!user) { throw new AppError('Usuario no encontrado', 404); }

    // Verifica la contraseña encriptada
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if(!isPasswordValid) { throw new AppError('Contraseña incorrecta', 401); }

    // Generar token
    const token = generateToken(user.id);

    // Guardar token en Redis
    await redisClient.set(`jwt:${token}`, 'valid', { EX: 3600 });

    logger.info(`Usuario iniciado sesión: ${user.username} (ID: ${user.id})`);

    return { user, token };
}

const logout = async (token) => {
    if (!token) { throw new AppError('Token no proporcionado', 401); }

    try {
        // Elimina el token de Redis
        await redisClient.del(`jwt:${token}`);

        // Añade el token a la blacklist para registrar tokens inválidos
        await redisClient.set(`blacklist:${token}`, 'invalid', 'EX', 600); // 10 minutos
    } catch (redisErr) {
        // Si Redis falla, solo loguea, no detengas al usuario
        logger.error('Fallo al invalidar token en Redis durante logout', redisErr);
    }
}

export const AuthService = {
    register,
    login,
    logout
}