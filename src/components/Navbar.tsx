import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import ikambaIcon from "@/assets/ikamba-icon.png";

const navLinks = [
  {
    label: "Solutions",
    href: "/solutions",
    dropdown: [
      { label: "For Corporates", href: "/solutions/corporates", desc: "Media production & storytelling for organizations" },
      { label: "For Talents", href: "/solutions/talents", desc: "Training, collaboration & growth for creatives" },
    ],
  },
  { label: "Work", href: "/work" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Insights", href: "/insights" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
  const location = useLocation();
  const { user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-b border-primary-foreground/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-1.5 shrink-0">
          <img src={ikambaIcon} alt="Ikamba" className="h-7 sm:h-8 w-auto" />
          <span className="font-heading font-extrabold tracking-tight text-primary-foreground text-base sm:text-lg leading-none">
            IKAMBA
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) =>
            link.dropdown ? (
              <div
                key={link.href}
                className="relative"
                ref={dropdownRef}
                onMouseEnter={() => setDropdownOpen(link.label)}
                onMouseLeave={() => setDropdownOpen(null)}
              >
                <button
                  className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors text-primary-foreground/70 hover:text-primary-foreground ${
                    location.pathname.startsWith("/solutions") ? "text-primary-foreground" : ""
                  }`}
                >
                  {link.label}
                  <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen === link.label ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {dropdownOpen === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-1 w-64 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50"
                    >
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setDropdownOpen(null)}
                          className="block px-4 py-3 hover:bg-accent/10 transition-colors border-b border-border last:border-b-0"
                        >
                          <span className="text-sm font-semibold text-foreground">{item.label}</span>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link key={link.href} to={link.href}>
                <Button
                  variant="nav"
                  size="sm"
                  className={`text-primary-foreground/70 hover:text-primary-foreground ${location.pathname === link.href ? "text-primary-foreground" : ""}`}
                >
                  {link.label}
                </Button>
              </Link>
            )
          )}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Link to="/auth-redirect">
              <Button variant="nav" size="sm" className="text-primary-foreground/70 hover:text-primary-foreground border border-primary-foreground/20">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="nav" size="sm" className="text-primary-foreground/70 hover:text-primary-foreground border border-primary-foreground/20">
                <LogIn size={14} className="mr-1" /> Login
              </Button>
            </Link>
          )}
          <Link to="/start-a-project">
            <Button variant="hero" size="sm">Start a Project</Button>
          </Link>
          <Link to="/contact">
            <Button variant="nav" size="sm" className="text-primary-foreground/70 hover:text-primary-foreground border border-primary-foreground/20">
              Book Consultation
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-1">
          <ThemeToggle />
          <button
            className="p-2 text-primary-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-primary border-b border-primary-foreground/10 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-2">
              {navLinks.map((link) =>
                link.dropdown ? (
                  <div key={link.href}>
                    <button
                      onClick={() => setMobileDropdown(mobileDropdown === link.label ? null : link.label)}
                      className="w-full flex items-center justify-between py-2 text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground"
                    >
                      {link.label}
                      <ChevronDown size={14} className={`transition-transform ${mobileDropdown === link.label ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {mobileDropdown === link.label && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="pl-4 space-y-1 pb-2">
                            {link.dropdown.map((item) => (
                              <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => { setOpen(false); setMobileDropdown(null); }}
                                className="block py-2 text-sm text-primary-foreground/60 hover:text-primary-foreground"
                              >
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setOpen(false)}
                    className="block py-2 text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground"
                  >
                    {link.label}
                  </Link>
                )
              )}
              {user ? (
                <Link to="/auth-redirect" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full mt-2 border-primary-foreground/20 text-primary-foreground">Dashboard</Button>
                </Link>
              ) : (
                <Link to="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full mt-2 border-primary-foreground/20 text-primary-foreground">
                    <LogIn size={14} className="mr-1" /> Login
                  </Button>
                </Link>
              )}
              <Link to="/start-a-project" onClick={() => setOpen(false)}>
                <Button variant="hero" className="w-full mt-2">Start a Project</Button>
              </Link>
              <Link to="/contact" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full mt-1 border-primary-foreground/20 text-primary-foreground">Book Consultation</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
