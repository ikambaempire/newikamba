import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  MessageCircle,
  Play,
  Send,
  Smartphone,
  Target,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import creativeAudiovisual from "@/assets/creative-audiovisual.webp";
import creativeJoy from "@/assets/creative-joy.jpg";
import creativeMindmap from "@/assets/creative-mindmap.jpg";
import creativeSilhouette from "@/assets/creative-silhouette.webp";
import helloFloating1 from "@/assets/hello-floating-1.webp";
import helloFloating3 from "@/assets/hello-floating-3.jpg";
import popupStrategy from "@/assets/popup-strategy.jpg";

type PopupSetting = {
  id: string;
  popup_type: string;
  title: string;
  message: string;
  button_text: string;
  button_link: string;
  delay_seconds: number;
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const auditSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  organization: z.string().trim().max(160).optional(),
  email: z.string().trim().email("Please enter a valid email"),
  whatsapp: z.string().trim().max(40).optional(),
});

const solutionPillars = [
  { title: "Strategy", desc: "Clarify the audience, message, proof points, and conversion goal before production starts." },
  { title: "Production", desc: "Capture interviews, field stories, visuals, and campaign assets with a premium production workflow." },
  { title: "Distribution", desc: "Package content for websites, proposals, reports, social channels, donor updates, and sales conversations." },
];

const caseStudies = [
  {
    client: "Development Partner",
    challenge: "A strong field program was difficult to explain to donors in a clear, emotional way.",
    solution: "We shaped beneficiary interviews into a concise impact film and supporting campaign cutdowns.",
    outcome: "Clearer stakeholder presentations and reusable assets for reports, web, and social.",
    image: creativeAudiovisual,
  },
  {
    client: "Corporate Team",
    challenge: "The brand looked active online, but the story behind the work was not memorable.",
    solution: "We built a message framework, filmed leadership content, and created launch videos.",
    outcome: "A sharper brand narrative and stronger trust across digital touchpoints.",
    image: creativeSilhouette,
  },
  {
    client: "Creative Initiative",
    challenge: "Program outcomes were scattered across photos, notes, and event footage.",
    solution: "We organized the story into a case-study format with hero visuals and short edits.",
    outcome: "A clean proof-of-impact package for partners, sponsors, and future participants.",
    image: creativeJoy,
  },
];

const tools = [
  { title: "Impact Story Audit", desc: "Score your current story for clarity, proof, emotion, and conversion readiness." },
  { title: "Storytelling Templates", desc: "Reusable prompts for campaign stories, beneficiary stories, and partner updates." },
  { title: "Video Brief Template", desc: "A structured brief to align objectives, audience, scenes, interviews, and deliverables." },
];

const testimonials = [
  "iKAMBA helped us turn complex program work into a story stakeholders could understand quickly.",
  "The process was clear, strategic, and professional from the first conversation to final delivery.",
  "Our content finally feels aligned with the quality and impact of the work we do on the ground.",
];

const submitAuditLead = async (payload: z.infer<typeof auditSchema>, source: string) => {
  return supabase.from("impact_audit_leads").insert({
    name: payload.name,
    organization: payload.organization || null,
    email: payload.email,
    whatsapp: payload.whatsapp || null,
    source,
  });
};

const AuditForm = ({ compact = false, onSuccess }: { compact?: boolean; onSuccess?: () => void }) => {
  const [form, setForm] = useState({ name: "", organization: "", email: "", whatsapp: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = auditSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message || "Please check the form");
      return;
    }
    setLoading(true);
    const { error } = await submitAuditLead(parsed.data, compact ? "popup" : "homepage");
    setLoading(false);
    if (error) {
      toast.error("Could not submit your audit request. Please try again.");
      return;
    }
    toast.success("Your free audit request has been received.");
    setForm({ name: "", organization: "", email: "", whatsapp: "" });
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" required />
      <Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} placeholder="Organization" />
      <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" required />
      <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="WhatsApp" />
      <Button type="submit" variant="hero" className="sm:col-span-2" disabled={loading}>
        <Send size={16} /> {loading ? "Sending..." : "Get Your Free Impact Story Audit"}
      </Button>
    </form>
  );
};

