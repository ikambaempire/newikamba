import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("Reset link sent — check your inbox.");
    }
  };

  return (
    <div className="min-h-screen gradient-navy flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-heading text-3xl font-extrabold tracking-tight text-white">
            iKAMBA<span className="text-accent">.</span>
          </Link>
          <p className="text-white/80 text-sm mt-2">Reset your password</p>
        </div>

        <div className="bg-white/[0.07] border border-white/20 rounded-xl p-8 space-y-5 backdrop-blur-sm shadow-2xl">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto h-14 w-14 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                <Mail size={26} />
              </div>
              <h2 className="text-white font-bold text-lg">Check your email</h2>
              <p className="text-white/70 text-sm">
                We sent a password reset link to <span className="text-white">{email}</span>.
                Click the link to choose a new password.
              </p>
              <Button onClick={() => setSent(false)} variant="outline" className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20">
                Send to a different email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-white/70 text-sm">Enter your email and we'll send you a link to reset your password.</p>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-white/80 mb-1.5 block">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-accent" />
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                <Mail size={16} className="mr-1" />
                {loading ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center mt-6">
          <Link to="/login" className="text-white/70 text-sm hover:text-white inline-flex items-center gap-1">
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
