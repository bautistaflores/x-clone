import express from 'express';

import usersRoutes from './routes/users.routes.js';
import profilesRoutes from './routes/profile.routes.js';

const app = express();

app.use(express.json());

app.use('/auth', usersRoutes);
app.use('/', profilesRoutes);

export default app;