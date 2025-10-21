import { z } from 'zod';

// Esquema para el registro de un nuevo usuario
export const registerSchema = z.object({
    username: z.string().min(1, { message: 'El nombre de usuario es requerido' }),
    email: z.string().email({ message: 'El email es inválido' }),
    password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
});

// Esquema para el inicio de sesión
export const loginSchema = z.object({
    userInput: z.string().min(1, { message: 'El nombre de usuario o email es requerido' }),
    password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
});