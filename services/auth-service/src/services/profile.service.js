import { ProfileRepository } from '../repositories/profile.repository.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import AppError from '../utils/AppError.js';
import logger from '../libs/logger.js';
import redisClient from '../libs/redis.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getAllProfiles = async () => {
    const profiles = await ProfileRepository.getProfiles();

    return profiles;
}

const getProfile = async (userId, username) => {
    let condicion = {};
    let cacheKey = null;

    // userId o username
    if (userId) {
        condicion = { id: Number(userId) };
        cacheKey = `profile:${Number(userId)}`;
    } else if (username) {
        condicion = { username: username };
    } else {
        throw new AppError('userId o username son requeridos', 400);
    }

    // Si hay cacheKey, se lee de Redis y se devuelve el perfil
    if (cacheKey) {
        try {
            const cachedProfile = await redisClient.get(cacheKey); // devuelve el perfil guardado en cache
            if (cachedProfile) {
                logger.debug(`Cache HIT para el perfil: ${cacheKey}`);
                return JSON.parse(cachedProfile);
            }
            logger.debug(`Cache MISS para el perfil: ${cacheKey}`);
        } catch (err) {
            logger.error('Error al leer de Redis (getProfile)', err);
        }
    }

    const profile = await ProfileRepository.getProfile(condicion);

    if (!profile) {
        throw new AppError('Perfil no encontrado', 404);
    }

    // Guardamos en cache antes de devolver el perfil
    const finalCacheKey = `profile:${profile.user_id}`; 
    try {
        await redisClient.set(finalCacheKey, JSON.stringify(profile), {
            EX: 3600 // Expira en 1 hora
        });
    } catch (err) {
        logger.error('Error al guardar en Redis (getProfile)', err);
    }

    return profile;
}

const getMyProfile = async (userId) => {
    const cacheKey = `profile:${userId}`;

    try {
        const cachedProfile = await redisClient.get(cacheKey); // devuelve el perfil guardado en cache
        if (cachedProfile) {
            logger.debug(`Cache HIT para el perfil: ${cacheKey}`);
            return JSON.parse(cachedProfile);
        }
        logger.debug(`Cache MISS para el perfil: ${cacheKey}`);
    } catch (err) {
        logger.error('Error al leer de Redis (getMyProfile)', err);
    }

    const profile = await ProfileRepository.getMyProfile(userId);

    if (!profile) {
        throw new AppError('Perfil no encontrado', 404);
    }

    // Guardamos en cache antes de devolver el perfil
    try {
        await redisClient.set(cacheKey, JSON.stringify(profile), {
            EX: 3600 // Expira en 1 hora
        });
    } catch (err) {
        logger.error('Error al guardar en Redis (getMyProfile)', err);
    }

    return profile;
}

const updateProfile = async (userId, full_name, bio) => {
    const dataToUpdate = {}

    if (full_name !== undefined) {
        dataToUpdate.full_name = full_name;
    }
    if (bio !== undefined) {
        dataToUpdate.bio = bio; 
    }

    const updatedProfile = await ProfileRepository.updateProfile(userId, dataToUpdate);

    if (!updatedProfile) {
        throw new AppError('Perfil no encontrado', 404);
    }

    // El perfil cambia, por lo tanto se debe borrar la cache
    const cacheKey = `profile:${userId}`;
    try {
        await redisClient.del(cacheKey);
        logger.info(`Caché invalidado (update) para: ${cacheKey}`);
    } catch (err) {
        logger.error('Error al invalidar caché en Redis (updateProfile)', err);
    }

    return updatedProfile;
}

const uploadProfilePicture = async (userId, imagePath) => {
    // Directorio base para las imágenes de perfil
    const UPLOADS_BASE_DIR = path.join(__dirname, '..', '..', 'public'); 
    // Ruta por defecto de la imagen de perfil
    const DEFAULT_PROFILE_PICTURE_DB_PATH = '/images/default_profile.webp'

    // Si no se proporciona ninguna imagen, se devuelve un error
    if (!imagePath) {
        throw new AppError('No se proporcionó ninguna imagen', 400);
    }

    // Busca la imagen de perfil del usuario en la base de datos
    const existingProfilePicture = await ProfileRepository.getProfilePicturePath(userId);

    // Si no se encuentra la imagen de perfil, se devuelve un error
    if (!existingProfilePicture) {
        throw new AppError('Foto de perfil no encontrada', 404);
    }

    const oldImagePath = existingProfilePicture.profile_picture;

    // Usar ruta absoluta para la imagen
    const newImagePath = `/profile_pictures/${userId}/${imagePath}`;

    // Actualizar la ruta de la imagen en la base de datos
    await ProfileRepository.updateProfilePicture(userId, newImagePath);

    // obtiene ruta de img antigua y ruta de img por defecto
    const oldAbsoluteImagePath = path.join(UPLOADS_BASE_DIR, oldImagePath);
    const defaultAbsolutePath = path.join(UPLOADS_BASE_DIR, DEFAULT_PROFILE_PICTURE_DB_PATH);

    // Si la img antigua existe y no es la img por defecto y no es la misma img que se está subiendo, se elimina
    if (oldImagePath && 
        oldAbsoluteImagePath !== defaultAbsolutePath &&
        oldImagePath !== newImagePath
        ) {
        // Elimina la imagen antigua
        fs.unlink(oldAbsoluteImagePath, (err) => {
            if (err) {
                logger.error(`Error al eliminar la foto de perfil antigua '${oldAbsoluteImagePath}': ${err}`);
            } else {
                logger.info(`Foto de perfil antigua eliminada: ${oldAbsoluteImagePath}`);
            }
        });
    }

    // la foto de perfil cambio, por lo tanto se debe borrar la cache
    const cacheKey = `profile:${userId}`;
    try {
        await redisClient.del(cacheKey);
        logger.info(`Caché invalidado (uploadProfilePicture) para: ${cacheKey}`);
    } catch (err) {
        logger.error('Error al invalidar caché en Redis (uploadProfilePicture)', err);
    }


    return newImagePath;
}

const searchProfiles = async (query) => {
    // no gastamos recursos si el query está vacío
    if (!query || query.trim() === '') {
        return [];
    }

    const cacheKey = `searchProfiles:${query}`;

    // Si hay cacheKey, se lee de Redis y se devuelve el resultado
    try {
        const cachedResults = await redisClient.get(cacheKey);
        if (cachedResults) {
            logger.debug(`Cache HIT para la búsqueda de perfiles: ${cacheKey}`);
            return JSON.parse(cachedResults);
        }
        logger.debug(`Cache MISS para la búsqueda de perfiles: ${cacheKey}`);
    } catch (err) {
        logger.error('Error al leer de Redis (searchProfiles)', err);
    }

    const profiles = await ProfileRepository.searchProfiles(query);

    // Guardamos en cache antes de devolver el resultado
    try {
        await redisClient.set(cacheKey, JSON.stringify(profiles), {
            EX: 60 // Expira en 1 minuto
        });
    } catch (err) {
        logger.error('Error al guardar en Redis (searchProfiles)', err);
    }

    return profiles;
}

export const ProfileService = {
    getAllProfiles,
    getProfile,
    getMyProfile,
    updateProfile,
    uploadProfilePicture,
    searchProfiles,
}