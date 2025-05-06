import express from 'express';
import cors from 'cors';

const app = express();

app.use(express.json());

// Configuración de CORS
app.use(cors({
  origin: "http://localhost", // El frontend se accede desde nginx
  credentials: true, // Para cookies JWT y sesiones
}));

export default app;