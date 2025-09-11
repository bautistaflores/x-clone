import React, { useEffect, memo } from 'react';
import useNotifications from '../hooks/useNotifications'; // Ajusta la ruta si es necesario
import { useAuth } from '../context/AuthContext'; // Ajusta la ruta a tu contexto de autenticación

const NotificationDisplay = memo(() => {
    const { user } = useAuth();
    const { notifications } = useNotifications(user?.id);

    if (!user) {
        return <p>Debes iniciar sesión para ver las notificaciones.</p>;
    }

    const filteredNotifications = notifications.filter(notification => String(user.id) !== notification.fromUserId);

    return (
        <div className="min-h-[1000px] border-t border-l border-r border-gray-600">
            <div className="px-4 border-b border-gray-600">
                <h3 className="text-xl font-bold py-4">Notificaciones</h3>
            </div>

            <div className="">
                {filteredNotifications.length === 0 ? (
                    <p className="border-b border-gray-600">No tienes notificaciones.</p>
                ) : (
                    <ul>
                        {filteredNotifications.map((notification, index) => (
                            <li key={index} className="border-b border-gray-600">
                                {notification.type === 'LIKE' && String(user.id) !== notification.fromUserId && (
                                    <span>
                                        Usuario {notification.fromUserId} le dio like a tu post {notification.postId}
                                    </span>
                                )}
                                {notification.type === 'RETWEET' && String(user.id) !== notification.fromUserId && (
                                    <span>
                                        Usuario {notification.fromUserId} retweeteo tu post {notification.postId}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
});

export default NotificationDisplay;