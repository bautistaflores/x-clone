import prisma from '../../prisma/prisma.js';

export const createPost = async (req, res) => {
    const { content, parentId } = req.body;
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

        const newPost = await prisma.post.create({
            data: {
                user_id: userId,
                content,
                parent_id: parentId || null,
            },
            include: {
                parent: true,
                comments: true
            }
        });

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
        const originalPost = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!originalPost) {
            return res.status(404).json({ error: 'Post original no encontrado' });
        }

        const retweet = await prisma.post.create({
            data: {
                user_id: userId,
                content: originalPost.content,
                is_retweet: true,
                original_post_id: postId
            },
            include: {
                original_post: true
            }
        });

        res.status(201).json(retweet);
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
    try {
        const posts = await prisma.post.findMany({
            where: {
                parent_id: null // Solo posts principales, no comentarios
            },
            include: {
                comments: true,
                likes: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        // Transformar los posts para incluir información de likes
        const postsWithLike = posts.map(post => ({
            ...post,
            likesCount: post.likes.length,
            isLiked: post.likes.some(like => String(like.user_id) === String(req.user?.userId))
        }));

        res.json(postsWithLike);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los posts' });
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
                likes: true
            }
        });
        
        const comments = await prisma.post.findMany({
            where: {
                parent_id: postId
            },
            include: {
                comments: true,
                likes: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        // Procesar el post principal
        const processedPost = {
            ...post,
            likesCount: post.likes.length,
            isLiked: post.likes.some(like => String(like.user_id) === userId)
        };

        // Procesar los comentarios
        const processedComments = comments.map(comment => ({
            ...comment,
            likesCount: comment.likes.length,
            isLiked: comment.likes.some(like => String(like.user_id) === userId)
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
