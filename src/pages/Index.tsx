import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight, FileText, Video, Target, FolderOpen,
  Camera, Film, Clapperboard, Aperture, Focus, MonitorPlay,
  Mic, Headphones, Radio, Tv, Projector, Podcast, ScanLine,
  CheckCircle2, Image, Megaphone, Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrustedBySlider from "@/components/home/TrustedBySlider";
import Card3D from "@/components/home/Card3D";
import HeroBackgroundVideo from "@/components/home/HeroBackgroundVideo";

import storytellingCommunity from "@/assets/images/storytelling-community.jpg";
import impactCampaign from "@/assets/images/impact-campaign.jpg";
import photographyLandscape from "@/assets/images/photography-landscape.jpg";
import heroDocumentary from "@/assets/images/hero-documentary.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const heroIcons = [
  { Icon: Camera, x: "5%", y: "10%", size: 28, delay: 0, dur: 6 },
  { Icon: Film, x: "18%", y: "5%", size: 22, delay: 0.8, dur: 7 },
  { Icon: Clapperboard, x: "32%", y: "14%", size: 24, delay: 0.4, dur: 5.5 },
  { Icon: Video, x: "48%", y: "8%", size: 20, delay: 1.2, dur: 6.5 },
  { Icon: Aperture, x: "62%", y: "12%", size: 28, delay: 0.6, dur: 7.5 },
  { Icon: MonitorPlay, x: "78%", y: "6%", size: 22, delay: 1.5, dur: 6 },
  { Icon: Mic, x: "90%", y: "14%", size: 20, delay: 0.3, dur: 5 },
  { Icon: Focus, x: "7%", y: "38%", size: 22, delay: 1, dur: 8 },
  { Icon: Headphones, x: "20%", y: "48%", size: 24, delay: 0.5, dur: 6 },
  { Icon: Projector, x: "40%", y: "42%", size: 22, delay: 1.8, dur: 7 },
  { Icon: Radio, x: "58%", y: "46%", size: 20, delay: 0.7, dur: 5.5 },
  { Icon: ScanLine, x: "72%", y: "36%", size: 26, delay: 1.3, dur: 6.5 },
  { Icon: Podcast, x: "88%", y: "44%", size: 20, delay: 0.2, dur: 7.5 },
  { Icon: Tv, x: "94%", y: "55%", size: 22, delay: 1.6, dur: 6 },
  { Icon: Camera, x: "10%", y: "72%", size: 24, delay: 0.9, dur: 5.5 },
  { Icon: Film, x: "25%", y: "80%", size: 20, delay: 1.4, dur: 7 },
  { Icon: Clapperboard, x: "42%", y: "68%", size: 26, delay: 0.1, dur: 6 },
  { Icon: Video, x: "56%", y: "76%", size: 22, delay: 2, dur: 8 },
  { Icon: Aperture, x: "70%", y: "70%", size: 24, delay: 0.6, dur: 5 },
  { Icon: MonitorPlay, x: "84%", y: "78%", size: 22, delay: 1.1, dur: 6.5 },
];

const solutions = [
  { icon: Film, title: "Documentary Production", desc: "Short documentaries highlighting real stories, community impact, and organizational achievements.", image: storytellingCommunity },
  { icon: Video, title: "Video Production", desc: "Professional video for campaigns, programs, interviews, and events.", image: impactCampaign },
  { icon: Image, title: "Photography", desc: "High-quality photography capturing communities, initiatives, and leadership stories.", image: photographyLandscape },
  { icon: Megaphone, title: "Campaign Storytelling", desc: "Visual storytelling designed for advocacy campaigns and communication initiatives.", image: heroDocumentary },
];

const processSteps = [
  { icon: Target, title: "Strategy", desc: "We understand your communication goals and identify the stories that matter most." },
  { icon: Video, title: "Production", desc: "Our team manages filming, photography, and editing with structured workflows." },
  { icon: FolderOpen, title: "Delivery", desc: "Final storytelling assets delivered ready for campaigns, reports, and digital platforms." },
];

