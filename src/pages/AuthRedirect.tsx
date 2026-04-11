import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const AuthRedirect = () => {
  const { user, isInternal, isClient, loading, roles } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    const timer = setTimeout(() => {
      if (isInternal) {
        navigate("/admin", { replace: true });
      } else if (isClient) {
        navigate("/workspace", { replace: true });
      } else {
        // Regular users (including Google sign-ups with no role yet)
        navigate("/dashboard", { replace: true });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [user, isInternal, isClient, loading, roles, navigate]);

  return (
    <div className="min-h-screen gradient-navy flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
    </div>
  );
};

export default AuthRedirect;
