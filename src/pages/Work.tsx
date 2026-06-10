import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { PROJECTS, type PortfolioProject } from "@/data/projects";
import { supabase } from "@/integrations/supabase/client";

type Card = {
  slug: string;
  title: string;
  client: string;
  category: string;
  year: string;
  cover: string;
  video?: string;
  excerpt: string;
  href: string;
};

const fromProject = (p: PortfolioProject): Card => ({
  slug: p.slug, title: p.title, client: p.client, category: p.category, year: p.year,
  cover: p.cover, video: p.video, excerpt: p.excerpt, href: `/work/${p.slug}`,
});

const OurWork = () => {
  const [active, setActive] = useState("All");
  const [dbWorks, setDbWorks] = useState<Card[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("works")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (data) {
        setDbWorks(
          (data as any[]).map((w) => ({
            slug: w.slug,
            title: w.title,
            client: w.client_name || "iKAMBA",
            category: w.category || "Story",
            year: w.year || "",
            cover: w.cover_url || "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=80",
            video: w.video_url || undefined,
            excerpt: w.summary || "",
            href: `/our-work/${w.slug}`,
          }))
        );
      }
    })();
  }, []);

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
        </div>
      </section>

      {/* Uniform card grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {visible.map((p, i) => (
              <motion.article key={p.href}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: (i % 4) * 0.05 }}>
                <Link to={p.href} className="group block">
                  <div className="relative overflow-hidden rounded-2xl aspect-[4/5] bg-muted">
                    <MediaPlayer
                      url={p.video}
                      poster={p.cover}
                      title={p.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
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
