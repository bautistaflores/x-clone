import { useEffect } from "react"
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import PostCard from '../components/PostCard';
import NotificationsDisplay from '../components/NotificationsDisplay';
import { useNavigate } from 'react-router-dom';

function HomePage() {
    const { isAuthenticated, logout } = useAuth();
    const { getPosts, posts } = usePosts()
    const navigate = useNavigate()

    useEffect(() => {
        getPosts()
    }, [])

    const handlePostClick = (postId) => {
        navigate(`/post/status/${postId}`);
    };

    return (
        <div>
            <h1>Home</h1>
            {isAuthenticated ? (
                <ul>
                    <li>
                        <Link to='/' onClick={() => { logout() }}>Logout</Link>
                    </li>
                </ul>
            ) : (
                <ul>
                    <li>
                        <Link to="/login">Login</Link>
                    </li>
                    <li>
                        <Link to="/register">Register</Link>
                    </li>
                </ul>
            )}


            <div>
                {
                    posts.length > 0 ? (
                        posts.map(post => (
                            <div
                                key={post.type === 'retweet' ? post.retweetedId : post.id}
                                onClick={() => handlePostClick(post.id)}
                                className="hover:cursor-pointer"
                            >
                                <PostCard post={post} />
                            </div>
                        ))
                    ) : (
                        <h1>No hay posts</h1>
                    )
                }
            </div>
        </div>
    )
}

export default HomePage
