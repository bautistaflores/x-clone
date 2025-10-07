import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { usePosts } from '../context/PostsContext'
import PostCard from '../components/PostCard'
import { useNavigate } from 'react-router-dom';
import ComposeComment from '../components/ComposeComment'

import BackIcon from "../components/Icons/BackIcon"
import LoadingIcon from "../components/Icons/LoadingIcon"

function PostPage() {
    const { post, getPostWithComments, loading: postsLoading } = usePosts()
    const { postId } = useParams()
    const navigate = useNavigate();

    useEffect(() => {
        getPostWithComments(postId)
    }, [postId, getPostWithComments])

    const handlePostClick = (postId) => {
        navigate(`/post/status/${postId}`);
    };
    
    if ( !post && postsLoading ) {
        return <LoadingIcon />
    } else if ( !post ) {
        return <p>No se encontró el post</p>
    }

    if (postsLoading || post.id !== postId) {
        return <LoadingIcon />
    } 

    return (
        <div>
            <div className='flex border-x border-gray-500/50'>
                <button onClick={() => navigate(-1)} className="cursor-pointer hover:bg-[#1e1e1e] rounded-full p-2 m-2">
                    <BackIcon />
                </button>

                <h1 className="text-xl font-bold ml-5 mt-3">Post</h1>
            </div>

            <PostCard post={post} postPage={true} />

            {/* Formulario de comentario */}
            <ComposeComment parentId={post.id} userIdPost={post.user_id} />
            
            
            {/* Sección de comentarios */}
            <div className="">
                {post.comments && post.comments.length > 0 ? (
                    post.comments.map(comment => (
                        <div key={comment.id} 
                            onClick={() => handlePostClick(comment.id)}
                            className="hover:cursor-pointer"
                        >
                            <PostCard post={comment} isComment={true}/>
                        </div>
                    ))
                ) : (
                    <div className="h-[1000px] border-x border-gray-500/50"></div>
                )}
            </div>
        </div>
    )
}

export default PostPage