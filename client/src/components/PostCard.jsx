import React, { useState, useEffect } from "react"
import { likePostRequest, retweetPostRequest } from "../api/posts"
import { usePosts } from "../context/PostsContext"
import { useUsers } from "../context/UsersContext"
import { useNavigate } from 'react-router-dom';
import { formatPostTimestamp } from "../utils/formatPostTimestamp";

function PostCard({ post, isComment = false }) {
    const { updatePostLike, updateRetweet } = usePosts();
    // Obtener user por id
    const { getUser, fetchUsers } = useUsers();
    const navigate = useNavigate();

    // Estado para el post
    const [isLiked, setIsLiked] = useState(post?.isLiked || false);
    const [likesCount, setLikesCount] = useState(post?.likesCount || 0);
    const [isRetweeted, setIsRetweeted] = useState(post?.isRetweeted || false);
    const [retweetsCount, setRetweetsCount] = useState(post?.retweetsCount || 0);
    const [isLoading, setIsLoading] = useState(false);

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

    const handleProfileClick = (event, username) => {
        event.stopPropagation();
        navigate(`/${username}`); // O /profiles/${username}
    };

    const postUser = getUser(post.user_id);
    const retweetUser = post.type === 'retweet' && post.retweetedBy ? getUser(post.retweetedBy) : null;

    return (
        <div className="border border-gray-300 rounded-md p-4">
            {post.type === 'retweet' && (
                <div className="text-gray-500 text-sm mb-2">
                    <p 
                        className="text-gray-500 hover:underline"
                        onClick={(e) => handleProfileClick(e, retweetUser.username)}
                    >
                        {retweetUser.full_name} reposteó
                    </p>
                </div>
            )}
            <div className="flex items-center gap-2 mb-2">
                {postUser.profile_picture && (
                    <img 
                        src={postUser.profile_picture} 
                        alt={postUser.username}
                        className="w-10 h-10 rounded-full cursor-pointer"
                        onClick={(e) => handleProfileClick(e, postUser.username)}
                    />
                )}
                <div>
                    <p 
                        className="font-bold cursor-pointer hover:underline"
                        onClick={(e) => handleProfileClick(e, postUser.username)}
                    >
                        {postUser.full_name}
                    </p>
                    <p 
                        className="text-gray-500 cursor-pointer"
                        onClick={(e) => handleProfileClick(e, postUser.username)}
                    >
                        @{postUser.username}
                    </p>

                    {/* Fecha de publicación formateada */}
                    <p className="text-gray-500 text-xs mb-2">
                        {formatPostTimestamp(post.created_at, isComment)}
                    </p>
                </div>
            </div>
            <p className="mb-4">{post.content}</p>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleLike}
                    disabled={isLoading}
                    className={`bg-blue-500 text-white py-2 px-4 rounded-md ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:cursor-pointer'
                    }`}>
                    {isLoading ? 'Procesando...' : isLiked ? 'Unlike' : 'Like'}
                </button>
                <span>{likesCount} likes</span>
            </div>

            <div className="flex items-center gap-2">
                <button 
                    onClick={handleRetweet}
                    disabled={isLoading}
                    className={`bg-green-500 text-white py-2 px-4 rounded-md ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:cursor-pointer'
                    }`}>
                    {isLoading ? 'Procesando...' : isRetweeted ? 'Unretweet' : 'Retweet'}
                </button>
                <span>{retweetsCount} retweets</span>
            </div>
        </div>
    )
}

export default PostCard

