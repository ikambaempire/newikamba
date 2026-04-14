import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  author: string | null;
  cover_image_url: string | null;
  published_at: string | null;
}

const estimateReadTime = (content: string) => Math.max(1, Math.ceil(content.split(/\s+/).length / 220));

const fallbackPosts: BlogPost[] = [
  { id: "1", title: "The Power of Documentary Storytelling for NGOs", slug: "documentary-storytelling-ngos", excerpt: "How documentary-style content helps non-profits communicate impact authentically and connect with donors on a deeper level.", category: "Strategy", author: "Ikamba Team", cover_image_url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80", published_at: "2026-03-15", content: "Documentary storytelling has become one of the most powerful tools for non-governmental organizations seeking to communicate their impact. Unlike traditional reports, documentaries allow audiences to experience the stories of real people, fostering empathy and understanding.\n\nWhen done right, documentary content can bridge the gap between an organization's mission and its audience's emotions. It transforms abstract statistics into human experiences that resonate deeply with donors, partners, and communities.\n\n## Why Documentary Works\n\nThe human brain is wired for narrative. We remember stories far better than facts alone. For NGOs, this means that a well-crafted documentary can communicate years of impact in just a few minutes.\n\n## Best Practices\n\n- Always center the community's voice\n- Use authentic locations and real people\n- Balance emotional storytelling with data\n- Ensure ethical consent and representation\n\nAt Ikamba, we specialize in creating documentary content that honors the dignity of every story while driving meaningful engagement for organizations." },
  { id: "2", title: "5 Visual Strategies That Drive Donor Engagement", slug: "visual-strategies-donor-engagement", excerpt: "Proven approaches to creating compelling visual content that moves stakeholders from awareness to action.", category: "Impact", author: "Ikamba Team", cover_image_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80", published_at: "2026-02-28", content: "In today's crowded digital landscape, capturing donor attention requires more than good intentions. It demands strategic visual storytelling that cuts through the noise.\n\n## 1. Lead with Human Faces\n\nResearch consistently shows that images featuring human faces generate significantly higher engagement. Show the people behind your programs.\n\n## 2. Use Before-and-After Narratives\n\nVisual transformation stories are incredibly compelling. Document the journey from challenge to impact.\n\n## 3. Invest in Quality Photography\n\nProfessional-quality images signal organizational credibility. They tell donors you take your work seriously.\n\n## 4. Create Short-Form Video Content\n\nWith attention spans shrinking, 60-90 second impact videos are the sweet spot for social media engagement.\n\n## 5. Design Infographics That Tell Stories\n\nCombine data with visual narrative to make your impact metrics memorable and shareable." },
  { id: "3", title: "Behind the Lens: Ethical Storytelling in Development", slug: "ethical-storytelling-development", excerpt: "Balancing powerful narratives with dignity and respect when documenting communities and social impact work.", category: "Production", author: "Ikamba Team", cover_image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80", published_at: "2026-01-20", content: "Ethical storytelling in the development sector is not just about getting consent forms signed. It's about fundamentally rethinking how we represent communities and whose voice drives the narrative.\n\n## The Problem with Traditional Approaches\n\nFor decades, development communication relied on deficit-based narratives — showing communities as helpless recipients of aid. This approach, while effective at generating short-term donations, undermines dignity and perpetuates harmful stereotypes.\n\n## A Better Way Forward\n\n**Strength-based storytelling** focuses on community agency, resilience, and leadership. It positions people as protagonists of their own stories rather than passive subjects.\n\n## Key Principles\n\n- Informed consent goes beyond paperwork\n- Community members should review content before publication\n- Avoid poverty imagery that strips dignity\n- Compensate participants for their time and stories\n- Share the final content with featured communities\n\nAt Ikamba, ethical storytelling isn't an afterthought — it's the foundation of every project we undertake." },
  { id: "4", title: "How to Create Impactful Annual Reports with Video", slug: "impactful-annual-reports-video", excerpt: "Transform your annual reporting from static PDFs into dynamic multimedia experiences that stakeholders actually engage with.", category: "Production", author: "Ikamba Team", cover_image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80", published_at: "2025-12-10", content: "Annual reports don't have to be boring PDF documents that no one reads. By integrating video content, organizations can create dynamic, engaging reports that stakeholders actually want to explore.\n\n## The Shift to Multimedia Reporting\n\nForward-thinking organizations are moving beyond traditional annual reports. They're creating multimedia experiences that combine data visualization, video testimonials, and interactive elements.\n\n## Getting Started\n\n- Start with a compelling 2-minute overview video\n- Create short testimonial clips from beneficiaries\n- Use motion graphics to bring statistics to life\n- Design an interactive digital report alongside print\n\nThe result? Higher engagement rates, better donor retention, and a report that truly reflects the vitality of your work." },
  { id: "5", title: "The Role of Photography in Humanitarian Communication", slug: "photography-humanitarian-communication", excerpt: "Why professional photography remains essential for humanitarian organizations in the age of video and social media.", category: "Strategy", author: "Ikamba Team", cover_image_url: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80", published_at: "2025-11-05", content: "In an era dominated by video content and social media stories, photography remains a cornerstone of humanitarian communication. A single powerful image can capture attention, convey emotion, and inspire action in ways that other media cannot.\n\n## Why Photography Still Matters\n\nPhotographs are versatile, immediate, and universally understood. They work across every platform — from annual reports to social media, from exhibition walls to email campaigns.\n\n## Best Practices for Humanitarian Photography\n\n- Prioritize dignity and agency in every frame\n- Capture moments of strength, not just vulnerability\n- Document the full spectrum of community life\n- Build relationships before picking up the camera\n- Always obtain informed consent\n\nProfessional photography is an investment in your organization's credibility and impact communication." },
];

const renderMarkdown = (md: string) => {
  let html = md
    .replace(/\[youtube:([a-zA-Z0-9_-]{11})\]/g, '<div class="my-6"><iframe width="100%" height="400" src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen style="border-radius:12px"></iframe></div>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-xl my-6 max-w-full" loading="lazy" />')
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-8 mb-3 text-foreground">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-10 mb-4 text-foreground">$1</h2>')
    .replace(/^\*\*(\d+)\. (.+?)\*\*$/gm, '<p class="font-bold mt-4 mb-1 text-foreground">$1. $2</p>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-accent underline hover:no-underline">$1</a>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-muted-foreground">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-muted-foreground">$1. $2</li>')
    .replace(/^---$/gm, '<hr class="my-8 border-border" />')
    .replace(/\n\n/g, '</p><p class="text-muted-foreground leading-relaxed mb-4">')
    ;
  return `<p class="text-muted-foreground leading-relaxed mb-4">${html}</p>`;
};

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug!)
        .eq("published", true)
        .single();
      if (data) {
        setPost(data as BlogPost);
        const { data: related } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("published", true)
          .neq("slug", slug!)
          .order("published_at", { ascending: false })
          .limit(3);
        if (related && related.length > 0) setRelatedPosts(related as BlogPost[]);
        else setRelatedPosts(fallbackPosts.filter(p => p.slug !== slug).slice(0, 3));
      } else {
        // Use fallback
        const fb = fallbackPosts.find(p => p.slug === slug);
        if (fb) {
          setPost(fb);
          setRelatedPosts(fallbackPosts.filter(p => p.slug !== slug).slice(0, 3));
        }
      }
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
          <div className="h-8 w-64 bg-muted animate-pulse rounded mb-4" />
          <div className="h-12 w-full bg-muted animate-pulse rounded mb-6" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-4 w-full bg-muted animate-pulse rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-20 text-center">
          <h1 className="text-2xl font-bold mb-4 text-foreground">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist or has been unpublished.</p>
          <Link to="/insights" className="text-accent hover:underline inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Insights
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <article className="max-w-3xl mx-auto px-6 pt-32 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/insights" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-8">
            <ArrowLeft size={14} /> Back to Insights
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] uppercase tracking-widest text-accent font-semibold bg-accent/10 px-2.5 py-1 rounded-full">{post.category}</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold leading-tight mb-6 text-foreground">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
            <span className="flex items-center gap-1.5"><User size={14} /> {post.author}</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""}
            </span>
            <span className="flex items-center gap-1.5"><Clock size={14} /> {estimateReadTime(post.content)} min read</span>
          </div>
        </motion.div>

        {post.cover_image_url && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="rounded-2xl overflow-hidden mb-10">
            <img src={post.cover_image_url} alt={post.title} className="w-full" />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />
      </article>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 pb-20">
          <div className="border-t border-border pt-12">
            <h2 className="text-xl font-bold mb-6 text-foreground">Continue Reading</h2>
            <div className="grid gap-4">
              {relatedPosts.map(rp => (
                <Link key={rp.id} to={`/insights/${rp.slug}`} className="group flex gap-4 p-4 rounded-xl border border-border hover:border-accent/30 hover:shadow-[0_8px_30px_hsl(var(--foreground)/0.08)] transition-all">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase tracking-widest text-accent font-semibold">{rp.category}</span>
                    <h3 className="font-bold mt-1 group-hover:text-accent transition-colors text-foreground">{rp.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{rp.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default BlogPostPage;
