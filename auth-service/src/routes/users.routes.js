import { Router } from 'express';
import { getUsers, createUser } from '../controllers/users.controller.js';

const router = Router();

router.get('/users', getUsers)

router.post('/register', createUser)

router.post('/login', (req, res) => {
    res.send('Login route');
})

router.post('/logout', (req, res) => {
    res.send('Logout route');
})

router.put('/update', (req, res) => {
    res.send('Update route');
})

router.get('/:id', (req, res) => {
    res.send('User profile route');
})

export default router;