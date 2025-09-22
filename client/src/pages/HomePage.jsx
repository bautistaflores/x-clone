import { useEffect } from "react"
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import PostCard from '../components/PostCard';
import { useNavigate } from 'react-router-dom';
import ComposePostHome from '../components/ComposePostHome';
import LoadingIcon from "../components/Icons/LoadingIcon"

function HomePage() {
    const { isAuthenticated, logout } = useAuth();
    const { getPosts, posts, loading: postsLoading } = usePosts()
    const navigate = useNavigate()

    useEffect(() => {
        getPosts()
    }, [getPosts])

    const handlePostClick = (postId) => {
        navigate(`/post/status/${postId}`);
    };

    return (
        <div className="w-[600px]">
            <ComposePostHome />
            <div>
                {postsLoading ? (
                    <div className="h-[1000px] border-x border-gray-500/50">
                        <LoadingIcon />
                    </div>
                ) : (
                    posts.length > 0 ? (
                        posts.map(post => (
                            <div
                                key={post.type === 'retweet' ? post.retweetedId : post.id}
                                onClick={() => handlePostClick(post.id)}
                                className="hover:cursor-pointer hover:bg-[#070707]"
                            >
                                <PostCard post={post} />
                            </div>
                        ))
                    ) : (
                        <div className="h-[1000px] border-x border-gray-500/50">
                            <h1 className="text-center font-bold text-xl text-gray-500">. . .</h1>
                        </div>
                    )
                )}
            </div>
        </div>
    )
}

export default HomePage
