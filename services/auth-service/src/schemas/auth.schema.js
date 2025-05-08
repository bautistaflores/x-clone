import { z } from 'zod';

export const registerSchema = z.object({
    username: z.string().min(1, { message: 'Username is required' }),
    email: z.string().email({ message: 'Invalid email' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' })
});

export const loginSchema = z.object({
    userInput: z.string().min(1, { message: 'Username or email is required' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' })
});
