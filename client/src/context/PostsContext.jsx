import { createContext, useState, useContext, useEffect, useCallback } from "react"
import { getPostsRequest, getPostWithCommentsRequest, createPostRequest, getPostsByUsernameRequest, getPostByIdRequest } from "../api/posts"
import { useUsers } from "./UsersContext"

export const PostsContext = createContext()

export const usePosts = () => {
    const context = useContext(PostsContext)
    if (!context) throw new Error('usePosts must be used within a PostsProvider')
    return context
}

export const PostsProvider = ({ children }) => {
    const [postsMap, setPostsMap] = useState({})
    const [posts, setPosts] = useState([])
    const [post, setPost] = useState(null)
    const [userPosts, setUserPosts] = useState([])
    const [loading, setLoading] = useState(false)
    const { fetchUsers } = useUsers();

    const createPost = async (formData) => {
        try {
            const res = await createPostRequest(formData)
            setPosts(prevPosts => [res.data, ...prevPosts])
        } catch (error) {
            console.log(error)
        }
    }

    const getPosts = useCallback(async () => {
        if (posts.length > 0) {
            return;
        }

        try {
            setLoading(true)
            const res = await getPostsRequest()
            const postsData = res.data;

            // trae los ids de los usuarios de los posts
            const userIds = [...new Set(postsData.map(p => p.user_id))];

            // trae info de todos los usuarios antes de renderizar
            await fetchUsers(userIds);

            setPosts(postsData)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }, [posts.length])

    const getPostsByUsername = async (username) => {
        try {
            setLoading(true)
            const res = await getPostsByUsernameRequest(username)
            const postsData = res.data;

            // trae los ids de los usuarios de los posts
            const userIds = [...new Set(postsData.map(p => p.user_id))];

            // trae info de todos los usuarios antes de renderizar
            await fetchUsers(userIds);

            setUserPosts(postsData)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const getPostWithComments = async (postId) => {
        if (postsMap[postId]) {
            setPost(postsMap[postId])
            return postsMap[postId];
        }

        try {
            setLoading(true)
            const res = await getPostWithCommentsRequest(postId)
            const fetchedPost = res.data;
            setPost(fetchedPost);
            setPostsMap(prev => ({ ...prev, [postId]: fetchedPost }));
            return fetchedPost;
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const getPostById = async (postId) => {
        try {
            const res = await getPostByIdRequest(postId)
            setPost(res.data)
            return res.data
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

    const updateRetweet = (postId, isRetweeted, retweetsCount) => {
        // Actualizar el post individual si existe
        if (post && post.id === postId) {
            setPost(prevPost => ({
                ...prevPost,
                isRetweeted,
                retweetsCount
            }))
        }
        
        // Actualizar el post en la lista de posts
        setPosts(prevPosts => 
            prevPosts.map(p => 
                p.id === postId 
                    ? { ...p, isRetweeted, retweetsCount }
                    : p
            )
        )
    }

    return (
        <PostsContext.Provider value={{
            posts,
            userPosts,
            createPost,
            getPosts,
            getPostsByUsername,
            post,
            getPostWithComments,
            getPostById,
            updatePostLike,
            updateRetweet,
            loading
        }}>
            {children}
        </PostsContext.Provider>
    )
}