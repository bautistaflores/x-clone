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
