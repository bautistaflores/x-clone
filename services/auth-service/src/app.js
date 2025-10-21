import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import logger from './libs/logger.js';

import usersRoutes from './routes/users.routes.js';
import profileRoutes from './routes/profile.routes.js';

import { errorHandler } from './middlewares/error.middleware.js';
import { apiLimiter } from './middlewares/rateLimit.middleware.js';

const app = express();

app.set('trust proxy', 1); // para que express sepa que está detrás de un proxy (nginx)

app.use(express.json());
app.use(helmet());
// Configura morgan para que use 'info' de winston
app.use(morgan('dev', { 
    stream: { write: (message) => logger.info(message.trim()) }
}));
app.use(cookieParser());

// Configuración de CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost", // El frontend se accede desde nginx
    credentials: true, // Para cookies JWT y sesiones
}));

// Rutas
app.use('/auth', apiLimiter, usersRoutes);
app.use('/profiles', apiLimiter, profileRoutes);

app.use(errorHandler);

export default app;