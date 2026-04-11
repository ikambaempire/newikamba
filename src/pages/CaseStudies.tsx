import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const cases = [
  { client: "Regional Financial Institution", type: "Annual Report Production", challenge: "Disjointed production process with 5+ vendors and no central coordination.", solution: "Implemented a single production governance framework with structured approval chains.", result: "Delivered 3 weeks early. Zero revision overruns. All assets archived." },
  { client: "International Development Organization", type: "Campaign Content System", challenge: "80+ content assets needed across 4 countries with no unified production system.", solution: "Centralized brief intake, production tracking, and multi-format delivery.", result: "All assets delivered on schedule. Structured archive created for future campaigns." },
  { client: "National Telecommunications Company", type: "Brand Content Standardization", challenge: "Inconsistent brand execution across 12 regional offices.", solution: "Developed brand governance toolkit with structured production templates.", result: "Brand consistency score improved. Production turnaround reduced by 40%." },
  { client: "Healthcare NGO Coalition", type: "Video Production Series", challenge: "Multiple stakeholders, unclear approval chains, and missed deadlines.", solution: "Structured 4-step production system with documented approval protocols.", result: "12 videos produced and archived within governance framework. On time, on budget." },
];

const CaseStudies = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="section-padding pt-32 pb-16 md:pt-40 gradient-navy text-white">
      <div className="max-w-5xl mx-auto">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs uppercase tracking-[0.2em] font-semibold text-white/60 mb-4">
          Proven Results
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-balance text-white">
          Case Studies
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-white/70 max-w-2xl mb-16">
          How structured production governance transforms organizational communication.
        </motion.p>
      </div>
    </section>
    <section className="section-padding">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-8">
          {cases.map((c, i) => (
            <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} className="bg-surface-elevated border border-border rounded-lg p-8">
              <span className="text-xs uppercase tracking-widest text-accent font-semibold">{c.type}</span>
              <h3 className="text-xl font-bold mt-2 mb-4">{c.client}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Challenge</p>
                  <p className="text-sm text-foreground leading-relaxed">{c.challenge}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Solution</p>
                  <p className="text-sm text-foreground leading-relaxed">{c.solution}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Result</p>
                  <p className="text-sm text-foreground leading-relaxed">{c.result}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default CaseStudies;
