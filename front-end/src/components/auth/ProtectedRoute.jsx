import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const ProtectedRoute = ({ children, allowedRoles }) => {

  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // user not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // role not allowed
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;