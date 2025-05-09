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
        const existingLike = await prisma.like.findUnique({
            where: {
                post_id: postId,
                user_id: userId
            }
        });

        if (existingLike) {
            await prisma.like.delete({
                where: { id: existingLike.id }
            });
            return res.status(200).json({ message: 'Post deslikeado exitosamente' });
        }

        // Obtener el post para saber quién es el dueño
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return res.status(404).json({ error: 'Post no encontrado' });
        }

        // Crear el like
        await prisma.like.create({
            data: {
                user_id: userId,
                post_id: postId
            }
        });

        // Publicar evento en Redis solo si el like es nuevo
        const redisClient = req.app.get('redisClient');
        await redisClient.publish('notifications', JSON.stringify({
            type: 'LIKE',
            fromUserId: userId,
            toUserId: post.user_id,
            postId: postId
        }));

        res.status(201).json({ message: 'Post likeado exitosamente' });
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
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los posts' });
    }
}

export const getPostComments = async (req, res) => {
    const { postId } = req.params;
    
    try {
        const comments = await prisma.post.findMany({
            where: {
                parent_id: postId
            },
            include: {
                likes: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los comentarios' });
    }
}
