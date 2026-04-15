import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight, FileText, Video, Target, FolderOpen,
  Camera, Film, Image, Megaphone, Users, CheckCircle2,
  Clapperboard, Aperture, Focus, MonitorPlay, Mic, Headphones, Radio, Tv, Projector, Podcast, ScanLine,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrustedBySlider from "@/components/home/TrustedBySlider";
import Card3D from "@/components/home/Card3D";
import HeroBackgroundVideo from "@/components/home/HeroBackgroundVideo";
import SlicedImageCarousel from "@/components/home/SlicedImageCarousel";

// Real Unsplash photos
const storytellingCommunity = "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=800&q=80";
const impactCampaign = "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80";
const photographyLandscape = "https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=800&q=80";
const heroDocumentary = "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&q=80";
const workDocumentary = "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80";
const workCampaign = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80";
const workPhotography = "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&q=80";

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const solutions = [
  { icon: Film, title: "Documentary & Impact Films", desc: "High-quality documentaries and storytelling films for NGOs, foundations, and development partners.", image: storytellingCommunity },
  { icon: Video, title: "Corporate Brand Videos", desc: "Brand stories, company profiles, and campaign videos designed to position organizations at a global standard.", image: impactCampaign },
  { icon: Camera, title: "Event Coverage & Livestreaming", desc: "Professional coverage for conferences, summits, launches, workshops, and institutional events.", image: photographyLandscape },
  { icon: Megaphone, title: "Social Media Content", desc: "Short-form videos, reels, campaign edits, and digital storytelling assets tailored for engagement and visibility.", image: heroDocumentary },
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
  "Creative talents",
];

const challenges = [
  {
    number: "01",
    title: "Low Engagement",
    desc: "Content fails to capture attention or build the emotional connection needed to move audiences.",
    stat: "82%",
    statLabel: "of content gets ignored",
  },
  {
    number: "02",
    title: "Unclear Impact",
    desc: "Projects, outcomes, and achievements are not translated into strong visual stories people can understand quickly.",
    stat: "3sec",
    statLabel: "average attention span",
  },
  {
    number: "03",
    title: "Weak Storytelling",
    desc: "Messages often lack structure, cinematic quality, and emotional depth, which reduces credibility and reach.",
    stat: "65%",
    statLabel: "of stories fail to convert",
  },
];

const extendedCapabilities = [
  "Campaign Strategy & Story Development",
  "Scriptwriting & Creative Direction",
  "Drone & Aerial Coverage",
  "Livestream & Hybrid Event Production",
  "Monitoring & Evaluation Storytelling",
  "Impact Reporting Videos",
  "Annual Report Visual Content",
  "Website & Campaign Photography",
];

const servicesList = [
  { icon: Film, title: "Documentary & Impact Films", desc: "High-quality documentaries and storytelling films for NGOs, foundations, and development partners." },
  { icon: Video, title: "Corporate Brand Videos", desc: "Brand stories, company profiles, and campaign videos designed to position organizations at a global standard." },
  { icon: Camera, title: "Event Coverage & Livestreaming", desc: "Professional coverage for conferences, summits, launches, workshops, and institutional events." },
  { icon: Users, title: "Interviews & Testimonials", desc: "Executive interviews, beneficiary stories, case studies, and stakeholder testimonials crafted with clarity and emotion." },
  { icon: Megaphone, title: "Social Media Content", desc: "Short-form videos, reels, campaign edits, and digital storytelling assets tailored for engagement and visibility." },
  { icon: Image, title: "Photography for Organizations", desc: "Corporate, documentary, event, and editorial photography aligned with your identity and communication goals." },
];

/* Hero floating image cards */
const heroCards = [
  { image: workDocumentary, rotate: -6, x: 0, y: 0, scale: 1 },
  { image: storytellingCommunity, rotate: 3, x: 60, y: -20, scale: 0.92 },
  { image: workCampaign, rotate: -3, x: 20, y: 80, scale: 0.88 },
  { image: impactCampaign, rotate: 5, x: 80, y: 60, scale: 0.85 },
  { image: workPhotography, rotate: -2, x: -10, y: 160, scale: 0.9 },
];

