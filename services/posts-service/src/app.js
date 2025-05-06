import express from 'express';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors({
    origin: "http://localhost:80", // url del front
    credentials: true, // para que el front pueda recibir las cookies
}))

export default app;