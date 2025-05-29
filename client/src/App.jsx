import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { PostsProvider } from "./context/PostsContext"
import { UsersProvider } from "./context/UsersContext"

import RegisterPage from "./pages/RegisterPage"
import LoginPage from "./pages/LoginPage"

import HomePage from "./pages/HomePage"
import PostPage from "./pages/PostPage"
import ProtectedRoute from "./ProtectedRoute"
import NotificationsDisplay from "./components/NotificationsDisplay"
import UpdateProfilePage from "./pages/UpdateProfilePage"

function App() {

  return (
    <AuthProvider>
      <UsersProvider>
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
              </Route>
            </Routes>
          </BrowserRouter>
        </PostsProvider>
      </UsersProvider>
    </AuthProvider>
  )
}

export default App
