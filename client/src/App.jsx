import { Routes, Route, useLocation, useNavigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { PostsProvider } from "./context/PostsContext"
import { UsersProvider } from "./context/UsersContext"
import { ProfileProvider } from "./context/ProfilesContext"

import AuthPage from "./pages/AuthPage"
import RegisterPage from "./pages/RegisterPage"
import LoginPage from "./pages/LoginPage"

import HomePage from "./pages/HomePage"
import PostPage from "./pages/PostPage"
import ProtectedRoute from "./ProtectedRoute"
import NotificationsDisplay from "./components/NotificationsDisplay"
import UpdateProfilePage from "./pages/UpdateProfilePage"
import ProfilePage from "./pages/ProfilePage"
import ComposePost from "./components/ComposePost"

function App() {
  const location = useLocation()
  const background = location.state && location.state.background;

  // navegación directa a /compose/post
  let backgroundLocation = background;

  if (location.pathname === '/compose/post' || location.pathname === '/settings/profile' && !background) {
    backgroundLocation = { pathname: '/home' };
  }
  if ((location.pathname === '/login' || location.pathname === '/register') && !background) {
    backgroundLocation = { pathname: '/' };
  }

  const showModal = 
    background || 
    location.pathname === '/register' ||
    location.pathname === '/login' ||
    location.pathname === '/compose/post' ||
    location.pathname === '/settings/profile';

  return (
    <AuthProvider>
      <UsersProvider>
        <ProfileProvider>
          <PostsProvider>
            <Routes location={backgroundLocation || location}>
              <Route path="/" element={<AuthPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              
              <Route element={<ProtectedRoute />}>
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/post/status/:postId" element={<PostPage />} />
                  <Route path="/notificaciones" element={<NotificationsDisplay />} />
                  <Route path="/:username" element={<ProfilePage />} />
              </Route>
            </Routes>
            
            {/* modales */}
            {showModal && (
              <Routes>
                <Route path="/compose/post" element={<ComposePost />} />
                <Route path="/settings/profile" element={<UpdateProfilePage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
              </Routes>
            )}
          </PostsProvider>
        </ProfileProvider>
      </UsersProvider>
    </AuthProvider>
  )
}

export default App
