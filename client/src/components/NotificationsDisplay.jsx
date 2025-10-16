import React, { useEffect, memo, useState } from 'react';
import useNotifications from '../hooks/useNotifications'; 
import { useAuth } from '../context/AuthContext'; 
import { usePosts } from '../context/PostsContext';
import { getProfileRequestById } from '../api/profiles';
import LikeIcon from './Icons/LikeIcon';
import RetweetIcon from './Icons/RetweetIcon';
import CommentIcon from './Icons/CommentIcon';
import LoadingIcon from './Icons/LoadingIcon';
import { useNavigate } from 'react-router-dom'

import { useNotificationContext } from '../context/NotificationsContext';

const NotificationDisplay = memo(() => {
    const { user } = useAuth();
    const { getPostById } = usePosts();
    const { notifications, isLoaded, hasUnread, markAllAsRead } = useNotificationContext();
    const [userProfiles, setUserProfiles] = useState({});
    const [postDetails, setPostDetails] = useState({});
    const [commentDetails, setCommentDetails] = useState({});
    const [loading, setLoading] = useState(true);
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

    // Obtener el post notificado
    const fetchPostDetails = async (postId) => {
        try {
            const post = await getPostById(postId);
            setPostDetails(prev => ({
                ...prev,
                [postId]: post
            }));
        } catch (error) {
            console.error(`Error al obtener el post con ID ${postId}:`, error);
        }
    };

    const fetchCommentDetails = async (commentId) => {
        try {
            const comment = await getPostById(commentId);
            setCommentDetails(prev => ({
                ...prev,
                [commentId]: comment
            }));
        } catch (error) {
            console.error(`Error al obtener el comentario con ID ${commentId}:`, error);
        }
    };

    useEffect(() => {
        // corregir condiciones de carrera al marcar como leidas las notificaciones
        const timer = setTimeout(() => {
            if (hasUnread) {
                markAllAsRead();
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [hasUnread, markAllAsRead]);

    // Obtener el perfil de los usuarios y post de cada notificacion SOLO al cargar inicialmente
    useEffect(() => {
        if (!isLoaded) {
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            await Promise.all(
                notifications.map(async (notification) => {
                    await fetchUserProfile(notification.fromUserId);
                    await fetchPostDetails(notification.postId);
                    if (notification.commentId) {
                        await fetchCommentDetails(notification.commentId);
                    }
                })
            );
            setLoading(false);
        };
        
        if (notifications.length > 0) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [isLoaded]);

    // Manejar nuevas notificaciones
    useEffect(() => {
        if (!isLoaded) return;

        // obtener datos para notificaciones que no tenemos
        const fetchMissingData = async () => {
            const notificationsToFetch = notifications.filter(notification => {
                const needsProfile = !userProfiles[notification.fromUserId];
                const needsPost = !postDetails[notification.postId];
                const needsComment = notification.commentId && !commentDetails[notification.commentId];
                
                return needsProfile || needsPost || needsComment;
            });

            if (notificationsToFetch.length > 0) {
                await Promise.all(
                    notificationsToFetch.map(async (notification) => {
                        if (!userProfiles[notification.fromUserId]) {
                            await fetchUserProfile(notification.fromUserId);
                        }
                        if (!postDetails[notification.postId]) {
                            await fetchPostDetails(notification.postId);
                        }
                        if (notification.commentId && !commentDetails[notification.commentId]) {
                            await fetchCommentDetails(notification.commentId);
                        }
                    })
                );
            }
        };

        if (Object.keys(userProfiles).length > 0) {
            fetchMissingData();
        }
    }, [notifications.length]);

    const handleProfileClick = (event, username) => {
        event.stopPropagation();
        navigate(`/${username}`);
    };

    const handlePostClick = (event, postId) => {
        event.stopPropagation();
        navigate(`/post/status/${postId}`);
    };

    const handleCommentClick = (event, commentId) => {
        event.stopPropagation();
        navigate(`/post/status/${commentId}?comment=true`);
    };

    // Filtrar las notificaciones para que no se muestren las notificaciones del usuario logueado
    const filteredNotifications = notifications.filter(notification => String(user.id) !== notification.fromUserId);

    return (
        <div className="min-h-[1000px] border-t border-l border-r border-gray-500/50">
            <div className="px-4 border-b border-gray-500/50">
                <h3 className="text-xl font-bold py-4">Notificaciones</h3>
            </div>

            <div className="">
                {loading ? (
                    <LoadingIcon />
                ) : (
                    filteredNotifications.length === 0 ? (
                        <p className="mt-10 text-center font-bold text-gray-500">Sin notificaciones.</p>
                    ) : (
                        <div>
                            {filteredNotifications.map((notification, index) => {
                                const userUsername = userProfiles[notification.fromUserId]?.username;
                                const userFullName = userProfiles[notification.fromUserId]?.profile?.full_name;
                                const userProfilePicture = userProfiles[notification.fromUserId]?.profile?.profile_picture;
                                const post = postDetails[notification.postId];

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
                                } else if (notification.type === 'COMMENT' && String(user.id) !== notification.fromUserId ) {
                                    notificationIcon = <CommentIcon height={29} width={29} color="#42A5F5" />;
                                    notificationText = (
                                        <span>
                                            <span className="font-bold hover:underline" onClick={(e) => handleProfileClick(e, userUsername)}>{userFullName}</span> <span> comentó tu post</span>
                                        </span>
                                    );
                                }

                                return (
                                    <div key={index} onClick={(e) => {notification.type === 'COMMENT' ? handleCommentClick(e, notification.commentId) : handlePostClick(e, notification.postId)}} className="flex border-b border-gray-600 py-3 px-4 hover:cursor-pointer">
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
                                            
                                            {!post ? (
                                                <p className="text-gray-400 text-sm">. . .</p>
                                            ) : (
                                                <div>
                                                    { post.content && notification.type === 'COMMENT' ? (
                                                        <p className='text-gray-500/90 mb-1.5'>{commentDetails[notification.commentId].content}</p>
                                                    ) : (
                                                        <>
                                                            {post.content && <p className='text-gray-500/90 mb-1.5'>{post.content}</p>}
                                                            {post.media_url && <img src={post.media_url} alt="Post" className='rounded-lg mb-3'/>}
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className='ml-8'>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )
                )}
            </div>
        </div>
    );
});

export default NotificationDisplay;