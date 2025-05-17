import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import usersRoutes from './routes/users.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

app.use(express.json());
app.use(cookieParser());


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Configuración de CORS
app.use(cors({
  origin: "http://localhost", // El frontend se accede desde nginx
  credentials: true, // Para cookies JWT y sesiones
}));


app.use('/auth', usersRoutes);

export default app;