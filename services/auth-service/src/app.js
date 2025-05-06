import express from 'express';
import cors from 'cors';
import usersRoutes from './routes/users.routes.js';
import profilesRoutes from './routes/profile.routes.js';

const app = express();

app.use(express.json());

// Configuración de CORS
app.use(cors({
  origin: "http://localhost", // El frontend se accede desde nginx
  credentials: true, // Para cookies JWT y sesiones
}));

app.use('/auth', usersRoutes);

export default app;