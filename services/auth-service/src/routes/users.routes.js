import { Router } from 'express';
import { getUsers, register, login, logout } from '../controllers/users.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

const router = Router();

router.get('/users', getUsers)

router.post('/register', validateSchema(registerSchema), register)

router.post('/login', validateSchema(loginSchema), login)

router.get('/posts', authenticate, (req, res) => {
    // req.userId está disponible aquí
    res.json({ message: 'Posts protegidos' });
});

router.post('/logout', authenticate, logout)

router.put('/update', (req, res) => {
    res.send('Update route');
})

router.get('/:id', (req, res) => {
    res.send('User profile route');
})

export default router;