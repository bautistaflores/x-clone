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
    try {
        const userId = String(req.user?.userId);
        
        // Obtener posts normales
        const posts = await prisma.post.findMany({
            where: {
                parent_id: null // Solo posts principales, no comentarios
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

        // Obtener retweets
        const retweets = await prisma.retweet.findMany({
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
            type: 'post'
        }));

        // Transformar los retweets
        const retweetsWithInteractions = retweets.map(retweet => ({
            ...retweet.originalPost,
            likesCount: retweet.originalPost.likes.length,
            isLiked: retweet.originalPost.likes.some(like => String(like.user_id) === userId),
            retweetsCount: retweet.originalPost.retweeters.length,
            isRetweeted: retweet.originalPost.retweeters.some(r => String(r.user_id) === userId),
            type: 'retweet',
            retweetedBy: retweet.user_id,
            retweetedAt: retweet.retweeted_at
        }));

        // Combinar y ordenar por fecha
        const allContent = [...postsWithInteractions, ...retweetsWithInteractions].sort((a, b) => {
            const dateA = a.type === 'retweet' ? a.retweetedAt : a.created_at;
            const dateB = b.type === 'retweet' ? b.retweetedAt : b.created_at;
            return new Date(dateB) - new Date(dateA);
        });

        res.json(allContent);
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
                likes: true,
                retweeters: true
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
            isRetweeted: post.retweeters.some(retweet => String(retweet.user_id) === userId)
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
