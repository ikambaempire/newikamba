import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Film, Camera, Megaphone } from "lucide-react";
import Card3D from "@/components/home/Card3D";

const workDocumentary = "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80";
const workCampaign = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80";
const workPhotography = "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&q=80";
const storytellingCommunity = "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=800&q=80";
const impactCampaign = "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80";
const heroDocumentary = "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&q=80";

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const projects = [
  {
    icon: Film,
    category: "Documentary",
    title: "Youth Entrepreneurship in East Africa",
    client: "International Development Foundation",
    desc: "A 20-minute documentary exploring how young entrepreneurs are reshaping local economies across Rwanda, Kenya, and Uganda.",
    result: "Featured at 3 international development conferences. 45K+ views across platforms.",
    image: workDocumentary,
  },
  {
    icon: Megaphone,
    category: "Impact Campaign",
    title: "Climate Action – Kigali 2025",
    client: "Environmental NGO Coalition",
    desc: "Multi-format campaign content for a regional climate conference, including event visuals, social graphics, and recap video.",
    result: "12 content assets delivered. Campaign reached 200K+ across digital platforms.",
    image: workCampaign,
  },
  {
    icon: Camera,
    category: "Photography",
    title: "Education Access in Rural Communities",
    client: "STEM Education Initiative",
    desc: "Photographic documentation of education programs reaching underserved communities, capturing classroom moments and community impact.",
    result: "Photography featured in annual report and donor communications.",
    image: workPhotography,
  },
  {
    icon: Film,
    category: "Documentary",
    title: "Financial Inclusion: A Community Perspective",
    client: "Regional Financial Institution",
    desc: "Short documentary highlighting community banking programs and their impact on local families and small businesses.",
    result: "Used in investor presentations and annual stakeholder communications.",
    image: storytellingCommunity,
  },
  {
    icon: Megaphone,
    category: "Campaign Storytelling",
    title: "Health Workers on the Frontlines",
    client: "Healthcare NGO Coalition",
    desc: "Video series featuring health workers in rural clinics, highlighting challenges, resilience, and the impact of international health programs.",
    result: "8 videos produced. Content used across fundraising and advocacy channels.",
    image: impactCampaign,
  },
  {
    icon: Camera,
    category: "Photography",
    title: "Real Estate Development Portfolio",
    client: "Property Development Company",
    desc: "Architectural and lifestyle photography for a premium real estate portfolio, capturing properties, communities, and the vision behind developments.",
    result: "Photography integrated into marketing materials and online listings.",
    image: heroDocumentary,
  },
];

const Work = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="section-padding pt-32 pb-16 md:pt-40">
      <div className="max-w-5xl mx-auto">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-4">
          Our Work
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-balance">
          Stories That Communicate Real Impact
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-lg text-muted-foreground max-w-2xl mb-16">
          Ikamba produces documentaries, video stories, and photography that communicate real impact. Our work focuses on capturing authentic stories that inspire action and build trust.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((p, i) => (
            <Card3D key={i} className="group">
              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="bg-card border border-border rounded-xl overflow-hidden h-full shadow-[0_2px_12px_hsl(var(--foreground)/0.04)] hover:shadow-[0_12px_40px_hsl(var(--foreground)/0.1)] hover:border-accent/30 transition-all duration-300">
                <div className="h-48 overflow-hidden">
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <p.icon className="text-accent" size={20} />
                    </div>
                    <span className="text-xs uppercase tracking-widest text-accent font-semibold">{p.category}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-1 text-foreground">{p.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{p.client}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{p.desc}</p>
                  <div className="bg-accent/5 border border-accent/10 rounded-lg px-4 py-3">
                    <p className="text-xs font-semibold text-accent-foreground">Result</p>
                    <p className="text-sm text-foreground">{p.result}</p>
                  </div>
                </div>
              </motion.div>
            </Card3D>
          ))}
        </div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={8}
          className="mt-16 text-center">
          <p className="text-lg text-muted-foreground mb-6">Interested in working together on your next storytelling project?</p>
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

export default Work;