const DeviceMockups = () => (
  <div className="relative min-h-[420px] lg:min-h-[520px]">
    <motion.div
      initial={{ opacity: 0, y: 32, rotate: -2 }}
      whileInView={{ opacity: 1, y: 0, rotate: -1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="absolute left-0 top-10 w-[86%] rounded-2xl border-[10px] border-primary bg-primary shadow-2xl overflow-hidden"
    >
      <div className="h-6 bg-primary flex items-center gap-1.5 px-3">
        <span className="h-2 w-2 rounded-full bg-destructive" />
        <span className="h-2 w-2 rounded-full bg-accent" />
        <span className="h-2 w-2 rounded-full bg-success" />
      </div>
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img src={helloFloating1} alt="Impact documentary preview on laptop" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-primary/25" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg">
            <Play fill="currentColor" size={24} />
          </div>
        </div>
      </div>
    </motion.div>
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: 5 }}
      whileInView={{ opacity: 1, y: 0, rotate: 4 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.15 }}
      className="absolute right-0 bottom-0 w-[34%] min-w-[150px] rounded-[2rem] border-[9px] border-primary bg-primary shadow-2xl overflow-hidden"
    >
      <div className="relative aspect-[9/16] overflow-hidden bg-muted">
        <img src={helloFloating3} alt="Short-form story preview on phone" className="h-full w-full object-cover" />
        <div className="absolute inset-x-4 bottom-5 rounded-lg bg-background/90 p-3 shadow-lg">
          <p className="text-[10px] uppercase font-bold text-accent">Campaign Cutdown</p>
          <p className="text-xs font-semibold text-foreground">30 sec impact story</p>
        </div>
      </div>
    </motion.div>
  </div>
);

