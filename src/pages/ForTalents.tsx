import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight, GraduationCap, Users, Briefcase, Camera, Palette,
  Mic, Star, BookOpen, Lightbulb, Handshake, Target, Rocket
} from "lucide-react";
import Card3D from "@/components/home/Card3D";
import creativeAudiovisual from "@/assets/creative-audiovisual.webp";
import creativeSilhouette from "@/assets/creative-silhouette.webp";
import creativeVRWoman from "@/assets/creative-vr-woman.jpg";
import creativeCollage from "@/assets/creative-collage.jpg";
import creativeMindmap from "@/assets/creative-mindmap.jpg";
import creativeCamera from "@/assets/creative-camera.webp";

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const talentServices = [
  {
    icon: GraduationCap,
    title: "Creative Training Programs",
    desc: "Hands-on workshops in filmmaking, photography, editing, and storytelling designed for emerging and mid-career creatives.",
    image: creativeAudiovisual,
    features: ["Cinematography & Editing Workshops", "Storytelling Masterclasses", "Equipment & Technical Training", "Portfolio Development"],
  },
  {
    icon: Handshake,
    title: "Collaboration & Networking",
    desc: "Connect with fellow creatives, industry professionals, and organizations looking for talent across East Africa.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80",
    features: ["Creative Meetups & Events", "Industry Networking Sessions", "Cross-discipline Collaboration", "Mentorship Matching"],
  },
  {
    icon: Briefcase,
    title: "Production Opportunities",
    desc: "Get matched to real production projects — documentaries, campaigns, events, and corporate productions.",
    image: creativeCamera,
    features: ["Freelance Project Matching", "Crew & Talent Database", "On-set Experience", "Client Introductions"],
  },
  {
    icon: Rocket,
    title: "Career Development",
    desc: "Build a sustainable creative career with business skills, personal branding, and industry knowledge.",
    image: creativeVRWoman,
    features: ["Personal Branding Workshops", "Pricing & Negotiation Skills", "Client Management Training", "Digital Presence Building"],
  },
  {
    icon: BookOpen,
    title: "Resources & Knowledge Hub",
    desc: "Access curated industry insights, templates, guides, and tools to sharpen your craft and grow your business.",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80",
    features: ["Industry Reports & Trends", "Contract & Agreement Templates", "Equipment Guides", "Creative Business Toolkit"],
  },
  {
    icon: Target,
    title: "Showcase & Visibility",
    desc: "Get your work seen by the right people — feature in our portfolio, events, and partner showcases.",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80",
    features: ["Portfolio Showcases", "Exhibition Opportunities", "Social Media Features", "Award Nominations Support"],
  },
];

const creativeCategories = [
  { icon: Camera, label: "Photographers", count: "50+" },
  { icon: Mic, label: "Audio & Sound", count: "25+" },
  { icon: Palette, label: "Designers", count: "40+" },
  { icon: Users, label: "Filmmakers", count: "60+" },
  { icon: Star, label: "Animators", count: "15+" },
  { icon: Lightbulb, label: "Storytellers", count: "35+" },
];

const ForTalents = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="section-padding pt-32 pb-16 md:pt-40 gradient-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[Camera, Mic, Palette, Star, Lightbulb, Users].map((Icon, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 25}%` }}
              animate={{ y: [0, -10, 0, 10, 0], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
            >
              <Icon size={28 + i * 4} className="text-white" />
            </motion.div>
          ))}
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs uppercase tracking-[0.2em] font-semibold text-white/60 mb-4">
            For Creative Talents
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-balance text-white">
            Grow Your Creative Career with Ikamba
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg text-white/70 max-w-2xl mb-8">
            Whether you're a filmmaker, photographer, designer, or storyteller — Ikamba helps you train, collaborate, and access real production opportunities across East Africa.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-3">
            <Link to="/contact">
              <Button variant="hero" size="lg">
                Join Our Community <ArrowRight className="ml-1" size={16} />
              </Button>
            </Link>
            <Link to="/start-a-project">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                Explore Opportunities
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Creative Categories */}
      <section className="section-padding bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-2">Creative Categories</h2>
            <p className="text-muted-foreground">We support creatives across disciplines</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {creativeCategories.map((cat, i) => (
              <motion.div key={cat.label} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
                <div className="bg-card border border-border rounded-xl p-5 text-center hover:border-accent/30 hover:shadow-lg transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/20 transition-colors">
                    <cat.icon className="text-accent" size={22} />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{cat.label}</p>
                  <p className="text-xs text-accent font-bold mt-1">{cat.count}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section-padding">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-2">What We Offer Talents</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From training programs to production opportunities — everything you need to build a thriving creative career.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {talentServices.map((s, i) => (
              <Card3D key={i} className="group">
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                  className="bg-card border border-border rounded-xl overflow-hidden h-full shadow-[0_2px_12px_hsl(var(--foreground)/0.04)] hover:shadow-[0_12px_40px_hsl(var(--foreground)/0.1)] hover:border-accent/30 transition-all duration-300">
                  <div className="aspect-[2.2/1] overflow-hidden">
                    <img src={s.image} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <s.icon className="text-accent" size={20} />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{s.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{s.desc}</p>
                    <ul className="space-y-1.5">
                      {s.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </Card3D>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding" style={{ background: "hsl(217, 72%, 14%)" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-2">How It Works</h2>
            <p className="text-white/60">Your path from aspiring to thriving creative</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Apply", desc: "Share your portfolio and creative interests with us" },
              { step: "02", title: "Train", desc: "Join workshops and training programs to sharpen your skills" },
              { step: "03", title: "Connect", desc: "Network with fellow creatives, mentors, and industry pros" },
              { step: "04", title: "Create", desc: "Get matched to real production projects and grow your career" },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="text-center">
                <div className="text-3xl font-extrabold text-accent mb-3">{item.step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/60">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: "200+", label: "Creatives Trained" },
              { num: "50+", label: "Production Projects" },
              { num: "30+", label: "Industry Partners" },
              { num: "5", label: "Countries Reached" },
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="text-center py-6">
                <div className="text-3xl md:text-4xl font-extrabold text-accent mb-1">{stat.num}</div>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4">Ready to Level Up Your Creative Career?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join Ikamba's creative community and get access to training, collaboration opportunities, and real production projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/contact">
                <Button variant="hero" size="lg">
                  Get Started <ArrowRight className="ml-1" size={16} />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="font-semibold">
                  Talk to Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ForTalents;
