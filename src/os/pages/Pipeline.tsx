import { useState } from "react";
import { Link } from "react-router-dom";
import { useOSStore } from "@/os/store";
import { PageHeader, Badge, PaymentBadge, OSButton } from "@/os/components/ui";
import { PIPELINE_STAGES, fmtRWF, type PipelineStage } from "@/os/mock/data";
import { Plus, GripVertical } from "lucide-react";

const Pipeline = () => {
  const { projects, updateProjectStage } = useOSStore();
  const [dragId, setDragId] = useState<string | null>(null);

  const byStage = (stage: PipelineStage) => projects.filter((p) => p.stage === stage);

  return (
    <div>
      <PageHeader
        title="Projects Pipeline"
        subtitle="Drag a project card across stages to move it forward."
        actions={
          <Link to="/os/projects/new"><OSButton><Plus size={16} /> Create Project</OSButton></Link>
        }
      />
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {PIPELINE_STAGES.map((stage) => {
          const items = byStage(stage);
          const total = items.reduce((s, p) => s + p.value, 0);
          return (
            <div
              key={stage}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (dragId) updateProjectStage(dragId, stage); setDragId(null); }}
              className="shrink-0 w-72 os-card rounded-xl p-3 flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-bold text-white">{stage}</div>
                  <div className="text-[10px] text-os-muted uppercase tracking-wider">{items.length} · {fmtRWF(total)}</div>
                </div>
              </div>
              <div className="space-y-2 min-h-[40px]">
                {items.map((p) => (
                  <div
                    key={p.id}
                    draggable
                    onDragStart={() => setDragId(p.id)}
                    className="os-card-2 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-[hsl(var(--os-gold))]/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/os/projects/${p.id}`} className="text-sm font-semibold text-white leading-tight hover:text-os-gold">
                        {p.name}
                      </Link>
                      <GripVertical size={14} className="text-os-muted shrink-0" />
                    </div>
                    <div className="text-xs text-os-muted mt-0.5">{p.client}</div>
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      <Badge>{p.product_line}</Badge>
                      <Badge tone="blue">{p.service}</Badge>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <div className="text-white font-semibold">{fmtRWF(p.value)}</div>
                      <PaymentBadge status={p.payment_status} />
                    </div>
                    <div className="text-[10px] text-os-muted mt-2 truncate">
                      {p.owner} · {p.deadline || "no deadline"}
                    </div>
                    {p.next_action && <div className="text-[10px] text-os-gold mt-1.5">→ {p.next_action}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pipeline;
