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
    return <Navigate to="/os" replace />;
  }

  if (requireClient && !isClient) {
    return <Navigate to="/os" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
