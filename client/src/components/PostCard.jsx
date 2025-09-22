import React, { useState, useEffect } from "react"
import { likePostRequest, retweetPostRequest } from "../api/posts"
import { usePosts } from "../context/PostsContext"
import { useUsers } from "../context/UsersContext"
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from 'react-router-dom';
import { formatPostTimestamp } from "../utils/formatPostTimestamp";
import { Link } from 'react-router-dom';

import RetweetIcon from "./Icons/RetweetIcon";
import LikeIcon from "./Icons/LikeIcon";
import CommentIcon from "./Icons/CommentIcon";

function PostCard({ post, isComment = false }) {
    const { updatePostLike, updateRetweet } = usePosts();
    // Obtener user por id
    const { getUser, fetchUsers } = useUsers();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Estado para el post
    const [isLiked, setIsLiked] = useState(post?.isLiked || false);
    const [likesCount, setLikesCount] = useState(post?.likesCount || 0);
    const [isRetweeted, setIsRetweeted] = useState(post?.isRetweeted || false);
    const [retweetsCount, setRetweetsCount] = useState(post?.retweetsCount || 0);
    const [isCommented, setIsCommented] = useState(post?.isCommented || false);
    const [commentsCount, setCommentsCount] = useState(post?.commentsCount || 0);
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation()

    // Efecto para actualizar el estado del post
    useEffect(() => {
        if (post) {
            // Actualizar el estado del post
            setIsLiked(Boolean(post.isLiked));
            setLikesCount(post.likesCount || 0);
            setIsRetweeted(Boolean(post.isRetweeted));
            setRetweetsCount(post.retweetsCount || 0);

            // Obtener información de usuarios
            const userIds = [post.user_id];
            if (post.type === 'retweet' && post.retweetedBy) {
                userIds.push(post.retweetedBy);
            }
            fetchUsers(userIds, fetchUsers);
        }
    }, [post]);

    // Manejar like
    const handleLike = async (event) => {
        event.stopPropagation();
        if (isLoading) return;
        
        setIsLoading(true);
        try {
            const response = await likePostRequest(post.id);
            const newIsLiked = response.data.action === 'like';
            const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;
            
            setIsLiked(newIsLiked);
            setLikesCount(newLikesCount);
            updatePostLike(post.id, newIsLiked, newLikesCount);
        } catch (error) {
            console.error('Error al dar/quitar like:', error);
            setIsLiked(!isLiked);
        } finally {
            setIsLoading(false);
        }
    };

    // Manejar retweet
    const handleRetweet = async (event) => {
        event.stopPropagation();
        if (isLoading) return;
        
        setIsLoading(true);
        try {
            const response = await retweetPostRequest(post.id);
            const newIsRetweeted = response.data.action === 'retweet';
            const newRetweetsCount = newIsRetweeted ? retweetsCount + 1 : retweetsCount - 1;
            
            setIsRetweeted(newIsRetweeted);
            setRetweetsCount(newRetweetsCount);
            updateRetweet(post.id, newIsRetweeted, newRetweetsCount);
        } catch (error) {
            console.error('Error al retweetear/quitar retweet:', error);
            setIsRetweeted(!isRetweeted);
        } finally {
            setIsLoading(false);
        }
    }

    const handleComment = (event) => {
        event.stopPropagation();
        navigate(`/compose/post`, { state: { parentId: post.id, background: location } });
    }

    const handleProfileClick = (event, username) => {
        event.stopPropagation();
        navigate(`/${username}`);
    };

    const postUser = getUser(post.user_id);
    const retweetUser = post.type === 'retweet' && post.retweetedBy ? getUser(post.retweetedBy) : null;

    return (
        <div className="border-x border-b border-gray-500/50 px-4 py-2">
            {/* Retweet */}
            {post.type === 'retweet' && (
                <div className="mx-6 mb-1">
                    <div className="text-gray-600 text-sm flex items-center gap-2">
                        <RetweetIcon isRetweeted={isRetweeted} width={16} height={16} />
                        <p 
                            className="text-gray-600 hover:underline font-semibold"
                            onClick={(e) => handleProfileClick(e, retweetUser.username)}
                        >
                            {
                                retweetUser.username === user?.username ? (
                                    'Reposteaste'
                                ) : (
                                    retweetUser.full_name + ' reposteó'
                                )
                            }
                        </p>
                    </div>
                </div>
            )}

            <div className="flex gap-2">
                {/* Imagen de perfil */}
                <div className="flex-shrink-0 w-auto">
                    {postUser.profile_picture && (
                        <img 
                            src={postUser.profile_picture} 
                            alt={postUser.username}
                            className="w-10 h-10 rounded-full cursor-pointer"
                            onClick={(e) => handleProfileClick(e, postUser.username)}
                        />
                    )}
                </div>

                {/* Content */}
                <div className="flex-grow">
                    <div className="flex items-center gap-2">
                        <div className="flex flex-row gap-1">
                            <p 
                                className="font-bold hover:underline"
                                onClick={(e) => handleProfileClick(e, postUser.username)}
                            >
                                {postUser.full_name}
                            </p>
                            <p 
                                className="text-gray-600"
                                onClick={(e) => handleProfileClick(e, postUser.username)}
                            >
                                @{postUser.username}
                            </p>
                            <p className="text-gray-600 font-bold">·</p>

                            {/* Fecha de publicación formateada */}
                            <p className="text-gray-600 hover:underline">
                                {formatPostTimestamp(post.created_at, location.pathname, isComment)}.
                            </p>
                        </div>
                    </div>

                    <div className="pb-2">
                        {/* contenido */}
                        <p>{post.content}</p>

                        {/* imagen */}
                        {post.media_url && (
                            <img src={`${post.media_url}`} alt="Post" className="w-full h-auto rounded-2xl mt-4" />
                        )}
                    </div>
                    
                    <div className="flex flex-rows gap-2">
                        <div>
                            <button 
                                onClick={handleRetweet}
                                disabled={isLoading}
                                className={`group flex items-center justify-center rounded-full
                                    ${isRetweeted ? 'text-green-500' : 'hover:text-green-500'}
                                    ${isLoading ? 'opacity-50' : 'cursor-pointer'}
                                }`}>

                                {/* Retweet icon */}
                                <div className="group-hover:bg-green-500/10 rounded-full p-1.5">
                                    <RetweetIcon isRetweeted={isRetweeted} />
                                </div>

                                {/* Retweets count */}
                                <span>{retweetsCount}</span>
                            </button>
                        </div>

                        <div>
                            <button 
                                onClick={handleLike}
                                disabled={isLoading}
                                className={`group flex items-center justify-center rounded-full
                                    ${isLiked ? 'text-red-500' : ' hover:text-red-500'}
                                    ${isLoading ? 'opacity-50' : 'cursor-pointer'}
                                }`}>

                                {/* Like icon */}
                                <div className="group-hover:bg-red-500/10 rounded-full p-1.5">
                                    <LikeIcon isLiked={isLiked} />
                                </div>

                                {/* Likes count */}
                                <span>{likesCount}</span>
                            </button>
                        </div>

                        <div>
                            <button
                                onClick={handleComment}
                                disabled={isLoading}
                                className={`group flex items-center justify-center rounded-full
                                    ${isCommented ? 'text-blue-500' : 'hover:text-blue-400'}
                                    ${isLoading ? 'opacity-50' : 'cursor-pointer'}
                                }`}>

                                {/* Comment icon */}
                                <div className="group-hover:bg-blue-500/15 rounded-full p-1.5">
                                    <CommentIcon />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PostCard

