import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft, Calendar, User, Mail, Target, Users as UsersIcon,
  MessageSquare, FileText, Clock, CheckCircle2, ChevronRight,
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type ProjectStatus = Database["public"]["Enums"]["project_status"];
type StatusLog = Database["public"]["Tables"]["project_status_logs"]["Row"];
type Revision = Database["public"]["Tables"]["revisions"]["Row"];
type Client = Database["public"]["Tables"]["clients"]["Row"];

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
  brief_received: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  strategy_alignment: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  production: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  editing: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  client_review: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  final_delivery: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  archive: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const allStatuses: ProjectStatus[] = [
  "brief_received", "strategy_alignment", "production", "editing",
  "client_review", "final_delivery", "archive",
];

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isInternal } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [statusLogs, setStatusLogs] = useState<StatusLog[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const [projRes, logsRes, revRes] = await Promise.all([
        supabase.from("projects").select("*").eq("id", id).single(),
        supabase.from("project_status_logs").select("*").eq("project_id", id).order("created_at", { ascending: true }),
        supabase.from("revisions").select("*").eq("project_id", id).order("revision_number", { ascending: true }),
      ]);
      if (projRes.data) {
        setProject(projRes.data);
        const { data: cl } = await supabase.from("clients").select("*").eq("id", projRes.data.client_id).single();
        if (cl) setClient(cl);
      }
      if (logsRes.data) setStatusLogs(logsRes.data);
      if (revRes.data) setRevisions(revRes.data);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const backPath = isInternal ? "/admin" : "/workspace";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading project…</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Project not found.</p>
        <Button variant="ghost" onClick={() => navigate(backPath)}>Go Back</Button>
      </div>
    );
  }

  const currentIdx = allStatuses.indexOf(project.status);

  const infoItems = [
    { icon: FileText, label: "Type", value: project.project_type },
    { icon: Target, label: "Objective", value: project.objective },
    { icon: UsersIcon, label: "Target Audience", value: project.target_audience },
    { icon: MessageSquare, label: "Key Message", value: project.key_message },
    { icon: Calendar, label: "Deadline", value: project.deadline ? new Date(project.deadline).toLocaleDateString() : null },
    { icon: User, label: "Approval Contact", value: project.approval_contact },
    { icon: Mail, label: "Contact Email", value: project.contact_email },
    { icon: FileText, label: "Distribution Plan", value: project.distribution_plan },
    { icon: FileText, label: "Budget Range", value: project.budget_range },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(backPath)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} className="mr-1" /> Back
          </Button>
          <span className="text-muted-foreground/30">|</span>
          <h1 className="text-foreground font-bold truncate">{project.name}</h1>
          <span className={`ml-auto inline-flex items-center text-xs px-2.5 py-1 rounded-full border ${statusColors[project.status]}`}>
            {statusLabels[project.status]}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Status Pipeline */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-foreground">Status Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {allStatuses.map((s, i) => {
                const done = i < currentIdx;
                const active = i === currentIdx;
                return (
                  <div key={s} className="flex items-center shrink-0">
                    <div className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      active ? "bg-accent/20 text-accent border border-accent/40" :
                      done ? "bg-emerald-500/15 text-emerald-400" :
                      "bg-muted/50 text-muted-foreground"
                    }`}>
                      {done && <CheckCircle2 size={12} />}
                      {active && <Clock size={12} />}
                      {statusLabels[s]}
                    </div>
                    {i < allStatuses.length - 1 && (
                      <ChevronRight size={14} className="text-muted-foreground/30 mx-0.5 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Project Info */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-foreground">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isInternal && client && (
                <div className="flex items-start gap-3 text-sm">
                  <UsersIcon size={14} className="text-accent mt-0.5 shrink-0" />
                  <div>
                    <span className="text-muted-foreground text-xs block">Client</span>
                    <span className="text-foreground">{client.name}</span>
                  </div>
                </div>
              )}
              {infoItems.filter(i => i.value).map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <item.icon size={14} className="text-accent mt-0.5 shrink-0" />
                  <div>
                    <span className="text-muted-foreground text-xs block">{item.label}</span>
                    <span className="text-foreground">{item.value}</span>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3 text-sm pt-2 border-t border-border">
                <Clock size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground text-xs block">Revisions</span>
                  <span className="text-foreground font-semibold">{project.revision_count}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revision History */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-foreground">Revision History</CardTitle>
            </CardHeader>
            <CardContent>
              {revisions.length === 0 ? (
                <p className="text-muted-foreground text-sm">No revisions yet.</p>
              ) : (
                <div className="space-y-4">
                  {revisions.map((r) => (
                    <div key={r.id} className="relative pl-6 border-l-2 border-accent/30 pb-4 last:pb-0">
                      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-accent" />
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-foreground text-sm font-medium">Revision {r.revision_number}</span>
                        <span className="text-muted-foreground text-xs">
                          {new Date(r.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {r.feedback && (
                        <p className="text-muted-foreground text-sm">{r.feedback}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Timeline */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-foreground">Status Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {statusLogs.length === 0 ? (
              <p className="text-muted-foreground text-sm">No status changes recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {statusLogs.map((log) => (
                  <div key={log.id} className="relative pl-6 border-l-2 border-border pb-3 last:pb-0">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-muted-foreground/50" />
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      {log.old_status && (
                        <>
                          <span className={`inline-flex text-xs px-2 py-0.5 rounded-full border ${statusColors[log.old_status]}`}>
                            {statusLabels[log.old_status]}
                          </span>
                          <ChevronRight size={12} className="text-muted-foreground" />
                        </>
                      )}
                      <span className={`inline-flex text-xs px-2 py-0.5 rounded-full border ${statusColors[log.new_status]}`}>
                        {statusLabels[log.new_status]}
                      </span>
                      <span className="text-muted-foreground text-xs ml-auto">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    {log.notes && <p className="text-muted-foreground text-xs mt-1">{log.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ProjectDetail;
