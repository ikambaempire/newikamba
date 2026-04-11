import { motion } from "framer-motion";
import { Layers, BarChart3, Clock, CheckCircle2, FolderOpen } from "lucide-react";

const metrics = [
  { icon: Layers, label: "Total Projects", value: "12" },
  { icon: BarChart3, label: "Active", value: "5" },
  { icon: Clock, label: "In Review", value: "3" },
  { icon: CheckCircle2, label: "Completed", value: "4" },
  { icon: FolderOpen, label: "Assets Delivered", value: "87" },
];

const DashboardMockup = () => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.7 }}
    className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
  >
    {/* Title bar */}
    <div className="px-5 py-3 border-b border-border flex items-center gap-2">
      <div className="flex gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-accent/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-success/60" />
      </div>
      <span className="text-[11px] text-muted-foreground ml-2 font-medium">Client Dashboard — MTN Rwanda</span>
    </div>

    <div className="p-5">
      {/* Metrics row */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {metrics.map((m, i) => (
          <div key={i} className="bg-background border border-border rounded-lg p-3 text-center">
            <m.icon className="text-accent mx-auto mb-1" size={16} />
            <p className="text-lg font-bold text-foreground">{m.value}</p>
            <p className="text-[10px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Welcome */}
      <p className="text-sm font-semibold text-foreground mb-3">Welcome, Sarah Uwase</p>

      {/* Mini table */}
      <div className="border border-border rounded-lg overflow-hidden text-xs">
        <div className="grid grid-cols-5 gap-0 bg-muted px-3 py-2 font-semibold text-muted-foreground">
          <span>Project</span><span>Type</span><span>Status</span><span>Deadline</span><span>Revisions</span>
        </div>
        {[
          { name: "Annual Report 2026", type: "Video", status: "Production", deadline: "Mar 28", rev: "1" },
          { name: "Brand Launch Film", type: "Film", status: "Client Review", deadline: "Apr 5", rev: "2" },
          { name: "Social Campaign Q1", type: "Social", status: "Editing", deadline: "Mar 15", rev: "0" },
        ].map((p, i) => (
          <div key={i} className="grid grid-cols-5 gap-0 px-3 py-2 border-t border-border text-foreground">
            <span className="font-medium">{p.name}</span>
            <span className="text-muted-foreground">{p.type}</span>
            <span>
              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                p.status === "Production" ? "bg-accent/15 text-accent" :
                p.status === "Client Review" ? "bg-primary/10 text-primary" :
                "bg-muted text-muted-foreground"
              }`}>{p.status}</span>
            </span>
            <span className="text-muted-foreground">{p.deadline}</span>
            <span className="text-muted-foreground">{p.rev}</span>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

export default DashboardMockup;
