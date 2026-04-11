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
        // Fetch related
        const { data: related } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("published", true)
          .neq("slug", slug!)
          .order("published_at", { ascending: false })
          .limit(3);
        if (related) setRelatedPosts(related as BlogPost[]);
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
