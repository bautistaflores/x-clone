import prisma from '../../prisma/prisma.js';

// Obtiene todos los perfiles
const getProfiles = async () => {
    return await prisma.profile.findMany();
}

// Obtiene un perfil mediante condicion de userId o username
const getProfile = async (condicion) => {
    return await prisma.user.findUnique({
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
}

// Obtiene el perfil del usuario
const getMyProfile = async (userId) => {
    return await prisma.user.findUnique({
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
}

// Actualiza el perfil
const updateProfile = async (userId, dataToUpdate) => {
    return await prisma.profile.update({
        where: { user_id: userId },
        data: dataToUpdate
    });
}

// Obtiene la ruta de la foto de perfil
const getProfilePicturePath = async (userId) => {
    return await prisma.profile.findUnique({
        where: { user_id: userId },
        select: { 
            profile_picture: true
        }
    });
}

// Actualiza la foto de perfil
const updateProfilePicture = async (userId, imagePath) => {
    return await prisma.profile.update({
        where: { user_id: userId },
        data: { profile_picture: imagePath }
    });
}

// Busca perfiles mediante username o nombre
const searchProfiles = async (query) => {
    return await prisma.user.findMany({
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
}

export const ProfileRepository = {
    getProfiles,
    getProfile,
    getMyProfile,
    updateProfile,
    getProfilePicturePath,
    updateProfilePicture,
    searchProfiles,
}