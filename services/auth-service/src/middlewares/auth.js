import { verifyToken } from '../libs/jwt.js';
import redisClient from '../libs/redis.js';

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  try {
    // 1. ¿Token existe en Redis?
    const isValid = await redisClient.exists(`jwt:${token}`);
    if (!isValid) return res.status(401).json({ error: 'Token inválido o expirado' });

    // 2. Verificar firma JWT
    const decoded = verifyToken(token);
    req.userId = decoded.userId; // Añade userId al request
    req.token = token; // Añade token al request

    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};