import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useNotifications = (userId) => {
    const [notifications, setNotifications] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);
    const userIdRef = useRef(userId);

    useEffect(() => {
        // Si el userId cambió, desconectamos el socket anterior
        if (userIdRef.current !== userId) {
            console.log('UserId cambió, reconectando socket...');
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            userIdRef.current = userId;
        }

        if (!userId) {
            console.log('No hay userId, no se inicializa el socket');
            setIsConnected(false);
            return;
        }

        // Si ya existe un socket y está conectado, no hacemos nada
        if (socketRef.current?.connected) {
            console.log('Socket ya está conectado');
            return;
        }

        const newSocket = io('/', {
            path: '/socket.io/',
            transports: ['polling', 'websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            withCredentials: true,
            forceNew: true
        });

        socketRef.current = newSocket;

        newSocket.on('connect', () => {
            setIsConnected(true);
            newSocket.emit('authenticate', userId);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Error de conexión socket:', error);
            setIsConnected(false);
        });

        // Manejar notificaciones previas
        newSocket.on('notifications', (previousNotifications) => {
            setNotifications(previousNotifications);
        });

        // Manejar nuevas notificaciones
        newSocket.on('notification', (newNotification) => {
            console.log("Nueva notificación recibida:", newNotification);
            setNotifications(prev => [newNotification, ...prev]);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('Socket desconectado. Razón:', reason);
            setIsConnected(false);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [userId]);

    return { notifications, isConnected };
};

export default useNotifications;