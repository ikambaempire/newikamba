import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

const projects = [
  { name: "MTN Annual Report", status: "Production", deadline: "Mar 28, 2026", rev: 1, producer: "Jean Bosco", risk: "green" },
  { name: "UNICEF Campaign Film", status: "Client Review", deadline: "Mar 10, 2026", rev: 3, producer: "Alice M.", risk: "red" },
  { name: "MINEDUC Explainer", status: "Editing", deadline: "Mar 14, 2026", rev: 2, producer: "David K.", risk: "orange" },
  { name: "Brand Identity Launch", status: "Strategy", deadline: "Apr 12, 2026", rev: 0, producer: "Jean Bosco", risk: "green" },
  { name: "Social Media Q2", status: "Brief Received", deadline: "Apr 20, 2026", rev: 0, producer: "—", risk: "green" },
];

const riskIcons = {
  green: <CheckCircle2 size={12} className="text-success" />,
  orange: <Clock size={12} className="text-accent" />,
  red: <AlertTriangle size={12} className="text-destructive" />,
};

const ProjectTrackerMockup = () => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.7, delay: 0.15 }}
    className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
  >
    <div className="px-5 py-3 border-b border-border flex items-center gap-2">
      <div className="flex gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-accent/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-success/60" />
      </div>
      <span className="text-[11px] text-muted-foreground ml-2 font-medium">Project Tracker — Admin View</span>
    </div>

    <div className="p-5 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-muted-foreground border-b border-border">
            <th className="text-left py-2 font-semibold">Project</th>
            <th className="text-left py-2 font-semibold">Status</th>
            <th className="text-left py-2 font-semibold">Deadline</th>
            <th className="text-left py-2 font-semibold">Rev</th>
            <th className="text-left py-2 font-semibold">Producer</th>
            <th className="text-left py-2 font-semibold">Risk</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p, i) => (
            <tr key={i} className="border-b border-border/50 text-foreground">
              <td className="py-2 font-medium">{p.name}</td>
              <td className="py-2">
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  p.status === "Production" ? "bg-accent/15 text-accent" :
                  p.status === "Client Review" ? "bg-primary/10 text-primary" :
                  p.status === "Editing" ? "bg-muted text-foreground" :
                  "bg-secondary text-secondary-foreground"
                }`}>{p.status}</span>
              </td>
              <td className={`py-2 ${p.risk === "red" ? "text-destructive font-semibold" : p.risk === "orange" ? "text-accent" : "text-muted-foreground"}`}>
                {p.deadline}
              </td>
              <td className={`py-2 ${p.rev > 2 ? "text-accent font-semibold" : "text-muted-foreground"}`}>{p.rev}</td>
              <td className="py-2 text-muted-foreground">{p.producer}</td>
              <td className="py-2">{riskIcons[p.risk as keyof typeof riskIcons]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </motion.div>
);

export default ProjectTrackerMockup;
