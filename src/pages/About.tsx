import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Eye, Compass, Sparkles } from "lucide-react";
import Card3D from "@/components/home/Card3D";
const aboutTeam = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80";

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const values = [
  { icon: Heart, title: "Authenticity", desc: "We capture real stories with honesty and respect for every community and organization we work with." },
  { icon: Eye, title: "Clarity", desc: "Every story we produce communicates a clear message. No ambiguity, no jargon — just impactful storytelling." },
  { icon: Compass, title: "Purpose-Driven", desc: "We work with organizations that create meaningful impact. Their mission becomes our creative direction." },
  { icon: Sparkles, title: "Excellence", desc: "Professional-grade production quality in every deliverable — from photography to documentary filmmaking." },
];

const About = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="section-padding pt-32 pb-16 md:pt-40 gradient-navy text-white">
      <div className="max-w-5xl mx-auto">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs uppercase tracking-[0.2em] font-semibold text-white/60 mb-4">
          About Ikamba
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 text-balance text-white">
          Strategic Storytelling & Media Production
        </motion.h1>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-white/70 max-w-2xl space-y-4 mb-16">
          <p className="text-lg leading-relaxed">
            Ikamba is a storytelling and media production company supporting organizations that create meaningful impact.
          </p>
          <p className="leading-relaxed">
            We combine storytelling expertise with professional media production to help organizations communicate their work clearly. From documentaries to campaign visuals, we capture stories that inspire action and build trust.
          </p>
        </motion.div>
      </div>
    </section>

    <section className="section-padding">
      <div className="max-w-5xl mx-auto">

        {/* Mission */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
          className="bg-primary text-primary-foreground rounded-xl p-8 md:p-10 mb-16 shadow-lg">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-primary-foreground/50 mb-3">Our Mission</p>
          <p className="text-xl md:text-2xl font-bold leading-relaxed">
            Help organizations tell their stories with clarity, authenticity, and impact.
          </p>
        </motion.div>

        {/* Team Image */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-xl overflow-hidden mb-16 shadow-lg">
          <img src={aboutTeam} alt="Ikamba team collaborating" className="w-full h-64 md:h-80 object-cover" loading="lazy" />
        </motion.div>

        <h2 className="text-2xl font-bold mb-8">Our Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {values.map((v, i) => (
            <Card3D key={i} className="group">
              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 2}
                className="bg-card border border-border rounded-xl p-6 h-full shadow-[0_2px_12px_hsl(var(--foreground)/0.04)] hover:shadow-[0_12px_40px_hsl(var(--foreground)/0.1)] hover:border-accent/30 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <v.icon className="text-accent" size={20} />
                </div>
                <h3 className="text-base font-bold mb-1">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            </Card3D>
          ))}
        </div>

      </div>
    </section>
    <section className="section-padding gradient-navy text-center">
      <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
            <p className="text-white/70 text-lg mb-6">Ready to tell your story?</p>
            <Link to="/start-a-project">
              <Button variant="hero" size="lg">
                Start a Project <ArrowRight className="ml-1" size={16} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    <Footer />
  </div>
);

export default About;
