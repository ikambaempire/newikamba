import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { PROJECTS, type PortfolioProject } from "@/data/projects";
import { supabase } from "@/integrations/supabase/client";
import MediaPlayer from "@/components/MediaPlayer";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Card = {
  id?: string;
  slug: string;
  title: string;
  client: string;
  category: string;
  year: string;
  cover: string;
  video?: string;
  excerpt: string;
  href: string;
  orientation?: string;
  editable?: boolean;
};

const fromProject = (p: PortfolioProject): Card => ({
  slug: p.slug, title: p.title, client: p.client, category: p.category, year: p.year,
  cover: p.cover, video: p.video, excerpt: p.excerpt, href: `/work/${p.slug}`,
  orientation: "landscape",
});

const OurWork = () => {
  const [active, setActive] = useState("All");
  const [dbWorks, setDbWorks] = useState<Card[]>([]);
  const { isInternal } = useAuth();

  const load = useCallback(async () => {
    const { data } = await (supabase as any)
      .from("works")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (data) {
      setDbWorks(
        (data as any[]).map((w) => ({
          id: w.id,
          slug: w.slug,
          title: w.title,
          client: w.client_name || "iKAMBA",
          category: w.category || "Story",
          year: w.year || "",
          cover: w.cover_url || "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=80",
          video: w.video_url || undefined,
          excerpt: w.summary || "",
          href: `/our-work/${w.slug}`,
          orientation: w.orientation || "landscape",
          editable: true,
        }))
      );
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (id: string, title: string) => {
    if (!window.confirm(`Remove "${title}" from Our Work? This cannot be undone.`)) return;
    const { error } = await (supabase as any).from("works").delete().eq("id", id);
    if (error) { toast.error("Could not remove this item."); return; }
    toast.success("Removed from Our Work.");
    setDbWorks((prev) => prev.filter((w) => w.id !== id));
  };

  const all: Card[] = useMemo(() => [...dbWorks, ...PROJECTS.map(fromProject)], [dbWorks]);
  const categories = ["All", ...Array.from(new Set(all.map((c) => c.category)))];
  const visible = active === "All" ? all : all.filter((c) => c.category === active);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Editorial header */}
      <section className="section-padding pt-32 pb-12 md:pt-40 gradient-navy text-white">
        <div className="max-w-7xl mx-auto">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-xs uppercase tracking-[0.25em] font-semibold text-accent mb-6">
            Our Work · Portfolio Journal
          </motion.p>
          <div className="grid md:grid-cols-12 gap-6 items-end">
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="md:col-span-8 text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.02] text-balance">
              Stories we've helped <span className="text-accent">tell.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="md:col-span-4 text-base text-white/70 leading-relaxed">
              Read how we approached each campaign — the brief, the craft, and the outcome. New entries are added as we wrap projects.
            </motion.p>
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button key={c} onClick={() => setActive(c)}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest font-semibold border transition-all ${active === c
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-transparent text-white/80 border-white/20 hover:border-accent hover:text-accent"
                  }`}>
                {c}
              </button>
            ))}
          </div>

          {isInternal && (
            <div className="mt-8">
              <Link to="/admin?tab=works"
                className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-xs uppercase tracking-widest font-bold hover:opacity-90 transition">
                <Pencil size={14} /> Manage Our Work
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Uniform card grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {visible.map((p, i) => (
              <motion.article key={p.href}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: (i % 4) * 0.05 }}
                className="relative">
                <Link to={p.href} className="group block">
                  <div className="relative overflow-hidden rounded-2xl aspect-[4/5] bg-black">
                    <MediaPlayer
                      url={p.video}
                      poster={p.cover}
                      title={p.title}
                      className={`absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-105 ${
                        p.orientation === "portrait" ? "object-cover" : "object-cover"
                      }`}
                    />
                    <div className="absolute top-3 left-3 bg-background/90 backdrop-blur px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold pointer-events-none">
                      {p.category}
                    </div>
                  </div>
                  <div className="pt-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-accent font-semibold mb-1.5">
                      {p.client}{p.year ? ` · ${p.year}` : ""}
                    </p>
                    <h2 className="text-lg md:text-xl font-extrabold leading-snug mb-2 line-clamp-2 group-hover:text-accent transition-colors">{p.title}</h2>
                    <p className="text-sm text-foreground/70 leading-relaxed line-clamp-3">{p.excerpt}</p>
                  </div>
                </Link>

                {isInternal && p.editable && p.id && (
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Link to="/admin?tab=works"
                      className="rounded-full bg-background/90 backdrop-blur p-2 hover:bg-accent hover:text-accent-foreground transition"
                      aria-label={`Edit ${p.title}`}>
                      <Pencil size={14} />
                    </Link>
                    <button onClick={() => remove(p.id!, p.title)}
                      className="rounded-full bg-background/90 backdrop-blur p-2 text-destructive hover:bg-destructive hover:text-destructive-foreground transition"
                      aria-label={`Delete ${p.title}`}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </motion.article>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 mt-24 border-t border-border pt-12 grid md:grid-cols-2 gap-8 items-end">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Have a story worth telling well?
          </h2>
          <div className="md:text-right">
            <Link to="/start-a-project"
              className="inline-flex items-center gap-2 text-base font-semibold border-b-2 border-accent pb-1 hover:gap-3 transition-all">
              Start a project <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OurWork;
