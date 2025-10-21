import { z } from 'zod';

export const updateProfileSchema = z.object({
  profile: z
    .object({
        // no puede estar vacio
        full_name: z
            .string()
            .min(1, { message: 'El nombre no puede estar vacío' })
            .optional(),

        // puede estar vacio
        bio: z.string().optional(),
    })
    // al menos uno para actualizar el perfil
    .refine(
      (data) => data.full_name !== undefined || data.bio !== undefined,
      {
        message: 'Se requiere al menos uno para actualizar el perfil',
        path: ['profile'],
      }
    ),
});