import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useOSStore } from "@/os/store";
import { PageHeader, KPICard, Badge, PaymentBadge, OSButton } from "@/os/components/ui";
import { fmtRWF } from "@/os/mock/data";
import { Plus, ArrowRight } from "lucide-react";

const Dashboard = () => {
  const { projects, payments, costs, quotations, schedule } = useOSStore();

  const kpis = useMemo(() => {
    const active = projects.filter((p) => !["Paid", "Closed"].includes(p.stage));
    const pipelineValue = active.reduce((s, p) => s + p.value, 0);
    const confirmedRevenue = projects.filter((p) => !["New Request", "Discovery / Meeting", "Quotation Sent"].includes(p.stage)).reduce((s, p) => s + p.value, 0);
    const cashCollected = payments.reduce((s, p) => s + p.amount, 0);
    const outstanding = projects.reduce((s, p) => s + Math.max(0, p.value - p.paid), 0);
    const expenses = costs.reduce((s, c) => s + c.amount, 0);
    const profit = confirmedRevenue - expenses;
    const overdue = projects.filter((p) => p.deadline && new Date(p.deadline) < new Date() && !["Paid", "Closed", "Delivered"].includes(p.stage));
    const upcomingShoots = schedule.filter((e) => e.type === "Shoot day" && new Date(e.date) >= new Date()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
    const pendingInvoices = projects.filter((p) => ["Invoice Sent", "Payment Pending"].includes(p.stage));
    return { active, pipelineValue, confirmedRevenue, cashCollected, outstanding, expenses, profit, overdue, upcomingShoots, pendingInvoices };
  }, [projects, payments, costs, schedule]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Every iKAMBA project — requested, scheduled, delivered, paid."
        actions={
          <Link to="/os/projects/new">
            <OSButton variant="primary"><Plus size={16} /> Create Project</OSButton>
          </Link>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <KPICard label="Active Projects" value={kpis.active.length} />
        <KPICard label="Pipeline Value" value={fmtRWF(kpis.pipelineValue)} accent />
        <KPICard label="Confirmed Revenue" value={fmtRWF(kpis.confirmedRevenue)} />
        <KPICard label="Cash Collected" value={fmtRWF(kpis.cashCollected)} />
        <KPICard label="Outstanding" value={fmtRWF(kpis.outstanding)} hint={`${kpis.pendingInvoices.length} invoices`} />
        <KPICard label="Total Expenses" value={fmtRWF(kpis.expenses)} />
        <KPICard label="Estimated Profit" value={fmtRWF(kpis.profit)} accent />
        <KPICard label="Overdue Projects" value={kpis.overdue.length} />
        <KPICard label="Upcoming Shoots" value={kpis.upcomingShoots.length} />
        <KPICard label="Pending Invoices" value={kpis.pendingInvoices.length} />
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
                  <div>
                    <div className="text-white text-sm font-semibold">{s.title}</div>
                    <div className="text-xs text-os-muted">{project?.client} · {s.location || "TBD"}</div>
                  </div>
                  <div className="text-xs text-os-gold font-semibold">{s.date}{s.time ? ` · ${s.time}` : ""}</div>
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
            {kpis.pendingInvoices.map((p) => (
              <Link to={`/os/projects/${p.id}`} key={p.id} className="flex items-center justify-between os-card-2 rounded-lg p-3 hover:border-[hsl(var(--os-gold))]/40 transition-colors">
                <div>
                  <div className="text-white text-sm font-semibold">{p.name}</div>
                  <div className="text-xs text-os-muted">{p.client}</div>
                </div>
                <div className="flex items-center gap-2">
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
              {kpis.active.map((p) => (
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
