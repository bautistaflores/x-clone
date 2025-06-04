import { BrowserRouter, Routes, Route } from "react-router-dom"
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

function App() {

  return (
    <AuthProvider>
      <UsersProvider>
        <ProfileProvider>
          <PostsProvider>
            <BrowserRouter>
              <Routes>
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
            </BrowserRouter>
          </PostsProvider>
        </ProfileProvider>
      </UsersProvider>
    </AuthProvider>
  )
}

export default App
