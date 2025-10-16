import express from 'express';
import cookieParser from 'cookie-parser';
import { createClient } from 'redis';
import { Server } from 'socket.io';
import { createServer } from 'http';
import prisma from '../prisma/prisma.js';
import notificationsRoutes from './routes/notifications.routes.js';

const app = express();
const httpServer = createServer(app);
app.use(express.json());
app.use(cookieParser());

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
            
            console.log(`Enviando ${previousNotifications.length} notificaciones previas al usuario ${userIdStr}`);
            socket.emit('notifications', previousNotifications);
        } catch (error) {
            console.error('Error al cargar notificaciones previas:', error);
            // envia array vacío si hay error
            socket.emit('notifications', []);
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
            
            // datos de la notificación
            const { type, fromUserId, toUserId, postId, commentId } = notification;
            const payload = {
                fromUserId: String(fromUserId),
                toUserId: String(toUserId),
                postId: postId
            };

            // switch para cada tipo de notificación
            switch (type) {
                case 'LIKE':
                case 'RETWEET': {
                    // crea la notificación 
                    console.log(`Procesando ${type}:`, notification);
                    const savedNotification = await prisma.notification.create({
                        data: { type, ...payload }
                    });

                    console.log('Notificación guardada en BD:', savedNotification);
                    
                    // envía la notificación al socket del usuario
                    const userSocket = userSockets.get(String(toUserId));
                    if (userSocket) {
                        console.log(`Enviando notificación al socket del usuario ${toUserId}`);
                        userSocket.emit('notification', savedNotification);
                    } else {
                        console.log(`Usuario ${toUserId} no conectado.`);
                    }
                    break;
                }

                case 'COMMENT': {
                    // crea la notificación 
                    console.log(`Procesando ${type}:`, notification);
                    const savedNotification = await prisma.notification.create({
                        data: {
                            type,
                            fromUserId: String(fromUserId),
                            toUserId: String(toUserId),
                            postId,
                            commentId // id del comentario
                        }
                    });

                    console.log('Notificación de comentario guardada:', savedNotification);
        
                    // La lógica del socket es la misma
                    const userSocket = userSockets.get(String(toUserId));
                    if (userSocket) {
                        console.log(`Enviando notificación al socket del usuario ${toUserId}`);
                        userSocket.emit('notification', savedNotification);
                    } else {
                        console.log(`Usuario ${toUserId} no conectado.`);
                    }
                    break; 
                }

                case 'UNLIKE':
                case 'UNRETWEET':
                case 'UNCOMMENT': {
                    // elimina la notificación
                    console.log(`Procesando ${type}:`, notification);
                    // deriva el tipo a eliminar
                    const typeToDelete = type.substring(2); 
                    
                    const { count } = await prisma.notification.deleteMany({
                        where: { type: typeToDelete, ...payload }
                    });
                    
                    console.log(`${count} notificación(es) de ${typeToDelete} eliminada(s).`);
                    break;
                }
                
                default:
                    console.warn(`Tipo de notificación desconocido: ${type}`);
            }

        } catch (error) {
            console.error('Error al procesar notificación:', error);
        }
    });
}

app.use('/notifications', notificationsRoutes);

export { redisClient, subscribeToNotifications, httpServer };
