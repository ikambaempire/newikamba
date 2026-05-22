import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { PROJECTS } from "@/data/projects";

const categories = ["All", ...Array.from(new Set(PROJECTS.map(p => p.category)))];

const spanClass = (s?: string) => {
  if (s === "wide") return "md:col-span-2 md:row-span-1";
  if (s === "tall") return "md:row-span-2";
  return "";
};
const heightClass = (s?: string) => (s === "tall" ? "aspect-[3/4] md:aspect-auto md:h-full md:min-h-[640px]" : s === "wide" ? "aspect-[16/9]" : "aspect-[4/3]");

const Work = () => {
  const [active, setActive] = useState("All");
  const projects = useMemo(() => active === "All" ? PROJECTS : PROJECTS.filter(p => p.category === active), [active]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Editorial header */}
      <section className="section-padding pt-32 pb-12 md:pt-40 md:pb-16">
        <div className="max-w-7xl mx-auto">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-xs uppercase tracking-[0.25em] font-semibold text-accent mb-6">
            Selected Work · 2024 – 2025
          </motion.p>
          <div className="grid md:grid-cols-12 gap-6 items-end">
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="md:col-span-8 text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.02] text-balance">
              Stories that communicate <span className="text-accent">real impact.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="md:col-span-4 text-base text-muted-foreground leading-relaxed">
              Documentaries, campaigns and photography produced under iKAMBA's structured production system —
              every story archived, governed and on time.
            </motion.p>
          </div>

          {/* Category filters */}
          <div className="mt-10 flex flex-wrap gap-2">
            {categories.map(c => (
              <button key={c} onClick={() => setActive(c)}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest font-semibold border transition-all ${active === c
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-foreground border-border hover:border-accent hover:text-accent"
                  }`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Bento grid */}
      <section className="px-4 md:px-8 pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 auto-rows-[280px] md:auto-rows-[340px] gap-4 md:gap-6">
          {projects.map((p, i) => (
            <motion.div key={p.slug}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }} transition={{ delay: (i % 6) * 0.06, duration: 0.5 }}
              className={`group relative overflow-hidden rounded-2xl bg-card border border-border ${spanClass(p.span)}`}>
              <Link to={`/work/${p.slug}`} className="block h-full w-full">
                <div className={`relative ${heightClass(p.span)} w-full overflow-hidden`}>
                  <img src={p.cover} alt={p.title} loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  {/* Top meta */}
                  <div className="absolute top-4 left-4 right-4 flex items-start justify-between text-[10px] uppercase tracking-[0.2em] text-white/85 font-semibold">
                    <span className="bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">{p.category}</span>
                    <span className="opacity-80">{p.year}</span>
                  </div>
                  {/* Bottom title block */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 text-white">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-accent font-semibold mb-2">{p.client}</p>
                    <h3 className="text-xl md:text-2xl font-bold leading-tight max-w-[90%]">{p.title}</h3>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5 text-[10px] uppercase tracking-widest text-white/70">
                        {p.services.slice(0, 3).map(s => <span key={s} className="border border-white/20 rounded-full px-2 py-0.5">{s}</span>)}
                      </div>
                      <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-accent text-accent-foreground translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <ArrowUpRight size={16} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="max-w-7xl mx-auto mt-20 border-t border-border pt-12 grid md:grid-cols-2 gap-8 items-end">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Have a story worth governing well?
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

export default Work;
