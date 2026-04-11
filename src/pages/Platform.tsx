import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  LayoutDashboard, GitBranch, FolderKanban, Archive,
  CheckCircle2, Clock, BarChart3, Layers, Users, Shield,
  FileVideo, FileImage, FileText, ChevronRight, Folder,
  ArrowRight, Zap, Eye, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

/* ── Inline interactive mockups ─────────────────────────────── */

const ClientDashboardDemo = () => {
  const [activeProject, setActiveProject] = useState(0);
  const projects = [
    { name: "Annual Report 2026", type: "Video", status: "Production", deadline: "Mar 28", progress: 65 },
    { name: "Brand Launch Film", type: "Film", status: "Client Review", deadline: "Apr 5", progress: 85 },
    { name: "Social Campaign Q1", type: "Social", status: "Editing", deadline: "Mar 15", progress: 45 },
  ];
  const metrics = [
    { label: "Active Projects", value: "5", icon: Layers },
    { label: "In Review", value: "3", icon: Clock },
    { label: "Completed", value: "12", icon: CheckCircle2 },
    { label: "Assets Delivered", value: "87", icon: BarChart3 },
  ];

  return (
    <div className="rounded-xl border border-border bg-card shadow-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-accent/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-success/60" />
          </div>
          <span className="text-[11px] text-muted-foreground ml-2 font-medium">Client Dashboard</span>
        </div>
        <span className="text-[10px] bg-accent/15 text-accent-foreground px-2 py-0.5 rounded-full font-medium">Live Preview</span>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-4 gap-3 mb-5">
          {metrics.map((m, i) => (
            <div key={i} className="bg-background border border-border rounded-lg p-3 text-center">
              <m.icon className="text-accent mx-auto mb-1" size={16} />
              <p className="text-lg font-bold text-foreground">{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
        <p className="text-sm font-semibold text-foreground mb-3">Your Projects</p>
        <div className="border border-border rounded-lg overflow-hidden text-xs">
          {projects.map((p, i) => (
            <div
              key={i}
              onClick={() => setActiveProject(i)}
              className={`grid grid-cols-5 gap-0 px-3 py-2.5 border-t border-border cursor-pointer transition-colors ${activeProject === i ? "bg-primary/5" : "hover:bg-muted/50"}`}
            >
              <span className="font-medium text-foreground">{p.name}</span>
              <span className="text-muted-foreground">{p.type}</span>
              <span>
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  p.status === "Production" ? "bg-accent/15 text-accent-foreground" :
                  p.status === "Client Review" ? "bg-primary/10 text-primary" :
                  "bg-muted text-muted-foreground"
                }`}>{p.status}</span>
              </span>
              <span className="text-muted-foreground">{p.deadline}</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                </div>
                <span className="text-muted-foreground">{p.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const WorkflowPipelineDemo = () => {
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const stages = [
    { label: "Brief", count: 2, color: "bg-primary", cards: ["MTN Annual Report", "UNICEF Documentary"] },
    { label: "Strategy", count: 1, color: "bg-primary/70", cards: ["Brand Launch Film"] },
    { label: "Production", count: 3, color: "bg-accent", cards: ["Social Q1", "Internal Comms", "Event Recap"] },
    { label: "Editing", count: 2, color: "bg-accent/70", cards: ["Product Demo", "Testimonials"] },
    { label: "Review", count: 1, color: "bg-success/70", cards: ["Year End Highlights"] },
    { label: "Delivery", count: 1, color: "bg-success", cards: ["Onboarding Video"] },
  ];

  return (
    <div className="rounded-xl border border-border bg-card shadow-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-accent/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-success/60" />
          </div>
          <span className="text-[11px] text-muted-foreground ml-2 font-medium">Workflow Pipeline</span>
        </div>
        <span className="text-[10px] bg-accent/15 text-accent-foreground px-2 py-0.5 rounded-full font-medium">Interactive</span>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-6 gap-2">
          {stages.map((s, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider truncate">{s.label}</span>
                <span className="text-[9px] text-muted-foreground bg-muted rounded-full w-4 h-4 flex items-center justify-center">{s.count}</span>
              </div>
              <div className={`h-1 rounded-full ${s.color}`} />
              {s.cards.map((card, j) => (
                <motion.div
                  key={j}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onHoverStart={() => setDraggedCard(card)}
                  onHoverEnd={() => setDraggedCard(null)}
                  className={`bg-background border rounded-md p-2 cursor-grab text-[10px] font-medium text-foreground transition-colors ${draggedCard === card ? "border-accent shadow-md" : "border-border"}`}
                >
                  {card}
                  <div className="h-1 w-2/3 bg-muted rounded mt-1" />
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProjectTrackerDemo = () => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const projects = [
    { name: "Annual Report 2026", client: "MTN Rwanda", producer: "Jean K.", editor: "Alice M.", status: "production", priority: "high", days: 5 },
    { name: "Brand Launch Film", client: "UNICEF", producer: "David R.", editor: "Sarah U.", status: "client_review", priority: "urgent", days: 2 },
    { name: "Social Campaign Q1", client: "MINEDUC", producer: "Grace N.", editor: "Paul M.", status: "editing", priority: "medium", days: 12 },
    { name: "Internal Comms Video", client: "MTN Rwanda", producer: "Jean K.", editor: "—", status: "strategy_alignment", priority: "low", days: 20 },
  ];

  const statusLabels: Record<string, string> = {
    production: "Production", client_review: "Client Review", editing: "Editing", strategy_alignment: "Strategy"
  };
  const statusColors: Record<string, string> = {
    production: "bg-accent/15 text-accent-foreground", client_review: "bg-primary/10 text-primary", editing: "bg-muted text-muted-foreground", strategy_alignment: "bg-primary/10 text-primary"
  };
  const priorityColors: Record<string, string> = {
    urgent: "text-destructive", high: "text-accent-foreground", medium: "text-muted-foreground", low: "text-muted-foreground"
  };
  const riskColor = (days: number) => days <= 3 ? "bg-destructive" : days <= 7 ? "bg-accent" : "bg-success";

  return (
    <div className="rounded-xl border border-border bg-card shadow-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-accent/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-success/60" />
          </div>
          <span className="text-[11px] text-muted-foreground ml-2 font-medium">Project Tracker — Admin View</span>
        </div>
        <span className="text-[10px] bg-accent/15 text-accent-foreground px-2 py-0.5 rounded-full font-medium">Click rows</span>
      </div>
      <div className="p-5">
        <div className="border border-border rounded-lg overflow-hidden text-xs">
          <div className="grid grid-cols-7 gap-0 bg-muted px-3 py-2 font-semibold text-muted-foreground">
            <span>Project</span><span>Client</span><span>Producer</span><span>Editor</span><span>Status</span><span>Priority</span><span>Risk</span>
          </div>
          {projects.map((p, i) => (
            <motion.div
              key={i}
              onClick={() => setSelectedRow(selectedRow === i ? null : i)}
              className={`grid grid-cols-7 gap-0 px-3 py-2.5 border-t border-border cursor-pointer transition-colors ${selectedRow === i ? "bg-primary/5" : "hover:bg-muted/50"}`}
              layout
            >
              <span className="font-medium text-foreground">{p.name}</span>
              <span className="text-muted-foreground">{p.client}</span>
              <span className="text-muted-foreground">{p.producer}</span>
              <span className="text-muted-foreground">{p.editor}</span>
              <span><span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColors[p.status]}`}>{statusLabels[p.status]}</span></span>
              <span className={`font-medium capitalize ${priorityColors[p.priority]}`}>{p.priority}</span>
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${riskColor(p.days)}`} />
                <span className="text-muted-foreground">{p.days}d</span>
              </span>
            </motion.div>
          ))}
        </div>
        <AnimatePresence>
          {selectedRow !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-4 bg-background border border-border rounded-lg text-xs"
            >
              <p className="font-semibold text-foreground mb-2">{projects[selectedRow].name} — Details</p>
              <div className="grid grid-cols-3 gap-3 text-muted-foreground">
                <div><span className="font-medium text-foreground">Client:</span> {projects[selectedRow].client}</div>
                <div><span className="font-medium text-foreground">Producer:</span> {projects[selectedRow].producer}</div>
                <div><span className="font-medium text-foreground">Deadline Risk:</span> {projects[selectedRow].days} days remaining</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const AssetLibraryDemo = () => {
  const [activeFolder, setActiveFolder] = useState<number | null>(null);
  const folders = [
    { name: "Raw Footage", count: 24, icon: Folder },
    { name: "Drafts", count: 8, icon: Folder },
    { name: "Final Cuts", count: 3, icon: Folder },
    { name: "Social Versions", count: 12, icon: Folder },
  ];
  const files = [
    { icon: FileVideo, name: "MTN_AnnualReport_Final_v3.mp4", size: "245 MB", date: "Mar 5, 2026" },
    { icon: FileImage, name: "MTN_Thumbnail_1920x1080.png", size: "2.1 MB", date: "Mar 4, 2026" },
    { icon: FileText, name: "MTN_Script_Final.pdf", size: "420 KB", date: "Feb 28, 2026" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card shadow-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-accent/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-success/60" />
          </div>
          <span className="text-[11px] text-muted-foreground ml-2 font-medium">Asset Library</span>
        </div>
        <span className="text-[10px] bg-accent/15 text-accent-foreground px-2 py-0.5 rounded-full font-medium">Click folders</span>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-4">
          <span className="text-foreground font-medium">MTN</span>
          <ChevronRight size={10} />
          <span className="text-foreground font-medium">2026</span>
          <ChevronRight size={10} />
          <span className="text-accent font-medium">Q1 Campaign</span>
        </div>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {folders.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveFolder(activeFolder === i ? null : i)}
              className={`bg-background border rounded-lg p-3 cursor-pointer transition-colors ${activeFolder === i ? "border-accent shadow-md" : "border-border hover:border-accent/50"}`}
            >
              <Folder className="text-accent mb-2" size={18} />
              <p className="text-xs font-medium text-foreground">{f.name}</p>
              <p className="text-[10px] text-muted-foreground">{f.count} files</p>
            </motion.div>
          ))}
        </div>
        <div className="border border-border rounded-lg divide-y divide-border">
          {files.map((f, i) => (
            <motion.div key={i} whileHover={{ backgroundColor: "hsl(var(--muted) / 0.5)" }} className="flex items-center gap-3 px-3 py-2.5 text-xs cursor-pointer">
              <f.icon size={14} className="text-muted-foreground shrink-0" />
              <span className="text-foreground font-medium flex-1 truncate">{f.name}</span>
              <span className="text-muted-foreground">{f.size}</span>
              <span className="text-muted-foreground">{f.date}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Feature data ───────────────────────────────────────────── */

const modules = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    title: "Client Dashboard",
    tagline: "One view. Full visibility.",
    description: "Give every client a branded portal where they can track project progress, view deliverables, submit feedback, and access their complete asset history — no email threads required.",
    features: [
      { icon: Eye, text: "Real-time project progress tracking with visual indicators" },
      { icon: BarChart3, text: "At-a-glance metrics: active projects, assets delivered, pending reviews" },
      { icon: MessageSquare, text: "Inline feedback and revision requests tied to specific deliverables" },
      { icon: Shield, text: "Role-based access — clients only see what's theirs" },
    ],
    Demo: ClientDashboardDemo,
  },
  {
    id: "workflow",
    icon: GitBranch,
    title: "Workflow Pipeline",
    tagline: "From brief to archive. Governed.",
    description: "Visualize every project across a structured Kanban pipeline — Brief → Strategy → Production → Editing → Review → Delivery → Archive. Drag, assign, and manage with full audit trails.",
    features: [
      { icon: Layers, text: "7-stage production pipeline with configurable columns" },
      { icon: Users, text: "Assign producers and editors per project per stage" },
      { icon: Clock, text: "Stage duration tracking with deadline risk indicators" },
      { icon: Zap, text: "Automatic status logging and transition history" },
    ],
    Demo: WorkflowPipelineDemo,
  },
  {
    id: "tracker",
    icon: FolderKanban,
    title: "Project Tracker",
    tagline: "Admin command center.",
    description: "A unified table view for project managers to monitor every project across all clients. Filter by status, priority, producer, or deadline risk. Click into any row for full context.",
    features: [
      { icon: BarChart3, text: "Multi-column sortable table with risk heatmap indicators" },
      { icon: Shield, text: "Priority levels: Low, Medium, High, Urgent with visual coding" },
      { icon: Users, text: "Producer and editor assignment tracking" },
      { icon: Eye, text: "Expandable row details with full project context" },
    ],
    Demo: ProjectTrackerDemo,
  },
  {
    id: "assets",
    icon: Archive,
    title: "Asset Library",
    tagline: "Structured. Searchable. Versioned.",
    description: "Every file organized by client → year → campaign → project with folder hierarchies, version control, and instant previews. No more digging through shared drives.",
    features: [
      { icon: Folder, text: "Hierarchical folder structure: Client → Year → Campaign → Project" },
      { icon: FileVideo, text: "Support for video, image, document, and design files" },
      { icon: Clock, text: "Version history with dated uploads and uploader tracking" },
      { icon: Shield, text: "Organization-scoped access with RLS-protected queries" },
    ],
    Demo: AssetLibraryDemo,
  },
];

/* ── Page ────────────────────────────────────────────────────── */

const Platform = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 px-6 lg:px-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs uppercase tracking-[0.2em] font-semibold text-accent mb-4">
            The Platform
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 text-balance">
            The Operating System for<br />Creative Production
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Four integrated modules that take your production workflow from chaotic email threads to structured, trackable, client-facing operations.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex justify-center gap-3">
            <Link to="/start-a-project">
              <Button variant="hero" size="lg">Start a Project <ArrowRight size={16} /></Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg">Request a Demo</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Tabbed module showcase */}
      <section className="px-6 lg:px-10 pb-20">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start bg-muted/50 border border-border mb-8 p-1 overflow-x-auto">
              {modules.map((m) => (
                <TabsTrigger key={m.id} value={m.id} className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2">
                  <m.icon size={16} />
                  <span className="hidden sm:inline">{m.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {modules.map((m) => (
              <TabsContent key={m.id} value={m.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Module header */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] font-semibold text-accent mb-2">{m.tagline}</p>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-4">{m.title}</h2>
                      <p className="text-muted-foreground leading-relaxed mb-6">{m.description}</p>
                      <div className="space-y-3">
                        {m.features.map((f, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="mt-0.5 w-7 h-7 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                              <f.icon size={14} className="text-accent" />
                            </div>
                            <p className="text-sm text-foreground">{f.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Stats panel */}
                    <div className="flex flex-col justify-center">
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: "Faster project delivery", value: "3×" },
                          { label: "Fewer revision cycles", value: "60%" },
                          { label: "Client satisfaction", value: "98%" },
                          { label: "Time saved per week", value: "12h" },
                        ].map((s, i) => (
                          <div key={i} className="bg-card border border-border rounded-xl p-5 text-center">
                            <p className="text-2xl md:text-3xl font-extrabold text-primary">{s.value}</p>
                            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Interactive demo */}
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-4">
                      Interactive Preview
                    </p>
                    <m.Demo />
                  </div>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-20 px-6 lg:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-extrabold text-primary-foreground mb-4">
            Ready to operationalize your production?
          </h2>
          <p className="text-primary-foreground/70 mb-8 text-lg">
            Join organizations across East Africa who manage their entire creative workflow through Ikamba OS.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/start-a-project">
              <Button variant="hero" size="lg">Get Started <ArrowRight size={16} /></Button>
            </Link>
            <Link to="/contact">
              <Button variant="hero-outline" size="lg">Talk to Us</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Platform;