const whoWeWorkWith = [
  "NGOs and nonprofit organizations",
  "Development agencies and foundations",
  "Corporate communication teams",
  "Government institutions",
  "Social enterprises",
];

const challenges = [
  {
    number: "01",
    title: "Inconsistent Brand Storytelling",
    desc: "Your brand story changes depending on who tells it — different teams, agencies, and freelancers produce fragmented content that dilutes your message.",
    stat: "73%",
    statLabel: "of audiences distrust inconsistent brands",
  },
  {
    number: "02",
    title: "Slow & Expensive Production",
    desc: "Traditional production workflows involve weeks of back-and-forth, hidden costs, and unpredictable timelines that drain budgets and delay campaigns.",
    stat: "6-8wks",
    statLabel: "average production cycle",
  },
  {
    number: "03",
    title: "No Central Content Hub",
    desc: "Media assets scattered across drives, emails, and platforms make it impossible to find, reuse, or repurpose existing content efficiently.",
    stat: "65%",
    statLabel: "of content never gets reused",
  },
  {
    number: "04",
    title: "Stories That Don't Convert",
    desc: "Beautiful videos and photos that fail to drive action. Without strategic storytelling, content becomes decoration instead of a growth engine.",
    stat: "2x",
    statLabel: "higher engagement with story-driven content",
  },
  {
    number: "05",
    title: "Scaling Content Across Regions",
    desc: "Operating in multiple markets means adapting stories for local audiences — but most organizations lack the infrastructure to produce at scale.",
    stat: "100+",
    statLabel: "countries need localized content",
  },
  {
    number: "06",
    title: "Measuring Impact Is Guesswork",
    desc: "Without clear metrics and feedback loops, organizations can't tell which stories resonate, making it impossible to optimize future campaigns.",
    stat: "40%",
    statLabel: "of teams lack content performance data",
  },
];

const FeaturedInsights = () => {
  const [posts, setPosts] = useState<{ id: string; title: string; slug: string; excerpt: string | null; category: string | null; cover_image_url: string | null; published_at: string | null }[]>([]);
  useEffect(() => {
    supabase.from("blog_posts").select("id, title, slug, excerpt, category, cover_image_url, published_at").eq("published", true).order("published_at", { ascending: false }).limit(3).then(({ data }) => { if (data) setPosts(data); });
  }, []);
  if (posts.length === 0) return null;
  return (
    <section className="section-padding bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Latest Insights</h2>
            <p className="text-muted-foreground mt-1">Stories, strategies, and lessons from impact storytelling.</p>
          </motion.div>
          <Link to="/insights" className="hidden sm:inline-flex items-center gap-1 text-sm text-accent hover:underline font-medium">View all <ArrowRight size={14} /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <motion.div key={post.id} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 1}>
              <Link to={`/insights/${post.slug}`} className="group block">
                <div className="rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition-shadow">
                  {post.cover_image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                  )}
                  <div className="p-5">
                    {post.category && <span className="text-[10px] uppercase tracking-widest text-accent font-semibold">{post.category}</span>}
                    <h3 className="font-bold mt-1 mb-2 text-foreground group-hover:text-accent transition-colors line-clamp-2">{post.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link to="/insights" className="text-sm text-accent hover:underline font-medium inline-flex items-center gap-1">View all insights <ArrowRight size={14} /></Link>
        </div>
      </div>
    </section>
  );
};

