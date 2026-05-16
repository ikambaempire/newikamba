import { useMemo } from "react";
import { useOSStore } from "@/os/store";
import { PageHeader, KPICard, Badge } from "@/os/components/ui";
import { PRODUCT_LINES, fmtRWF } from "@/os/mock/data";

const Reports = () => {
  const { projects } = useOSStore();

  const byLine = useMemo(() => PRODUCT_LINES.map((line) => {
    const ps = projects.filter((p) => p.product_line === line);
    return { line, count: ps.length, revenue: ps.reduce((s, p) => s + p.value, 0), profit: ps.reduce((s, p) => s + (p.value - p.costs_total), 0) };
  }), [projects]);

  const maxRev = Math.max(1, ...byLine.map((x) => x.revenue));
  const completionRate = Math.round((projects.filter((p) => ["Delivered","Paid","Closed"].includes(p.stage)).length / Math.max(1, projects.length)) * 100);
  const overdue = projects.filter((p) => p.deadline && new Date(p.deadline) < new Date() && !["Paid","Closed","Delivered"].includes(p.stage));

  return (
    <div>
      <PageHeader title="Reports" subtitle="High-signal views to brief leadership." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KPICard label="Total projects" value={projects.length} />
        <KPICard label="Completion rate" value={`${completionRate}%`} accent />
        <KPICard label="Overdue" value={overdue.length} />
        <KPICard label="Total revenue" value={fmtRWF(projects.reduce((s,p)=>s+p.value,0))} />
      </div>

      <section className="os-card rounded-xl p-5 mb-6">
        <h3 className="text-white font-bold mb-4">Revenue by product line</h3>
        <div className="space-y-3">
          {byLine.map((l) => (
            <div key={l.line}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white">{l.line} <span className="text-os-muted text-xs">· {l.count} projects</span></span>
                <span className="text-os-gold font-semibold">{fmtRWF(l.revenue)}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-os-gold rounded-full" style={{ width: `${(l.revenue / maxRev) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="os-card rounded-xl p-5">
          <h3 className="text-white font-bold mb-3">Profit by project</h3>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-os-muted text-xs uppercase border-b border-os"><th className="py-2">Project</th><th className="py-2">Profit</th></tr></thead>
            <tbody>
              {projects.slice().sort((a,b) => (b.value - b.costs_total) - (a.value - a.costs_total)).slice(0, 6).map((p) => (
                <tr key={p.id} className="border-b border-os/50">
                  <td className="py-2 text-white">{p.name}</td>
                  <td className="py-2 text-emerald-300 font-semibold">{fmtRWF(p.value - p.costs_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="os-card rounded-xl p-5">
          <h3 className="text-white font-bold mb-3">Overdue projects</h3>
          {overdue.length === 0 && <p className="text-os-muted text-sm">Nothing overdue.</p>}
          <ul className="space-y-2">
            {overdue.map((p) => (
              <li key={p.id} className="flex justify-between os-card-2 rounded-lg p-3">
                <div><div className="text-white text-sm font-semibold">{p.name}</div><div className="text-xs text-os-muted">{p.client}</div></div>
                <Badge tone="red">Due {p.deadline}</Badge>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Reports;
