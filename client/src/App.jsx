import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { PostsProvider } from "./context/PostsContext"

import RegisterPage from "./pages/RegisterPage"
import LoginPage from "./pages/LoginPage"
import HomePage from "./pages/HomePage"
import ProtectedRoute from "./ProtectedRoute"

function App() {

  return (
    <AuthProvider>
      <PostsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<HomePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PostsProvider>
    </AuthProvider>
  )
}

export default App
