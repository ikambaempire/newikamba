import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import MediaPlayer from "@/components/MediaPlayer";

type Work = {
  id: string; slug: string; title: string; summary: string | null; content: string | null;
  cover_url: string | null; video_url: string | null; category: string | null;
  year: string | null; client_name: string | null;
};

const OurWorkDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [work, setWork] = useState<Work | null | undefined>(undefined);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await (supabase as any).from("works").select("*").eq("slug", slug).eq("published", true).maybeSingle();
      setWork((data as any) || null);
    })();
  }, [slug]);

  if (work === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }
  if (work === null) return <Navigate to="/work" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <article className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <Link to="/work" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground hover:text-accent mb-8">
            <ArrowLeft size={14} /> All work
          </Link>
          <p className="text-[11px] uppercase tracking-[0.25em] text-accent font-semibold mb-4">
            {work.category || "Story"}{work.year ? ` · ${work.year}` : ""}
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">{work.title}</h1>
          {work.client_name && (
            <p className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-8">{work.client_name}</p>
          )}
          {work.video_url ? (
            <div className="w-full rounded-2xl mb-10 bg-black aspect-video overflow-hidden">
              <MediaPlayer url={work.video_url} poster={work.cover_url} title={work.title} controls className="w-full h-full object-cover" />
            </div>
          ) : work.cover_url ? (
            <img src={work.cover_url} alt={work.title} className="w-full rounded-2xl mb-10 object-cover" />
          ) : null}
          {work.summary && <p className="text-xl text-foreground/80 leading-relaxed mb-8">{work.summary}</p>}
          {work.content && (
            <div className="prose prose-lg max-w-none text-foreground/85 leading-relaxed whitespace-pre-wrap">
              {work.content}
            </div>
          )}
        </div>
      </article>
      <Footer />
    </div>
  );
};

export default OurWorkDetail;
