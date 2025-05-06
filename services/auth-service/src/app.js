import express from 'express';
import cors from 'cors';

import usersRoutes from './routes/users.routes.js';
import profilesRoutes from './routes/profile.routes.js';

const app = express();

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173", // url del front
    credentials: true, // para que el front pueda recibir las cookies
}))

app.use('/auth', usersRoutes);
app.use('/', profilesRoutes);

export default app;