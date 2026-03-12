import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const ProtectedRoute = ({ children, allowedRoles }) => {

  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // role not allowed
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;