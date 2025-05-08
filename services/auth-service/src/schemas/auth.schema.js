import { z } from 'zod';

export const registerSchema = z.object({
    username: z.string().min(1, { message: 'Username is required' }),
    email: z.string().email({ message: 'Invalid email' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' })
});
