import { createContext, useState, useContext, useEffect } from "react"
import { getPostsRequest, getPostWithCommentsRequest } from "../api/posts"

export const PostsContext = createContext()

export const usePosts = () => {
    const context = useContext(PostsContext)
    if (!context) throw new Error('usePosts must be used within a PostsProvider')
    return context
}

export const PostsProvider = ({ children }) => {
    const [posts, setPosts] = useState([])
    const [post, setPost] = useState(null)

    const getPosts = async () => {
        try {
            const res = await getPostsRequest()
            setPosts(res.data)
            
            // Si tenemos un post individual cargado, actualizamos su estado
            if (post) {
                const updatedPost = res.data.find(p => p.id === post.id)
                if (updatedPost) {
                    setPost(prevPost => ({
                        ...prevPost,
                        isLiked: updatedPost.isLiked,
                        likesCount: updatedPost.likesCount
                    }))
                }
            }
        } catch (error) {
            console.log(error)
        } 
    }

    const getPostWithComments = async (postId) => {
        try {
            const res = await getPostWithCommentsRequest(postId)
            
            // Buscar el post en la lista de posts para mantener el estado del like
            const existingPost = posts.find(p => p.id === postId)
            if (existingPost) {
                setPost({
                    ...res.data,
                    isLiked: existingPost.isLiked,
                    likesCount: existingPost.likesCount
                })
            } else {
                setPost(res.data)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const updatePostLike = (postId, isLiked, likesCount) => {
        // Actualizar el post individual si existe
        if (post && post.id === postId) {
            setPost(prevPost => ({
                ...prevPost,
                isLiked,
                likesCount
            }))
        }
        
        // Actualizar el post en la lista de posts
        setPosts(prevPosts => 
            prevPosts.map(p => 
                p.id === postId 
                    ? { ...p, isLiked, likesCount }
                    : p
            )
        )
    }

    return (
        <PostsContext.Provider value={{
            posts,
            getPosts,
            post,
            getPostWithComments,
            updatePostLike
        }}>
            {children}
        </PostsContext.Provider>
    )
}