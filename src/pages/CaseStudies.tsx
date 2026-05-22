import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { PROJECTS, findProject, adjacentProjects, type PortfolioProject } from "@/data/projects";

const CaseStudies = () => {
  const { slug } = useParams<{ slug?: string }>();

  // Index view (no slug) — editorial list of all cases
  if (!slug) return <IndexView />;

  const project = findProject(slug);
  if (!project) return <Navigate to="/case-studies" replace />;
  return <DetailView project={project} />;
};

const IndexView = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="section-padding pt-32 pb-12 md:pt-40 gradient-navy text-white">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs uppercase tracking-[0.25em] font-semibold text-accent mb-4">Case Studies</p>
        <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight max-w-4xl">
          How structured production governance transforms organizational communication.
        </h1>
      </div>
    </section>
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-20">
        {PROJECTS.map((p, i) => (
          <motion.article key={p.slug}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}
            className="grid md:grid-cols-12 gap-8 items-center">
            <Link to={`/case-studies/${p.slug}`} className={`md:col-span-7 group block ${i % 2 ? "md:order-2" : ""}`}>
              <div className="relative overflow-hidden rounded-2xl aspect-[16/10]">
                <img src={p.cover} alt={p.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold">
                  Case #{String(i + 1).padStart(2, "0")}
                </div>
              </div>
            </Link>
            <div className={`md:col-span-5 ${i % 2 ? "md:order-1 md:pr-8" : "md:pl-4"}`}>
              <p className="text-[11px] uppercase tracking-[0.2em] text-accent font-semibold mb-3">{p.category} · {p.year}</p>
              <h2 className="text-2xl md:text-3xl font-extrabold leading-tight mb-3">{p.title}</h2>
              <p className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-4">{p.client}</p>
              <p className="text-base text-foreground/80 leading-relaxed mb-6">{p.excerpt}</p>
              <Link to={`/case-studies/${p.slug}`}
                className="inline-flex items-center gap-2 text-sm font-semibold border-b-2 border-accent pb-0.5 hover:gap-3 transition-all">
                Read the case <ArrowUpRight size={16} />
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
    <Footer />
  </div>
);

const DetailView = ({ project: p }: { project: PortfolioProject }) => {
  const { prev, next } = adjacentProjects(p.slug);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero cover */}
      <section className="relative pt-24 md:pt-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <Link to="/case-studies"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground hover:text-accent transition-colors mb-8">
            <ArrowLeft size={14} /> All case studies
          </Link>
          <div className="grid md:grid-cols-12 gap-6 mb-10">
            <div className="md:col-span-8">
              <p className="text-[11px] uppercase tracking-[0.25em] text-accent font-semibold mb-4">
                {p.category} · {p.year}
              </p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.03] tracking-tight mb-6 text-balance">
                {p.title}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                {p.excerpt}
              </p>
            </div>
            <aside className="md:col-span-4 space-y-5 md:pt-2 md:border-l md:border-border md:pl-8">
              <Meta label="Client" value={p.client} />
              <Meta label="Year" value={p.year} />
              <Meta label="Services" value={p.services.join(" · ")} />
            </aside>
          </div>
          <div className="relative overflow-hidden rounded-3xl aspect-[16/9]">
            <img src={p.cover} alt={p.title} className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
      </section>

      {/* Metrics strip */}
      {p.metrics && p.metrics.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-border py-10">
            {p.metrics.map(m => (
              <div key={m.label}>
                <div className="text-4xl md:text-5xl font-extrabold text-accent tracking-tight">{m.value}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">{m.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Challenge · Approach · Outcome */}
      <section className="py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-14">
          {[
            { eyebrow: "01 — Challenge", title: "What we were asked to solve", body: p.challenge },
            { eyebrow: "02 — Approach", title: "How we built the production", body: p.approach },
            { eyebrow: "03 — Outcome", title: "What it delivered", body: p.outcome },
          ].map((b) => (
            <motion.div key={b.eyebrow}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="grid md:grid-cols-12 gap-6">
              <div className="md:col-span-4">
                <p className="text-[11px] uppercase tracking-[0.25em] text-accent font-bold">{b.eyebrow}</p>
              </div>
              <div className="md:col-span-8">
                <h3 className="text-2xl md:text-3xl font-extrabold leading-tight mb-4">{b.title}</h3>
                <p className="text-lg text-foreground/80 leading-relaxed">{b.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Next / Prev case */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 grid md:grid-cols-2 gap-6">
          <CaseLink direction="prev" project={prev} />
          <CaseLink direction="next" project={next} />
        </div>
      </section>

      <Footer />
    </div>
  );
};

const Meta = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold mb-1">{label}</div>
    <div className="text-sm font-semibold">{value}</div>
  </div>
);

const CaseLink = ({ direction, project }: { direction: "prev" | "next"; project: PortfolioProject }) => (
  <Link to={`/case-studies/${project.slug}`}
    className={`group relative overflow-hidden rounded-2xl bg-card border border-border p-6 md:p-8 hover:border-accent transition-all ${direction === "next" ? "md:text-right" : ""}`}>
    <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground font-bold mb-3 inline-flex items-center gap-2">
      {direction === "prev" ? <><ArrowLeft size={12} /> Previous case</> : <>Next case <ArrowRight size={12} /></>}
    </p>
    <h4 className="text-xl md:text-2xl font-extrabold leading-tight group-hover:text-accent transition-colors">{project.title}</h4>
    <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-2">{project.client}</p>
  </Link>
);

export default CaseStudies;
