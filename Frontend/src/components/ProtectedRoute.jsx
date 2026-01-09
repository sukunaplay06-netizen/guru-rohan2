import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { isLoggedIn, loading, hasEnrolledCourses } = useContext(AuthContext);

  // ⏳ Loader
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "20vh" }}>
        Checking authentication...
      </div>
    );
  }

  // 🔴 Not logged in
  if (!isLoggedIn) {
    return <Navigate to="/auth/login" replace />;
  }

  // 🟡 Logged in but no course
  if (!hasEnrolledCourses) {
    return <Navigate to="/courses" replace />;
  }

  // ✅ Allowed
  return <Outlet />;
};

export default ProtectedRoute;
