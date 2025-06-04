import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { usePosts } from '../context/PostsContext'
import PostCard from '../components/PostCard'
import { useNavigate } from 'react-router-dom';

function PostPage() {
    const { post, getPostWithComments } = usePosts()
    const { postId } = useParams()
    const navigate = useNavigate();

    useEffect(() => {
        getPostWithComments(postId)
    }, [postId])

    const handlePostClick = (postId) => {
        navigate(`/post/status/${postId}`);
    };

    return (
        <div>
            {post ? (
                <>
                    <PostCard post={post} />
                    
                    {/* Sección de comentarios */}
                    <div className="mt-8">
                        <h2 className="text-xl font-bold mb-4">Comentarios</h2>
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
                            <p className="text-gray-500">No hay comentarios aún</p>
                        )}
                    </div>
                </>
            ) : (
                <p>Cargando post...</p>
            )}
        </div>
    )
}

export default PostPage