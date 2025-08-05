import { Routes, Route, useLocation, useNavigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { PostsProvider } from "./context/PostsContext"
import { UsersProvider } from "./context/UsersContext"
import { ProfileProvider } from "./context/ProfilesContext"

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

  if (location.pathname === '/compose/post' && !background) {
    backgroundLocation = { pathname: '/home' };
  }

  const showModal = background || location.pathname === '/compose/post';

  return (
    <AuthProvider>
      <UsersProvider>
        <ProfileProvider>
          <PostsProvider>
            <Routes location={backgroundLocation || location}>
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<LoginPage />} />
              
              <Route element={<ProtectedRoute />}>
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/post/status/:postId" element={<PostPage />} />
                  <Route path="/notificaciones" element={<NotificationsDisplay />} />
                  <Route path="/update-profile" element={<UpdateProfilePage />} />
                  <Route path="/:username" element={<ProfilePage />} />
              </Route>
            </Routes>
            
            {showModal && (
              <Routes>
                <Route path="/compose/post" element={<ComposePost />} />
              </Routes>
            )}
          </PostsProvider>
        </ProfileProvider>
      </UsersProvider>
    </AuthProvider>
  )
}

export default App
