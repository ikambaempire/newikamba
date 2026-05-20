import { NavLink, Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, Kanban, FilePlus2, Calendar, Wallet, FileText,
  Users, BarChart3, Settings, LogOut, Menu, X, CheckSquare, Shield, UserCircle2, Lock, Receipt, Download,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import SetupWizard from "@/os/SetupWizard";
import NotificationsListener from "@/os/NotificationsListener";
import { WebsitePopupSystem } from "@/components/home/ConversionSections";
import {
  ADMIN_TOOLS, LOCKED_TOOLS, getProfile, pickAvatarColor, upsertProfile, onAccessChange, fetchAllowedTools, setAllowedTools,
  hasAdminRole, type OSProfile, type OSToolKey,
} from "@/os/access";

const ALL_NAV: { to: OSToolKey; icon: any; label: string; end?: boolean }[] = [
  { to: "/os", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/os/todos", icon: CheckSquare, label: "My To-Dos" },
  { to: "/os/pipeline", icon: Kanban, label: "Pipeline" },
  { to: "/os/projects/new", icon: FilePlus2, label: "New Project" },
  { to: "/os/calendar", icon: Calendar, label: "Calendar" },
  { to: "/os/finance", icon: Wallet, label: "Finance" },
  { to: "/os/quotations", icon: FileText, label: "Quotations" },
  { to: "/os/expenses", icon: Receipt, label: "Expense Requests" },
  { to: "/os/team", icon: Users, label: "Team" },
  { to: "/os/reports", icon: BarChart3, label: "Reports" },
  { to: "/os/access", icon: Shield, label: "User Access" },
  { to: "/os/profile", icon: UserCircle2, label: "My Profile" },
  { to: "/os/app", icon: Download, label: "Download App" },
  { to: "/os/settings", icon: Settings, label: "Settings" },
];

// Map any /os/* pathname to its base tool key for guard checks.
const matchToolKey = (pathname: string): OSToolKey | null => {
  if (pathname === "/os" || pathname === "/os/") return "/os";
  if (pathname.startsWith("/os/projects/new")) return "/os/projects/new";
  if (pathname.startsWith("/os/projects/")) return "/os/pipeline"; // detail belongs to pipeline
  const seg = "/" + pathname.split("/").slice(1, 3).join("/");
  return (ALL_NAV.find((n) => n.to === seg)?.to as OSToolKey) || null;
};

const OSLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut, profile, user, roles } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = hasAdminRole(roles);

  const [osProfile, setOsProfile] = useState<OSProfile | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!user) return;
    const existing = getProfile(user.id);
    if (existing) {
      setOsProfile(existing);
      setShowWizard(!existing.setupComplete);
      if (!isAdmin) fetchAllowedTools(user.id).then((tools) => tools && setOsProfile((p) => { setAllowedTools(user.id, tools); return p ? { ...p, allowedTools: tools } : p; }));
    } else if (isAdmin) {
      const now = new Date().toISOString();
      const adminProfile: OSProfile = {
        userId: user.id, email: user.email || "",
        fullName: profile?.full_name || user.email?.split("@")[0] || "Admin",
        role: roles.includes("super_admin") ? "Super Admin" : "Admin", department: "Leadership",
        avatarColor: pickAvatarColor(user.id),
        setupComplete: true, allowedTools: ADMIN_TOOLS,
        createdAt: now, updatedAt: now,
      };
      upsertProfile(adminProfile);
      setOsProfile(adminProfile);
    } else {
      setShowWizard(true);
    }
  }, [user, isAdmin, profile?.full_name, roles]);

  useEffect(() => {
    if (!user || isAdmin) return;
    const syncTools = () => fetchAllowedTools(user.id).then((tools) => tools && setOsProfile((p) => { setAllowedTools(user.id, tools); return p ? { ...p, allowedTools: tools } : p; }));
    window.addEventListener("focus", syncTools);
    const iv = window.setInterval(syncTools, 30000);
    return () => { window.removeEventListener("focus", syncTools); window.clearInterval(iv); };
  }, [user, isAdmin]);

  // React immediately to admin permission changes (same tab + cross-tab).
  useEffect(() => {
    if (!user) return;
    return onAccessChange(() => {
      setOsProfile(getProfile(user.id));
      setTick((t) => t + 1);
    });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const allowed = useMemo(() => {
    if (isAdmin) return new Set<OSToolKey>(ALL_NAV.map((n) => n.to));
    const tools = osProfile?.allowedTools || [];
    const set = new Set<OSToolKey>([...tools, ...LOCKED_TOOLS]);
    set.delete("/os/access");
    return set;
  }, [isAdmin, osProfile?.allowedTools]);

  const visibleNav = ALL_NAV.filter((n) => allowed.has(n.to));

  // ── Hard permission enforcement: block routes the user no longer has access to.
  const currentKey = matchToolKey(location.pathname);
  const blocked = !!osProfile && !!currentKey && !allowed.has(currentKey);

  const initial = (osProfile?.fullName || profile?.full_name || user?.email || "?").charAt(0).toUpperCase();
  const avatarColor = osProfile?.avatarColor || pickAvatarColor(user?.id || "guest");
  const avatarUrl = osProfile?.avatarUrl;

  const SideContent = (
    <>
      <div className="px-5 pt-5 pb-4 border-b border-os">
        <Link to="/" className="flex items-center gap-2 group" title="Back to ikamba.africa">
          <div className="h-8 w-8 rounded-md bg-os-gold flex items-center justify-center text-os-navy font-extrabold text-sm group-hover:scale-105 transition-transform">iK</div>
          <div>
            <div className="text-white font-bold leading-tight group-hover:text-os-gold transition-colors">iKAMBA</div>
            <div className="text-[10px] uppercase tracking-widest text-os-gold leading-tight">Media OS</div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {visibleNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-os-gold text-[hsl(var(--os-navy-deep))] font-semibold"
                  : "text-os-muted hover:text-white hover:bg-white/5"
              }`
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-os">
        <div className="flex items-center gap-2 px-2 pb-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="h-8 w-8 rounded-full object-cover shrink-0" />
          ) : (
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: avatarColor }}>
              {initial}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-xs text-white font-medium truncate">{osProfile?.fullName || profile?.full_name || user?.email}</div>
            <div className="text-[10px] text-os-muted truncate">{osProfile?.role || user?.email}</div>
          </div>
        </div>
        <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-os-muted hover:text-white hover:bg-white/5">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="os-theme min-h-screen flex">
      <NotificationsListener />
      <WebsitePopupSystem showWhatsApp={false} />
      {showWizard && user && (
        <SetupWizard
          userId={user.id}
          email={user.email || ""}
          isAdmin={isAdmin}
          initialName={profile?.full_name || undefined}
          onComplete={() => {
            setOsProfile(getProfile(user.id));
            setShowWizard(false);
          }}
        />
      )}
      <aside className="hidden lg:flex w-60 flex-col bg-os-navy-deep border-r border-os shrink-0">
        {SideContent}
      </aside>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-os-navy-deep border-r border-os flex flex-col">
            {SideContent}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-os-navy-deep border-b border-os">
          <button onClick={() => setMobileOpen(true)} className="text-white p-1">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-6 rounded bg-os-gold flex items-center justify-center text-os-navy font-extrabold text-xs">iK</div>
            <span className="text-white font-bold text-sm">iKAMBA Media OS</span>
          </div>
          <div className="w-6" />
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {blocked ? (
            <BlockedView />
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

const BlockedView = () => {
  const navigate = useNavigate();
  return (
    <div className="os-card rounded-2xl p-10 text-center max-w-md mx-auto mt-12">
      <Lock className="mx-auto text-os-muted mb-3" size={32} />
      <h2 className="text-white font-bold text-lg mb-1">Access restricted</h2>
      <p className="text-os-muted text-sm mb-5">You no longer have access to this tool. Ask an admin to enable it for you.</p>
      <button onClick={() => navigate("/os", { replace: true })} className="px-4 py-2 rounded-lg bg-os-gold text-[hsl(var(--os-navy-deep))] font-semibold text-sm">
        Back to Dashboard
      </button>
    </div>
  );
};

export default OSLayout;
