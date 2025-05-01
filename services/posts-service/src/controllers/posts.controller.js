import prisma from '../../prisma/prisma.js';

export const createPost = async (req, res) => {
    const { content } = req.body;
    const userId = String(req.user.userId); 

    try {
        const newPost = await prisma.post.create({
            data: {
              user_id: userId,
              content,
            }
        });

        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating post:', error);
    }
}

export const getPosts = async (req, res) => {
    try {
        const users = await prisma.post.findMany();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching posts' });
    }
}
