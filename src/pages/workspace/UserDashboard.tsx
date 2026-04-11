import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LogOut, User, BarChart3, Clock, FolderOpen, Plus, FileText, CheckCircle2,
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type ProjectStatus = Database["public"]["Enums"]["project_status"];

const statusLabels: Record<ProjectStatus, string> = {
  brief_received: "Brief Received",
  strategy_alignment: "Strategy",
  production: "Production",
  editing: "Editing",
  client_review: "Client Review",
  final_delivery: "Delivered",
  archive: "Archived",
};

const statusColors: Record<ProjectStatus, string> = {
  brief_received: "bg-primary/10 text-primary",
  strategy_alignment: "bg-primary/10 text-primary",
  production: "bg-accent/15 text-accent-foreground",
  editing: "bg-muted text-foreground",
  client_review: "bg-accent/15 text-accent-foreground",
  final_delivery: "bg-[hsl(var(--success))]/15 text-foreground",
  archive: "bg-muted text-muted-foreground",
};

const UserDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase.from("projects").select("*").order("updated_at", { ascending: false });
      if (data) setProjects(data);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  const active = projects.filter((p) => !["archive", "final_delivery"].includes(p.status));
  const inReview = projects.filter((p) => p.status === "client_review");
  const completed = projects.filter((p) => ["final_delivery", "archive"].includes(p.status));

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const metrics = [
    { icon: BarChart3, label: "Active", value: active.length, color: "text-primary" },
    { icon: Clock, label: "In Review", value: inReview.length, color: "text-accent" },
    { icon: CheckCircle2, label: "Completed", value: completed.length, color: "text-[hsl(var(--success))]" },
    { icon: FolderOpen, label: "Total", value: projects.length, color: "text-muted-foreground" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-heading text-lg font-extrabold text-foreground">
              IKAMBA<span className="text-accent">.</span>
            </Link>
            <span className="text-muted-foreground/30 text-xs">|</span>
            <span className="text-muted-foreground text-sm">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <User size={14} className="text-accent" />
              </div>
              <span className="text-muted-foreground text-sm hidden sm:block">{displayName}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-foreground">
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Welcome, {displayName}</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your projects and manage your workspace</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {metrics.map((m, i) => (
            <Card key={i} className="bg-card">
              <CardContent className="p-5">
                <m.icon className={`${m.color} mb-2`} size={20} />
                <p className="text-2xl font-bold text-foreground">{loading ? "—" : m.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground">Your Projects</h2>
          <Link to="/workspace/new-brief">
            <Button variant="hero" size="sm">
              <Plus size={14} className="mr-1" /> Submit Brief
            </Button>
          </Link>
        </div>

        {/* Projects */}
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading...</div>
        ) : projects.length === 0 ? (
          <Card className="bg-card">
            <CardContent className="p-12 text-center">
              <FileText className="mx-auto mb-3 text-muted-foreground/30" size={40} />
              <h3 className="text-foreground font-semibold mb-1">No projects yet</h3>
              <p className="text-muted-foreground text-sm mb-4">Submit your first brief to get started with Ikamba.</p>
              <Link to="/workspace/new-brief">
                <Button variant="hero" size="sm">
                  <Plus size={14} className="mr-1" /> Submit Your First Brief
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <Link key={p.id} to={`/project/${p.id}`}>
                <Card className="bg-card hover:shadow-md hover:border-primary/20 transition-all cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${statusColors[p.status]}`}>
                        {statusLabels[p.status]}
                      </span>
                      {p.priority === "urgent" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/15 text-destructive font-semibold">Urgent</span>
                      )}
                    </div>
                    <CardTitle className="text-base mt-2">{p.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-xs text-muted-foreground">
                      {p.project_type && (
                        <div className="flex justify-between">
                          <span>Type</span>
                          <span className="text-foreground">{p.project_type}</span>
                        </div>
                      )}
                      {p.deadline && (
                        <div className="flex justify-between">
                          <span>Deadline</span>
                          <span className="text-foreground">{new Date(p.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Revisions</span>
                        <span className="text-foreground">{p.revision_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Updated</span>
                        <span className="text-foreground">{new Date(p.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
