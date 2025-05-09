import { redisClient, subscribeToNotifications, httpServer } from './app.js';

// Iniciar el servidor
const PORT = process.env.PORT || 3000;

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect()
    .then(() => {
        console.log('Redis Client Connected');
        return subscribeToNotifications();
    })
    .then(() => {
        httpServer.listen(PORT, '0.0.0.0', () => {
            console.log(`Notifications-Service running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error starting server:', err);
        process.exit(1);
    });