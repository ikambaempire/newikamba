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

const fallbackPosts: BlogPost[] = [
  { id: "1", title: "The Power of Documentary Storytelling for NGOs", slug: "documentary-storytelling-ngos", excerpt: "How documentary-style content helps non-profits communicate impact authentically and connect with donors on a deeper level.", category: "Strategy", author: "Ikamba Team", cover_image_url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80", published_at: "2026-03-15", content: "Documentary storytelling has become one of the most powerful tools for non-governmental organizations seeking to communicate their impact. Unlike traditional reports, documentaries allow audiences to experience the stories of real people, fostering empathy and understanding.\n\nWhen done right, documentary content can bridge the gap between an organization's mission and its audience's emotions. It transforms abstract statistics into human experiences that resonate deeply with donors, partners, and communities.\n\n## Why Documentary Works\n\nThe human brain is wired for narrative. We remember stories far better than facts alone. For NGOs, this means that a well-crafted documentary can communicate years of impact in just a few minutes.\n\n## Best Practices\n\n- Always center the community's voice\n- Use authentic locations and real people\n- Balance emotional storytelling with data\n- Ensure ethical consent and representation\n\nAt Ikamba, we specialize in creating documentary content that honors the dignity of every story while driving meaningful engagement for organizations." },
  { id: "2", title: "5 Visual Strategies That Drive Donor Engagement", slug: "visual-strategies-donor-engagement", excerpt: "Proven approaches to creating compelling visual content that moves stakeholders from awareness to action.", category: "Impact", author: "Ikamba Team", cover_image_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80", published_at: "2026-02-28", content: "In today's crowded digital landscape, capturing donor attention requires more than good intentions. It demands strategic visual storytelling that cuts through the noise.\n\n## 1. Lead with Human Faces\n\nResearch consistently shows that images featuring human faces generate significantly higher engagement. Show the people behind your programs.\n\n## 2. Use Before-and-After Narratives\n\nVisual transformation stories are incredibly compelling. Document the journey from challenge to impact.\n\n## 3. Invest in Quality Photography\n\nProfessional-quality images signal organizational credibility. They tell donors you take your work seriously.\n\n## 4. Create Short-Form Video Content\n\nWith attention spans shrinking, 60-90 second impact videos are the sweet spot for social media engagement.\n\n## 5. Design Infographics That Tell Stories\n\nCombine data with visual narrative to make your impact metrics memorable and shareable." },
  { id: "3", title: "Behind the Lens: Ethical Storytelling in Development", slug: "ethical-storytelling-development", excerpt: "Balancing powerful narratives with dignity and respect when documenting communities and social impact work.", category: "Production", author: "Ikamba Team", cover_image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80", published_at: "2026-01-20", content: "Ethical storytelling in the development sector is not just about getting consent forms signed. It's about fundamentally rethinking how we represent communities and whose voice drives the narrative.\n\n## The Problem with Traditional Approaches\n\nFor decades, development communication relied on deficit-based narratives — showing communities as helpless recipients of aid. This approach, while effective at generating short-term donations, undermines dignity and perpetuates harmful stereotypes.\n\n## A Better Way Forward\n\n**Strength-based storytelling** focuses on community agency, resilience, and leadership. It positions people as protagonists of their own stories rather than passive subjects.\n\n## Key Principles\n\n- Informed consent goes beyond paperwork\n- Community members should review content before publication\n- Avoid poverty imagery that strips dignity\n- Compensate participants for their time and stories\n- Share the final content with featured communities\n\nAt Ikamba, ethical storytelling isn't an afterthought — it's the foundation of every project we undertake." },
  { id: "4", title: "How to Create Impactful Annual Reports with Video", slug: "impactful-annual-reports-video", excerpt: "Transform your annual reporting from static PDFs into dynamic multimedia experiences that stakeholders actually engage with.", category: "Production", author: "Ikamba Team", cover_image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80", published_at: "2025-12-10", content: "Annual reports don't have to be boring PDF documents that no one reads. By integrating video content, organizations can create dynamic, engaging reports that stakeholders actually want to explore.\n\n## The Shift to Multimedia Reporting\n\nForward-thinking organizations are moving beyond traditional annual reports. They're creating multimedia experiences that combine data visualization, video testimonials, and interactive elements.\n\n## Getting Started\n\n- Start with a compelling 2-minute overview video\n- Create short testimonial clips from beneficiaries\n- Use motion graphics to bring statistics to life\n- Design an interactive digital report alongside print\n\nThe result? Higher engagement rates, better donor retention, and a report that truly reflects the vitality of your work." },
  { id: "5", title: "The Role of Photography in Humanitarian Communication", slug: "photography-humanitarian-communication", excerpt: "Why professional photography remains essential for humanitarian organizations in the age of video and social media.", category: "Strategy", author: "Ikamba Team", cover_image_url: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80", published_at: "2025-11-05", content: "In an era dominated by video content and social media stories, photography remains a cornerstone of humanitarian communication. A single powerful image can capture attention, convey emotion, and inspire action in ways that other media cannot.\n\n## Why Photography Still Matters\n\nPhotographs are versatile, immediate, and universally understood. They work across every platform — from annual reports to social media, from exhibition walls to email campaigns.\n\n## Best Practices for Humanitarian Photography\n\n- Prioritize dignity and agency in every frame\n- Capture moments of strength, not just vulnerability\n- Document the full spectrum of community life\n- Build relationships before picking up the camera\n- Always obtain informed consent\n\nProfessional photography is an investment in your organization's credibility and impact communication." },
];

const Insights = () => {
  const [posts, setPosts] = useState<BlogPost[]>(fallbackPosts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false });
      if (data && data.length > 0) setPosts(data as BlogPost[]);
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