export const ConversionSections = () => {
  const [testimonial, setTestimonial] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setTestimonial((current) => (current + 1) % testimonials.length), 4200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <section className="section-padding bg-background overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-accent mb-3">Mockup Preview</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4">See how your story comes to life</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              From a single field interview to a full campaign system, your message becomes cinematic content for every platform your audience uses.
            </p>
            <div className="grid grid-cols-3 gap-3 text-center">
              {["Hero film", "Social clips", "Audit-ready story"].map((item) => (
                <div key={item} className="rounded-lg border border-border bg-card p-4">
                  <CheckCircle2 className="text-accent mx-auto mb-2" size={18} />
                  <p className="text-xs font-semibold text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <DeviceMockups />
        </div>
      </section>

      <section className="section-padding gradient-navy text-primary-foreground">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-3xl mb-10">
            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-accent mb-3">Problem</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">Great work deserves better storytelling</h2>
            <p className="text-primary-foreground/70 text-lg">Organizations often do meaningful work, but the message is not always clear enough to earn attention, trust, or action.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {["Unclear messaging", "Low visibility", "Weak storytelling"].map((problem, i) => (
              <motion.div key={problem} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 1} className="rounded-lg border border-primary-foreground/10 bg-primary-foreground/5 p-6">
                <span className="text-accent font-extrabold text-3xl">0{i + 1}</span>
                <h3 className="text-xl font-bold mt-5 mb-2">{problem}</h3>
                <p className="text-primary-foreground/65 text-sm leading-relaxed">The right audience cannot act when the value, proof, and emotional hook are hard to understand.</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-xs uppercase tracking-[0.25em] font-semibold text-accent mb-3">Solution</motion.p>
            <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4">We don’t just create content. We design stories.</motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {solutionPillars.map((pillar, i) => (
              <motion.div key={pillar.title} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 2} className="rounded-lg border border-border bg-card p-7 hover:border-accent/40 transition-colors">
                <Target className="text-accent mb-5" size={28} />
                <h3 className="text-xl font-bold text-foreground mb-3">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 items-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <p className="text-xs uppercase tracking-[0.25em] font-semibold text-accent mb-3">How It Works</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Understand → Strategy → Production</h2>
              <p className="text-muted-foreground text-lg">A simple production system that keeps the story clear before cameras roll.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["Understand", "Strategy", "Production"].map((step, i) => (
                <motion.div key={step} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 1} className="relative rounded-lg border border-border bg-card p-6">
                  <div className="h-9 w-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold mb-5">{i + 1}</div>
                  <h3 className="font-bold text-foreground mb-2">{step}</h3>
                  <p className="text-sm text-muted-foreground">{i === 0 ? "We map goals, audiences, blockers, and proof." : i === 1 ? "We build the message, narrative arc, and content plan." : "We film, edit, package, and prepare assets for launch."}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] font-semibold text-accent mb-3">Case Studies</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground">Proof that story changes perception</h2>
            </div>
            <Link to="/work" className="text-sm font-semibold text-accent inline-flex items-center gap-1">View work <ArrowRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {caseStudies.map((study, i) => (
              <motion.article key={study.client} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} className="overflow-hidden rounded-lg border border-border bg-card">
                <img src={study.image} alt={`${study.client} storytelling case study`} className="h-48 w-full object-cover" loading="lazy" />
                <div className="p-6 space-y-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Client → {study.client}</p>
                  <p className="text-sm"><strong className="text-foreground">Challenge:</strong> <span className="text-muted-foreground">{study.challenge}</span></p>
                  <p className="text-sm"><strong className="text-foreground">Solution:</strong> <span className="text-muted-foreground">{study.solution}</span></p>
                  <p className="text-sm"><strong className="text-foreground">Outcome:</strong> <span className="text-muted-foreground">{study.outcome}</span></p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-accent mb-3">Free Tools</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Free tools to improve your storytelling</h2>
            <p className="text-muted-foreground text-lg">Use these resources to clarify your next impact story before you invest in production.</p>
          </motion.div>
          <div className="grid grid-cols-1 gap-3">
            {tools.map((tool, i) => (
              <motion.a key={tool.title} href="#audit" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 1} className="group rounded-lg border border-border bg-card p-5 flex items-start justify-between gap-4 hover:border-accent/40 transition-colors">
                <div className="flex gap-4">
                  <div className="h-11 w-11 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0"><FileText size={20} /></div>
                  <div>
                    <h3 className="font-bold text-foreground">{tool.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{tool.desc}</p>
                  </div>
                </div>
                <Download className="text-muted-foreground group-hover:text-accent shrink-0" size={18} />
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      <section id="audit" className="section-padding gradient-navy text-primary-foreground">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-accent mb-3">Lead Capture</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">Get Your Free Impact Story Audit</h2>
            <p className="text-primary-foreground/70 text-lg">Tell us who you are and we’ll help identify the clearest story your organization should be telling next.</p>
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} className="rounded-lg border border-primary-foreground/10 bg-primary-foreground p-6 text-foreground shadow-2xl">
            <AuditForm />
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.25em] font-semibold text-accent mb-5">Testimonials</p>
          <AnimatePresence mode="wait">
            <motion.blockquote key={testimonial} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.35 }} className="text-2xl md:text-4xl font-extrabold text-foreground leading-tight">
              “{testimonials[testimonial]}”
            </motion.blockquote>
          </AnimatePresence>
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => <button key={i} onClick={() => setTestimonial(i)} className={`h-2 rounded-full transition-all ${i === testimonial ? "w-8 bg-accent" : "w-2 bg-muted-foreground/30"}`} />)}
          </div>
        </div>
      </section>
    </>
  );
};

export const WebsitePopupSystem = () => {
  const [settings, setSettings] = useState<PopupSetting[]>([]);
  const [active, setActive] = useState<PopupSetting | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    supabase.from("popup_settings").select("id, popup_type, title, message, button_text, button_link, delay_seconds").eq("enabled", true).then(({ data }) => {
      if (data) setSettings(data);
    });
  }, []);

  const timePopup = useMemo(() => settings.find((item) => item.popup_type === "time_delay"), [settings]);
  const exitPopup = useMemo(() => settings.find((item) => item.popup_type === "exit_intent"), [settings]);

  useEffect(() => {
    if (!timePopup || dismissed) return;
    const timer = window.setTimeout(() => setActive(timePopup), timePopup.delay_seconds * 1000);
    return () => window.clearTimeout(timer);
  }, [timePopup, dismissed]);

  useEffect(() => {
    if (!exitPopup || dismissed) return;
    const onMouseLeave = (event: MouseEvent) => {
      if (event.clientY <= 0) setActive(exitPopup);
    };
    document.addEventListener("mouseleave", onMouseLeave);
    return () => document.removeEventListener("mouseleave", onMouseLeave);
  }, [exitPopup, dismissed]);

  const close = () => {
    setDismissed(true);
    setActive(null);
  };

  return (
    <>
      <AnimatePresence>
        {active && !dismissed && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/70 backdrop-blur-sm px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className="relative w-full max-w-xl rounded-lg bg-background border border-border shadow-2xl overflow-hidden">
              <button onClick={close} className="absolute right-4 top-4 z-10 text-muted-foreground hover:text-foreground" aria-label="Close popup"><X size={18} /></button>
              <div className="grid grid-cols-1 sm:grid-cols-[0.85fr_1.15fr]">
                <img src={popupStrategy} alt="iKAMBA strategy storytelling" className="hidden sm:block h-full w-full object-cover" />
                <div className="p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-3">Free Resource</p>
                  <h2 className="text-2xl font-extrabold text-foreground mb-2">{active.title}</h2>
                  <p className="text-sm text-muted-foreground mb-5">{active.message}</p>
                  <AuditForm compact onSuccess={close} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <a
        href="https://wa.me/250796889527?text=Hello%20iKAMBA%2C%20I%20would%20like%20to%20talk%20about%20storytelling%20for%20my%20organization."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full bg-success text-primary-foreground shadow-2xl flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={26} />
      </a>
    </>
  );
};
