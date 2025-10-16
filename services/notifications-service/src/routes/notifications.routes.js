// src/routes/notifications.routes.js
import { Router } from 'express';
import prisma from '../../prisma/prisma.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

router.post('/mark-as-read', verifyToken, async (req, res) => {
    const userId = String(req.user.userId); 

    try {
        const { count } = await prisma.notification.updateMany({
            where: {
                toUserId: userId,
                read: false
            },
            data: {
                read: true
            }
        });

        res.status(200).json({ message: 'Notificaciones marcadas como leidas', count });
    } catch (error) {
        console.error('Error al marcar notificaciones como leidas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

export default router;