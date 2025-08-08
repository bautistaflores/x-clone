import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import postsRoutes from './routes/posts.routes.js';
import { createClient } from 'redis';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Redis
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://redis:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

// Conectar a Redis
redisClient.connect()
    .then(() => console.log('Redis connection established'))
    .catch(err => console.error('Redis connection error:', err));

// Hacer el cliente de Redis disponible globalmente
app.set('redisClient', redisClient);

app.use(express.json());
app.use(cookieParser());

// Configuración de CORS
app.use(cors({
  origin: "http://localhost", // El frontend se accede desde nginx
  credentials: true, // Para cookies JWT y sesiones
}));

// Servir archivos estáticos 
app.use('/imagePost', express.static(path.join(__dirname, '../public/imagePosts'), {
    setHeaders: (res, path) => {
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }
}));

app.use('/posts', postsRoutes);

export default app;