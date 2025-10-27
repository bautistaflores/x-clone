import { z } from 'zod';
import dotenv from 'dotenv';

// Carga las variables del .env
dotenv.config();

// esquema de variables de entorno
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    
    DATABASE_URL: z.string().min(1, 'DATABASE_URL no puede estar vacio'),
    
    JWT_SECRET: z.string().min(1, 'JWT_SECRET no puede estar vacio'),

    PORT: z.coerce.number().default(3000), // 'coerce' convierte "3000" a número

    REDIS_URL: z.string().min(1, 'REDIS_URL no puede estar vacio'),
});

// validamos las variables de entorno
// .parse falla y frena la app si falta una variable 
const validatedEnv = envSchema.parse(process.env);

// exportamos las variables validadas y tipadas
export default validatedEnv;