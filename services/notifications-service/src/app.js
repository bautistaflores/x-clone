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
    console.log('Nuevo cliente conectado:', socket.id);

    // Autenticar y registrar el socket del usuario
    socket.on('authenticate', async (userId) => {
        const userIdStr = String(userId);
        console.log(`Autenticando usuario ${userIdStr} con socket ${socket.id}`);
        userSockets.set(userIdStr, socket);

        // Cargar notificaciones previas
        try {
            const previousNotifications = await prisma.notification.findMany({
                where: { toUserId: userIdStr },
                orderBy: { createdAt: 'desc' },
                take: 50
            });
            
            if (previousNotifications.length > 0) {
                console.log(`Enviando ${previousNotifications.length} notificaciones previas al usuario ${userIdStr}`);
                socket.emit('notifications', previousNotifications);
            }
        } catch (error) {
            console.error('Error al cargar notificaciones previas:', error);
        }
    });

    socket.on('disconnect', () => {
        // Encontrar y eliminar el socket del usuario
        for (const [userId, userSocket] of userSockets.entries()) {
            if (userSocket === socket) {
                userSockets.delete(userId);
                console.log(`Usuario ${userId} desconectado (socket ${socket.id})`);
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
        try {
            console.log('Notificación recibida de Redis:', message);
            const notification = JSON.parse(message);
            
            if (notification.type === 'UNLIKE') {
                console.log('Procesando unlike:', notification);
                // Si es un unlike, elimina la notificación de like existente
                const deletedNotification = await prisma.notification.deleteMany({
                    where: {
                        type: 'LIKE',
                        fromUserId: String(notification.fromUserId),
                        toUserId: String(notification.toUserId),
                        postId: notification.postId
                    }
                });
                console.log('Notificación de like eliminada:', deletedNotification);

                
            } else if (notification.type === 'LIKE') {
                console.log('Procesando like:', notification);
                // Si es un like, crea la notificación
                const savedNotification = await prisma.notification.create({
                    data: {
                        type: notification.type,
                        fromUserId: String(notification.fromUserId),
                        toUserId: String(notification.toUserId),
                        postId: notification.postId
                    }
                });

                console.log('Notificación guardada en BD:', savedNotification);

                // Envia la notificación al usuario si está conectado
                const userSocket = userSockets.get(String(notification.toUserId));
                if (userSocket) {
                    console.log(`Enviando notificación al socket del usuario ${notification.toUserId}`);
                    userSocket.emit('notification', savedNotification);
                } else {
                    console.log(`Usuario ${notification.toUserId} no está conectado, notificación guardada para más tarde`);
                }


            } else if (notification.type === 'UNRETWEET') {
                console.log('Procesando unretweet:', notification);
                // Si es un unretweet, elimina la notificación de retweet existente
                const deletedNotification = await prisma.notification.deleteMany({
                    where: {
                        type: 'RETWEET',
                        fromUserId: String(notification.fromUserId),
                        toUserId: String(notification.toUserId),
                        postId: notification.postId
                    }
                });
                console.log('Notificación de retweet eliminada:', deletedNotification);


            } else if (notification.type === 'RETWEET') {
                console.log('Procesando retweet:', notification);
                // Si es un retweet, crea la notificación
                const savedNotification = await prisma.notification.create({
                    data: {
                        type: notification.type,
                        fromUserId: String(notification.fromUserId),
                        toUserId: String(notification.toUserId),
                        postId: notification.postId
                    }
                });

                console.log('Notificación guardada en BD:', savedNotification);

                // Envia la notificación al usuario si está conectado
                const userSocket = userSockets.get(String(notification.toUserId));
                if (userSocket) {
                    console.log(`Enviando notificación al socket del usuario ${notification.toUserId}`);
                    userSocket.emit('notification', savedNotification);
                } else {
                    console.log(`Usuario ${notification.toUserId} no está conectado, notificación guardada para más tarde`);
                }
            }
        } catch (error) {
            console.error('Error al procesar notificación:', error);
        }
    });
}

export { redisClient, subscribeToNotifications, httpServer };
