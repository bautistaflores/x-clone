import { verifyToken } from '../libs/jwt.js';
import redisClient from '../libs/redis.js';
import AppError from '../utils/AppError.js';

// Verifica si el token es válido
export const authenticate = async (req, res, next) => {
    const {token} = req.cookies

    if (!token) throw new AppError('Token no proporcionado', 401);

    // Verifica si el token está en la blacklist
    const isBlacklisted = await redisClient.exists(`blacklist:${token}`);
    if (isBlacklisted) throw new AppError('Token en blacklist', 401);

    // Verifica si el token existe en Redis
    const isValid = await redisClient.exists(`jwt:${token}`);
    if (!isValid) throw new AppError('Token inválido o expirado', 401);

    try {
        // Verifica firma JWT
        const decoded = verifyToken(token);

        // Si el token es válido, agrega userId y token al request
        req.userId = decoded.userId;
        req.token = token;
        next();
    } catch (error) {
        logger.error(`Error al verificar el token: ${error.message}`);
        throw new AppError('Token inválido', 401);
    }
};