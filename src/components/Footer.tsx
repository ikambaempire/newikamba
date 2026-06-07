import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const useKigaliTime = () => {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => {
      const d = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false, timeZone: "Africa/Kigali",
      }).format(new Date());
      setT(d);
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);
  return t;
};

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Our Work", to: "/work" },
  { label: "Solutions", to: "/solutions" },
  { label: "Insights", to: "/insights" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];
const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/ikamba/" },
  { label: "Instagram", href: "https://www.instagram.com/ikamba_rw/" },
  { label: "Wedding by Ikamba", href: "https://wedding.ikamba.africa/" },
  { label: "Resona", href: "https://resona.ikamba.africa/" },
];
const legalLinks = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Service", to: "/terms" },
];

const Footer = () => {
  const time = useKigaliTime();
  return (
    <footer className="relative overflow-hidden text-white" style={{ backgroundColor: "hsl(217 72% 14%)" }}>
      {/* Soft gold radial */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            "radial-gradient(900px 500px at 50% 110%, hsl(var(--accent) / 0.18) 0%, transparent 60%), radial-gradient(600px 400px at 90% 10%, hsl(var(--accent) / 0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-14 md:gap-10 mb-20">
          {/* Navigation */}
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary-foreground/40 mb-6">Navigation</p>
            <ul className="space-y-3">
              {navLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-2xl md:text-3xl font-heading font-light tracking-tight text-primary-foreground hover:text-accent transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary-foreground/40 mb-6">Social</p>
            <ul className="space-y-3">
              {socialLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-2xl md:text-3xl font-heading font-light tracking-tight text-primary-foreground hover:text-accent transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legals */}
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary-foreground/40 mb-6">Legals</p>
            <ul className="space-y-3">
              {legalLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-2xl md:text-3xl font-heading font-light tracking-tight text-primary-foreground hover:text-accent transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-10 space-y-1 text-sm text-primary-foreground/60">
              <p>connect@ikamba.africa</p>
              <p>0796 889 527</p>
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs md:text-sm text-primary-foreground/60 pb-12 border-t border-primary-foreground/10 pt-6">
          <p>© {new Date().getFullYear()} iKAMBA. All rights reserved.</p>
          <p className="md:text-center">Kigali, Rwanda <span className="mx-2 text-accent">→</span> {time}</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="md:text-right inline-flex md:justify-end items-center gap-2 text-accent hover:gap-3 transition-all"
          >
            Back to top <ArrowUp size={14} />
          </button>
        </div>
      </div>

      {/* Giant brand wordmark */}
      <div className="relative z-0 select-none pointer-events-none">
        <p
          aria-hidden="true"
          className="font-heading font-extrabold tracking-tighter leading-none text-center whitespace-nowrap"
          style={{
            fontSize: "clamp(6rem, 24vw, 22rem)",
            background:
              "linear-gradient(180deg, hsl(var(--primary-foreground) / 0.12) 0%, hsl(var(--accent) / 0.18) 70%, hsl(var(--accent) / 0.05) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "-0.18em",
          }}
        >
          iKAMBA
        </p>
      </div>
    </footer>
  );
};

export default Footer;
