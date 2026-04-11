import { motion } from "framer-motion";
import { Folder, FileVideo, FileImage, FileText, ChevronRight } from "lucide-react";

const AssetLibraryMockup = () => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.7, delay: 0.2 }}
    className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
  >
    <div className="px-5 py-3 border-b border-border flex items-center gap-2">
      <div className="flex gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-accent/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-success/60" />
      </div>
      <span className="text-[11px] text-muted-foreground ml-2 font-medium">Asset Library — MTN Rwanda</span>
    </div>

    <div className="p-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-4">
        <span className="text-foreground font-medium">MTN</span>
        <ChevronRight size={10} />
        <span className="text-foreground font-medium">2026</span>
        <ChevronRight size={10} />
        <span className="text-foreground font-medium">Q1 Campaign</span>
        <ChevronRight size={10} />
        <span className="text-accent font-medium">Annual Report</span>
      </div>

      {/* Folder grid */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { name: "Raw", count: 24 },
          { name: "Draft", count: 8 },
          { name: "Final", count: 3 },
          { name: "Social Versions", count: 12 },
        ].map((f, i) => (
          <div key={i} className="bg-background border border-border rounded-lg p-3 hover:border-accent/50 transition-colors cursor-pointer">
            <Folder className="text-accent mb-2" size={18} />
            <p className="text-xs font-medium text-foreground">{f.name}</p>
            <p className="text-[10px] text-muted-foreground">{f.count} files</p>
          </div>
        ))}
      </div>

      {/* File list */}
      <div className="border border-border rounded-lg divide-y divide-border">
        {[
          { icon: FileVideo, name: "MTN_AnnualReport_Final_v3.mp4", size: "245 MB", date: "Mar 5, 2026" },
          { icon: FileImage, name: "MTN_Thumbnail_1920x1080.png", size: "2.1 MB", date: "Mar 4, 2026" },
          { icon: FileText, name: "MTN_Script_Final.pdf", size: "420 KB", date: "Feb 28, 2026" },
        ].map((f, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 text-xs">
            <f.icon size={14} className="text-muted-foreground shrink-0" />
            <span className="text-foreground font-medium flex-1 truncate">{f.name}</span>
            <span className="text-muted-foreground">{f.size}</span>
            <span className="text-muted-foreground">{f.date}</span>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

export default AssetLibraryMockup;
