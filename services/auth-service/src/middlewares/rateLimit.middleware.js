import rateLimit from 'express-rate-limit';
import AppError from '../utils/AppError.js';

// Handler cuando se supera el límite
const limitHandler = (req, res, next) => {
  next(new AppError('Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.', 429));
};

// limitador para rutas deautenticación
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10, // limite de 10 peticiones por IP cada 15 min
  message: 'Demasiados intentos de login/registro.',
  handler: limitHandler
});

// limitador para el resto de la API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10000, // limite de 10000 peticiones
  message: 'Demasiadas peticiones.',
  handler: limitHandler,
});