import { Router } from 'express';
import { getUsers, register, login, logout } from '../controllers/users.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.get('/users', getUsers)

router.post('/register', register)

router.post('/login', login)

router.get('/posts', authenticate, (req, res) => {
    // req.userId está disponible aquí
    res.json({ message: 'Posts protegidos' });
});

router.post('/logout', authenticate, logout, (req, res) => {
    res.json({ message: 'Logoute Exitoso' });
})

router.put('/update', (req, res) => {
    res.send('Update route');
})

router.get('/:id', (req, res) => {
    res.send('User profile route');
})

export default router;