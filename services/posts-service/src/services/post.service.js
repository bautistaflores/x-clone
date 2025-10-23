import { PostRepository } from '../repositories/post.repository.js';
import axios from 'axios';

// Crear post
const createPost = async (userId, content, file, parentId) => {
    // si es comentario, verificar si el post padre existe
    if (parentId) {
        const parentPost = await PostRepository.existsPost(parentId);

        if (!parentPost) {
            throw new Error('Post padre no encontrado');
        }
    }

    // se guarda la URL de la imagen
    const imageUrl = file ? `/imagePost/${userId}/${file.filename}` : null;

    // se crea el post
    const newPost = await PostRepository.createPost(userId, content, imageUrl, parentId);

    return newPost;
}

// Eliminar post
const deletePost = async (postId, userId) => {
    // verificar si el post existe
    const post = await PostRepository.existsPost(postId);

    if (!post) {
        throw new Error('Post no encontrado');
    }

    // verificar si el usuario es el creador del post
    if (post.user_id !== userId) {
        throw new Error('No tienes permisos para eliminar este post');
    }

    // se elimina el post
    await PostRepository.deletePost(postId);

    return { message: 'Post eliminado exitosamente' };
}

// Publica la notificación en Redis para retweets y likes
const publishNotification = async (type, fromUserId, toUserId, postId, redisClient) => {
    try {
        // se publica la notificación en Redis
        await redisClient.publish('notifications', JSON.stringify({
            type: type,
            fromUserId: fromUserId,
            toUserId: toUserId,
            postId: postId,
            timestamp: new Date().toISOString()
        }));
    } catch (error) {
        throw new Error('Error al publicar la notificación');
    }
}

// Retweet y unretweet
const retweetPost = async (postId, userId, redisClient) => {
    // Verificar si el post existe
    const post = await PostRepository.getPostById(postId);

    if (!post) {
        throw new Error('Post no encontrado');
    }

    // Verificar si ya existe un retweet
    const existingRetweet = await PostRepository.existsRetweet(userId, postId);

    // si ya existe un retweet, se elimina, sino se crea
    if (existingRetweet) {
        await PostRepository.deleteRetweet(existingRetweet.id);

        // Publicar evento de unretweet en Redis
        await publishNotification('UNRETWEET', userId, post.user_id, postId, redisClient);

        return { message: 'Post unretweeteado exitosamente' };
    } else {
        await PostRepository.createRetweet(userId, postId);

        // Publicar evento de retweet en Redis
        await publishNotification('RETWEET', userId, post.user_id, postId, redisClient);

        return { message: 'Post retweeteado exitosamente' };
    }
}

// Like y unlike
const likePost = async (postId, userId, redisClient) => {
    // Verificar si el post existe
    const post = await PostRepository.getPostById(postId);

    if (!post) {
        throw new Error('Post no encontrado');
    }

    // Verificar si ya existe un like
    const existingLike = await PostRepository.existsLike(userId, postId);

    // si ya existe un like, se elimina, sino se crea
    if (existingLike) {
        await PostRepository.deleteLike(existingLike.id);

        await publishNotification('UNLIKE', userId, post.user_id, postId, redisClient);

        return { message: 'Post deslikeado exitosamente' };
    } else {
        await PostRepository.createLike(userId, postId);

        await publishNotification('LIKE', userId, post.user_id, postId, redisClient);

        return { message: 'Post likeado exitosamente' };
    }
}


// Transforma los datos de los posts y retweets para agregar las interacciones
const transformPostData = (post, authUserId, type = 'post', retweetInfo = {}) => {
    // obtiene los likes, retweeters y comments del post
    const likes = post?.likes ?? []
    const retweeters = post?.retweeters ?? []
    const comments = post?.comments ?? []
    const commentsCount = post?._count?.comments ?? comments.length // usa el count si esta, sino el array

    // crea los datos base del post
    const baseData = {
        ...(post ?? {}), // si no hay post, se crea un objeto vacio
        likesCount: likes.length,
        isLiked: likes.some(like => String(like.user_id) === authUserId), // si el usuario autenticado tiene like, es true
        retweetsCount: retweeters.length,
        isRetweeted: retweeters.some(retweet => String(retweet.user_id) === authUserId), // si el usuario autenticado tiene retweet, es true
        commentsCount: commentsCount,
        type: type
    }

    // si es retweet, agrega la info del retweet
    if (type === 'retweet') {
        return {
            ...baseData,
            retweetedBy: retweetInfo.user_id,
            retweetedAt: retweetInfo.retweeted_at,
            retweetedId: retweetInfo.id
        }
    }

    return baseData;
}

