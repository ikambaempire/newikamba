import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MediaPlayer from "@/components/MediaPlayer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

    if (!data) return;
    setDbWorks((data as any[]).map((work) => ({
      id: work.id,
      slug: work.slug,
      title: work.title,
      client: work.client_name || "iKAMBA",
      category: work.category || "Story",
      year: work.year || "",
      cover: work.cover_url || "",
      video: work.video_url || undefined,
      excerpt: work.summary || "",
      href: `/our-work/${work.slug}`,
      orientation: work.orientation || "landscape",
      editable: true,
    })));
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (id: string, title: string) => {
    if (!window.confirm(`Remove “${title}” from Our Work? This cannot be undone.`)) return;
    const { error } = await (supabase as any).from("works").delete().eq("id", id);
    if (error) {
      toast.error("Could not remove this item.");
      return;
    }
    setDbWorks((previous) => previous.filter((work) => work.id !== id));
    toast.success("Removed from Our Work.");
  };

  // Only dashboard-managed video entries appear here. Portrait work leads the
  // collection, followed by landscape work; saved sort order applies within each group.
  const all = useMemo(() => {
    const videos = dbWorks.filter((card) => Boolean(card.video));
    return [...videos].sort((a, b) => {
      const aPortrait = a.orientation === "portrait" ? 0 : 1;
      const bPortrait = b.orientation === "portrait" ? 0 : 1;
      return aPortrait - bPortrait;
    });
  }, [dbWorks]);
  const categories = useMemo(() => ["All", ...Array.from(new Set(all.map((card) => card.category)))], [all]);
  const visible = active === "All" ? all : all.filter((card) => card.category === active);

  return (
    <div className="portfolio-page min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-8 md:pb-32 md:pt-40 lg:px-12">
        <header className="mb-16 border-b border-border pb-10 md:mb-24 md:flex md:items-end md:justify-between md:gap-12 md:pb-14">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">Portfolio · East Africa</p>
            <h1 className="portfolio-display text-7xl font-normal uppercase leading-[0.82] sm:text-8xl md:text-[8.5rem]">
              Our Work
            </h1>
            <p className="mt-7 max-w-lg text-base font-light leading-relaxed text-muted-foreground md:text-lg">
              Documentary, campaign and photographic stories shaped with purpose—from the first frame to the final archive.
            </p>
          </motion.div>

          <div className="mt-10 flex max-w-xl flex-wrap gap-x-6 gap-y-3 md:mt-0 md:justify-end">
            {categories.map((category) => (
              <Button
                key={category}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActive(category)}
                className={`h-auto rounded-none px-0 py-1 text-[10px] uppercase tracking-[0.2em] hover:bg-transparent ${active === category ? "text-accent" : "text-muted-foreground hover:text-foreground"}`}
              >
                {category}
              </Button>
            ))}
          </div>
        </header>

        {visible.length ? (
          <section key={active} className="grid grid-cols-1 items-start gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {visible.map((project, index) => (
              <motion.article
                key={project.href}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.65 }}
                className="group relative min-w-0"
              >
                <Link to={project.href} className="block">
                   <div className={`relative overflow-hidden bg-card ${project.orientation === "portrait" ? "aspect-[9/16]" : "aspect-video"}`}>
                    <MediaPlayer
                      url={project.video}
                      poster={project.cover}
                      title={project.title}
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
                    />
                    <div className="absolute inset-0 bg-background/10 transition-colors duration-700 group-hover:bg-transparent" />
                    <span className="absolute right-3 top-3 text-[10px] tracking-[0.25em] text-foreground/70">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-accent">
                      {project.category}{project.year ? ` · ${project.year}` : ""}
                    </p>
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <h2 className="portfolio-display text-2xl font-normal uppercase leading-none md:text-3xl">{project.title}</h2>
                        <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">{project.client}</p>
                        {project.excerpt && (
                          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{project.excerpt}</p>
                        )}
                      </div>
                      <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent" />
                    </div>
                  </div>
                </Link>
                {isInternal && project.editable && project.id && (
                  <div className="absolute right-3 top-3 z-10 flex gap-2">
                    <Button asChild size="icon" variant="secondary" aria-label={`Edit ${project.title}`}>
                      <Link to={`/admin?tab=works&edit=${project.id}`}><Pencil /></Link>
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => remove(project.id as string, project.title)} aria-label={`Delete ${project.title}`}>
                      <Trash2 />
                    </Button>
                  </div>
                )}
              </motion.article>
            ))}
          </section>
        ) : (
          <div className="py-24 text-center text-muted-foreground">No projects in this category yet.</div>
        )}

        <section className="mt-36 border-t border-border pt-20 text-center md:mt-52 md:pt-28">
          <p className="mb-7 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Have a story worth telling?</p>
          <Link to="/start-a-project" className="group inline-flex items-center gap-4">
            <span className="portfolio-display text-5xl font-normal uppercase leading-none transition-colors group-hover:text-accent md:text-7xl">Start a project</span>
            <ArrowUpRight className="h-8 w-8 text-accent transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default OurWork;