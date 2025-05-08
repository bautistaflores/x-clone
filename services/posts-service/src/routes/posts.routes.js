import { Router } from 'express';
import { getPosts, createPost, getPostComments } from '../controllers/posts.controller.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

router.get('/', getPosts);
router.get('/:postId/comments', getPostComments);
router.post('/create', verifyToken, createPost);

export default router;