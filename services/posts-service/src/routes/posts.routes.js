import { Router } from 'express';
import { createPost, deletePost, retweetPost, likePost, getPosts, getPostWithComments, getPostById } from '../controllers/posts.controller.js';
import { verifyToken } from '../middlewares/auth.js';
import upload from '../middlewares/upload.middleware.js';

const router = Router();

router.post('/create', verifyToken, upload.single('image'), createPost);
router.delete('/delete/:postId', verifyToken, deletePost);
router.post('/:postId/retweet', verifyToken, retweetPost);
router.post('/:postId/like', verifyToken, likePost);

router.get('/', verifyToken, getPosts);
router.get('/u/:username', verifyToken, getPosts);
router.get('/:postId', verifyToken, getPostWithComments);
router.get('/id/:postId', verifyToken, getPostById);

export default router;