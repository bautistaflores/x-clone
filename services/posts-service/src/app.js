import express from 'express';
import cors from 'cors';
import postsRoutes from './routes/posts.routes.js';

const app = express();

app.use(express.json());

// Configuración de CORS
app.use(cors({
  origin: "http://localhost", // El frontend se accede desde nginx
  credentials: true, // Para cookies JWT y sesiones
}));

app.use('/posts', postsRoutes);

export default app;