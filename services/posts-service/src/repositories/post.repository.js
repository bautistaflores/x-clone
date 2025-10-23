import prisma from '../../prisma/prisma.js';

// Crear post
const createPost = async (userId, content, imageUrl, parentId) => {
    return await prisma.post.create({
        data: {
            user_id: userId,
            content,
            media_url: imageUrl || null,
            parent_id: parentId || null,
        },
        include: {
            parent: true,
            comments: true
        }
    });
}

// Eliminar post
const deletePost = async (postId) => {
    return await prisma.post.delete({
        where: { id: postId }
    });
}

// Devolver Post por id. Verificar si existe
const existsPost = async (postId) => {
    return await prisma.post.findUnique({
        where: { id: postId }
    });
}

// Devolver retweets de un usuario
const getRetweets = async (retweetConIdUsuario) => {
    return await prisma.retweet.findMany({
        where: retweetConIdUsuario,
        include: {
            originalPost: {
                include: {
                    comments: true,
                    likes: true,
                    retweeters: true
                }
            }
        },
        orderBy: {
            retweeted_at: 'desc'
        }
    });
}

// Verificar si un usuario ya retweeteo un post
const existsRetweet = async (userId, postId) => {
    return await prisma.retweet.findUnique({
        where: {
            user_id_post_id: {
                user_id: userId,
                post_id: postId
            }
        }
    });
}

// Crear retweet
const createRetweet = async (userId, postId) => {
    return await prisma.retweet.create({
        data: {
            user_id: userId,
            post_id: postId
        }
    });
}

// Eliminar retweet
const deleteRetweet = async (retweetId) => {
    return await prisma.retweet.delete({
        where: { id: retweetId }
    });
}

// Verificar si un usuario ya likeo un post
const existsLike = async (userId, postId) => {
    return await prisma.like.findUnique({
        where: {
            post_id_user_id: {
                post_id: postId,
                user_id: userId
            }
        }
    });
}

// Crear like
const createLike = async (userId, postId) => {
    return await prisma.like.create({
        data: {
            user_id: userId,
            post_id: postId
        }
    });
}

// Eliminar like
const deleteLike = async (likeId) => {
    return await prisma.like.delete({
        where: { id: likeId }
    });
}

// Devolver posts de un usuario
const getPosts = async (postConIdUsuario) => {
    return await prisma.post.findMany({
        where: postConIdUsuario,
        include: {
            _count: {
                select: {
                    comments: true
                }
            },
            comments: true,
            likes: true,
            retweeters: true
        },
        orderBy: {
            created_at: 'desc'
        }
    });
}

// Devolver post por id compelto
const getPostById = async (postId) => {
    return await prisma.post.findUnique({
        where: { id: postId },
        include: {
            comments: true,
            likes: true,
            retweeters: true,
            _count: {
                select: {
                    comments: true
                }
            }
        }
    });
}

export const PostRepository = {
    createPost,
    deletePost,
    existsPost,
    getRetweets,
    existsRetweet,
    createRetweet,
    deleteRetweet,
    existsLike,
    createLike,
    deleteLike,
    getPosts,
    getPostById,
}