const typewriterWords = ["Storytelling", "Documentaries", "Campaigns", "Photography"];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero with background video */}
      <section className="section-padding pt-28 pb-20 sm:pt-32 sm:pb-24 md:pt-40 md:pb-32 relative overflow-hidden">
        <HeroBackgroundVideo />

        {heroIcons.map(({ Icon, x, y, size, delay, dur }, i) => (
          <motion.div
            key={i}
            className="absolute pointer-events-none text-white"
            style={{ left: x, top: y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.12, 0.06, 0.12, 0],
              scale: [0.6, 1, 1.15, 1, 0.6],
              y: [0, -8, 0, 8, 0],
              rotate: [0, 6, -4, 3, 0],
            }}
            transition={{ duration: dur, delay, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon size={size} strokeWidth={1.5} />
          </motion.div>
        ))}

        <motion.div
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-[1]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="absolute w-[600px] h-[2px] bg-gradient-to-r from-transparent via-accent/30 to-transparent"
            style={{ top: "30%", left: "-300px", rotate: "-12deg" }}
            animate={{ x: ["-300px", "calc(100vw + 300px)"] }}
            transition={{ duration: 4, delay: 1, repeat: Infinity, repeatDelay: 8, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none z-[1]"
          style={{ background: "radial-gradient(circle, hsl(38 92% 50% / 0.08) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            className="hidden md:block absolute -top-6 -left-8 w-16 h-16 border-l-2 border-t-2 border-accent/40 rounded-tl-sm"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          />
          <motion.div
            className="hidden md:block absolute -bottom-6 -right-8 w-16 h-16 border-r-2 border-b-2 border-accent/40 rounded-br-sm"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          />

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-6"
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-accent"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
              Impact Storytelling & Media Production
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] as const }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.08] text-white mb-6 text-balance drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
          >
            {"Powerful ".split("").map((char, i) => (
              <motion.span
                key={`p-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.04, duration: 0.3 }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
            <motion.span
              className="inline-block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              {typewriterWords.map((word, wi) => (
                <motion.span
                  key={word}
                  className="absolute text-accent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    y: [20, 0, 0, -20],
                  }}
                  transition={{
                    duration: 3,
                    delay: 0.8 + wi * 3,
                    repeat: Infinity,
                    repeatDelay: (typewriterWords.length - 1) * 3,
                    ease: "easeInOut",
                    times: [0, 0.1, 0.9, 1],
                  }}
                >
                  {word}
                </motion.span>
              ))}
              <span className="invisible">{typewriterWords[0]}</span>
            </motion.span>
            {" for Organizations That Create Impact.".split("").map((char, i) => (
              <motion.span
                key={`s-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + i * 0.02, duration: 0.3 }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 1.8 }}
            className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed mb-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
          >
            Ikamba helps NGOs, development organizations, and corporate teams produce powerful storytelling through documentary production, video, and photography.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.0 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link to="/start-a-project">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button variant="hero" size="lg">
                  Start a Project <ArrowRight className="ml-1" size={16} />
                </Button>
              </motion.div>
            </Link>
            <Link to="/design-studio">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button variant="outline" size="lg" className="font-semibold border-white/30 bg-white text-primary hover:bg-white/90">
                  ✨ Free AI Creative Tools
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trusted By */}
      <TrustedBySlider />

      {/* The Challenge */}
      <section className="section-padding gradient-navy text-white">
        <div className="max-w-5xl mx-auto">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} custom={0}
            className="text-2xl md:text-3xl font-bold mb-4 text-white">
            The Challenge
          </motion.h2>
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} custom={1}
            className="text-white/70 mb-10 max-w-xl text-lg">
            Many organizations struggle to manage storytelling and media production.
          </motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((text, i) => (
              <Card3D key={i} className="group">
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 2}
                  className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/10 h-full hover:bg-white/15 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center mb-3">
                    <span className="text-accent font-bold text-sm">{i + 1}</span>
                  </div>
                  <p className="text-sm text-white/90 leading-relaxed">{text}</p>
                </motion.div>
              </Card3D>
            ))}
          </div>
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={8}
            className="text-white/60 mt-8 text-base">
            As a result, important stories often remain undocumented.
          </motion.p>
        </div>
      </section>

      {/* Our Solutions with images */}
      <section className="section-padding bg-secondary">
        <div className="max-w-5xl mx-auto">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} custom={0}
            className="text-2xl md:text-3xl font-bold mb-3 text-foreground">Our Solutions</motion.h2>
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} custom={1}
            className="text-muted-foreground mb-12 max-w-xl text-lg">
            Ikamba Media provides a structured approach to storytelling and media production.
          </motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {solutions.map((s, i) => (
              <Card3D key={i} className="group">
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 2}
                  className="bg-card border border-border rounded-xl overflow-hidden h-full shadow-[0_2px_12px_hsl(var(--foreground)/0.04)] hover:shadow-[0_12px_40px_hsl(var(--foreground)/0.1)] hover:border-accent/30 transition-all duration-300">
                  <div className="h-48 overflow-hidden">
                    <img src={s.image} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-8">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                      <s.icon className="text-accent" size={24} />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              </Card3D>
            ))}
          </div>
          <div className="mt-10">
            <Link to="/solutions">
              <Button variant="outline" size="sm" className="font-semibold border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                View All Solutions <ArrowRight className="ml-1" size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Work with images */}
      <section className="section-padding">
        <div className="max-w-5xl mx-auto">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} custom={0}
            className="text-2xl md:text-3xl font-bold mb-3 text-foreground">Featured Work</motion.h2>
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} custom={1}
            className="text-muted-foreground mb-10 max-w-xl text-lg">
            Our storytelling work captures real stories that communicate impact and inspire action.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Documentary Storytelling", desc: "Real stories from the field, produced with cinematic quality.", image: storytellingCommunity },
              { title: "Impact Campaigns", desc: "Visual campaigns that amplify organizational missions.", image: impactCampaign },
              { title: "Photography Stories", desc: "Authentic photography that captures leadership and community.", image: photographyLandscape },
            ].map((item, i) => (
              <Card3D key={i} className="group">
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 2}
                  className="rounded-xl overflow-hidden h-full shadow-[0_4px_20px_hsl(var(--foreground)/0.1)] hover:shadow-[0_12px_40px_hsl(var(--foreground)/0.15)] transition-shadow">
                  <div className="h-44 overflow-hidden relative">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                  </div>
                  <div className="bg-primary text-primary-foreground p-6">
                    <h3 className="text-base font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-primary-foreground/60 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              </Card3D>
            ))}
          </div>
          <div className="mt-10">
            <Link to="/work">
              <Button variant="outline" size="sm" className="font-semibold border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                Explore Our Work <ArrowRight className="ml-1" size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding gradient-navy text-white">
        <div className="max-w-5xl mx-auto">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} custom={0}
            className="text-2xl md:text-3xl font-bold mb-3 text-white">How It Works</motion.h2>
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} custom={1}
            className="text-white/70 mb-12 max-w-xl text-lg">
            Our simple process makes storytelling production easier for communication teams.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {processSteps.map((step, i) => (
              <Card3D key={i} className="group">
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 2}
                  className="relative bg-white/10 backdrop-blur rounded-xl p-8 border border-white/10 h-full hover:bg-white/15 transition-all duration-300">
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold text-sm shadow-lg">
                    {i + 1}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 mt-2">
                    <step.icon className="text-accent" size={24} />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">{step.title}</h3>
                    <p className="text-sm text-white/70 leading-relaxed">{step.desc}</p>
                </motion.div>
              </Card3D>
            ))}
          </div>
          <div className="mt-10">
            <Link to="/how-it-works">
              <Button variant="outline" size="sm" className="font-semibold border-white/30 text-white hover:bg-white/10">
                Learn More <ArrowRight className="ml-1" size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Insights */}
      <FeaturedInsights />

      {/* Who We Work With - with background image */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={photographyLandscape} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/90" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10 text-primary-foreground">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} custom={0}
            className="text-2xl md:text-3xl font-bold mb-8">
            Who We Work With
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {whoWeWorkWith.map((org, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 1}
                className="flex gap-3 items-center bg-white/5 border border-white/10 rounded-lg px-5 py-4">
                <Users className="text-accent shrink-0" size={18} />
                <p className="text-sm text-white/80">{org}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-background text-center">
        <div className="max-w-3xl mx-auto">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} custom={0}
            className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
            Let's Tell Your Story
          </motion.h2>
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} custom={1}
            className="text-muted-foreground mb-8 max-w-xl mx-auto text-lg">
            If your organization wants to communicate its work through powerful storytelling, we would love to collaborate.
          </motion.p>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
            className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/start-a-project">
              <Button variant="hero" size="lg">
                Start a Project <ArrowRight className="ml-1" size={16} />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="font-semibold">
                Book Consultation
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
