import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { KeyRound, Check } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  // Supabase auto-exchanges the recovery token in the URL fragment on load.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (password !== confirm) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated. Please sign in.");
    await supabase.auth.signOut();
    setTimeout(() => navigate("/login"), 600);
  };

  return (
    <div className="min-h-screen gradient-navy flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-heading text-3xl font-extrabold tracking-tight text-white">
            iKAMBA<span className="text-accent">.</span>
          </Link>
          <p className="text-white/80 text-sm mt-2">Choose a new password</p>
        </div>

        <div className="bg-white/[0.07] border border-white/20 rounded-xl p-8 space-y-5 backdrop-blur-sm shadow-2xl">
          {!ready ? (
            <p className="text-white/80 text-sm text-center">
              Open this page from the reset link in your email. If you arrived here directly, request a new link from{" "}
              <Link to="/forgot-password" className="text-accent underline">Forgot password</Link>.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-white/80 mb-1.5 block">New password</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={8}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-accent" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-white/80 mb-1.5 block">Confirm new password</label>
                <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required minLength={8}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-accent" />
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                {loading ? <>Updating…</> : <><Check size={16} className="mr-1" /> Update password</>}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center mt-6">
          <Link to="/login" className="text-white/70 text-sm hover:text-white inline-flex items-center gap-1">
            <KeyRound size={14} /> Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
