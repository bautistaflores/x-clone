// src/hooks/usePostInteractions.js
import { useState, useEffect } from 'react';
import { usePosts } from '../context/PostsContext';
import { likePostRequest, retweetPostRequest } from '../api/posts';

export const usePostInteractions = (post) => {
    const { updatePostLike, updateRetweet } = usePosts();

    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [isRetweeted, setIsRetweeted] = useState(false);
    const [retweetsCount, setRetweetsCount] = useState(0);

    // Sincroniza el estado local cuando el post (de props) cambia
    useEffect(() => {
        if (post) {
            setIsLiked(Boolean(post.isLiked));
            setLikesCount(post.likesCount || 0);
            setIsRetweeted(Boolean(post.isRetweeted));
            setRetweetsCount(post.retweetsCount || 0);
        }
    }, [post]);

    const handleLike = async (event) => {
        event.stopPropagation();
        
        // Actualización optimista para una UI instantánea
        const newIsLiked = !isLiked;
        const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;

        // Actualiza el estado local Y el global
        setIsLiked(newIsLiked);
        setLikesCount(newLikesCount);
        updatePostLike(post.id, newIsLiked, newLikesCount);

        try {
            await likePostRequest(post.id);
        } catch (error) {
            console.error('Error en la API de like:', error);
            // Si falla, revierte los cambios
            setIsLiked(!newIsLiked);
            setLikesCount(newIsLiked ? newLikesCount - 1 : newLikesCount + 1);
            updatePostLike(post.id, !newIsLiked, newIsLiked ? newLikesCount - 1 : newLikesCount + 1);
        }
    };

    const handleRetweet = async (event) => {
        event.stopPropagation();

        const newIsRetweeted = !isRetweeted;
        const newRetweetsCount = newIsRetweeted ? retweetsCount + 1 : retweetsCount - 1;
        
        setIsRetweeted(newIsRetweeted);
        setRetweetsCount(newRetweetsCount);
        updateRetweet(post.id, newIsRetweeted, newRetweetsCount);

        try {
            await retweetPostRequest(post.id);
        } catch (error) {
            console.error('Error en la API de retweet:', error);
            // Revertir en caso de error
            setIsRetweeted(!newIsRetweeted);
            setRetweetsCount(newIsRetweeted ? newRetweetsCount - 1 : newRetweetsCount + 1);
            updateRetweet(post.id, !newIsRetweeted, newIsRetweeted ? newRetweetsCount - 1 : newRetweetsCount + 1);
        }
    };

    return {
        isLiked,
        likesCount,
        isRetweeted,
        retweetsCount,
        handleLike,
        handleRetweet
    };
};

export default usePostInteractions;