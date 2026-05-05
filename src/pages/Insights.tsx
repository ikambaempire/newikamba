import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ArrowRight, Clock } from "lucide-react";
import insight1 from "@/assets/insight-1.jpg";
import insight2 from "@/assets/insight-2.jpg";
import insight3 from "@/assets/insight-3.jpg";
import insight4 from "@/assets/insight-4.jpg";
import insight5 from "@/assets/insight-5.jpg";
import insight6 from "@/assets/insight-6.jpg";

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
  {
    id: "1",
    title: "The Rise of Africa's Creative Economy: Why Storytelling Is the New Currency",
    slug: "africa-creative-economy-storytelling",
    excerpt: "Africa's creative industries are projected to generate over $20B annually by 2030. Here's how brands, NGOs, and creators can position themselves at the center of this cultural and economic shift.",
    category: "Creative Economy",
    author: "iKAMBA Editorial",
    cover_image_url: insight6,
    published_at: "2026-04-22",
    content: "Africa's creative economy is no longer emerging — it has arrived. From Lagos to Kigali, Nairobi to Johannesburg, a new generation of filmmakers, designers, musicians, and digital creators is reshaping how the continent is seen and how it sees itself.\n\n## The numbers tell the story\n\nUNESCO estimates that the creative and cultural industries already contribute over 3% of global GDP and employ nearly 30 million people worldwide. In Africa specifically, projections suggest the sector could generate more than $20 billion annually and create 20 million jobs by 2030 if properly supported.\n\nNollywood alone produces around 2,500 films a year — making Nigeria the second-largest film industry in the world by volume. Afrobeats has crossed every cultural border imaginable, and African fashion houses are commanding runways in Paris, Milan, and New York.\n\n## Why this matters for brands and organizations\n\nFor too long, stories about Africa were told *about* Africa rather than *by* Africa. That is changing — and the brands that recognize this shift early will earn cultural relevance that money alone cannot buy.\n\nWorking with African creatives is no longer a CSR talking point. It is a competitive advantage. Local insight, authentic representation, and culturally fluent storytelling now drive measurable business outcomes: stronger brand affinity, deeper community trust, and content that travels.\n\n## What this means for iKAMBA's clients\n\nWe believe the next decade of African storytelling will be defined by three things: ownership, dignity, and craft. We help organizations show up in that space — not as outsiders looking in, but as partners contributing to a shared cultural moment.\n\nIf you are an NGO, a brand, or an institution looking to communicate with an African audience — or to bring African stories to a global one — the time to invest is now."
  },
  {
    id: "2",
    title: "Documentary Storytelling for NGOs: Turning Impact Reports into Movements",
    slug: "documentary-storytelling-ngos",
    excerpt: "Annual reports get filed away. Documentaries get shared. Here's how non-profits are using long-form storytelling to convert awareness into action — and donors into lifelong partners.",
    category: "Strategy",
    author: "iKAMBA Editorial",
    cover_image_url: insight2,
    published_at: "2026-03-30",
    content: "Most NGOs publish an annual report. Almost no one reads it. Meanwhile, a 12-minute documentary on the same programme can be shared a thousand times, screened at boardroom pitches, and quoted by journalists for years.\n\nThis is the difference between *reporting* impact and *communicating* it.\n\n## Why documentary works where statistics fail\n\nNeuroscience research consistently shows that the human brain processes narrative differently from data. Stories activate the same neural circuits as lived experience — meaning a well-told story doesn't just inform a donor, it makes them *feel* something. And feeling is what drives action.\n\nA Stanford study famously found that people remember stories up to 22 times more than facts presented alone.\n\n## The four ingredients of a documentary that moves people\n\n1. **A protagonist with agency** — not a victim, but a person navigating a real challenge\n2. **Specificity over scale** — one named family is more powerful than 'thousands affected'\n3. **Visible transformation** — show the before, the during, and the after\n4. **A clear call to action** — emotion without direction is wasted\n\n## Practical advice for programme teams\n\n- Start filming earlier than you think you need to. The most powerful footage is the footage from *before* the intervention.\n- Budget for translation and subtitling from day one.\n- Get community sign-off on the final cut. Always.\n- Plan distribution before you plan production. A film no one sees is not a film, it's a hard drive."
  },
  {
    id: "3",
    title: "Joy as a Creative Strategy: Why African Brands Are Winning by Showing Happiness",
    slug: "joy-as-creative-strategy",
    excerpt: "Decades of deficit-based imagery shaped the world's view of Africa. A new wave of creators is rewriting that visual language — and the data shows audiences are responding.",
    category: "Creative Direction",
    author: "iKAMBA Editorial",
    cover_image_url: insight3,
    published_at: "2026-03-12",
    content: "For half a century, the dominant visual language used to represent Africa abroad was built on suffering. Dust, hunger, conflict, and outstretched hands. It raised money, but it also raised a generation that misunderstands an entire continent.\n\nA new wave of African creators — photographers, directors, art directors, and stylists — is deliberately reversing that frame. Joy is now a creative strategy.\n\n## Joy is not naivety\n\nShowing joy doesn't mean ignoring hardship. It means refusing to reduce human beings to their worst day. It means trusting your audience to understand complexity.\n\nBrands like MTN, Trace, and Maisha Magic, and campaigns from organizations like the Mastercard Foundation, have demonstrated that joyful, dignified imagery outperforms deficit imagery on virtually every engagement metric — click-through, share rate, time-on-page, and brand recall.\n\n## Why it converts\n\nAudiences in 2026 are saturated. They scroll past anything that feels manipulative. Joyful imagery, when it is honest, cuts through because it is rare and because it respects the viewer.\n\nIt also respects the subject. And subjects who feel respected give better performances, refer their networks, and become long-term collaborators.\n\n## How to brief for joy without it feeling forced\n\n- Cast real people from real communities, not stock-style models\n- Shoot on location, in context, with natural light when possible\n- Capture in-between moments, not just the posed shot\n- Trust your subjects — the best smiles happen when the camera stops being the center of attention"
  },
  {
    id: "4",
    title: "The Economics of Creativity: How Smart Organizations Budget for Storytelling",
    slug: "economics-of-creativity",
    excerpt: "Most organizations underspend on storytelling and overspend on ads that no one remembers. Here's a framework for allocating creative budget the way the best-performing brands do.",
    category: "Strategy",
    author: "iKAMBA Editorial",
    cover_image_url: insight4,
    published_at: "2026-02-18",
    content: "If you ask a CFO to justify a paid media budget, they have a spreadsheet. If you ask them to justify a creative budget, they have a feeling. That asymmetry is why most organizations dramatically underinvest in the work that actually moves people.\n\n## The 60/40 problem\n\nThe IPA's long-running effectiveness research suggests that brands which split spend roughly 60% on long-term brand-building (often creative-led) and 40% on short-term activation outperform their peers on virtually every commercial metric over a 3-5 year horizon.\n\nMost organizations get this backwards. They pour budget into performance ads optimized for last-click attribution, then wonder why brand affinity is flat.\n\n## A simple framework for creative budgeting\n\n1. **Anchor pieces (40%)** — one or two flagship productions per year (a documentary, a hero film, a major photography series) that define the brand's visual identity\n2. **Always-on content (35%)** — consistent, lower-budget content that keeps the brand visible between anchor moments\n3. **Activation creative (15%)** — campaign-specific assets tied to launches, events, or appeals\n4. **Experimentation (10%)** — deliberate budget for trying new formats, new creators, new channels\n\n## What this looks like in practice\n\nA mid-sized NGO with a $200K annual content budget might commission one major documentary every 18 months ($80K), keep a quarterly photo essay and short-film cadence ($70K), produce campaign assets for two appeals ($30K), and reserve $20K for experimentation.\n\nThe organizations that win in 2026 aren't the ones with the biggest budgets. They are the ones with the clearest allocation logic."
  },
  {
    id: "5",
    title: "The Creator Economy Map: Where Creative Industries Actually Make Money",
    slug: "creator-economy-map",
    excerpt: "Film, music, fashion, gaming, software, advertising — the creative industries are bigger and more interconnected than most people realize. A practical map for organizations entering the space.",
    category: "Industry",
    author: "iKAMBA Editorial",
    cover_image_url: insight5,
    published_at: "2026-01-25",
    content: "Most people, when they hear 'creative industries,' picture a film set or a graphic designer at a laptop. The reality is much bigger — and much more economically significant.\n\n## The full map\n\nThe creative industries, as defined by UNESCO and the WIPO, span eleven core sectors:\n\n- Film, TV, and radio\n- Music and performing arts\n- Photography and visual arts\n- Publishing and journalism\n- Advertising and marketing\n- Architecture and interior design\n- Fashion and textiles\n- Software, gaming, and digital design\n- Crafts and product design\n- Cultural heritage and museums\n- R&D in creative technologies\n\nTogether, these sectors employ more people globally than the automotive and aerospace industries combined.\n\n## Where the value is moving\n\nThree shifts are reshaping the map in 2026:\n\n1. **From distribution to ownership** — creators are no longer just hired hands; they own IP, audiences, and increasingly, distribution channels\n2. **From single-format to multi-format** — a story now ships as a film, a podcast, a photo essay, and a social cut, all at once\n3. **From local to borderless** — a Kigali-based studio can serve a Berlin-based client on a Dubai-based campaign without anyone moving\n\n## What this means for organizations\n\nIf you only engage one slice of the creative industry — say, you only hire video production — you are leaving most of the value on the table. The organizations getting the most out of creative work are the ones treating it as an integrated practice: brand, photography, film, design, and digital, all moving in the same direction.\n\nThat is the model iKAMBA was built around."
  },
  {
    id: "6",
    title: "Immersive Storytelling: Why VR, AR, and Spatial Media Are the Next Frontier for Impact Communication",
    slug: "immersive-storytelling-frontier",
    excerpt: "Immersive media is no longer experimental. It is being used by the UN, the Red Cross, and leading brands to put audiences inside stories in ways traditional film cannot.",
    category: "Innovation",
    author: "iKAMBA Editorial",
    cover_image_url: insight1,
    published_at: "2026-01-08",
    content: "When the UN released *Clouds Over Sidra* — a six-minute VR documentary following a 12-year-old girl in a Syrian refugee camp — it changed how the development sector thought about storytelling. Donors who experienced the film in VR gave nearly twice as much as those who watched a flat-screen version.\n\nThat was 2015. The technology has only matured since.\n\n## What 'immersive' actually means in 2026\n\nImmersive storytelling is now a spectrum:\n\n- **360° video** — accessible on any phone, low production cost, high reach\n- **Volumetric capture** — full 3D recordings of people and spaces, viewable from any angle\n- **AR overlays** — digital layers placed on top of physical exhibitions, reports, or annual events\n- **Spatial audio documentaries** — increasingly powerful on AirPods, Vision Pro, and Quest devices\n\n## Where it's being used well\n\n- The ICRC uses VR to train field workers in conflict zones\n- The Mastercard Foundation has experimented with AR in donor reporting\n- WWF has used 360° film to put viewers inside endangered habitats\n- Brands like Nike have built spatial campaigns that double as flagship moments\n\n## When immersive is worth the investment\n\nImmersive media is not a fit for every brief. It works best when:\n\n1. The story is about *place* — somewhere the audience cannot easily go\n2. The story is about *perspective* — seeing through someone else's eyes is the point\n3. The audience is captive — a gala, an exhibition, a boardroom, a conference\n4. The budget can support both production and distribution hardware\n\nFor the right brief, nothing else creates the same depth of empathy. For the wrong brief, a great two-minute film will outperform an average VR experience every time.\n\n## The iKAMBA view\n\nWe see immersive as one tool in a much larger storytelling toolkit. We use it when the brief calls for it — and we are honest with clients when it doesn't. The goal is always the same: move the audience, honor the subject, deliver the outcome."
  },
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
        <div className="max-w-6xl mx-auto px-6 pb-20">
          {/* Featured post */}
          {featured && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Link to={`/insights/${featured.slug}`} className="block group mb-12">
                <article className="bg-card border border-border rounded-xl overflow-hidden shadow-[0_4px_24px_hsl(var(--foreground)/0.06)] hover:shadow-[0_16px_48px_hsl(var(--foreground)/0.12)] transition-all duration-500 md:grid md:grid-cols-[1.08fr_0.92fr]">
                  {featured.cover_image_url && (
                    <div className="aspect-[16/10] md:aspect-auto overflow-hidden bg-secondary">
                      <img src={featured.cover_image_url} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  )}
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
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
                    <h2 className="text-2xl md:text-3xl font-extrabold leading-tight mb-3 text-foreground group-hover:text-accent transition-colors">{featured.title}</h2>
                    <p className="text-muted-foreground leading-7 mb-5">{featured.excerpt}</p>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent group-hover:gap-3 transition-all">
                      Read Article <ArrowRight size={16} />
                    </span>
                  </div>
                </article>
              </Link>
            </motion.div>
          )}

          {/* Rest of posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {rest.map((post, i) => (
              <motion.div key={post.id} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
                <Link to={`/insights/${post.slug}`} className="block group h-full">
                  <article className="bg-card border border-border rounded-xl overflow-hidden shadow-[0_2px_12px_hsl(var(--foreground)/0.04)] hover:shadow-[0_12px_40px_hsl(var(--foreground)/0.1)] hover:border-accent/30 transition-all duration-300 h-full flex flex-col">
                    {post.cover_image_url && (
                      <div className="aspect-[16/9] overflow-hidden bg-secondary">
                        <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="text-[10px] uppercase tracking-widest text-accent font-semibold">{post.category}</span>
                        <span className="text-[10px] text-muted-foreground">{post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : ""}</span>
                        <span className="text-[10px] text-muted-foreground">{estimateReadTime(post.content)} min</span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground leading-snug mb-2 group-hover:text-accent transition-colors">{post.title}</h3>
                      <p className="text-sm text-muted-foreground leading-6 line-clamp-3 mb-4">{post.excerpt}</p>
                      <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-accent">Read Article <ArrowRight size={15} /></span>
                    </div>
                  </article>
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
