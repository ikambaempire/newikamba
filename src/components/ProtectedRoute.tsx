import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  children: React.ReactNode;
  requireInternal?: boolean;
  requireClient?: boolean;
}

const ProtectedRoute = ({ children, requireInternal, requireClient }: Props) => {
  const { user, loading, isInternal, isClient } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (requireInternal && !isInternal) {
    if (isClient) return <Navigate to="/workspace" replace />;
    return <Navigate to="/login" replace />;
  }

  if (requireClient && !isClient) {
    if (isInternal) return <Navigate to="/admin" replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
