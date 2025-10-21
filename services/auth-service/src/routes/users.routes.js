import { Router } from 'express';
import { register, login, logout } from '../controllers/auth.controller.js';
import { verifyAuth, getUsersByIds, getUserByUsername } from '../controllers/users.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
import { authLimiter } from '../middlewares/rateLimit.middleware.js';
import catchAsync from '../utils/catchAsync.js';

const router = Router();

router.get('/verify', authenticate, catchAsync(verifyAuth));

router.post('/register', authLimiter, validateSchema(registerSchema), catchAsync(register));
router.post('/login', authLimiter, validateSchema(loginSchema), catchAsync(login));
router.post('/logout', authenticate, catchAsync(logout));

router.post('/batch', authenticate, catchAsync(getUsersByIds));
router.get('/:username', authenticate, catchAsync(getUserByUsername));

export default router;