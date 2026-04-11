import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight, ChevronLeft, ExternalLink, Sparkles,
  Video, Image, Wand2, Paintbrush, Film, Music, Type, Layers3, Palette, Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const tools = [
  {
    category: "Video Generation",
    icon: Video,
    color: "from-purple-500 to-indigo-600",
    items: [
      { name: "Google Veo", desc: "Generate cinematic AI videos from text prompts", url: "https://deepmind.google/technologies/veo/", tag: "Popular" },
      { name: "Runway Gen-3", desc: "Professional AI video generation & editing", url: "https://runwayml.com/", tag: "Pro" },
      { name: "Pika", desc: "Creative AI video with motion control", url: "https://pika.art/", tag: "Free Tier" },
      { name: "Kling AI", desc: "High-quality video generation with lip-sync", url: "https://klingai.com/", tag: "New" },
    ],
  },
  {
    category: "Image Generation",
    icon: Image,
    color: "from-amber-500 to-orange-600",
    items: [
      { name: "Midjourney", desc: "Premium AI art with stunning photorealism", url: "https://www.midjourney.com/", tag: "Best Quality" },
      { name: "DALL·E 3", desc: "OpenAI's powerful image generator", url: "https://openai.com/dall-e-3", tag: "Popular" },
      { name: "Leonardo AI", desc: "AI art with fine-tuned creative control", url: "https://leonardo.ai/", tag: "Free Tier" },
      { name: "Ideogram", desc: "AI images with perfect text rendering", url: "https://ideogram.ai/", tag: "Text" },
    ],
  },
  {
    category: "Design & Graphics",
    icon: Paintbrush,
    color: "from-pink-500 to-rose-600",
    items: [
      { name: "Canva AI", desc: "Design anything with Magic Studio tools", url: "https://www.canva.com/", tag: "All-in-One" },
      { name: "Adobe Firefly", desc: "Creative AI integrated with Adobe suite", url: "https://www.adobe.com/products/firefly.html", tag: "Pro" },
      { name: "Figma AI", desc: "AI-powered design & prototyping", url: "https://www.figma.com/", tag: "Teams" },
      { name: "Looka", desc: "AI-powered logo & brand identity", url: "https://looka.com/", tag: "Branding" },
    ],
  },
  {
    category: "Audio & Music",
    icon: Music,
    color: "from-emerald-500 to-teal-600",
    items: [
      { name: "Suno AI", desc: "Generate full songs from text prompts", url: "https://suno.com/", tag: "Popular" },
      { name: "ElevenLabs", desc: "Realistic AI voice generation & cloning", url: "https://elevenlabs.io/", tag: "Voice" },
      { name: "Udio", desc: "Create professional music with AI", url: "https://www.udio.com/", tag: "Music" },
      { name: "Adobe Podcast", desc: "AI-powered audio enhancement", url: "https://podcast.adobe.com/", tag: "Free" },
    ],
  },
  {
    category: "Writing & Content",
    icon: Type,
    color: "from-blue-500 to-cyan-600",
    items: [
      { name: "ChatGPT", desc: "Versatile AI assistant for any content", url: "https://chat.openai.com/", tag: "Essential" },
      { name: "Claude", desc: "Thoughtful AI for research & long content", url: "https://claude.ai/", tag: "Research" },
      { name: "Jasper", desc: "Marketing-focused AI copywriting", url: "https://www.jasper.ai/", tag: "Marketing" },
      { name: "Copy.ai", desc: "AI-powered sales & marketing copy", url: "https://www.copy.ai/", tag: "Free Tier" },
    ],
  },
  {
    category: "Presentation & Motion",
    icon: Layers3,
    color: "from-violet-500 to-purple-600",
    items: [
      { name: "Gamma", desc: "AI-powered presentations & documents", url: "https://gamma.app/", tag: "Popular" },
      { name: "Luma Dream Machine", desc: "Generate 3D scenes from text & images", url: "https://lumalabs.ai/", tag: "3D" },
      { name: "D-ID", desc: "AI-powered talking avatar videos", url: "https://www.d-id.com/", tag: "Avatars" },
      { name: "HeyGen", desc: "AI video creation with digital avatars", url: "https://www.heygen.com/", tag: "Business" },
    ],
  },
];

const DesignStudio = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-20 section-padding relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(38 92% 50% / 0.1) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Free Creative Toolkit</span>
          </motion.div>

          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-5 leading-tight">
            All The <span className="text-accent">Creative Tools</span><br />You'll Ever Need
          </motion.h1>

          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-8">
            A curated collection of the world's best AI-powered creative tools — for video, images, design, audio, writing, and more. One place, zero friction.
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="flex flex-wrap justify-center gap-3">
            <Link to="/caption-generator">
              <Button variant="hero" size="lg">
                <Wand2 className="w-4 h-4 mr-2" /> AI Caption Generator
              </Button>
            </Link>
            <Link to="/start-a-project">
              <Button variant="hero-outline" size="lg">
                Start a Project <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="section-padding bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-16">
            {tools.map((cat, ci) => (
              <motion.div key={cat.category} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg`}>
                    <cat.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground">{cat.category}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {cat.items.map((tool, ti) => (
                    <motion.a
                      key={tool.name}
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      custom={ti + 1}
                      className="group relative bg-card border border-border rounded-xl p-5 hover:shadow-[0_8px_30px_hsl(var(--foreground)/0.1)] hover:border-accent/30 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-foreground group-hover:text-accent transition-colors">{tool.name}</h3>
                        <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{tool.desc}</p>
                      <span className={`inline-block text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${cat.color} text-primary-foreground`}>
                        {tool.tag}
                      </span>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-secondary text-center">
        <div className="max-w-3xl mx-auto">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
            className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Need Custom Content Production?
          </motion.h2>
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
            className="text-muted-foreground mb-8 text-lg">
            While AI tools are great for quick creative work, nothing beats professional storytelling. Let Ikamba bring your vision to life.
          </motion.p>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
            className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/start-a-project">
              <Button variant="hero" size="lg">Start a Project <ArrowRight className="ml-2 w-4 h-4" /></Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="font-semibold">Book Consultation</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DesignStudio;
