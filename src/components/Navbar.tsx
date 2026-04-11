import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import ikambaIcon from "@/assets/ikamba-icon.png";

const navLinks = [
  { label: "Solutions", href: "/solutions" },
  { label: "Work", href: "/work" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Insights", href: "/insights" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

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
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              <Button
                variant="nav"
                size="sm"
                className={`text-primary-foreground/70 hover:text-primary-foreground ${location.pathname === link.href ? "text-primary-foreground" : ""}`}
              >
                {link.label}
              </Button>
            </Link>
          ))}
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
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground"
                >
                  {link.label}
                </Link>
              ))}
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
