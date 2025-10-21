import { createClient } from 'redis';
import logger from '../libs/logger.js';
import config from '../config.js';

// Configuración de Redis
const redisClient = createClient({
  url: config.REDIS_URL
});

// Maneja errores de Redis
redisClient.on('error', (err) => logger.error(`Redis error: ${err.message}`));

// Conecta al iniciar la app
await redisClient.connect();

export default redisClient;