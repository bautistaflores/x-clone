import { ZodError } from 'zod';
import logger from '../libs/logger.js';

export const errorHandler = (err, req, res, next) => {
  
  // registra el error
  logger.error(err.message, { 
    statusCode: err.statusCode || 500,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // maneja errores de validacion
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Error de validación',
      // mapea los errores para que el frontend los entienda
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // maneja errores personalizados
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // maneja errores genericos
  return res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message,
  });
};