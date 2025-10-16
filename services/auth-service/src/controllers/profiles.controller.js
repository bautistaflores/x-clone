import prisma from '../../prisma/prisma.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getProfiles = async (req, res) => {
    try {
        const profiles = await prisma.profile.findMany();
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching profiles' });
    }
}

export const getProfile = async (req, res) => {
    const { userId, username} = req.params;

    try {
        let condicion = {};

        if (userId) {
            condicion = { id: Number(userId) };
        } else if (username) {
            condicion = { username: username };
        } else {
            return res.status(400).json({ error: 'userId o username son requeridos' });
        }

        const fullProfile = await prisma.user.findUnique({
            where: condicion,
            select: {
                username: true,
                profile: {
                    select: {
                        full_name: true,
                        bio: true,
                        profile_picture: true
                    }
                }
            }
        });

        if (!fullProfile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json(fullProfile);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Error fetching profile' });
    }
};

export const getMyProfile = async (req, res) => {
    const userId = req.userId;
    
    try {
        const profile = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                username: true,
                profile: {
                    select: {
                        full_name: true,
                        bio: true,
                        profile_picture: true
                    }
                }
            }
        });

        res.json(profile);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Error fetching profile' });
    }
}

export const updateProfile = async (req, res) => {
    const { full_name, bio } = req.body.profile;
    const userId = req.userId;

    if (full_name === undefined || full_name.trim() === '') {
        return res.status(400).json({ error: 'El nombre no puede estar vacío' });
    }

    try {
        const dataToUpdate = {}

        if (full_name !== undefined) {
            dataToUpdate.full_name = full_name;
        }
        if (bio !== undefined) {
            dataToUpdate.bio = bio; 
        }

        const updatedProfile = await prisma.profile.update({
            where: { user_id: userId },
            data: dataToUpdate
        });

        res.json({
            success: true,
            profile: updatedProfile
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Error updating profile' });
    }
}

export const uploadProfilePicture = async (req, res) => {
    const UPLOADS_BASE_DIR = path.join(__dirname, '..', '..', 'public'); 
    const DEFAULT_PROFILE_PICTURE_DB_PATH = '/images/default_profile.webp'

    try {
        // Si no se proporciona ninguna imagen, se devuelve un error
        if (!req.file) {
            return res.status(400).json({ error: 'No se ha proporcionado ninguna imagen' });
        }

        const userId = req.userId;
 
        // Busca la imagen de perfil del usuario en la base de datos
        const existingProfile = await prisma.profile.findUnique({
            where: { user_id: userId },
            select: { 
                profile_picture: true
            }
        });

        // Si no se encuentra la imagen de perfil, se devuelve un error
        if (!existingProfile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Obtiene la ruta de la imagen de perfil antigua
        const oldImagePath = existingProfile.profile_picture;

        // Usar ruta absoluta para la imagen
        const imagePath = `/profile_pictures/${userId}/${req.file.filename}`;

        // Actualizar la ruta de la imagen en la base de datos
        await prisma.profile.update({
            where: { user_id: userId },
            data: { profile_picture: imagePath }
        });

        // obtiene ruta de img antigua y ruta de img por defecto
        const oldAbsoluteImagePath = path.join(UPLOADS_BASE_DIR, oldImagePath);
        const defaultAbsolutePath = path.join(UPLOADS_BASE_DIR, DEFAULT_PROFILE_PICTURE_DB_PATH);

        // Si la img antigua existe y no es la img por defecto y no es la misma img que se está subiendo, se elimina
        if (oldImagePath && 
            oldAbsoluteImagePath !== defaultAbsolutePath &&
            oldImagePath !== imagePath
           ) 
        {
            fs.unlink(oldAbsoluteImagePath, (err) => {
                if (err) {
                    console.error(`Error al eliminar la foto de perfil antigua '${oldAbsoluteImagePath}':`, err);
                } else {
                    console.log(`Foto de perfil antigua eliminada: ${oldAbsoluteImagePath}`);
                }
            });
        }

        res.json({
            success: true,
            profile_picture: imagePath
        });
    } catch (error) {
        console.error('Error al actualizar la foto de perfil:', error);
        res.status(500).json({ error: 'Error al actualizar la foto de perfil' });
    }
};

export const searchProfiles = async (req, res) => {
    try {
        const { query } = req.query;

        const profiles = await prisma.user.findMany({
            where: { 
                OR: 
                [
                    { username: { contains: query, mode: 'insensitive' } }, 
                    { profile: { full_name: { contains: query, mode: 'insensitive' } } }
                ]},
            select: {
                username: true,
                profile: {
                    select: {
                        full_name: true,
                        profile_picture: true
                    }
                }
            },
            take: 10
        });

        res.json(profiles);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Error searching users' });
    }
}