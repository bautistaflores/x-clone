import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { usePosts } from '../context/PostsContext'
import PostCard from '../components/PostCard'

function PostPage() {
    const { post, getPostWithComments } = usePosts()
    const { postId } = useParams()

    useEffect(() => {
        getPostWithComments(postId)
    }, [postId])

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
                                <div key={comment.id}>
                                    <PostCard post={comment} />
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