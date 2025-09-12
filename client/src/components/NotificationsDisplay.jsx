import React, { useEffect, memo, useState } from 'react';
import useNotifications from '../hooks/useNotifications'; 
import { useAuth } from '../context/AuthContext'; 
import { getProfileRequestById } from '../api/profiles';
import LikeIcon from './Icons/LikeIcon';
import RetweetIcon from './Icons/RetweetIcon';
import { useNavigate } from 'react-router-dom';

const NotificationDisplay = memo(() => {
    const { user } = useAuth();
    const { notifications } = useNotifications(user?.id);
    const [userProfiles, setUserProfiles] = useState({});
    const navigate = useNavigate();
    
    if (!user) {
        return <p>Debes iniciar sesión para ver las notificaciones.</p>;
    }

    // Obtener el perfil del usuario
    const fetchUserProfile = async (userId) => {
        try {
            const response = await getProfileRequestById(userId);
            setUserProfiles(prev => ({
                ...prev,
                [userId]: response.data
            }));
        } catch (error) {
            console.error(`Error al obtener el perfil para el usuario ${userId}:`, error);
        }
    };

    // Obtener el perfil de los usuarios de cada notificacion
    useEffect(() => {
        notifications.forEach(notification => {
            fetchUserProfile(notification.fromUserId);
        });
    }, [notifications]);

    const handleProfileClick = (event, username) => {
        event.stopPropagation();
        navigate(`/${username}`);
    };

    const handlePostClick = (event, postId) => {
        event.stopPropagation();
        navigate(`/post/status/${postId}`);
    };

    // Filtrar las notificaciones para que no se muestren las notificaciones del usuario logueado
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
                    <div>
                        {filteredNotifications.map((notification, index) => {
                            const userUsername = userProfiles[notification.fromUserId]?.username;
                            const userFullName = userProfiles[notification.fromUserId]?.profile?.full_name;
                            const userProfilePicture = userProfiles[notification.fromUserId]?.profile?.profile_picture;

                            // Icono y texto de la notificacion
                            let notificationIcon;
                            let notificationText;

                            if (notification.type === 'LIKE' && String(user.id) !== notification.fromUserId ) {
                                notificationIcon = <LikeIcon height={29} width={29} isLiked={true} color="red" />;
                                notificationText = (
                                    <span>
                                        <span 
                                            className="font-bold hover:underline" 
                                            onClick={(e) => handleProfileClick(e, userUsername)}>
                                                {userFullName} 
                                        </span> 
                                        <span> indicó que le gusta tu post</span>
                                    </span>
                                );
                            } else if (notification.type === 'RETWEET' && String(user.id) !== notification.fromUserId ) {
                                notificationIcon = <RetweetIcon height={29} width={29} isRetweeted={true} color="#22C55E" />;
                                notificationText = (
                                    <span>
                                        <span 
                                            className="font-bold hover:underline" 
                                            onClick={(e) => handleProfileClick(e, userUsername)}>
                                                {userFullName}
                                        </span> 
                                        <span> retweeteó tu post</span>
                                    </span>
                                );
                            }

                            return (
                                <div key={index} onClick={(e) => handlePostClick(e, notification.postId)} className="flex border-b border-gray-600 py-3 px-4 hover:cursor-pointer">
                                    {/* Icono de la notificacion */}
                                    <div className="mr-2">
                                        {notificationIcon}
                                    </div>

                                    <div>
                                        {/* Imagen de perfil */}
                                        <div>
                                            {userProfilePicture && (
                                                <img 
                                                    src={userProfilePicture} 
                                                    alt={userFullName}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                            )}
                                        </div>

                                        {/* texto de notificacion */}
                                        <div className='mt-2'>
                                            {notificationText}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
});

export default NotificationDisplay;