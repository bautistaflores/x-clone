import { Router } from 'express';
import { createPost, retweetPost, likePost, getPosts, getPostComments } from '../controllers/posts.controller.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

router.post('/create', verifyToken, createPost);
router.post('/:postId/retweet', verifyToken, retweetPost);
router.post('/:postId/like', verifyToken, likePost);

router.get('/', getPosts);
router.get('/:postId/comments', getPostComments);

export default router;