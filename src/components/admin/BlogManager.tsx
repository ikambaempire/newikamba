import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Upload, Image as ImageIcon, Youtube, ArrowLeft, Eye, Bold, Heading2, List, Link2 } from "lucide-react";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  cover_image_url: string | null;
  author: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const emptyPost = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "",
  cover_image_url: "",
  author: "Ikamba",
  published: false,
};

const categories = ["Storytelling", "Documentary", "Photography", "Impact", "Strategy", "Media Production", "Case Study"];

const BlogManager = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(emptyPost);
  const [saving, setSaving] = useState(false);
  const [editorMode, setEditorMode] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);
  const [preview, setPreview] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const fetchPosts = async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    if (data) setPosts(data as BlogPost[]);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const seedSamplePosts = async () => {
    const samplePosts = [
      {
        title: "The Power of Documentary Storytelling in Development Communication",
        slug: "power-documentary-storytelling-development",
        excerpt: "How documentary films are transforming the way organizations communicate impact, engage stakeholders, and drive meaningful change across communities.",
        content: "## Why Documentary Storytelling Matters\n\nIn the world of development communication, there's a growing recognition that traditional reports and statistics alone aren't enough to capture the full picture of impact. Documentary storytelling bridges this gap by combining authentic narratives with cinematic production quality.\n\n## The Human Connection\n\nDocumentaries create emotional connections that data alone cannot achieve. When viewers see real people sharing their experiences, they develop empathy and understanding that drives action.\n\n## Key Elements of Effective Impact Documentaries\n\n- **Authentic voices**: Let beneficiaries and stakeholders tell their own stories\n- **Visual quality**: Professional cinematography elevates credibility\n- **Strategic narrative**: Structure the story around clear impact themes\n- **Call to action**: Guide viewers toward meaningful engagement\n\n## Our Approach at Ikamba\n\nAt Ikamba, we combine strategic storytelling with premium production to create documentaries that don't just inform — they inspire. Our process begins with understanding the organization's communication goals and identifying the stories that matter most.\n\n## The Impact\n\nOrganizations that invest in documentary storytelling consistently see higher engagement rates, stronger donor relationships, and more effective communication of their mission and impact.",
        category: "Documentary",
        cover_image_url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80",
        author: "Ikamba",
        published: true,
        published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "5 Visual Storytelling Strategies Every NGO Should Adopt in 2026",
        slug: "visual-storytelling-strategies-ngos-2026",
        excerpt: "From short-form social content to immersive documentaries, these five strategies will help your organization communicate impact more effectively.",
        content: "## The Visual Communication Landscape\n\nThe way audiences consume content has fundamentally shifted. Attention spans are shorter, but appetite for meaningful stories has never been greater. Here are five strategies that leading NGOs are using to cut through the noise.\n\n## 1. Short-Form Impact Reels\n\nCreate 60-90 second impact reels that capture key achievements. These work powerfully on social media and in donor presentations.\n\n## 2. Beneficiary-Led Narratives\n\nPut the people you serve at the center of your storytelling. Authentic first-person narratives build trust and emotional connection.\n\n## 3. Behind-the-Scenes Content\n\nShow the process, the challenges, and the team behind the work. This transparency builds credibility and humanizes your organization.\n\n## 4. Data Visualization Videos\n\nTransform your impact data into compelling animated stories. Numbers become memorable when they're visually brought to life.\n\n## 5. Annual Report Videos\n\nReplace lengthy PDF reports with concise video summaries. Stakeholders are far more likely to watch a 3-minute video than read a 50-page document.\n\n## Getting Started\n\nThe key is to start with strategy before production. Understand your audience, define your message, and then choose the right format to deliver it.",
        category: "Strategy",
        cover_image_url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80",
        author: "Ikamba",
        published: true,
        published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "How Photography Shapes Organizational Identity",
        slug: "photography-shapes-organizational-identity",
        excerpt: "Professional photography is more than aesthetics — it's a strategic tool that defines how organizations are perceived by stakeholders and communities.",
        content: "## Beyond the Snapshot\n\nIn an era of smartphone cameras and stock photos, professional photography might seem like a luxury. But for organizations working in development, corporate communication, and social impact, authentic imagery is a strategic necessity.\n\n## Building Visual Identity\n\nYour photography style communicates your values before a single word is read. Consistent, professional imagery across your website, reports, and social media creates a cohesive brand that stakeholders trust.\n\n## Documentary vs. Corporate Photography\n\nThe best organizational photography blends documentary authenticity with corporate polish. It captures real moments while maintaining the quality standards that institutional partners expect.\n\n## Practical Tips\n\n- **Plan your shot list**: Align photography with your communication strategy\n- **Capture diversity**: Show the full range of your work and the people involved\n- **Think long-term**: Build a photo library that serves multiple campaigns\n- **Invest in editing**: Post-production elevates raw captures into powerful visuals\n\n## The Ikamba Difference\n\nWe approach every photography project with a storytelling mindset. Every image should contribute to the larger narrative your organization is building.",
        category: "Photography",
        cover_image_url: "https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=800&q=80",
        author: "Ikamba",
        published: true,
        published_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "Event Coverage That Goes Beyond Highlights: Capturing the Full Story",
        slug: "event-coverage-beyond-highlights",
        excerpt: "Professional event coverage should capture not just what happened, but why it mattered. Here's how strategic event filming creates lasting value.",
        content: "## The Problem with Traditional Event Coverage\n\nMost event videos are forgettable — generic highlight reels set to upbeat music. They capture the surface but miss the substance. Strategic event coverage is different.\n\n## Capturing What Matters\n\nThe best event content tells the story of transformation. What did attendees learn? What connections were made? What commitments were formed?\n\n## Our Multi-Format Approach\n\n- **Same-day edits**: Quick turnaround highlights for social media\n- **Speaker profiles**: Individual interviews with key presenters\n- **Documentary coverage**: The full event narrative for reports and archives\n- **Photography**: High-quality stills for press releases and publications\n\n## Pre-Production Planning\n\nGreat event coverage starts weeks before the event. We work with organizers to understand the agenda, identify key moments, and plan our coverage strategy.\n\n## Maximizing Content Value\n\nA single well-covered event can generate months of content: social media clips, newsletter features, annual report visuals, and stakeholder presentations.",
        category: "Media Production",
        cover_image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
        author: "Ikamba",
        published: true,
        published_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "Impact Storytelling: Turning M&E Data into Compelling Narratives",
        slug: "impact-storytelling-me-data-narratives",
        excerpt: "Monitoring and evaluation data holds powerful stories. Learn how to transform raw impact metrics into visual narratives that move stakeholders to action.",
        content: "## The Data-Story Gap\n\nOrganizations collect mountains of monitoring and evaluation data, but rarely translate it into stories that resonate. This gap between data and narrative is where impact storytelling lives.\n\n## Why Numbers Need Stories\n\nA statistic tells you what happened. A story tells you why it matters. The most effective impact communication combines both — using data for credibility and narrative for emotional engagement.\n\n## The Storytelling Framework\n\n**1. Start with the human**: Every data point represents a real person or community\n\n**2. Show the journey**: Before, during, and after — transformation is inherently compelling\n\n**3. Use data as proof points**: Weave statistics naturally into the narrative arc\n\n**4. End with vision**: Connect current impact to future possibility\n\n## Visual Approaches\n\n- Animated data visualizations\n- Beneficiary testimonial videos paired with infographics\n- Photo essays with embedded statistics\n- Interactive annual report websites\n\n## The Result\n\nWhen M&E data meets strategic storytelling, organizations see dramatically improved stakeholder engagement, donor retention, and public understanding of their work.",
        category: "Impact",
        cover_image_url: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=800&q=80",
        author: "Ikamba",
        published: true,
        published_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "Corporate Video Production: What Sets Professional Work Apart",
        slug: "corporate-video-production-professional-standards",
        excerpt: "The difference between amateur and professional corporate video isn't just equipment — it's strategy, storytelling craft, and production discipline.",
        content: "## The Quality Question\n\nEvery organization needs video content, but not all video is created equal. The gap between amateur and professional corporate video has real consequences for brand perception and stakeholder trust.\n\n## What Makes Professional Video Different\n\n### Strategic Foundation\nProfessional productions start with clear communication objectives. Every creative decision serves the strategic goal.\n\n### Production Discipline\nFrom lighting and sound to camera movement and composition, professional crews bring technical excellence that elevates every frame.\n\n### Post-Production Craft\nEditing, color grading, sound design, and graphics — this is where raw footage becomes a polished story.\n\n## When to Invest in Professional Video\n\n- Brand launch or rebrand campaigns\n- Annual impact reports\n- Major stakeholder presentations\n- Recruitment and employer branding\n- Product or service launches\n\n## The ROI of Quality\n\nProfessional video content has a significantly longer shelf life, higher engagement rates, and stronger brand impact than amateur alternatives. The initial investment pays dividends across multiple campaigns and channels.",
        category: "Media Production",
        cover_image_url: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&q=80",
        author: "Ikamba",
        published: true,
        published_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    for (const post of samplePosts) {
      const { error } = await supabase.from("blog_posts").insert(post);
      if (error && !error.message.includes("duplicate")) {
        toast.error("Failed to seed: " + error.message);
        return;
      }
    }
    toast.success("Sample insights added successfully!");
    fetchPosts();
  };

  const openNew = () => {
    setEditing(null);
    setForm(emptyPost);
    setEditorMode(true);
    setPreview(false);
  };

  const openEdit = (post: BlogPost) => {
    setEditing(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      category: post.category || "",
      cover_image_url: post.cover_image_url || "",
      author: post.author || "Ikamba",
      published: post.published,
    });
    setEditorMode(true);
    setPreview(false);
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleTitleChange = (val: string) => {
    setForm(f => ({ ...f, title: val, slug: editing ? f.slug : generateSlug(val) }));
  };

  const uploadImage = async (file: File, type: "cover" | "inline") => {
    const setter = type === "cover" ? setUploadingCover : setUploadingInline;
    setter(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("blog-images").upload(path, file);
    if (error) {
      toast.error("Upload failed: " + error.message);
      setter(false);
      return null;
    }
    const { data: { publicUrl } } = supabase.storage.from("blog-images").getPublicUrl(path);
    setter(false);
    return publicUrl;
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file, "cover");
    if (url) setForm(f => ({ ...f, cover_image_url: url }));
  };

  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file, "inline");
    if (url) insertAtCursor(`\n\n![${file.name}](${url})\n\n`);
  };

  const insertAtCursor = (text: string) => {
    const ta = contentRef.current;
    if (!ta) { setForm(f => ({ ...f, content: f.content + text })); return; }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = form.content.substring(0, start);
    const after = form.content.substring(end);
    setForm(f => ({ ...f, content: before + text + after }));
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + text.length;
    }, 0);
  };

  const insertYouTube = () => {
    const url = prompt("Paste YouTube video URL:");
    if (!url) return;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    if (!match) { toast.error("Invalid YouTube URL"); return; }
    insertAtCursor(`\n\n[youtube:${match[1]}]\n\n`);
  };

  const wrapSelection = (prefix: string, suffix: string) => {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = form.content.substring(start, end);
    const wrapped = `${prefix}${selected || "text"}${suffix}`;
    const before = form.content.substring(0, start);
    const after = form.content.substring(end);
    setForm(f => ({ ...f, content: before + wrapped + after }));
    setTimeout(() => { ta.focus(); ta.selectionStart = start + prefix.length; ta.selectionEnd = start + prefix.length + (selected.length || 4); }, 0);
  };

  const handleSave = async (publish?: boolean) => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setSaving(true);
    const isPublished = publish !== undefined ? publish : form.published;
    const payload = {
      title: form.title,
      slug: form.slug || generateSlug(form.title),
      excerpt: form.excerpt || null,
      content: form.content,
      category: form.category || null,
      cover_image_url: form.cover_image_url || null,
      author: form.author || "Ikamba",
      published: isPublished,
      published_at: isPublished ? (editing?.published_at || new Date().toISOString()) : null,
    };

    if (editing) {
      const { error } = await supabase.from("blog_posts").update(payload).eq("id", editing.id);
      if (error) toast.error("Failed to update: " + error.message);
      else toast.success("Post updated");
    } else {
      const { error } = await supabase.from("blog_posts").insert(payload);
      if (error) toast.error("Failed to create: " + error.message);
      else toast.success("Post created");
    }
    setSaving(false);
    setEditorMode(false);
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post permanently?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) toast.error("Failed to delete: " + error.message);
    else { toast.success("Post deleted"); fetchPosts(); }
  };

  const renderMarkdownPreview = (md: string) => {
    let html = md
      .replace(/\[youtube:([a-zA-Z0-9_-]{11})\]/g, '<div class="my-4"><iframe width="100%" height="315" src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen style="border-radius:12px"></iframe></div>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg my-4 max-w-full" />')
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-6 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3">$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-accent underline">$1</a>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-3 text-muted-foreground">')
    ;
    return `<p class="mb-3 text-muted-foreground">${html}</p>`;
  };

  // ========= EDITOR VIEW =========
  if (editorMode) {
    return (
      <div className="space-y-0">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <button onClick={() => setEditorMode(false)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} /> All Posts
          </button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleSave(false)} disabled={saving}>
              Save Draft
            </Button>
            <Button size="sm" onClick={() => handleSave(true)} disabled={saving} className="gap-1.5">
              {saving ? "Saving..." : form.published ? "Update" : "Publish"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Main editor */}
          <div className="space-y-5">
            {/* Title */}
            <input
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="Post title"
              className="w-full text-2xl font-bold bg-transparent border-0 outline-none placeholder:text-muted-foreground/40 text-foreground"
            />

            {/* Cover image */}
            <div className="relative">
              {form.cover_image_url ? (
                <div className="relative rounded-xl overflow-hidden group">
                  <img src={form.cover_image_url} alt="Cover" className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Button size="sm" variant="secondary" onClick={() => coverInputRef.current?.click()} disabled={uploadingCover}>
                      <Upload size={14} className="mr-1" /> Replace
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setForm(f => ({ ...f, cover_image_url: "" }))}>
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="w-full h-36 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-accent/50 hover:text-accent transition-colors"
                >
                  {uploadingCover ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent" />
                  ) : (
                    <>
                      <Upload size={24} />
                      <span className="text-sm">Upload cover image</span>
                    </>
                  )}
                </button>
              )}
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-muted/30">
              <button onClick={() => wrapSelection("**", "**")} className="p-2 rounded hover:bg-background text-muted-foreground hover:text-foreground transition-colors" title="Bold">
                <Bold size={16} />
              </button>
              <button onClick={() => insertAtCursor("\n## ")} className="p-2 rounded hover:bg-background text-muted-foreground hover:text-foreground transition-colors" title="Heading">
                <Heading2 size={16} />
              </button>
              <button onClick={() => insertAtCursor("\n- ")} className="p-2 rounded hover:bg-background text-muted-foreground hover:text-foreground transition-colors" title="List">
                <List size={16} />
              </button>
              <button onClick={() => wrapSelection("[", "](https://)")} className="p-2 rounded hover:bg-background text-muted-foreground hover:text-foreground transition-colors" title="Link">
                <Link2 size={16} />
              </button>
              <div className="w-px h-5 bg-border mx-1" />
              <button onClick={() => inlineInputRef.current?.click()} disabled={uploadingInline} className="p-2 rounded hover:bg-background text-muted-foreground hover:text-foreground transition-colors" title="Insert image">
                {uploadingInline ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent" /> : <ImageIcon size={16} />}
              </button>
              <button onClick={insertYouTube} className="p-2 rounded hover:bg-background text-muted-foreground hover:text-foreground transition-colors" title="YouTube video">
                <Youtube size={16} />
              </button>
              <div className="flex-1" />
              <button onClick={() => setPreview(!preview)} className={`p-2 rounded transition-colors ${preview ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground hover:bg-background"}`} title="Preview">
                <Eye size={16} />
              </button>
            </div>
            <input ref={inlineInputRef} type="file" accept="image/*" className="hidden" onChange={handleInlineImageUpload} />

            {/* Content area */}
            {preview ? (
              <div className="border border-border rounded-xl p-6 min-h-[400px] prose prose-sm max-w-none bg-background" dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(form.content) }} />
            ) : (
              <Textarea
                ref={contentRef}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                rows={20}
                placeholder="Write your article here... Use Markdown for formatting.

## Heading
**Bold text**
- List item
[Link text](https://url.com)

Click the image or YouTube icons in the toolbar to embed media."
                className="font-mono text-sm resize-none min-h-[400px] border-border"
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="border border-border rounded-xl p-4 space-y-4 bg-card">
              <h3 className="font-semibold text-sm text-foreground">Post Settings</h3>

              <div>
                <Label className="text-xs text-muted-foreground">Slug</Label>
                <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="url-slug" className="mt-1 h-8 text-sm" />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Category</Label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="mt-1 w-full h-8 text-sm rounded-md border border-input bg-background px-3 text-foreground"
                >
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Author</Label>
                <Input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} className="mt-1 h-8 text-sm" />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Excerpt</Label>
                <Textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={3} placeholder="Brief summary shown in listings..." className="mt-1 text-sm" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <Label className="text-sm">Published</Label>
                <Switch checked={form.published} onCheckedChange={v => setForm(f => ({ ...f, published: v }))} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========= LIST VIEW =========
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Blog Posts</h2>
        <div className="flex items-center gap-2">
          {posts.length === 0 && (
            <Button size="sm" variant="outline" onClick={seedSamplePosts} className="gap-1.5">
              Seed Sample Posts
            </Button>
          )}
          <Button size="sm" onClick={openNew} className="gap-1.5">
            <Plus size={14} /> New Post
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs">Title</TableHead>
                <TableHead className="text-muted-foreground text-xs">Category</TableHead>
                <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                <TableHead className="text-muted-foreground text-xs">Date</TableHead>
                <TableHead className="text-muted-foreground text-xs w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map(p => (
                <TableRow key={p.id} className="border-border">
                  <TableCell className="font-medium text-sm text-foreground max-w-[300px] truncate">{p.title}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{p.category || "—"}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.published ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {p.published_at ? new Date(p.published_at).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}>
                        <Pencil size={13} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(p.id)}>
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {posts.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No posts yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default BlogManager;
