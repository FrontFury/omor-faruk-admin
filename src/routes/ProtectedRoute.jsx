import { Navigate, Outlet, useLocation } from "react-router-dom";
import useRole from "../hook/useRole";
import AccessDenied from "../pages/AccessDenied/AccessDenied";
import useAuth from "../hook/useAuth";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const { role, roleLoading } = useRole();
  const location = useLocation();

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 font-medium">Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role !== "admin") {
    return <AccessDenied />;
  }

  return <Outlet />;
};

export default ProtectedRoute;