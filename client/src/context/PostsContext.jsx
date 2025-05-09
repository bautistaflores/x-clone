import { createContext, useState, useContext, useEffect } from "react"
import { getPostsRequest } from "../api/posts"

export const PostsContext = createContext()

export const usePosts = () => {
    const context = useContext(PostsContext)
    if (!context) throw new Error('usePosts must be used within a PostsProvider')
    return context
}

export const PostsProvider = ({ children }) => {
    const [posts, setPosts] = useState([])

    const getPosts = async () => {
        try {
            const res = await getPostsRequest()
            setPosts(res.data)
        } catch (error) {
            console.log(error)
        } 
    }

    return (
        <PostsContext.Provider value={{
            posts,
            getPosts
        }}>
            {children}
        </PostsContext.Provider>
    )
}



