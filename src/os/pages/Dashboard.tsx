import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useOSStore } from "@/os/store";
import { useAuth } from "@/hooks/useAuth";
import { ALL_TOOLS, getProfile, hasAdminRole } from "@/os/access";
import { PageHeader, KPICard, Badge, PaymentBadge, OSButton } from "@/os/components/ui";
import { fmtRWF } from "@/os/mock/data";
import { Plus, ArrowRight, Calendar as CalendarIcon, Wallet, CheckSquare, Download } from "lucide-react";

const Dashboard = () => {
  const { projects, payments, costs, schedule } = useOSStore();
  const { user, profile: authProfile, roles } = useAuth();
  const isAdmin = hasAdminRole(roles);
  const osProfile = user ? getProfile(user.id) : null;
  const allowed = useMemo(() => new Set(isAdmin ? ALL_TOOLS.map((t) => t.key) : osProfile?.allowedTools || []), [isAdmin, osProfile?.allowedTools]);
  const greetingName = osProfile?.fullName || authProfile?.full_name || user?.email?.split("@")[0] || "there";
  const firstName = greetingName.split(" ")[0];

  const kpis = useMemo(() => {
    const active = projects.filter((p) => !["Paid", "Closed"].includes(p.stage));
    const pipelineValue = active.reduce((s, p) => s + p.value, 0);
    const cashCollected = payments.reduce((s, p) => s + p.amount, 0);
    const outstanding = projects.reduce((s, p) => s + Math.max(0, p.value - p.paid), 0);
    const expenses = costs.reduce((s, c) => s + c.amount, 0);
    const confirmedRevenue = projects
      .filter((p) => !["New Request", "Discovery / Meeting", "Quotation Sent"].includes(p.stage))
      .reduce((s, p) => s + p.value, 0);
    const profit = confirmedRevenue - expenses;
    const upcomingShoots = schedule
      .filter((e) => e.type === "Shoot day" && new Date(e.date) >= new Date())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4);
    const pendingInvoices = projects.filter((p) => ["Invoice Sent", "Payment Pending"].includes(p.stage));
    const hour = new Date().getHours();
    const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    return { active, pipelineValue, cashCollected, outstanding, profit, upcomingShoots, pendingInvoices, greet };
  }, [projects, payments, costs, schedule]);

  return (
    <div>
      <PageHeader
        title={`${kpis.greet}, ${firstName}`}
        subtitle={isAdmin ? "Admin Dashboard — full view of the iKAMBA workspace." : "Here's a quick look at your workspace today."}
        actions={
          <>
            {isAdmin && <Badge tone="gold"><CheckSquare size={10} className="inline mr-1" /> Admin Dashboard</Badge>}
        {allowed.has("/os/projects/new") && <Link to="/os/projects/new">
              <OSButton variant="primary"><Plus size={16} /> Create Project</OSButton>
        </Link>}
          </>
        }
      />

      {/* 4 focused KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Active Projects" value={kpis.active.length} hint={`${kpis.pendingInvoices.length} pending invoices`} />
        <KPICard label="Pipeline Value" value={fmtRWF(kpis.pipelineValue)} accent />
        <KPICard label="Cash Collected" value={fmtRWF(kpis.cashCollected)} hint={`Outstanding ${fmtRWF(kpis.outstanding)}`} />
        <KPICard label="Estimated Profit" value={fmtRWF(kpis.profit)} accent />
      </div>

      {/* Quick actions row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        {allowed.has("/os/todos") && <Link to="/os/todos" className="os-card-2 rounded-xl p-4 flex items-center gap-3 hover:border-[hsl(var(--os-gold))]/40 transition-colors">
          <CheckSquare size={20} className="text-os-gold" />
          <span className="text-sm font-semibold text-white">My To-Dos</span>
        </Link>}
        {allowed.has("/os/calendar") && <Link to="/os/calendar" className="os-card-2 rounded-xl p-4 flex items-center gap-3 hover:border-[hsl(var(--os-gold))]/40 transition-colors">
          <CalendarIcon size={20} className="text-os-gold" />
          <span className="text-sm font-semibold text-white">Calendar</span>
        </Link>}
        {allowed.has("/os/finance") && <Link to="/os/finance" className="os-card-2 rounded-xl p-4 flex items-center gap-3 hover:border-[hsl(var(--os-gold))]/40 transition-colors">
          <Wallet size={20} className="text-os-gold" />
          <span className="text-sm font-semibold text-white">Finance</span>
        </Link>}
        {allowed.has("/os/pipeline") && <Link to="/os/pipeline" className="os-card-2 rounded-xl p-4 flex items-center gap-3 hover:border-[hsl(var(--os-gold))]/40 transition-colors">
          <ArrowRight size={20} className="text-os-gold" />
          <span className="text-sm font-semibold text-white">Pipeline</span>
        </Link>}
        <Link to="/os/app" className="os-card-2 rounded-xl p-4 flex items-center gap-3 hover:border-[hsl(var(--os-gold))]/40 transition-colors">
          <Download size={20} className="text-os-gold" />
          <span className="text-sm font-semibold text-white">Download App</span>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <section className="os-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold">Upcoming Shoots</h2>
            <Link to="/os/calendar" className="text-os-gold text-xs font-semibold flex items-center gap-1">View calendar <ArrowRight size={12} /></Link>
          </div>
          <div className="space-y-2">
            {kpis.upcomingShoots.length === 0 && <p className="text-os-muted text-sm">No upcoming shoots.</p>}
            {kpis.upcomingShoots.map((s) => {
              const project = projects.find((p) => p.id === s.project_id);
              return (
                <div key={s.id} className="flex items-center justify-between os-card-2 rounded-lg p-3">
                  <div className="min-w-0">
                    <div className="text-white text-sm font-semibold truncate">{s.title}</div>
                    <div className="text-xs text-os-muted truncate">{project?.client} · {s.location || "TBD"}</div>
                  </div>
                  <div className="text-xs text-os-gold font-semibold shrink-0 ml-3">{s.date}{s.time ? ` · ${s.time}` : ""}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="os-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold">Pending Invoices</h2>
            <Link to="/os/finance" className="text-os-gold text-xs font-semibold flex items-center gap-1">Open finance <ArrowRight size={12} /></Link>
          </div>
          <div className="space-y-2">
            {kpis.pendingInvoices.length === 0 && <p className="text-os-muted text-sm">All caught up.</p>}
            {kpis.pendingInvoices.slice(0, 4).map((p) => (
              <Link to={`/os/projects/${p.id}`} key={p.id} className="flex items-center justify-between os-card-2 rounded-lg p-3 hover:border-[hsl(var(--os-gold))]/40 transition-colors">
                <div className="min-w-0">
                  <div className="text-white text-sm font-semibold truncate">{p.name}</div>
                  <div className="text-xs text-os-muted truncate">{p.client}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <PaymentBadge status={p.payment_status} />
                  <span className="text-xs text-white font-semibold">{fmtRWF(p.value - p.paid)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="os-card rounded-xl p-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold">Active Projects</h2>
          <Link to="/os/pipeline" className="text-os-gold text-xs font-semibold flex items-center gap-1">Pipeline view <ArrowRight size={12} /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-left text-os-muted text-xs uppercase tracking-wider border-b border-os">
                <th className="py-2 pr-3">Project</th>
                <th className="py-2 pr-3">Client</th>
                <th className="py-2 pr-3">Stage</th>
                <th className="py-2 pr-3">Owner</th>
                <th className="py-2 pr-3">Value</th>
                <th className="py-2">Payment</th>
              </tr>
            </thead>
            <tbody>
              {kpis.active.slice(0, 8).map((p) => (
                <tr key={p.id} className="border-b border-os/50 hover:bg-white/5 cursor-pointer">
                  <td className="py-2.5 pr-3"><Link to={`/os/projects/${p.id}`} className="text-white font-semibold">{p.name}</Link></td>
                  <td className="py-2.5 pr-3 text-os-muted">{p.client}</td>
                  <td className="py-2.5 pr-3"><Badge tone="gold">{p.stage}</Badge></td>
                  <td className="py-2.5 pr-3 text-os-muted">{p.owner}</td>
                  <td className="py-2.5 pr-3 text-white">{fmtRWF(p.value)}</td>
                  <td className="py-2.5"><PaymentBadge status={p.payment_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
