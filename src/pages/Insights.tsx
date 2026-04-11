import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ArrowRight, Clock } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  author: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  content: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const estimateReadTime = (content: string) => Math.max(1, Math.ceil(content.split(/\s+/).length / 220));

const Insights = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false });
      if (data) setPosts(data as BlogPost[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="section-padding pt-32 pb-8 md:pt-40 gradient-navy text-white">
        <div className="max-w-5xl mx-auto">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs uppercase tracking-[0.2em] font-semibold text-white/60 mb-4">
            Ideas & Resources
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-white">
            Insights
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-white/70 max-w-2xl mb-12">
            Ideas and resources on storytelling, media production, and impact communication for organizations.
          </motion.p>
        </div>
      </section>

      {loading ? (
        <div className="max-w-5xl mx-auto px-6 pb-20">
          <div className="grid gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="max-w-5xl mx-auto px-6 pb-20 text-center text-muted-foreground">
          <p>No articles published yet. Check back soon.</p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-6 pb-20">
          {/* Featured post */}
          {featured && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Link to={`/insights/${featured.slug}`} className="block group mb-12">
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[0_4px_24px_hsl(var(--foreground)/0.06)] hover:shadow-[0_16px_48px_hsl(var(--foreground)/0.12)] transition-all duration-500">
                  {featured.cover_image_url && (
                    <div className="aspect-[2.2/1] overflow-hidden">
                      <img src={featured.cover_image_url} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  )}
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[10px] uppercase tracking-widest text-accent font-semibold">{featured.category}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Calendar size={10} />
                        {featured.published_at ? new Date(featured.published_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : ""}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock size={10} />
                        {estimateReadTime(featured.content)} min read
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-accent transition-colors">{featured.title}</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">{featured.excerpt}</p>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent group-hover:gap-3 transition-all">
                      Read Article <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Rest of posts */}
          <div className="space-y-5">
            {rest.map((post, i) => (
              <motion.div key={post.id} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
                <Link to={`/insights/${post.slug}`} className="block group">
                  <div className="bg-card border border-border rounded-xl p-6 shadow-[0_2px_12px_hsl(var(--foreground)/0.04)] hover:shadow-[0_12px_40px_hsl(var(--foreground)/0.1)] hover:border-accent/30 transition-all duration-300 flex gap-6">
                    {post.cover_image_url && (
                      <div className="hidden sm:block w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] uppercase tracking-widest text-accent font-semibold">{post.category}</span>
                        <span className="text-[10px] text-muted-foreground">{post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : ""}</span>
                        <span className="text-[10px] text-muted-foreground">{estimateReadTime(post.content)} min</span>
                      </div>
                      <h3 className="text-lg font-bold mb-1 group-hover:text-accent transition-colors">{post.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>
                    </div>
                    <ArrowRight size={18} className="text-muted-foreground group-hover:text-accent transition-colors self-center flex-shrink-0 hidden md:block" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Insights;
