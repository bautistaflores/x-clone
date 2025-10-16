import prisma from '../../prisma/prisma.js';
import axios from 'axios';

export const createPost = async (req, res) => {
    const { content, parentId } = req.body;
    const { file } = req;
    const userId = String(req.user.userId); 

    try {
        // Si es un comentario, verificamos que el post padre existe
        if (parentId) {
            const parentPost = await prisma.post.findUnique({
                where: { id: parentId }
            });

            if (!parentPost) {
                return res.status(404).json({ error: 'Post padre no encontrado' });
            }
        }

        // se guarda la URL de la imagen
        const imageUrl = file ? `/imagePost/${userId}/${file.filename}` : null;

        const newPost = await prisma.post.create({
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

        console.log(newPost);
        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Error al crear el post' });
    }
}

export const retweetPost = async (req, res) => {
    const { postId } = req.params;
    const userId = String(req.user.userId);

    try {
        // Verificar si el post existe
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return res.status(404).json({ error: 'Post no encontrado' });
        }

        // Verificar si ya existe un retweet
        const existingRetweet = await prisma.retweet.findUnique({
            where: {
                user_id_post_id: {
                    user_id: userId,
                    post_id: postId
                }
            }
        });

        if (existingRetweet) {
            // Si existe, lo eliminamos (unretweet)
            await prisma.retweet.delete({
                where: { id: existingRetweet.id }
            });

            // Publicar evento de unretweet en Redis
            const redisClient = req.app.get('redisClient');
            if (redisClient) {
                await redisClient.publish('notifications', JSON.stringify({
                    type: 'UNRETWEET',
                    fromUserId: userId,
                    toUserId: post.user_id,
                    postId: postId,
                    timestamp: new Date().toISOString()
                }));
            }

            return res.status(200).json({
                message: 'Post unretweeteado exitosamente',
                action: 'unretweet'
            });
        }

        // Si no existe, creamos el retweet
        await prisma.retweet.create({
            data: {
                user_id: userId,
                post_id: postId
            }
        });

        // Publicar evento de retweet en Redis
        const redisClient = req.app.get('redisClient');
        if (redisClient) {
            await redisClient.publish('notifications', JSON.stringify({
                type: 'RETWEET',
                fromUserId: userId,
                toUserId: post.user_id,
                postId: postId,
                timestamp: new Date().toISOString()
            }));
        }

        res.status(201).json({
            message: 'Post retweeteado exitosamente',
            action: 'retweet'
        });
    } catch (error) {
        console.error('Error al retweetear el post:', error);
        res.status(500).json({ error: 'Error al retweetear el post' });
    }
}

export const likePost = async (req, res) => {
    const { postId } = req.params;
    const userId = String(req.user.userId);

    try {
        // Verificar si el post existe primero
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return res.status(404).json({ error: 'Post no encontrado' });
        }

        // Verificar si ya existe un like
        const existingLike = await prisma.like.findUnique({
            where: {
                post_id_user_id: {
                    post_id: postId,
                    user_id: userId
                }
            }
        });

        if (existingLike) {
            // Si existe, lo eliminamos (unlike)
            await prisma.like.delete({
                where: { id: existingLike.id }
            });

            // Publicar evento de unlike en Redis
            const redisClient = req.app.get('redisClient');
            if (redisClient) {
                await redisClient.publish('notifications', JSON.stringify({
                    type: 'UNLIKE',
                    fromUserId: userId,
                    toUserId: post.user_id,
                    postId: postId,
                    timestamp: new Date().toISOString()
                }));
            }

            return res.status(200).json({ 
                message: 'Post deslikeado exitosamente',
                action: 'unlike'
            });
        }

        // Si no existe, creamos el like
        await prisma.like.create({
            data: {
                user_id: userId,
                post_id: postId
            }
        });

        // Publicar evento de like en Redis
        const redisClient = req.app.get('redisClient');
        if (redisClient) {
            await redisClient.publish('notifications', JSON.stringify({
                type: 'LIKE',
                fromUserId: userId,
                toUserId: post.user_id,
                postId: postId,
                timestamp: new Date().toISOString()
            }));
        }

        res.status(201).json({ 
            message: 'Post likeado exitosamente',
            action: 'like'
        });
    } catch (error) {
        console.error('Error al likear el post:', error);
        res.status(500).json({ error: 'Error al likear el post' });
    }
}



