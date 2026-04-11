import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Send } from "lucide-react";

const NewBrief = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    project_type: "",
    objective: "",
    target_audience: "",
    key_message: "",
    distribution_plan: "",
    deadline: "",
    budget_range: "",
    approval_contact: "",
    contact_email: "",
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.client_id) {
      toast.error("Your account is not linked to a client organization. Contact your admin.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("projects").insert({
      ...form,
      client_id: profile.client_id,
      deadline: form.deadline || null,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Brief submitted successfully!");
      navigate("/workspace");
    }
  };

  const fieldClass = "bg-card border-border text-foreground placeholder:text-muted-foreground/50";
  const labelClass = "text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/workspace">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <span className="font-heading text-lg font-extrabold text-foreground">
            IKAMBA<span className="text-accent">.</span>
          </span>
          <span className="text-muted-foreground/30 text-xs">|</span>
          <span className="text-muted-foreground text-sm">Submit Brief</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-foreground mb-2">New Project Brief</h1>
        <p className="text-muted-foreground text-sm mb-8">Fill in the details below to start a new project.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Project Title *</label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} required className={fieldClass} placeholder="e.g. Annual Report Video" />
            </div>
            <div>
              <label className={labelClass}>Project Type</label>
              <Input value={form.project_type} onChange={(e) => update("project_type", e.target.value)} className={fieldClass} placeholder="e.g. Corporate Video, Social Content" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Objective *</label>
            <Textarea value={form.objective} onChange={(e) => update("objective", e.target.value)} required className={fieldClass} placeholder="What should this project achieve?" rows={3} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Target Audience</label>
              <Input value={form.target_audience} onChange={(e) => update("target_audience", e.target.value)} className={fieldClass} placeholder="e.g. Board members, General public" />
            </div>
            <div>
              <label className={labelClass}>Key Message</label>
              <Input value={form.key_message} onChange={(e) => update("key_message", e.target.value)} className={fieldClass} placeholder="Core message to communicate" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Distribution Plan</label>
            <Textarea value={form.distribution_plan} onChange={(e) => update("distribution_plan", e.target.value)} className={fieldClass} placeholder="Where and how will this content be distributed?" rows={2} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Deadline</label>
              <Input type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Budget Range</label>
              <Input value={form.budget_range} onChange={(e) => update("budget_range", e.target.value)} className={fieldClass} placeholder="e.g. $5,000 - $10,000" />
            </div>
            <div>
              <label className={labelClass}>Approval Contact</label>
              <Input value={form.approval_contact} onChange={(e) => update("approval_contact", e.target.value)} className={fieldClass} placeholder="Name of approver" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Contact Email</label>
            <Input type="email" value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} className={fieldClass} placeholder="email@company.com" />
          </div>

          <div className="pt-4">
            <Button type="submit" variant="hero" size="lg" disabled={loading} className="w-full sm:w-auto">
              <Send size={16} className="mr-1" />
              {loading ? "Submitting..." : "Submit Brief"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default NewBrief;
