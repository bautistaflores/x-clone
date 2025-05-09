import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import postsRoutes from './routes/posts.routes.js';
import { createClient } from 'redis';

const app = express();

// Configuración de Redis
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://redis:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect().then(() => console.log('Redis Client Connected'));

// Hacer el cliente de Redis disponible globalmente
app.set('redisClient', redisClient);

app.use(express.json());
app.use(cookieParser());

// Configuración de CORS
app.use(cors({
  origin: "http://localhost", // El frontend se accede desde nginx
  credentials: true, // Para cookies JWT y sesiones
}));

app.use('/posts', postsRoutes);

export default app;