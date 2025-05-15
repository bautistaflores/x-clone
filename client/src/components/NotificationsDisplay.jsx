import React, { useEffect, memo } from 'react';
import useNotifications from '../hooks/useNotifications'; // Ajusta la ruta si es necesario
import { useAuth } from '../context/AuthContext'; // Ajusta la ruta a tu contexto de autenticación

const NotificationDisplay = memo(() => {
    const { user } = useAuth();
    const { notifications, isConnected } = useNotifications(user?.id);

    useEffect(() => {
        console.log("Estado de conexión:", isConnected ? "Conectado" : "Desconectado");
    }, [isConnected, user]);

    if (!user) {
        return <p>Debes iniciar sesión para ver las notificaciones.</p>;
    }

    return (
        <div>
            <h3>Notificaciones</h3>
            {notifications.length === 0 ? (
                <p>No tienes notificaciones.</p>
            ) : (
                <ul>
                    {notifications.map((notification, index) => (
                        <li key={index}> 
                            {notification.type === 'LIKE' && (
                                <span>
                                    Usuario {notification.fromUserId} le dio like a tu post {notification.postId}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
});

export default NotificationDisplay;