import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard, Kanban, FilePlus2, Calendar, Wallet, FileText,
  Users, BarChart3, Settings, LogOut, Menu, X, CheckSquare,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const nav = [
  { to: "/os", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/os/todos", icon: CheckSquare, label: "My To-Dos" },
  { to: "/os/pipeline", icon: Kanban, label: "Pipeline" },
  { to: "/os/projects/new", icon: FilePlus2, label: "New Project" },
  { to: "/os/calendar", icon: Calendar, label: "Calendar" },
  { to: "/os/finance", icon: Wallet, label: "Finance" },
  { to: "/os/quotations", icon: FileText, label: "Quotations" },
  { to: "/os/team", icon: Users, label: "Team" },
  { to: "/os/reports", icon: BarChart3, label: "Reports" },
  { to: "/os/settings", icon: Settings, label: "Settings" },
];

const OSLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut, profile, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const SideContent = (
    <>
      <div className="px-5 pt-5 pb-4 border-b border-os">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-os-gold flex items-center justify-center text-os-navy font-extrabold text-sm">iK</div>
          <div>
            <div className="text-white font-bold leading-tight">iKAMBA</div>
            <div className="text-[10px] uppercase tracking-widest text-os-gold leading-tight">Media OS</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {nav.map((item) => (
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
        <div className="px-2 pb-2">
          <div className="text-xs text-white font-medium truncate">{profile?.full_name || user?.email}</div>
          <div className="text-[10px] text-os-muted truncate">{user?.email}</div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-os-muted hover:text-white hover:bg-white/5"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="os-theme min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-col bg-os-navy-deep border-r border-os shrink-0">
        {SideContent}
      </aside>

      {/* Mobile sidebar */}
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
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OSLayout;
