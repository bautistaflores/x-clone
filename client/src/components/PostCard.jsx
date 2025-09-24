import React, { useState, useEffect } from "react"
import { likePostRequest, retweetPostRequest } from "../api/posts"
import { usePosts } from "../context/PostsContext"
import { useUsers } from "../context/UsersContext"
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from 'react-router-dom';
import { formatPostTimestamp } from "../utils/formatPostTimestamp";

import InteractionsPost from "./InteractionsPost";
import RetweetIcon from "./Icons/RetweetIcon";

function PostCard({ post, isComment = false, postPage = false }) {
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

    const profileAndDate = (postPage = false) => {
        return (
            <div className="flex items-center gap-2">
                <div className={`flex ${postPage ? 'flex-col' : 'flex-row gap-1'}`}>
                    <p
                        className={`font-semibold hover:underline hover:cursor-pointer ${postPage ? 'leading-none' : ''}`}
                        onClick={(e) => handleProfileClick(e, postUser.username)}
                    >
                        {postUser.full_name}
                    </p>

                    <p
                        className="text-gray-600 hover:cursor-pointer"
                        onClick={(e) => handleProfileClick(e, postUser.username)}
                    >
                        @{postUser.username}
                    </p>


                    {!postPage && (
                        <>
                            <p className="text-gray-600 font-bold">·</p>
                            <p className="text-gray-600 hover:underline">
                                {formatPostTimestamp(post.created_at, location.pathname, isComment)}.
                            </p>
                        </>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className={`border-x ${postPage ? '' : 'border-b'} border-gray-500/50 px-4 py-2`}>
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
                
                {!postPage ? (
                    <>
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
                            {/* Usuario y fecha de publicación */}
                            {profileAndDate()}

                            {/* Contenido del post */}
                            <div className="pb-2">
                                {/* contenido */}
                                <p>{post.content}</p>

                                {/* imagen */}
                                {post.media_url && (
                                    <img src={`${post.media_url}`} alt="Post" className="w-full h-auto rounded-2xl mt-4" />
                                )}
                            </div>

                            {/* Botones de retweet, like y comment */}
                            <InteractionsPost
                                handleComment={handleComment}
                                handleRetweet={handleRetweet}
                                handleLike={handleLike}
                                isCommented={isCommented}
                                isRetweeted={isRetweeted}
                                isLiked={isLiked}
                                isLoading={isLoading}
                                retweetsCount={retweetsCount}
                                likesCount={likesCount}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col gap-2 w-full">
                        {/* Imagen de perfil y usuario */}
                        <div className="flex flex-row flex-shrink-0 w-auto gap-2">
                            {postUser.profile_picture && (
                                <img 
                                    src={postUser.profile_picture} 
                                    alt={postUser.username}
                                    className="w-10 h-10 rounded-full cursor-pointer"
                                    onClick={(e) => handleProfileClick(e, postUser.username)}
                                />
                            )}

                            {/* Usuario */}
                            {profileAndDate(true)}
                        </div>

                        {/* Content */}
                        <div className="flex-grow">
                            {/* Contenido del post */}
                            <div className="pb-2">
                                {/* contenido */}
                                <p>{post.content}</p>

                                {/* imagen */}
                                {post.media_url && (
                                    <img src={`${post.media_url}`} alt="Post" className="w-full h-auto rounded-2xl mt-4" />
                                )}

                                {/* Fecha de publicación formateada */}
                                <p className="text-gray-600 hover:underline hover:cursor-pointer mt-4">
                                    {formatPostTimestamp(post.created_at, location.pathname, isComment)}.
                                </p>
                            </div>

                            {/* Botones de retweet, like y comment */}
                            <InteractionsPost
                                handleComment={handleComment}
                                handleRetweet={handleRetweet}
                                handleLike={handleLike}
                                isCommented={isCommented}
                                isRetweeted={isRetweeted}
                                isLiked={isLiked}
                                isLoading={isLoading}
                                retweetsCount={retweetsCount}
                                likesCount={likesCount}
                                postPage={true}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PostCard

