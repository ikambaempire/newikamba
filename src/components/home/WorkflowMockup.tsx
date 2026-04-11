import { motion } from "framer-motion";

const stages = [
  { label: "Brief Received", count: 2, color: "bg-primary" },
  { label: "Strategy", count: 1, color: "bg-primary/70" },
  { label: "Production", count: 3, color: "bg-accent" },
  { label: "Editing", count: 2, color: "bg-accent/70" },
  { label: "Client Review", count: 1, color: "bg-success/70" },
  { label: "Final Delivery", count: 1, color: "bg-success" },
  { label: "Archive", count: 4, color: "bg-muted-foreground/40" },
];

const WorkflowMockup = () => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.7, delay: 0.1 }}
    className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
  >
    <div className="px-5 py-3 border-b border-border flex items-center gap-2">
      <div className="flex gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-accent/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-success/60" />
      </div>
      <span className="text-[11px] text-muted-foreground ml-2 font-medium">Workflow Pipeline</span>
    </div>

    <div className="p-5">
      {/* Kanban columns */}
      <div className="grid grid-cols-7 gap-2">
        {stages.map((s, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">{s.label}</span>
              <span className="text-[10px] text-muted-foreground bg-muted rounded-full w-4 h-4 flex items-center justify-center">{s.count}</span>
            </div>
            <div className={`h-1 rounded-full ${s.color}`} />
            {/* Mock cards */}
            {Array.from({ length: Math.min(s.count, 2) }).map((_, j) => (
              <div key={j} className="bg-background border border-border rounded-md p-2">
                <div className="h-2 w-3/4 bg-muted rounded mb-1.5" />
                <div className="h-1.5 w-1/2 bg-muted/60 rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

export default WorkflowMockup;
