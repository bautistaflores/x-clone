import { createClient } from 'redis';
import logger from '../libs/logger.js';
import config from '../config.js';

// Configuración de Redis
const redisConfig = {
  url: config.REDIS_URL
};

// Configuración de Redis para HTTPS en Render
if (config.REDIS_URL.startsWith('rediss://')) {
  redisConfig.socket = {
    tls: true,
    rejectUnauthorized: false
  };
}

// Crea el cliente de Redis
const redisClient = createClient(redisConfig);

// Maneja errores de Redis
redisClient.on('error', (err) => logger.error(`Redis error: ${err.message}`));

// Conecta al iniciar la app
await redisClient.connect();

export default redisClient;