const getPosts = async (authUserId, username, authCookie, USERS_SERVICE_URL) => {
    let profileUserId = null; // id del usuario del perfil

    if (username) {
        try {
            // obtiene el token para verificar el usuario logueado
            if (!authCookie) {
                throw new Error('No autorizado: El token no se encontró en la cookie.');
            }

            // Llamada al servicio auth-service para obtener el id del usuario mediante el username
            const userRes = await axios.get(`${USERS_SERVICE_URL}/${username}`, {
                headers: {
                    Cookie: `token=${authCookie}` // se pasa el token para verificar el usuario logueado
                }
            });
            
            // se obtiene el usuario de auth-service
            const user = userRes.data;

            // si el usuario existe, se obtiene su id
            if (user && user.id) {
                profileUserId = String(user.id);
            } else {
                throw new Error('El usuario no existe');
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                throw new Error('El usuario no existe');
            }
            console.error('Error al obtener el usuario:', error);
            throw new Error('Error al comunicarse con el servicio de usuarios');
        }
    }

    // Si hay un ID de perfil, filtra para la consulta
    const postConIdUsuario = profileUserId ? { user_id: profileUserId, parent_id: null } : { parent_id: null };
    const retweetConIdUsuario = profileUserId ? { user_id: profileUserId } : {};

    // Obtener posts y retweets en paralelo
    let posts = [];
    let retweets = [];
    try {
        [posts, retweets] = await Promise.all([
            PostRepository.getPosts(postConIdUsuario),
            PostRepository.getRetweets(retweetConIdUsuario)
        ]);
    } catch (dbError) {
        console.error('Error al obtener los posts o retweets:', dbError);
        throw new Error('Error al obtener los posts o retweets');
    }

    // Transformar los posts normales
    const postsWithInteractions = posts.map(post =>
        transformPostData(post, authUserId, 'post'),
    );

    // Transformar los retweets
    const retweetsWithInteractions = retweets.map(retweet =>
        transformPostData(retweet.originalPost, authUserId, 'retweet', {
            user_id: retweet.user_id,
            retweeted_at: retweet.retweeted_at,
            id: retweet.id
        })
    );

    // combina los posts y retweets y los ordena por fecha
    const allContent = [...postsWithInteractions, ...retweetsWithInteractions].sort((a, b) => {
        const dateA = a.type === 'retweet' ? a.retweetedAt : a.created_at;
        const dateB = b.type === 'retweet' ? b.retweetedAt : b.created_at;
        return new Date(dateB) - new Date(dateA);
    });

    return allContent;
}

const getPostById = async (postId, authUserId) => {
    // obtiene el post por id
    const post = await PostRepository.getPostById(postId);

    if (!post) {
        throw new Error('Post no encontrado');
    }

    // Procesar el post principal
    const processedPost = transformPostData(post, authUserId, 'post');

    return processedPost;
}

const getPostWithComments = async (postId, authUserId) => {
    // obtiene el post principal
    const post = await PostRepository.getPostById(postId);
    
    if (!post) {
        throw new Error('Post no encontrado');
    }

    const comments = post.comments ?? [];

    // Procesar el post principal
    const { comments: originalComments, ...postDataOnly } = post;
    const processedPost = transformPostData(postDataOnly, authUserId, 'post');

    // Procesar los comentarios
    const processedComments = comments.map(comment =>
        transformPostData(comment, authUserId, 'comment')
    );

    // se retorna el post con los comentarios procesados
    const postWithComments = {
        ...processedPost,
        comments: processedComments
    };

    return postWithComments;
}

export const PostService = {
    createPost,
    deletePost,
    retweetPost,
    likePost,
    getPosts,
    getPostById,
    getPostWithComments,
}