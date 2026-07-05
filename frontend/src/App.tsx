import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ReviewNewPage from "./pages/ReviewNewPage";
import ReviewDetailPage from "./pages/ReviewDetailPage";
import ReviewEditPage from "./pages/ReviewEditPage";
import ProfilePage from "./pages/ProfilePage";
import ProfileEditPage from "./pages/ProfileEditPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/reviews/new" element={<PrivateRoute><ReviewNewPage /></PrivateRoute>} />
          <Route path="/reviews/:id" element={<PrivateRoute><ReviewDetailPage /></PrivateRoute>} />
          <Route path="/reviews/:id/edit" element={<PrivateRoute><ReviewEditPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/profile/edit" element={<PrivateRoute><ProfileEditPage /></PrivateRoute>} />
          <Route path="/users/:id" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
