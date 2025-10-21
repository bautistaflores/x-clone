import prisma from '../../prisma/prisma.js';

// Crea un nuevo usuario
const create = async (userData) => {
    return await prisma.user.create({
        data: userData,
        include: {
            profile: true,
        }
    });
};

const getUsers = async () => {
    return await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            email: true,
            profile: true
        }
    });
}

const getUserById = async (userId) => {
    return await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
    });
}

// Obtiene los usuarios mediante sus ids
const getUsersByIds = async (userIds) => {
    return await prisma.user.findMany({
        where: {
            id: {
                in: userIds
            }
        },
        select: {
            id: true,
            username: true,
            profile: {
                select: {
                    full_name: true,
                    profile_picture: true
                }
            }
        }
    });
}

const getUserByUsername = async (username) => {
    return await prisma.user.findUnique({
        where: { username },
        select: { id: true }
    });
}

// Busca un usuario por email o username para login
const findByEmailOrUsername = async (userInput) => {
    return await prisma.user.findFirst({
        where: {
            OR: [
                { username: userInput },
                { email: userInput }
            ]
        },
        include: {
            profile: true
        }
    });
};

// Busca un usuario por email o username para registro
const findExistingUser = async (email, username) => {
    return await prisma.user.findFirst({
        where: {
            OR: [
                { email },
                { username }
            ]
        }
    });
};

export const UserRepository = {
    create,
    getUsers,
    getUserById,
    getUsersByIds,
    getUserByUsername,
    findByEmailOrUsername,
    findExistingUser,
}