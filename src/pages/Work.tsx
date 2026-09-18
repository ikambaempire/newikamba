import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MediaPlayer from "@/components/MediaPlayer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { PROJECTS, type PortfolioProject } from "@/data/projects";
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

const fromProject = (project: PortfolioProject): Card => ({
  slug: project.slug,
  title: project.title,
  client: project.client,
  category: project.category,
  year: project.year,
  cover: project.cover,
  video: project.video,
  excerpt: project.excerpt,
  href: `/work/${project.slug}`,
  orientation: "landscape",
});

const itemLayouts = [
  "md:col-span-5",
  "md:col-span-6 md:col-start-7 md:mt-32",
  "md:col-span-4",
  "md:col-span-7 md:col-start-6 md:mt-20",
  "md:col-span-7",
  "md:col-span-4 md:col-start-9 md:mt-28",
];

const mediaLayouts = [
  "aspect-[4/5]",
  "aspect-square",
  "aspect-[3/4]",
  "aspect-video",
  "aspect-[16/10]",
  "aspect-[4/5]",
];

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

  const all = useMemo(() => [...dbWorks, ...PROJECTS.map(fromProject)], [dbWorks]);
  const categories = useMemo(() => ["All", ...Array.from(new Set(all.map((card) => card.category)))], [all]);
  const visible = active === "All" ? all : all.filter((card) => card.category === active);
  const featured = visible[0];
  const projects = visible.slice(1);

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

        {featured ? (
          <section key={active} className="grid grid-cols-1 gap-x-8 gap-y-20 md:grid-cols-12 md:gap-y-28">
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="group relative md:col-span-12"
            >
              <Link to={featured.href} className="block">
                <div className="relative aspect-[4/3] overflow-hidden bg-card sm:aspect-[16/8]">
                  <MediaPlayer
                    url={featured.video}
                    poster={featured.cover}
                    title={featured.title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-1000 ease-out group-hover:scale-[1.025]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/55 via-transparent to-transparent" />
                  <span className="absolute left-4 top-4 border border-foreground/20 bg-background/70 px-3 py-2 text-[9px] uppercase tracking-[0.25em] backdrop-blur-md md:left-6 md:top-6">
                    Featured story
                  </span>
                </div>
                <div className="mt-7 gap-8 md:flex md:items-start md:justify-between">
                  <div>
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
                      {featured.category} · {featured.client}{featured.year ? ` · ${featured.year}` : ""}
                    </p>
                    <h2 className="portfolio-display max-w-3xl text-4xl font-normal uppercase leading-none md:text-6xl">{featured.title}</h2>
                  </div>
                  <p className="mt-5 max-w-sm text-sm font-light leading-relaxed text-muted-foreground md:mt-1">{featured.excerpt}</p>
                </div>
              </Link>
              {isInternal && featured.editable && featured.id && (
                <div className="absolute right-4 top-4 z-10 flex gap-2 md:right-6 md:top-6">
                  <Button asChild size="icon" variant="secondary" aria-label={`Edit ${featured.title}`}>
                    <Link to="/admin?tab=works"><Pencil /></Link>
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => remove(featured.id as string, featured.title)} aria-label={`Delete ${featured.title}`}>
                    <Trash2 />
                  </Button>
                </div>
              )}
            </motion.article>

            {projects.map((project, index) => (
              <motion.article
                key={project.href}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.65 }}
                className={`group relative ${itemLayouts[index % itemLayouts.length]}`}
              >
                <Link to={project.href} className="block">
                  <div className={`relative overflow-hidden bg-card ${mediaLayouts[index % mediaLayouts.length]}`}>
                    <MediaPlayer
                      url={project.video}
                      poster={project.cover}
                      title={project.title}
                      className={`absolute inset-0 h-full w-full transition duration-1000 ease-out group-hover:scale-[1.035] ${project.orientation === "portrait" ? "object-contain bg-card" : "object-cover"}`}
                    />
                    <div className="absolute inset-0 bg-background/10 transition-colors duration-700 group-hover:bg-transparent" />
                    <span className="absolute right-4 top-4 text-[10px] tracking-[0.25em] text-foreground/70">{String(index + 2).padStart(2, "0")}</span>
                  </div>
                  <div className="mt-5 border-t border-border pt-5">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-accent">
                      {project.category}{project.year ? ` · ${project.year}` : ""}
                    </p>
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <h2 className="portfolio-display text-3xl font-normal uppercase leading-none md:text-4xl">{project.title}</h2>
                        <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">{project.client}</p>
                      </div>
                      <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent" />
                    </div>
                  </div>
                </Link>
                {isInternal && project.editable && project.id && (
                  <div className="absolute right-3 top-3 z-10 flex gap-2">
                    <Button asChild size="icon" variant="secondary" aria-label={`Edit ${project.title}`}>
                      <Link to="/admin?tab=works"><Pencil /></Link>
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