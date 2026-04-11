import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Camera, Film, Clapperboard, Aperture, Focus, MonitorPlay,
  Video, Mic, Headphones, Radio, Tv, Projector, Podcast, ScanLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Mail } from "lucide-react";

const floatingIcons = [
  { Icon: Camera, x: "5%", y: "10%", size: 26, delay: 0, dur: 6 },
  { Icon: Film, x: "18%", y: "5%", size: 22, delay: 0.8, dur: 7 },
  { Icon: Clapperboard, x: "30%", y: "15%", size: 24, delay: 0.4, dur: 5.5 },
  { Icon: Video, x: "45%", y: "8%", size: 20, delay: 1.2, dur: 6.5 },
  { Icon: Aperture, x: "60%", y: "12%", size: 28, delay: 0.6, dur: 7.5 },
  { Icon: MonitorPlay, x: "75%", y: "6%", size: 22, delay: 1.5, dur: 6 },
  { Icon: Mic, x: "88%", y: "14%", size: 20, delay: 0.3, dur: 5 },
  { Icon: Focus, x: "8%", y: "40%", size: 20, delay: 1, dur: 8 },
  { Icon: Headphones, x: "22%", y: "50%", size: 24, delay: 0.5, dur: 6 },
  { Icon: Projector, x: "38%", y: "42%", size: 22, delay: 1.8, dur: 7 },
  { Icon: Radio, x: "55%", y: "48%", size: 18, delay: 0.7, dur: 5.5 },
  { Icon: ScanLine, x: "70%", y: "38%", size: 26, delay: 1.3, dur: 6.5 },
  { Icon: Podcast, x: "85%", y: "45%", size: 20, delay: 0.2, dur: 7.5 },
  { Icon: Tv, x: "92%", y: "52%", size: 22, delay: 1.6, dur: 6 },
  { Icon: Camera, x: "12%", y: "75%", size: 22, delay: 0.9, dur: 5.5 },
  { Icon: Film, x: "28%", y: "82%", size: 20, delay: 1.4, dur: 7 },
  { Icon: Clapperboard, x: "42%", y: "70%", size: 26, delay: 0.1, dur: 6 },
  { Icon: Video, x: "58%", y: "78%", size: 22, delay: 2, dur: 8 },
  { Icon: Aperture, x: "72%", y: "72%", size: 24, delay: 0.6, dur: 5 },
  { Icon: MonitorPlay, x: "86%", y: "80%", size: 20, delay: 1.1, dur: 6.5 },
];

const Footer = () => (
  <footer className="relative bg-primary text-primary-foreground overflow-hidden">
    {floatingIcons.map(({ Icon, x, y, size, delay, dur }, i) => (
      <motion.div
        key={i}
        className="absolute pointer-events-none text-primary-foreground"
        style={{ left: x, top: y }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: [0, 0.15, 0.08, 0.15, 0],
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
      className="absolute w-[600px] h-[2px] bg-gradient-to-r from-transparent via-accent/20 to-transparent pointer-events-none"
      style={{ top: "30%", left: "-300px", rotate: "-10deg" }}
      animate={{ x: ["-300px", "calc(100vw + 300px)"] }}
      transition={{ duration: 4, delay: 1, repeat: Infinity, repeatDelay: 8, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
      style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.07) 0%, transparent 70%)" }}
      animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
    />

    <div className="relative z-10 max-w-7xl mx-auto section-padding">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        <div className="md:col-span-1">
          <p className="font-heading text-xl font-extrabold tracking-tight mb-3">
            <span className="text-accent">i</span>KAMBA<span className="text-primary-foreground/60 text-base font-semibold ml-1">Media</span>
          </p>
          <p className="text-sm text-primary-foreground/60 leading-relaxed mb-4">
            Impact Storytelling & Media Production for Organizations.
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/start-a-project">
              <Button variant="hero" size="sm" className="w-full">
                Start a Project <ArrowRight className="ml-1" size={14} />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="sm" className="w-full border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                Book Consultation
              </Button>
            </Link>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/40 mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li><Link to="/" className="hover:text-primary-foreground transition-colors">Home</Link></li>
            <li><Link to="/solutions" className="hover:text-primary-foreground transition-colors">Solutions</Link></li>
            <li><Link to="/work" className="hover:text-primary-foreground transition-colors">Work</Link></li>
            <li><Link to="/insights" className="hover:text-primary-foreground transition-colors">Insights</Link></li>
            <li><Link to="/about" className="hover:text-primary-foreground transition-colors">About</Link></li>
            <li><Link to="/contact" className="hover:text-primary-foreground transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/40 mb-4">Connect</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li><a href="https://www.linkedin.com/company/ikamba/" target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground transition-colors">LinkedIn</a></li>
            <li><a href="https://www.instagram.com/ikamba_rw/" target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground transition-colors">Instagram</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/40 mb-4">Contact</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/70">
            <li className="flex items-center gap-2">
              <Phone size={14} className="text-accent" />
              <span>0796 889 527</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={14} className="text-accent" />
              <span>connect@ikambamedia.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-primary-foreground/40">© {new Date().getFullYear()} Ikamba Media. All rights reserved.</p>
        <p className="text-xs text-primary-foreground/40">Impact Storytelling & Media Production.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
