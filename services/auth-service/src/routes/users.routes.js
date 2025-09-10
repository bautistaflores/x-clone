import { Router } from 'express';
import { register, login, logout, verifyAuth, getUsersByIds, getUserByUsername } from '../controllers/users.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

const router = Router();

router.get('/verify', authenticate, verifyAuth);

router.post('/register', validateSchema(registerSchema), register);
router.post('/login', validateSchema(loginSchema), login);
router.post('/logout', authenticate, logout);

router.post('/batch', authenticate, getUsersByIds);
router.get('/:username', authenticate, getUserByUsername);

router.put('/update', (req, res) => {
    res.send('Update route');
});


export default router;