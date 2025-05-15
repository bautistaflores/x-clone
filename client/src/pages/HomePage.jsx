import { useEffect } from "react"
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import PostCard from '../components/PostCard';
import NotificationsDisplay from '../components/NotificationsDisplay';

function HomePage() {
    const { isAuthenticated, logout } = useAuth();
    const { getPosts, posts } = usePosts()

    useEffect(() => {
        getPosts()
    }, [])

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
                            <PostCard post={post} key={post.id} />
                        ))
                    ) : (
                        <h1>No hay posts</h1>
                    )
                }
            </div>
            <NotificationsDisplay />
        </div>

    )
}

export default HomePage
