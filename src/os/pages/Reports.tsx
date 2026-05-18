import { useMemo } from "react";
import { useOSStore } from "@/os/store";
import { PageHeader, KPICard, Badge } from "@/os/components/ui";
import { PRODUCT_LINES, fmtRWF } from "@/os/mock/data";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

const GOLD = "hsl(45 75% 53%)";
const PALETTE = ["#D4A739", "#5b8def", "#22c55e", "#ef4444", "#a855f7", "#06b6d4", "#f97316", "#ec4899"];
const axis = { stroke: "rgba(255,255,255,0.35)", style: { fontSize: 11 } };
const tooltipStyle = {
  contentStyle: { background: "hsl(var(--os-surface))", border: "1px solid hsl(var(--os-border))", borderRadius: 8, color: "white" },
  labelStyle: { color: "rgba(255,255,255,0.7)" },
  itemStyle: { color: "white" },
  formatter: (v: any) => fmtRWF(Number(v)),
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="os-card rounded-xl p-5">
    <h3 className="text-white font-bold mb-4">{title}</h3>
    {children}
  </section>
);

const Reports = () => {
  const { projects } = useOSStore();

  const byLine = useMemo(() => PRODUCT_LINES.map((line) => {
    const ps = projects.filter((p) => p.product_line === line);
    return {
      line, name: line,
      count: ps.length,
      revenue: ps.reduce((s, p) => s + p.value, 0),
      profit: ps.reduce((s, p) => s + (p.value - p.costs_total), 0),
    };
  }), [projects]);

  const stageDist = useMemo(() => {
    const m = new Map<string, number>();
    projects.forEach((p) => m.set(p.stage, (m.get(p.stage) || 0) + 1));
    return Array.from(m, ([name, value]) => ({ name, value }));
  }, [projects]);

  const profitByProject = useMemo(() =>
    projects.slice().sort((a, b) => (b.value - b.costs_total) - (a.value - a.costs_total)).slice(0, 8)
      .map((p) => ({ name: p.name.length > 18 ? p.name.slice(0, 18) + "…" : p.name, profit: p.value - p.costs_total })),
    [projects]);

  const totalRevenue = projects.reduce((s, p) => s + p.value, 0);
  const totalProfit = projects.reduce((s, p) => s + (p.value - p.costs_total), 0);
  const completionRate = Math.round((projects.filter((p) => ["Delivered","Paid","Closed"].includes(p.stage)).length / Math.max(1, projects.length)) * 100);
  const overdue = projects.filter((p) => p.deadline && new Date(p.deadline) < new Date() && !["Paid","Closed","Delivered"].includes(p.stage));

  return (
    <div>
      <PageHeader title="Reports" subtitle="High-signal views to brief leadership." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KPICard label="Total projects" value={projects.length} />
        <KPICard label="Completion rate" value={`${completionRate}%`} accent />
        <KPICard label="Overdue" value={overdue.length} />
        <KPICard label="Total revenue" value={fmtRWF(totalRevenue)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Section title="Revenue by product line">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={byLine}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" {...axis} />
                <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} {...axis} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ color: "white", fontSize: 12 }} />
                <Bar dataKey="revenue" fill={GOLD} radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Pipeline by stage">
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={stageDist} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50} paddingAngle={2}>
                  {stageDist.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle.contentStyle} itemStyle={tooltipStyle.itemStyle} />
                <Legend wrapperStyle={{ color: "white", fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Top profit projects">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={profitByProject} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis type="number" tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} {...axis} />
                <YAxis type="category" dataKey="name" width={130} {...axis} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="profit" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Projects per product line">
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={byLine}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" {...axis} />
                <YAxis {...axis} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle.contentStyle} itemStyle={tooltipStyle.itemStyle} />
                <Line type="monotone" dataKey="count" stroke={GOLD} strokeWidth={2.5} dot={{ fill: GOLD, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <Section title="Overdue projects">
        {overdue.length === 0 ? <p className="text-os-muted text-sm">Nothing overdue. </p> : (
          <ul className="space-y-2">
            {overdue.map((p) => (
              <li key={p.id} className="flex justify-between os-card-2 rounded-lg p-3">
                <div><div className="text-white text-sm font-semibold">{p.name}</div><div className="text-xs text-os-muted">{p.client}</div></div>
                <Badge tone="red">Due {p.deadline}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
};

export default Reports;
