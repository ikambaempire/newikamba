import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Target, Video, FolderOpen } from "lucide-react";
import Card3D from "@/components/home/Card3D";

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const steps = [
  {
    icon: Target,
    num: "01",
    title: "Strategy",
    desc: "We work with your team to understand communication goals and identify the most important stories.",
    details: [
      "Discovery call to understand your organization's mission and objectives",
      "Audience mapping and messaging alignment",
      "Story identification — finding the narratives that resonate",
      "Production planning with clear timelines and deliverables",
    ],
  },
  {
    icon: Video,
    num: "02",
    title: "Production",
    desc: "Our team manages filming, photography, interviews, and editing to produce high-quality storytelling content.",
    details: [
      "Professional filming and photography by experienced crew",
      "Structured interview guidance and subject preparation",
      "On-location production management",
      "Post-production editing with revision cycles",
    ],
  },
  {
    icon: FolderOpen,
    num: "03",
    title: "Delivery",
    desc: "Final storytelling assets are delivered ready for campaigns, reports, websites, and social media.",
    details: [
      "Multi-format export for all platforms",
      "Campaign-ready assets with professional finishing",
      "Organized file delivery with clear naming",
      "Post-delivery support and future collaboration planning",
    ],
  },
];

const HowItWorks = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="section-padding pt-32 pb-16 md:pt-40 gradient-navy text-white">
      <div className="max-w-5xl mx-auto">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs uppercase tracking-[0.2em] font-semibold text-white/60 mb-4">
          Our Process
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-balance text-white">
          Our Storytelling Process
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-lg text-white/70 max-w-2xl mb-16">
          Ikamba Media follows a simple and structured production process that makes storytelling easier for communication teams.
        </motion.p>
      </div>
    </section>

    <section className="section-padding">
      <div className="max-w-5xl mx-auto">

        <div className="space-y-10">
          {steps.map((step, i) => (
            <Card3D key={i} className="group">
              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="bg-card border border-border rounded-xl p-8 md:p-10 shadow-[0_2px_12px_hsl(var(--foreground)/0.04)] hover:shadow-[0_12px_40px_hsl(var(--foreground)/0.1)] hover:border-accent/30 transition-all duration-300">
                <div className="flex items-start gap-6">
                  <div className="hidden md:flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-accent-foreground font-extrabold text-lg shadow-lg">
                      {step.num}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-px h-16 bg-border mt-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <step.icon className="text-accent" size={22} />
                      <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-5">{step.desc}</p>
                    <ul className="space-y-2">
                      {step.details.map((detail, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </Card3D>
          ))}
        </div>

      </div>
    </section>

    <section className="section-padding gradient-navy text-center">
      <div className="max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
          <p className="text-white/70 text-lg mb-6">Ready to get started?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/start-a-project">
              <Button variant="hero" size="lg">
                Start a Project <ArrowRight className="ml-1" size={16} />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="hero-outline" size="lg">
                Book Consultation
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
    <Footer />
  </div>
);

export default HowItWorks;
