import { Router } from 'express';
import { getUsers, register, login, logout, verifyAuth } from '../controllers/users.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

const router = Router();

router.get('/users', getUsers)
router.get('/verify', authenticate, verifyAuth)

router.post('/register', validateSchema(registerSchema), register)

router.post('/login', validateSchema(loginSchema), login)

router.post('/logout', authenticate, logout)

router.put('/update', (req, res) => {
    res.send('Update route');
})

router.get('/:id', (req, res) => {
    res.send('User profile route');
})

export default router;