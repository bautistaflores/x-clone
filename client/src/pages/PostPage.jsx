import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { usePosts } from '../context/PostsContext'
import PostCard from '../components/PostCard'

function PostPage() {
    const { post, getPostWithComments, posts, getPosts } = usePosts()
    const { postId } = useParams()

    useEffect(() => {
        // Si no hay posts cargados, los cargamos primero
        if (posts.length === 0) {
            getPosts()
        }
        
        getPostWithComments(postId)
    }, [postId])

    // Si el post existe en la lista de posts, usamos ese estado
    const postFromList = posts.find(p => p.id === postId)
    const displayPost = postFromList || post

    return (
        <div>
            {displayPost ? (
                <PostCard post={displayPost} />
            ) : (
                <p>Cargando post...</p>
            )}
        </div>
    )
}

export default PostPage