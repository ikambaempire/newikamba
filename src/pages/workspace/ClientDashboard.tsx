import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  FolderOpen, BarChart3, FileText, Clock, CheckCircle2, LogOut, Plus, Layers,
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type ProjectStatus = Database["public"]["Enums"]["project_status"];

const statusLabels: Record<ProjectStatus, string> = {
  brief_received: "Brief Received",
  strategy_alignment: "Strategy Alignment",
  production: "Production",
  editing: "Editing",
  client_review: "Client Review",
  final_delivery: "Final Delivery",
  archive: "Archived",
};

const statusColors: Record<ProjectStatus, string> = {
  brief_received: "bg-primary/10 text-primary border-primary/20",
  strategy_alignment: "bg-primary/10 text-primary border-primary/20",
  production: "bg-accent/15 text-accent-foreground border-accent/30",
  editing: "bg-muted text-foreground border-border",
  client_review: "bg-accent/15 text-accent-foreground border-accent/30",
  final_delivery: "bg-success/15 text-foreground border-success/30",
  archive: "bg-muted text-muted-foreground border-border",
};

const ClientDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [assets, setAssets] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data: proj } = await supabase.from("projects").select("*").order("updated_at", { ascending: false });
      if (proj) setProjects(proj);
      const { count } = await supabase.from("assets").select("*", { count: "exact", head: true });
      setAssets(count ?? 0);
      setLoading(false);
    };
    fetchData();
  }, []);

  const active = projects.filter((p) => !["archive", "final_delivery"].includes(p.status));
  const inReview = projects.filter((p) => p.status === "client_review");
  const completed = projects.filter((p) => ["final_delivery", "archive"].includes(p.status));

  const metrics = [
    { icon: Layers, label: "Total Projects", value: projects.length },
    { icon: BarChart3, label: "Active", value: active.length },
    { icon: Clock, label: "In Review", value: inReview.length },
    { icon: CheckCircle2, label: "Completed", value: completed.length },
    { icon: FolderOpen, label: "Assets Delivered", value: assets },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-heading text-lg font-extrabold text-foreground">
              IKAMBA<span className="text-accent">.</span>
            </span>
            <span className="text-muted-foreground/30 text-xs">|</span>
            <span className="text-muted-foreground text-sm">Client Workspace</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-sm hidden sm:block">
              {profile?.full_name || user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-foreground">
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Your project overview and workspace</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {metrics.map((m, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-5">
              <m.icon className="text-accent mb-2" size={20} />
              <p className="text-2xl font-bold text-foreground">{loading ? "—" : m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground">Projects</h2>
          <Link to="/workspace/new-brief">
            <Button variant="hero" size="sm">
              <Plus size={14} className="mr-1" /> Submit Brief
            </Button>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto mb-3 text-muted-foreground/30" size={32} />
              <p className="text-muted-foreground text-sm">No projects yet. Submit your first brief to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Project</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Deadline</TableHead>
                  <TableHead className="text-muted-foreground">Revisions</TableHead>
                  <TableHead className="text-muted-foreground">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.id} className="border-border hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/project/${p.id}`)}>
                    <TableCell className="text-foreground font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{p.project_type || "—"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full border ${statusColors[p.status]}`}>
                        {statusLabels[p.status]}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {p.deadline ? new Date(p.deadline).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{p.revision_count}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(p.updated_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