export const getPosts = async (req, res) => {
    // para consumir el servicio de usuarios
    const USERS_SERVICE_URL = 'http://auth-service:3000/auth';
    
    try {
        let profileUserId = null;
        const userId = String(req.user?.userId); // id del usuario logueado

        // Para filtrar posts por usuario mediante el username
        const username = req.params.username;

        if (username) {
            try {
                // obtiene el token para verificar
                const authCookie = req.cookies.token;

                if (!authCookie) {
                    return res.status(401).json({ error: 'No autorizado: El token no se encontró en la cookie.' });
                }

                //Llamada a auth-service para obtener el id del usuario mediante el username
                const userRes = await axios.get(`${USERS_SERVICE_URL}/${username}`, {
                    headers: {
                        Cookie: `token=${authCookie}`
                    }
                });
                
                // Extrae el ID del usuario del objeto de respuesta
                const user = userRes.data;
                if (user) {
                    profileUserId = String(user.id);
                } else {
                    return res.status(404).json({ error: 'El usuario no existe' });
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    return res.status(404).json({ error: 'El usuario no existe' });
                }
                console.error('Error al obtener el usuario:', error);
                return res.status(500).json({ error: 'Error al comunicarse con el servicio de usuarios' });
            }
        }

        // Si hay un ID de perfil, filtra para la consulta
        const postConIdUsuario = profileUserId ? { user_id: profileUserId, parent_id: null } : { parent_id: null };
        const retweetConIdUsuario = profileUserId ? { user_id: profileUserId } : {};

        // Obtener posts normales
        const posts = await prisma.post.findMany({
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

        // Obtener retweets
        const retweets = await prisma.retweet.findMany({
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

        // Transformar los posts normales
        const postsWithInteractions = posts.map(post => ({
            ...post,
            likesCount: post.likes.length,
            isLiked: post.likes.some(like => String(like.user_id) === userId),
            retweetsCount: post.retweeters.length,
            isRetweeted: post.retweeters.some(retweet => String(retweet.user_id) === userId),
            commentsCount: post._count.comments,
            type: 'post'
        }));

        // Transformar los retweets
        const retweetsWithInteractions = retweets.map(retweet => ({
            ...retweet.originalPost,
            likesCount: retweet.originalPost.likes.length,
            isLiked: retweet.originalPost.likes.some(like => String(like.user_id) === userId),
            retweetsCount: retweet.originalPost.retweeters.length,
            isRetweeted: retweet.originalPost.retweeters.some(r => String(r.user_id) === userId),
            commentsCount: retweet.originalPost.comments.length,
            type: 'retweet',
            retweetedBy: retweet.user_id,
            retweetedAt: retweet.retweeted_at,
            retweetedId: retweet.id
        }));

        // Combinar y ordenar por fecha
        const allContent = [...postsWithInteractions, ...retweetsWithInteractions].sort((a, b) => {
            const dateA = a.type === 'retweet' ? a.retweetedAt : a.created_at;
            const dateB = b.type === 'retweet' ? b.retweetedAt : b.created_at;
            return new Date(dateB) - new Date(dateA);
        });

        res.json(allContent);
    } catch (error) {
        console.error('Error al obtener los posts:', error);
        res.status(500).json({ error: 'Error al obtener los posts' });
    }
}

export const getPostById = async (req, res) => {
    const { postId } = req.params;
    const userId = String(req.user?.userId);

    try {
        const post = await prisma.post.findUnique({
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

        // Procesar el post principal
        const processedPost = {
            ...post,
            likesCount: post.likes.length,
            isLiked: post.likes.some(like => String(like.user_id) === userId),
            retweetsCount: post.retweeters.length,
            isRetweeted: post.retweeters.some(retweet => String(retweet.user_id) === userId),
            commentsCount: post._count.comments
        };

        if (!post) {
            return res.status(404).json({ error: 'Post no encontrado' });
        }

        res.json(processedPost);
    } catch (error) {
        console.error('Error al obtener el post:', error);
        res.status(500).json({ error: 'Error al obtener el post' });
    }
}

export const getPostWithComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = String(req.user?.userId);

        const post = await prisma.post.findUnique({
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
        
        const comments = await prisma.post.findMany({
            where: {
                parent_id: postId
            },
            include: {
                comments: true,
                likes: true,
                retweeters: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        // Procesar el post principal
        const processedPost = {
            ...post,
            likesCount: post.likes.length,
            isLiked: post.likes.some(like => String(like.user_id) === userId),
            retweetsCount: post.retweeters.length,
            isRetweeted: post.retweeters.some(retweet => String(retweet.user_id) === userId),
            commentsCount: post._count.comments
        };

        // Procesar los comentarios
        const processedComments = comments.map(comment => ({
            ...comment,
            likesCount: comment.likes.length,
            isLiked: comment.likes.some(like => String(like.user_id) === userId),
            retweetsCount: comment.retweeters.length,
            isRetweeted: comment.retweeters.some(retweet => String(retweet.user_id) === userId)
        }));

        const postWithComments = {
            ...processedPost,
            comments: processedComments
        };

        res.json(postWithComments);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el post con comentarios' });
    }
}
