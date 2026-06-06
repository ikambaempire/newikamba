import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { featuredProjects } from "@/data/projects";

const SelectedWork = () => {
  const items = featuredProjects();
  return (
    <section className="section-padding bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-accent mb-3">Selected Work</p>
            <h2 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight max-w-2xl">
              Recent productions, archived and governed end-to-end.
            </h2>
          </div>
          <Link to="/work"
            className="inline-flex items-center gap-2 text-sm font-semibold border-b-2 border-accent pb-0.5 self-start md:self-end hover:gap-3 transition-all">
            View all work <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 auto-rows-[minmax(0,1fr)]">
          {items.map((p, i) => {
            const colSpan = i === 0 ? "md:col-span-7" : i === 1 ? "md:col-span-5" : i === 2 ? "md:col-span-6" : i === 3 ? "md:col-span-6" : "md:col-span-12";
            const aspect = i === 4 ? "aspect-[21/8]" : "aspect-[4/3]";
            return (
              <motion.div key={p.slug}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }} transition={{ delay: i * 0.08, duration: 0.6 }}
                className={colSpan}>
                <Link to={`/work/${p.slug}`} className="group block relative overflow-hidden rounded-2xl">
                  <div className={`relative overflow-hidden ${aspect}`}>
                    {p.video ? (
                      <video
                        src={p.video}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        poster={p.cover}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
                      />
                    ) : (
                      <img src={p.cover} alt={p.title} loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    <div className="absolute top-5 left-5 right-5 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-white/85 font-semibold">
                      <span className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-2.5 py-1">{p.category}</span>
                      <span>{p.year}</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-accent font-semibold mb-2">{p.client}</p>
                      <h3 className="text-xl md:text-3xl font-bold leading-tight max-w-[85%]">{p.title}</h3>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold opacity-90 group-hover:gap-3 transition-all">
                        Read case <ArrowUpRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SelectedWork;
