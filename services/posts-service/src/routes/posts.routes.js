import { Router } from 'express';
import { getPosts, createPost } from '../controllers/posts.controller.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

router.get('/', getPosts)

router.post('/create', verifyToken, createPost);

export default router;