/* Featured Work cards for carousel */
const featuredWork = [
  { title: "Documentary Storytelling", category: "DOCUMENTARY", desc: "Real stories from the field, produced with cinematic quality.", image: storytellingCommunity, stat: "45K+ Views" },
  { title: "Impact Campaigns", category: "CAMPAIGN", desc: "Visual campaigns that amplify organizational missions.", image: impactCampaign, stat: "200K+ Reach" },
  { title: "Photography Stories", category: "PHOTOGRAPHY", desc: "Authentic photography that captures leadership and community.", image: photographyLandscape, stat: "50+ Projects" },
  { title: "Youth Entrepreneurship", category: "DOCUMENTARY", desc: "How young entrepreneurs are reshaping local economies across East Africa.", image: workDocumentary, stat: "3 Conferences" },
  { title: "Climate Action Kigali", category: "CAMPAIGN", desc: "Multi-format campaign content for a regional climate conference.", image: workCampaign, stat: "12 Assets" },
  { title: "Education Access", category: "PHOTOGRAPHY", desc: "Photographic documentation of education programs reaching underserved communities.", image: workPhotography, stat: "Annual Report" },
];

const fallbackInsights = [
  { id: "1", title: "The Power of Documentary Storytelling for NGOs", slug: "documentary-storytelling-ngos", excerpt: "How documentary-style content helps non-profits communicate impact authentically and connect with donors on a deeper level.", category: "Strategy", cover_image_url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80", published_at: "2026-03-15" },
  { id: "2", title: "5 Visual Strategies That Drive Donor Engagement", slug: "visual-strategies-donor-engagement", excerpt: "Proven approaches to creating compelling visual content that moves stakeholders from awareness to action.", category: "Impact", cover_image_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80", published_at: "2026-02-28" },
  { id: "3", title: "Behind the Lens: Ethical Storytelling in Development", slug: "ethical-storytelling-development", excerpt: "Balancing powerful narratives with dignity and respect when documenting communities and social impact work.", category: "Production", cover_image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80", published_at: "2026-01-20" },
];

const FeaturedInsights = () => {
  const [posts, setPosts] = useState<{ id: string; title: string; slug: string; excerpt: string | null; category: string | null; cover_image_url: string | null; published_at: string | null }[]>(fallbackInsights);
  useEffect(() => {
    supabase.from("blog_posts").select("id, title, slug, excerpt, category, cover_image_url, published_at").eq("published", true).order("published_at", { ascending: false }).limit(3).then(({ data }) => { if (data && data.length > 0) setPosts(data); });
  }, []);
  return (
    <section className="section-padding bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground">Latest Insights</h2>
            <p className="text-muted-foreground mt-1">Stories, strategies, and lessons from strategic storytelling.</p>
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

/* Featured Work Carousel - 90seconds Self Serve Creation style */
const FeaturedWorkCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % featuredWork.length);
    }, 3500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <section className="section-padding bg-background overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
            className="text-xs uppercase tracking-[0.25em] font-semibold text-muted-foreground mb-3">
            Featured Work
          </motion.p>
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-foreground">
            Real stories from real organizations
          </motion.h2>
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
            className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Our storytelling work captures authentic narratives that communicate impact and inspire action.
          </motion.p>
        </div>

        {/* Carousel container */}
        <div className="relative flex items-center justify-center h-[420px] md:h-[480px]">
          {featuredWork.map((item, i) => {
            const offset = i - activeIndex;
            const absOffset = Math.abs(offset);
            const isActive = offset === 0;
            const isVisible = absOffset <= 2;
            if (!isVisible) return null;

            return (
              <motion.div
                key={i}
                className="absolute cursor-pointer"
                onClick={() => {
                  setActiveIndex(i);
                  if (intervalRef.current) clearInterval(intervalRef.current);
                }}
                animate={{
                  x: offset * 220,
                  scale: isActive ? 1 : 0.82 - absOffset * 0.06,
                  zIndex: 10 - absOffset,
                  opacity: isActive ? 1 : 0.5 - absOffset * 0.15,
                  rotateY: offset * -8,
                }}
                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                style={{ perspective: 1000 }}
              >
                <div className={`relative w-[280px] md:w-[320px] h-[380px] md:h-[420px] rounded-2xl overflow-hidden shadow-2xl ${isActive ? 'ring-2 ring-accent/50' : ''}`}>
                  <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="text-[9px] uppercase tracking-[0.2em] bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full font-semibold">
                      {item.category}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-white/70 mb-2"
                      >
                        {item.desc}
                      </motion.p>
                    )}
                    <span className="text-xs font-semibold text-accent">{item.stat}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {featuredWork.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveIndex(i);
                if (intervalRef.current) clearInterval(intervalRef.current);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'bg-accent w-6' : 'bg-muted-foreground/30'}`}
            />
          ))}
        </div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={7}
          className="mt-10 text-center">
          <Link to="/work">
            <Button variant="outline" size="sm" className="font-semibold border-border text-foreground hover:bg-accent hover:text-accent-foreground">
              Explore Our Work <ArrowRight className="ml-1" size={14} />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

const carouselImages = [
  { src: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&q=80", alt: "Film crew on location", caption: "Documentary Production" },
  { src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80", alt: "Conference event coverage", caption: "Event Coverage" },
  { src: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=800&q=80", alt: "Community storytelling", caption: "Community Stories" },
  { src: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&q=80", alt: "Professional photography session", caption: "Brand Photography" },
  { src: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80", alt: "Video production setup", caption: "Visual Storytelling" },
];

const NormalImageCarousel = () => {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
  };

  useEffect(() => {
    startAutoPlay();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
        {carouselImages.map((img, i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            initial={false}
            animate={{
              opacity: i === current ? 1 : 0,
              scale: i === current ? 1 : 1.05,
            }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            <img src={img.src} alt={img.alt} className="w-full h-full object-cover" loading="lazy" width={800} height={600} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4">
              <span className="text-xs uppercase tracking-[0.15em] bg-accent/90 text-accent-foreground px-3 py-1 rounded-full font-semibold">
                {img.caption}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {carouselImages.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); startAutoPlay(); }}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-accent' : 'w-1.5 bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero - 90seconds inspired split layout with video background */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <HeroBackgroundVideo />

        {/* Creative floating icons - like footer */}
        {[
          { Icon: Camera, x: "4%", y: "12%", size: 24, delay: 0, dur: 6 },
          { Icon: Film, x: "15%", y: "6%", size: 20, delay: 0.8, dur: 7 },
          { Icon: Clapperboard, x: "28%", y: "18%", size: 22, delay: 0.4, dur: 5.5 },
          { Icon: Video, x: "42%", y: "8%", size: 18, delay: 1.2, dur: 6.5 },
          { Icon: Aperture, x: "58%", y: "14%", size: 26, delay: 0.6, dur: 7.5 },
          { Icon: MonitorPlay, x: "72%", y: "7%", size: 20, delay: 1.5, dur: 6 },
          { Icon: Mic, x: "86%", y: "16%", size: 18, delay: 0.3, dur: 5 },
          { Icon: Focus, x: "6%", y: "45%", size: 18, delay: 1, dur: 8 },
          { Icon: Headphones, x: "20%", y: "55%", size: 22, delay: 0.5, dur: 6 },
          { Icon: Projector, x: "35%", y: "46%", size: 20, delay: 1.8, dur: 7 },
          { Icon: Radio, x: "52%", y: "52%", size: 16, delay: 0.7, dur: 5.5 },
          { Icon: ScanLine, x: "68%", y: "42%", size: 24, delay: 1.3, dur: 6.5 },
          { Icon: Podcast, x: "82%", y: "48%", size: 18, delay: 0.2, dur: 7.5 },
          { Icon: Tv, x: "90%", y: "56%", size: 20, delay: 1.6, dur: 6 },
          { Icon: Camera, x: "10%", y: "78%", size: 20, delay: 0.9, dur: 5.5 },
          { Icon: Film, x: "25%", y: "85%", size: 18, delay: 1.4, dur: 7 },
          { Icon: Clapperboard, x: "40%", y: "74%", size: 24, delay: 0.1, dur: 6 },
          { Icon: Aperture, x: "70%", y: "76%", size: 22, delay: 0.6, dur: 5 },
          { Icon: MonitorPlay, x: "85%", y: "82%", size: 18, delay: 1.1, dur: 6.5 },
        ].map(({ Icon, x, y, size, delay, dur }, i) => (
          <motion.div
            key={`hero-icon-${i}`}
            className="absolute pointer-events-none text-white z-[1]"
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

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-12 lg:px-20 relative z-10 py-28 sm:py-32 md:py-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left side - Text */}
            <div>
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
                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-white/70">
                  Strategic Storytelling & Media Production
                </p>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.08] text-white mb-6 text-balance"
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
                <br />
                <span>for Organizations That Create Impact.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-base sm:text-lg text-white/75 max-w-lg leading-relaxed mb-8"
              >
                Ikamba helps NGOs, development organizations, and corporate teams produce powerful storytelling through documentary production, video, and photography.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
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

            {/* Right side - Floating image cards grid (transparent bg, like 90seconds) */}
            <div className="hidden lg:block relative h-[500px]">
              <div className="relative w-full h-full">
                {/* Card grid - 3 columns, 2 rows of floating cards */}
                {[
                  { image: workDocumentary, className: "top-0 left-0 w-[180px] h-[220px] rotate-[-4deg]", delay: 0.2 },
                  { image: storytellingCommunity, className: "top-[-10px] left-[200px] w-[160px] h-[200px] rotate-[3deg]", delay: 0.4 },
                  { image: workCampaign, className: "top-[10px] right-0 w-[150px] h-[190px] rotate-[-2deg]", delay: 0.6 },
                  { image: impactCampaign, className: "bottom-[60px] left-[30px] w-[170px] h-[200px] rotate-[2deg]", delay: 0.8 },
                  { image: heroDocumentary, className: "bottom-[40px] left-[220px] w-[160px] h-[210px] rotate-[-3deg]", delay: 1.0 },
                  { image: workPhotography, className: "bottom-[70px] right-[10px] w-[140px] h-[180px] rotate-[4deg]", delay: 0.5 },
                ].map((card, i) => (
                  <motion.div
                    key={i}
                    className={`absolute rounded-xl overflow-hidden shadow-2xl ${card.className}`}
                    initial={{ opacity: 0, y: 40, scale: 0.9 }}
                    animate={{ 
                      opacity: 1, 
                      y: [0, -12, 0, 8, 0], 
                      scale: 1,
                    }}
                    transition={{ 
                      opacity: { duration: 0.7, delay: card.delay },
                      scale: { duration: 0.7, delay: card.delay },
                      y: { duration: 4 + i * 0.5, delay: card.delay + 0.7, repeat: Infinity, ease: "easeInOut" },
                    }}
                    whileHover={{ scale: 1.08, zIndex: 20, rotate: 0 }}
                  >
                    <img src={card.image} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <TrustedBySlider />

      {/* The Challenge */}
      <section className="section-padding gradient-navy text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
              className="text-xs uppercase tracking-[0.25em] font-semibold text-accent mb-3">
              The Challenge
            </motion.p>
            <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-white">
              Important work is often poorly communicated.
            </motion.h2>
            <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
              className="text-white/60 max-w-2xl mx-auto text-lg">
              Many organizations struggle to communicate their impact clearly, engage their audience deeply, and present their work in a way that resonates with donors, stakeholders, and communities.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {challenges.map((c, i) => (
              <Card3D key={i} className="group">
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 3}
                  className="relative bg-white/[0.06] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.08] h-full hover:bg-white/[0.1] hover:border-accent/30 transition-all duration-500 overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-full pointer-events-none" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-accent/70 font-semibold">{c.number}</span>
                    <div className="text-right">
                      <p className="text-xl font-extrabold text-accent leading-none">{c.stat}</p>
                      <p className="text-[9px] uppercase tracking-wider text-white/40 mt-0.5">{c.statLabel}</p>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 leading-tight">{c.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{c.desc}</p>
                </motion.div>
              </Card3D>
            ))}
          </div>
        </div>
      </section>

      {/* Our Response */}
      <section className="section-padding bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
              className="text-xs uppercase tracking-[0.25em] font-semibold text-accent mb-3">
              Our Response
            </motion.p>
            <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-foreground">
              We combine storytelling strategy with premium production.
            </motion.h2>
            <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
              className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Ikamba helps organizations shape stronger narratives, produce high-quality visual content, and communicate in ways that inspire trust, visibility, and action.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section-padding bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
              className="text-xs uppercase tracking-[0.25em] font-semibold text-muted-foreground mb-3">
              Services
            </motion.p>
            <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-foreground">
              What we offer organizations and institutions.
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {servicesList.map((s, i) => (
              <Card3D key={i} className="group">
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 2}
                  className="bg-card border border-border rounded-2xl p-6 h-full hover:shadow-[0_12px_40px_hsl(var(--foreground)/0.08)] hover:border-accent/30 transition-all duration-500">
                  <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <s.icon className="text-accent" size={22} />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </motion.div>
              </Card3D>
            ))}
          </div>

          {/* Extended Capabilities */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={9}
            className="mt-12 bg-card border border-border rounded-2xl p-8">
            <h3 className="text-lg font-bold text-foreground mb-1">Extended Capabilities</h3>
            <p className="text-sm text-muted-foreground mb-5">More ways we support strategic communication.</p>
            <div className="flex flex-wrap gap-2">
              {extendedCapabilities.map((cap, i) => (
                <span key={i} className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-full font-medium border border-accent/20">
                  {cap}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={10}
            className="mt-10 text-center">
            <Link to="/solutions">
              <Button variant="outline" size="sm" className="font-semibold border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                View All Solutions <ArrowRight className="ml-1" size={14} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Work - 90seconds Self Serve Creation carousel style */}
      <FeaturedWorkCarousel />

      {/* Start Creating */}
      <section className="section-padding bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
              className="text-xs uppercase tracking-[0.25em] font-semibold text-accent mb-3">
              Start Creating
            </motion.p>
            <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-foreground">
              Order storytelling projects like you order anything else.
            </motion.h2>
            <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
              className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Browse our storytelling solutions, configure your project scope, and get started. Transparent process, guaranteed quality.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: FileText, title: "Brief It", desc: "Share your vision, goals, and audience. We'll craft the perfect storytelling approach.", color: "from-blue-500/20 to-blue-600/5" },
              { icon: Video, title: "Produce It", desc: "Our crew handles filming, photography, and production — anywhere you need us.", color: "from-accent/20 to-accent/5" },
              { icon: CheckCircle2, title: "Review It", desc: "Structured review cycles with real-time collaboration. No endless back-and-forth.", color: "from-emerald-500/20 to-emerald-600/5" },
              { icon: ArrowRight, title: "Launch It", desc: "Receive final assets optimized for every platform — ready to publish and share.", color: "from-purple-500/20 to-purple-600/5" },
            ].map((step, i) => (
              <Card3D key={i} className="group">
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 3}
                  className="relative bg-card rounded-2xl p-6 border border-border h-full hover:border-accent/30 hover:shadow-[0_12px_40px_hsl(var(--foreground)/0.08)] transition-all duration-500 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                      <step.icon className="text-accent" size={22} />
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">Step {i + 1}</div>
                    <h3 className="text-base font-bold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              </Card3D>
            ))}
          </div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={8}
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center gap-8 text-center">
              {[
                { value: "50+", label: "Projects Delivered" },
                { value: "Structured", label: "Process" },
                { value: "100%", label: "Transparent" },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 + i * 0.1 }}>
                  <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={9}
            className="mt-8 text-center">
            <Link to="/start-a-project">
              <Button variant="hero" size="lg">
                Start a Project <ArrowRight className="ml-1" size={16} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding gradient-navy text-white">
        <div className="max-w-5xl mx-auto">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} custom={0}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 text-white">How It Works</motion.h2>
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

      {/* Who We Work With */}
      <section className="section-padding relative overflow-hidden" style={{ background: 'hsl(217, 72%, 14%)' }}>

        <div className="max-w-6xl mx-auto relative z-10 text-primary-foreground">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} custom={0}
                className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
                Who We Work With
              </motion.h2>
              <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
                className="text-white/60 mb-8 text-lg">
                We partner with organizations and individuals creating meaningful impact across sectors.
              </motion.p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {whoWeWorkWith.map((org, i) => (
                  <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 2}
                    className="flex gap-3 items-center bg-white/5 border border-white/10 rounded-lg px-4 py-3 hover:bg-white/10 transition-colors">
                    <Users className="text-accent shrink-0" size={16} />
                    <p className="text-sm text-white/80">{org}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Normal image carousel */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <NormalImageCarousel />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-background text-center">
        <div className="max-w-3xl mx-auto">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} custom={0}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-foreground">
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
