import React, { useState, useEffect } from "react"
import { likePostRequest } from "../api/posts"
import { usePosts } from "../context/PostsContext"

function PostCard({ post }) {
    const { updatePostLike } = usePosts();
    // Inicializa el estado con la información del post
    const [isLiked, setIsLiked] = useState(post?.isLiked || false);
    const [likesCount, setLikesCount] = useState(post?.likesCount || 0);
    const [isLoading, setIsLoading] = useState(false);

    // Actualiza el estado cuando cambia el post
    useEffect(() => {
        if (post) {
            setIsLiked(Boolean(post.isLiked));
            setLikesCount(post.likesCount || 0);
        }
    }, [post]);

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
            // Revierte el estado en caso de error
            setIsLiked(!isLiked);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="border border-gray-300 rounded-md p-4">
            <p>id: {post.id}</p>
            <p>Post de user: {post.user_id}</p>
            <p>{post.content}</p>
            
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
        </div>
    )
}

export default PostCard