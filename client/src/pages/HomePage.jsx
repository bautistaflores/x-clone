import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HomePage() {

    const { isAuthenticated, logout } = useAuth();
    return (
        <div>
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
        </div>
    )
}

export default HomePage
