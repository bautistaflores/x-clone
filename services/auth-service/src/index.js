import app from './app.js';
import logger from './libs/logger.js';
import config from './config.js';

const PORT = config.PORT;

// Escucha en 0.0.0.0 para aceptar conexiones desde cualquier IP dentro de la red Docker
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Auth-Service on port ${PORT}`);
});
