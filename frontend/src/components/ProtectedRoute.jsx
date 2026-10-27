import { ShieldX } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import Loading from "./Loading";

const AccessDenied = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
  <div className="text-center max-w-md">
    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
      <ShieldX className="h-10 w-10 text-red-600" />
    </div>

    <h2 className="text-3xl font-bold text-gray-900 mb-3">
      Access Denied
    </h2>

    <p className="text-gray-600 mb-8">
      You don't have permission to access this page. If you believe this is a mistake, please contact support.
    </p>

    <Link to="/" className="btn bg-primary text-white hover:bg-primary/90">
      Go Home
    </Link>
  </div>
</div>
);

const ProtectedRoute = ({
  authUser,
  isLoading,
  requiredRole = [],
  requireCompleteProfile = false,
}) => {
  const location = useLocation();

  if (isLoading) {
    return <Loading fullScreen label="Checking your access..." />;
  }

  if (!authUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requiredRole.length > 0 && !requiredRole.includes(authUser.role)) {
    return <AccessDenied />;
  }

  if (requireCompleteProfile && !authUser.profileCompleted) {
    return (
      <Navigate
        to="/settings"
        replace
        state={{ completeProfileRequired: true, from: location.pathname }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
