import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  BarChart3, Clock, AlertTriangle, CheckCircle2, LogOut, Layers, TrendingUp, Building2, LayoutGrid, TableIcon, FileText, Users,
} from "lucide-react";
import KanbanBoard from "@/components/admin/KanbanBoard";
import BlogManager from "@/components/admin/BlogManager";
import UserManager from "@/components/admin/UserManager";
import type { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type Client = Database["public"]["Tables"]["clients"]["Row"];
type ProjectStatus = Database["public"]["Enums"]["project_status"];
type PriorityLevel = Database["public"]["Enums"]["priority_level"];

const statusLabels: Record<ProjectStatus, string> = {
  brief_received: "Brief Received",
  strategy_alignment: "Strategy",
  production: "Production",
  editing: "Editing",
  client_review: "Client Review",
  final_delivery: "Final Delivery",
  archive: "Archived",
};

const allStatuses: ProjectStatus[] = [
  "brief_received", "strategy_alignment", "production", "editing", "client_review", "final_delivery", "archive",
];

const priorityColors: Record<PriorityLevel, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/10 text-primary",
  high: "bg-accent/15 text-accent-foreground",
  urgent: "bg-destructive/15 text-destructive",
};

const AdminDashboard = () => {
  const { user, profile, signOut, roles } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState("");
  const [view, setView] = useState<"table" | "kanban">("table");
  const [tab, setTab] = useState<"projects" | "blog" | "users">("projects");

  const fetchData = async () => {
    const [projRes, clientRes] = await Promise.all([
      supabase.from("projects").select("*").order("updated_at", { ascending: false }),
      supabase.from("clients").select("*"),
    ]);
    if (projRes.data) setProjects(projRes.data);
    if (clientRes.data) setClients(clientRes.data);

    if (profile?.organization_id) {
      const { data: org } = await supabase.from("organizations").select("name").eq("id", profile.organization_id).single();
      if (org) setOrgName(org.name);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [profile?.organization_id]);

  const getClientName = (clientId: string) => clients.find((c) => c.id === clientId)?.name || "—";
  const getDaysInStage = (stageEnteredAt: string) => Math.floor((Date.now() - new Date(stageEnteredAt).getTime()) / 86400000);

  const getDeadlineRisk = (deadline: string | null, status: ProjectStatus) => {
    if (!deadline || ["final_delivery", "archive"].includes(status)) return "green";
    const daysLeft = Math.floor((new Date(deadline).getTime() - Date.now()) / 86400000);
    if (daysLeft < 0) return "red";
    if (daysLeft <= 3) return "orange";
    return "green";
  };

  const active = projects.filter((p) => !["archive", "final_delivery"].includes(p.status));
  const inReview = projects.filter((p) => p.status === "client_review");
  const overdue = projects.filter((p) => p.deadline && new Date(p.deadline) < new Date() && !["final_delivery", "archive"].includes(p.status));
  const deliveredThisMonth = projects.filter((p) => {
    if (p.status !== "final_delivery") return false;
    const now = new Date();
    const updated = new Date(p.updated_at);
    return updated.getMonth() === now.getMonth() && updated.getFullYear() === now.getFullYear();
  });
  const avgRevisions = projects.length > 0
    ? (projects.reduce((s, p) => s + p.revision_count, 0) / projects.length).toFixed(1)
    : "0";

  const updateProjectStatus = async (projectId: string, newStatus: ProjectStatus) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    await supabase.from("project_status_logs").insert({
      project_id: projectId,
      old_status: project.status,
      new_status: newStatus,
      changed_by: user?.id,
    });
    await supabase.from("projects").update({ status: newStatus, stage_entered_at: new Date().toISOString() }).eq("id", projectId);
    fetchData();
  };

  const updatePriority = async (projectId: string, priority: PriorityLevel) => {
    await supabase.from("projects").update({ priority }).eq("id", projectId);
    fetchData();
  };

  const metrics = [
    { icon: Layers, label: "Active Projects", value: active.length, color: "text-primary" },
    { icon: Clock, label: "In Review", value: inReview.length, color: "text-muted-foreground" },
    { icon: AlertTriangle, label: "Overdue", value: overdue.length, color: "text-destructive" },
    { icon: CheckCircle2, label: "Delivered This Month", value: deliveredThisMonth.length, color: "text-success" },
    { icon: TrendingUp, label: "Avg Revisions", value: avgRevisions, color: "text-accent" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-heading text-lg font-extrabold text-foreground">
              IKAMBA<span className="text-accent">.</span>
            </span>
            <span className="text-muted-foreground/30 text-xs">|</span>
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <Building2 size={14} />
              <span>{orgName || "Admin Dashboard"}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-accent border border-accent/30 px-2 py-0.5 rounded-full">
              {roles[0]?.replace("_", " ").toUpperCase()}
            </span>
            <span className="text-muted-foreground text-sm hidden sm:block">
              {profile?.full_name || user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-foreground">
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Global Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">Operational status across all projects</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {metrics.map((m, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-5">
              <m.icon className={`${m.color} mb-2`} size={20} />
              <p className="text-2xl font-bold text-foreground">{loading ? "—" : m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 mb-6 border-b border-border">
          <button onClick={() => setTab("projects")} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === "projects" ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            Projects
          </button>
          <button onClick={() => setTab("blog")} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${tab === "blog" ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <FileText size={14} /> Blog
          </button>
          {roles.includes("super_admin") && (
            <button onClick={() => setTab("users")} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${tab === "users" ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <Users size={14} /> Users
            </button>
          )}
        </div>

        {tab === "users" ? (
          <UserManager />
        ) : tab === "blog" ? (
          <BlogManager />
        ) : (
        <>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">
            {view === "table" ? "Master Project Table" : "Workflow Pipeline"}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm">{projects.length} projects</span>
            <div className="flex items-center bg-muted rounded-md p-0.5">
              <Button variant="ghost" size="sm" onClick={() => setView("table")}
                className={`h-7 px-2.5 ${view === "table" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <TableIcon size={14} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setView("kanban")}
                className={`h-7 px-2.5 ${view === "kanban" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <LayoutGrid size={14} />
              </Button>
            </div>
          </div>
        </div>

        {view === "kanban" ? (
          loading ? (
            <div className="p-12 text-center text-muted-foreground">Loading...</div>
          ) : (
            <KanbanBoard
              projects={projects}
              clients={clients.map((c) => ({ id: c.id, name: c.name }))}
              onStatusChange={updateProjectStatus}
            />
          )
        ) : (
        <div className="bg-card border border-border rounded-lg overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs">Client</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Project</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Type</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Priority</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Deadline</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Days in Stage</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Revisions</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => {
                  const risk = getDeadlineRisk(p.deadline, p.status);
                  const days = getDaysInStage(p.stage_entered_at);
                  return (
                    <TableRow key={p.id} className="border-border hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/project/${p.id}`)}>
                      <TableCell className="text-muted-foreground text-sm">{getClientName(p.client_id)}</TableCell>
                      <TableCell className="text-foreground font-medium text-sm">{p.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{p.project_type || "—"}</TableCell>
                      <TableCell>
                        <Select value={p.status} onValueChange={(v) => { updateProjectStatus(p.id, v as ProjectStatus); }}>
                          <SelectTrigger className="h-7 text-xs bg-transparent border-border text-foreground w-[140px]" onClick={(e) => e.stopPropagation()}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {allStatuses.map((s) => (
                              <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select value={p.priority} onValueChange={(v) => { updatePriority(p.id, v as PriorityLevel); }}>
                          <SelectTrigger className={`h-7 text-xs border-0 w-[90px] ${priorityColors[p.priority]}`} onClick={(e) => e.stopPropagation()}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(["low", "medium", "high", "urgent"] as PriorityLevel[]).map((pr) => (
                              <SelectItem key={pr} value={pr}>{pr.charAt(0).toUpperCase() + pr.slice(1)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm ${risk === "red" ? "text-destructive font-semibold" : risk === "orange" ? "text-accent" : "text-muted-foreground"}`}>
                          {p.deadline ? new Date(p.deadline).toLocaleDateString() : "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm ${days > 7 ? "text-accent" : "text-muted-foreground"}`}>{days}d</span>
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm ${p.revision_count > 2 ? "text-accent font-semibold" : "text-muted-foreground"}`}>{p.revision_count}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{new Date(p.updated_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
        )}
        </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
