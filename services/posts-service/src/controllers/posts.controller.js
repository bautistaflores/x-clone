import { PostService } from '../services/post.service.js';

// Crear post
export const createPost = async (req, res) => {
    const { content, parentId } = req.body;
    const { file } = req;
    const userId = String(req.user.userId); 

    try {
        const newPost = await PostService.createPost(userId, content, file, parentId);

        console.log(newPost);
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ error: 'Error creando el post' });
    }
}

// Eliminar post
export const deletePost = async (req, res) => {
    const { postId } = req.params;
    const userId = String(req.user.userId);

    try {
        await PostService.deletePost(postId, userId);

        res.status(200).json({ message: 'Post eliminado exitosamente' });        
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el post' });
    }
}

// Retweet y unretweet
export const retweetPost = async (req, res) => {
    const { postId } = req.params;
    const userId = String(req.user.userId);
    const redisClient = req.app.get('redisClient');

    try {
        const result = await PostService.retweetPost(postId, userId, redisClient);

        const status = result.action === 'retweet' ? 201 : 200;
        const message = result.action === 'retweet'
            ? 'Post retweeteado exitosamente'
            : 'Post unretweeteado exitosamente';

        res.status(status).json({ message: message });
    } catch (error) {
        console.error('Error al retweetear el post:', error);
        res.status(500).json({ error: 'Error al retweetear el post' });
    }
}

// Like y unlike
export const likePost = async (req, res) => {
    const { postId } = req.params;
    const userId = String(req.user.userId);
    const redisClient = req.app.get('redisClient');

    try {
        const result = await PostService.likePost(postId, userId, redisClient);

        const status = result.action === 'like' ? 201 : 200;
        const message = result.action === 'like'
            ? 'Post likeado exitosamente'
            : 'Post deslikeado exitosamente';

        res.status(status).json({ message: message });
    } catch (error) {
        console.error('Error al likear el post:', error);
        res.status(500).json({ error: 'Error al likear el post' });
    }
}

// Obtener posts
export const getPosts = async (req, res) => {
    // para consumir el servicio de usuarios
    const USERS_SERVICE_URL = 'http://auth-service:3000/auth';
    const userId = String(req.user?.userId); // id del usuario logueado

    // Para filtrar posts por usuario mediante el username
    const username = req.params.username;
    // obtiene el token para verificar el usuario logueado
    const authCookie = req.cookies.token;

    try {
        const allContent = await PostService.getPosts(userId, username, authCookie, USERS_SERVICE_URL);

        res.json(allContent);
    } catch (error) {
        console.error('Error al obtener los posts:', error);
        res.status(500).json({ error: 'Error al obtener los posts' });
    }
}

// Obtener post por postId
export const getPostById = async (req, res) => {
    const { postId } = req.params;
    const userId = String(req.user?.userId);

    try {
        const post = await PostService.getPostById(postId, userId);

        if (!post) {
            return res.status(404).json({ error: 'Post no encontrado' });
        }

        res.json(post);
    } catch (error) {
        console.error('Error al obtener el post:', error);
        res.status(500).json({ error: 'Error al obtener el post' });
    }
}

// Obtener post con comentarios
export const getPostWithComments = async (req, res) => {
    const { postId } = req.params;
    const userId = String(req.user?.userId);

    try {
        const postWithComments = await PostService.getPostWithComments(postId, userId);

        if (!postWithComments) {
            return res.status(404).json({ error: 'Post con comentarios no encontrado' });
        }

        res.json(postWithComments);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el post con comentarios' });
    }
}