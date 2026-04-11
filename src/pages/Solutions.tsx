import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Film, Video, Image, Megaphone, Users, FileSearch, X, CheckCircle2 } from "lucide-react";
import Card3D from "@/components/home/Card3D";

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const allSolutions = [
  {
    icon: Film, title: "Documentary Production",
    desc: "We produce short documentaries that highlight real stories, community impact, and organizational achievements. From concept through final cut, we manage the entire production process.",
    caseStudy: {
      client: "International Development Organization",
      overview: "Produced a 5-part documentary series showcasing community health initiatives across rural East Africa.",
      approach: [
        "Conducted field research and story identification across 3 countries",
        "Deployed a 4-person production crew for 12 days of location filming",
        "Captured authentic testimonials from community leaders and beneficiaries",
        "Delivered cinematic-quality edits with multilingual subtitling",
      ],
      result: "Series screened at 3 international conferences and drove a 45% increase in donor engagement.",
    },
  },
  {
    icon: Video, title: "Video Production",
    desc: "Professional video production for campaigns, programs, interviews, and events. Cinematic quality with structured workflows and clear timelines.",
    caseStudy: {
      client: "National Telecommunications Company",
      overview: "Created a suite of brand campaign videos for a nationwide product launch across digital and broadcast channels.",
      approach: [
        "Developed creative concepts aligned with brand messaging guidelines",
        "Managed multi-location shoots with talent coordination",
        "Produced 8 video assets optimized for TV, social media, and web",
        "Delivered all assets within a 3-week production window",
      ],
      result: "Campaign videos generated 2.5M+ views in the first month and were adopted across 12 regional offices.",
    },
  },
  {
    icon: Image, title: "Photography for Impact Storytelling",
    desc: "High-quality photography capturing communities, initiatives, and leadership stories. Images that tell powerful visual narratives.",
    caseStudy: {
      client: "Healthcare NGO Coalition",
      overview: "Documented community health programs across 5 districts with photography that captured both impact and human dignity.",
      approach: [
        "Built trust with communities before shooting through local partnerships",
        "Used documentary and portrait photography styles for authentic storytelling",
        "Created a curated library of 500+ images organized by theme and campaign",
        "Delivered print-ready and digital-optimized formats",
      ],
      result: "Photography featured in annual reports, fundraising materials, and global health publications.",
    },
  },
  {
    icon: Megaphone, title: "Campaign Storytelling",
    desc: "Visual storytelling designed for advocacy campaigns and communication initiatives. Multi-format content that amplifies your message across platforms.",
    caseStudy: {
      client: "Environmental Advocacy Network",
      overview: "Designed and produced a multi-platform campaign to raise awareness about sustainable agriculture practices.",
      approach: [
        "Developed a unified visual identity for the campaign across all touchpoints",
        "Produced video, photography, and graphic content in coordinated batches",
        "Created platform-specific content for social media, web, and print",
        "Managed content calendar and release schedule for maximum impact",
      ],
      result: "Campaign reached 1.2M people across platforms and was adopted by 15 partner organizations.",
    },
  },
  {
    icon: Users, title: "NGO Storytelling",
    desc: "Specialized storytelling solutions for nonprofit organizations and development partners. We understand the unique needs and sensitivities of impact communication.",
    caseStudy: {
      client: "Regional Education Foundation",
      overview: "Partnered to tell the stories of scholarship recipients and community education programs across 4 countries.",
      approach: [
        "Worked closely with program teams to identify story subjects ethically",
        "Trained local facilitators to support interview processes",
        "Produced written, photo, and video stories for donor communications",
        "Built a reusable storytelling framework for ongoing content production",
      ],
      result: "Stories contributed to a 30% increase in annual fundraising and strengthened donor relationships.",
    },
  },
  {
    icon: FileSearch, title: "Content Strategy",
    desc: "Strategic communication planning that identifies the right stories, audiences, and formats to maximize organizational impact.",
    caseStudy: {
      client: "Pan-African Trade Association",
      overview: "Developed a comprehensive content strategy to position the organization as a thought leader in regional economic development.",
      approach: [
        "Audited existing content and communication channels",
        "Mapped audience segments and messaging priorities",
        "Created a 12-month content calendar with production milestones",
        "Established brand voice guidelines and content governance framework",
      ],
      result: "Content engagement increased 60% within 6 months. Strategy adopted as organizational standard.",
    },
  },
];

const Solutions = () => {
  const [selectedSolution, setSelectedSolution] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="section-padding pt-32 pb-16 md:pt-40 gradient-navy text-white">
        <div className="max-w-5xl mx-auto">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs uppercase tracking-[0.2em] font-semibold text-white/60 mb-4">
            What We Do
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-balance text-white">
            Storytelling & Media Production Solutions
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg text-white/70 max-w-2xl mb-16">
            Ikamba provides storytelling and media production solutions designed for organizations that want to communicate their work clearly and effectively.
          </motion.p>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {allSolutions.map((s, i) => (
              <Card3D key={i} className="group">
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                  onClick={() => setSelectedSolution(i)}
                  className="bg-card border border-border rounded-xl p-8 h-full shadow-[0_2px_12px_hsl(var(--foreground)/0.04)] hover:shadow-[0_12px_40px_hsl(var(--foreground)/0.1)] hover:border-accent/30 transition-all duration-300 cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                    <s.icon className="text-accent" size={24} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{s.desc}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:gap-2 transition-all">
                    View Case Study <ArrowRight size={12} />
                  </span>
                </motion.div>
              </Card3D>
            ))}
          </div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={8}
            className="mt-16 text-center">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
            </div>
          </motion.div>
        </div>
      </section>

      {/* Case Study Modal */}
      <AnimatePresence>
        {selectedSolution !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedSolution(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-card border border-border rounded-2xl p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {(() => {
                const s = allSolutions[selectedSolution];
                const cs = s.caseStudy;
                return (
                  <>
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                          <s.icon className="text-accent" size={20} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{s.title}</h3>
                          <p className="text-xs text-muted-foreground">{cs.client}</p>
                        </div>
                      </div>
                      <button onClick={() => setSelectedSolution(null)} className="text-muted-foreground hover:text-foreground p-1">
                        <X size={20} />
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-2">Overview</p>
                        <p className="text-sm text-foreground leading-relaxed">{cs.overview}</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-3">Our Approach</p>
                        <ul className="space-y-2">
                          {cs.approach.map((item, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                              <CheckCircle2 className="text-accent shrink-0 mt-0.5" size={14} />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-accent/10 rounded-xl p-5">
                        <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-2">Result</p>
                        <p className="text-sm text-foreground font-medium leading-relaxed">{cs.result}</p>
                      </div>

                      <div className="pt-2">
                        <Link to="/start-a-project" onClick={() => setSelectedSolution(null)}>
                          <Button variant="hero" size="lg" className="w-full">
                            Start a Similar Project <ArrowRight className="ml-1" size={16} />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Solutions;
