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
            setNotifications(prev => {
                const safePrev = Array.isArray(prev) ? prev : [];
        
                const exists = safePrev.some(
                    n => n.type === newNotification.type 
                      && n.postId === newNotification.postId 
                      && n.fromUserId === newNotification.fromUserId
                );
        
                console.log("Nueva notificación recibida:", newNotification);
        
                if (exists) return safePrev;
        
                // Si estoy en /notificaciones, la marco como leída automáticamente
                const isRead = window.location.pathname === "/notificaciones";
        
                return [{ ...newNotification, read: isRead }, ...safePrev];
            });
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