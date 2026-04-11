import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, AlertTriangle, GripVertical } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];
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

const columnColors: Record<ProjectStatus, string> = {
  brief_received: "border-t-primary",
  strategy_alignment: "border-t-primary/70",
  production: "border-t-accent",
  editing: "border-t-accent/70",
  client_review: "border-t-[hsl(var(--warning))]",
  final_delivery: "border-t-[hsl(var(--success))]",
  archive: "border-t-muted-foreground/40",
};

const priorityDots: Record<PriorityLevel, string> = {
  low: "bg-muted-foreground/40",
  medium: "bg-primary",
  high: "bg-accent",
  urgent: "bg-destructive",
};

const allStatuses: ProjectStatus[] = [
  "brief_received", "strategy_alignment", "production", "editing", "client_review", "final_delivery", "archive",
];

interface KanbanBoardProps {
  projects: Project[];
  clients: { id: string; name: string }[];
  onStatusChange: (projectId: string, newStatus: ProjectStatus) => Promise<void>;
}

const KanbanBoard = ({ projects, clients, onStatusChange }: KanbanBoardProps) => {
  const navigate = useNavigate();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<ProjectStatus | null>(null);

  const getClientName = (clientId: string) => clients.find((c) => c.id === clientId)?.name || "—";

  const getDeadlineRisk = (deadline: string | null, status: ProjectStatus) => {
    if (!deadline || ["final_delivery", "archive"].includes(status)) return "green";
    const daysLeft = Math.floor((new Date(deadline).getTime() - Date.now()) / 86400000);
    if (daysLeft < 0) return "red";
    if (daysLeft <= 3) return "orange";
    return "green";
  };

  const getDaysInStage = (stageEnteredAt: string) =>
    Math.floor((Date.now() - new Date(stageEnteredAt).getTime()) / 86400000);

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    setDraggedId(projectId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", projectId);
  };

  const handleDragOver = (e: React.DragEvent, status: ProjectStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(status);
  };

  const handleDragLeave = () => setDropTarget(null);

  const handleDrop = async (e: React.DragEvent, newStatus: ProjectStatus) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData("text/plain");
    const project = projects.find((p) => p.id === projectId);
    if (project && project.status !== newStatus) {
      await onStatusChange(projectId, newStatus);
    }
    setDraggedId(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDropTarget(null);
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 min-h-[500px]">
      {allStatuses.map((status) => {
        const columnProjects = projects.filter((p) => p.status === status);
        const isOver = dropTarget === status;

        return (
          <div
            key={status}
            className={`flex-shrink-0 w-[220px] rounded-lg border border-t-[3px] transition-colors ${columnColors[status]} ${
              isOver ? "bg-accent/5 border-accent/30" : "bg-card/50 border-border"
            }`}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            {/* Column header */}
            <div className="px-3 py-2.5 border-b border-border">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                  {statusLabels[status]}
                </span>
                <span className="text-[10px] text-muted-foreground bg-muted rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {columnProjects.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="p-2 space-y-2 min-h-[100px]">
              <AnimatePresence mode="popLayout">
                {columnProjects.map((p) => {
                  const risk = getDeadlineRisk(p.deadline, p.status);
                  const days = getDaysInStage(p.stage_entered_at);
                  const isDragging = draggedId === p.id;

                  return (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      draggable
                      onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, p.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => navigate(`/project/${p.id}`)}
                      className={`bg-background border border-border rounded-md p-2.5 cursor-grab active:cursor-grabbing hover:border-primary/30 hover:shadow-sm transition-all group ${
                        isDragging ? "opacity-50" : ""
                      }`}
                    >
                      {/* Drag handle + client */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <GripVertical size={12} className="text-muted-foreground/30 group-hover:text-muted-foreground/60 flex-shrink-0" />
                        <span className="text-[10px] text-muted-foreground truncate">
                          {getClientName(p.client_id)}
                        </span>
                      </div>

                      {/* Project name */}
                      <p className="text-xs font-semibold text-foreground leading-tight mb-2 line-clamp-2">
                        {p.name}
                      </p>

                      {/* Footer indicators */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {/* Priority dot */}
                          <span className={`w-2 h-2 rounded-full ${priorityDots[p.priority]}`} title={p.priority} />
                          {/* Days in stage */}
                          {days > 5 && (
                            <span className="flex items-center gap-0.5 text-[10px] text-accent">
                              <Clock size={10} />
                              {days}d
                            </span>
                          )}
                        </div>

                        {/* Deadline risk */}
                        {risk !== "green" && (
                          <AlertTriangle
                            size={12}
                            className={risk === "red" ? "text-destructive" : "text-accent"}
                          />
                        )}
                      </div>

                      {/* Type tag */}
                      {p.project_type && (
                        <span className="mt-1.5 inline-block text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {p.project_type}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Empty state */}
              {columnProjects.length === 0 && (
                <div className="flex items-center justify-center h-20 text-[11px] text-muted-foreground/50 border border-dashed border-border rounded-md">
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
