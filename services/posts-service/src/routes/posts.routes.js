import { Router } from 'express';
import { createPost, retweetPost, likePost, getPosts, getPostWithComments } from '../controllers/posts.controller.js';
import { verifyToken } from '../middlewares/auth.js';
import upload from '../middlewares/upload.middleware.js';

const router = Router();

router.post('/create', verifyToken, upload.single('image'), createPost);
router.post('/:postId/retweet', verifyToken, retweetPost);
router.post('/:postId/like', verifyToken, likePost);

router.get('/', verifyToken, getPosts);
router.get('/u/:username', verifyToken, getPosts);
router.get('/:postId', verifyToken, getPostWithComments);

export default router;