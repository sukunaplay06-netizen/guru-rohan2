import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { isLoggedIn, loading, hasEnrolledCourses } = useContext(AuthContext);

  if (loading) return null;

  // 🔴 Not logged in → Login
  if (!isLoggedIn) {
    return <Navigate to="/auth/login" replace />;
  }

  // 🟡 Logged in but NO COURSE → HOME
  if (!hasEnrolledCourses) {
    return <Navigate to="/" replace />;
  }

  // ✅ Logged in + Course → Dashboard allowed
  return <Outlet />;
};

export default ProtectedRoute;
