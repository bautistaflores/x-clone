import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { markNotificationsAsReadRequest } from '../api/notifications';

const useNotifications = (userId) => {
    const [notifications, setNotifications] = useState([]);
    const [hasUnread, setHasUnread] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const socketRef = useRef(null);
    const userIdRef = useRef(userId);

    useEffect(() => {
        const unreadExists = notifications.some(notification => !notification.read);
        setHasUnread(unreadExists);
    }, [notifications]);

    const markAllAsRead = useCallback(async () => {
        if (!hasUnread) return;

        // que se muestren como leidas en la UI
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));

        // marcar las notificaciones como leidas en la base de datos
        try {
            await markNotificationsAsReadRequest();
        } catch (error) {
            console.error("Error al marcar notificaciones como leídas en el backend:", error);
        }
    }, [hasUnread]);

    useEffect(() => {
        if (userIdRef.current !== userId) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            userIdRef.current = userId;
        }

        if (!userId) {
            setIsConnected(false);
            return;
        }

        // si ya existe un socket y está conectado, no hacemos nada
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

        // manejar notificaciones previas
        newSocket.on('notifications', (previousNotifications) => {
            setNotifications(previousNotifications);
            setIsLoaded(true);
        });

        // manejar nuevas notificaciones
        newSocket.on('notification', (newNotification) => {
            setNotifications(prev => {
                const safePrev = Array.isArray(prev) ? prev : [];

                const isDuplicate = safePrev.some(
                    n => n.type === newNotification.type &&
                         n.fromUserId === newNotification.fromUserId &&
                         n.postId === newNotification.postId
                );
    
                // si ya existe una notificación igual, no hacemos nada
                if (isDuplicate) {
                    console.log("Notificación duplicada ignorada:", newNotification);
                    return safePrev;
                }
    
                // si no es un duplicado, la añadimos al principio
                return [newNotification, ...safePrev];
            });
        });
        

        newSocket.on('disconnect', (reason) => {
            setIsConnected(false);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [userId]);

    return { notifications, isConnected, isLoaded, hasUnread, markAllAsRead };
};

export default useNotifications;