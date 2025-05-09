import express from 'express';
import { createClient } from 'redis';
import { Server } from 'socket.io';
import { createServer } from 'http';
import prisma from '../prisma/prisma.js';

const app = express();
const httpServer = createServer(app);
app.use(express.json());

// Configuración de Socket.IO
const io = new Server(httpServer, {
  cors: {
      origin: "http://localhost",
      methods: ["GET", "POST"],
      credentials: true
  }
});

// Configuración de Redis
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});

// Almacenar las conexiones de socket por usuario
const userSockets = new Map();

// Manejar conexiones de Socket.IO
io.on('connection', (socket) => {
    console.log('Cliente conectado');

    // Autenticar y registrar el socket del usuario
    socket.on('authenticate', (userId) => {
        userSockets.set(userId, socket);
        console.log(`Usuario ${userId} autenticado`);
    });

    socket.on('disconnect', () => {
        // Encontrar y eliminar el socket del usuario
        for (const [userId, userSocket] of userSockets.entries()) {
            if (userSocket === socket) {
                userSockets.delete(userId);
                console.log(`Usuario ${userId} desconectado`);
                break;
            }
        }
    });
});

// Suscribirse a eventos de Redis
async function subscribeToNotifications() {
    const subscriber = redisClient.duplicate();
    await subscriber.connect();
    await subscriber.subscribe('notifications', async (message) => {
        const notification = JSON.parse(message);
        
        // Guardar la notificación en la base de datos
        const savedNotification = await prisma.notification.create({
            data: {
                type: notification.type,
                fromUserId: notification.fromUserId,
                toUserId: notification.toUserId,
                postId: notification.postId
            }
        });

        // Enviar la notificación al usuario si está conectado
        const userSocket = userSockets.get(notification.toUserId);
        if (userSocket) {
            userSocket.emit('notification', savedNotification);
        }
    });
}

export { redisClient, subscribeToNotifications, httpServer };
