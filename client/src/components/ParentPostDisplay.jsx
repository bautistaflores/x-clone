// src/components/ParentPostDisplay.jsx
import React, { useState, useEffect } from 'react';
import { usePosts } from '../context/PostsContext';
import { useUsers } from '../context/UsersContext';
import PostCard from './PostCard';
import LoadingIcon from './Icons/LoadingIcon';

function ParentPostDisplay({ parentId }) {
    const { getPostById } = usePosts();
    const { fetchUsers } = useUsers();
    const [parentPost, setParentPost] = useState(null);

    useEffect(() => {
        const fetchParent = async () => {
            if (parentId) {
                // trae el post del padre
                const postData = await getPostById(parentId);

                if (postData) {
                    await fetchUsers([postData.user_id]);
                    setParentPost(postData);
                }
            }
        };
        fetchParent();
    }, [parentId, getPostById, fetchUsers]);

    // loading
    if (!parentPost) {
        return (
            <div className="p-4 border-b border-gray-500/50">
                <LoadingIcon />
            </div>
        );
    }

    return (
        <div className="">
            <PostCard post={parentPost} postPage={false} commentPage={true} />
        </div>
    );
}

export default ParentPostDisplay;