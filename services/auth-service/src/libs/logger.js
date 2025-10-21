import winston from 'winston';

// Determina el nivel de log basado en el entorno
const level = process.env.NODE_ENV === 'production' ? 'warn' : 'info';

// formato legible para la consola
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(
    (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
  )
);

// Crea la instancia del logger
const logger = winston.createLogger({
  level: level,
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

export default logger;