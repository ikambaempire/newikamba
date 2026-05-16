import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useOSStore } from "@/os/store";
import { PageHeader, KPICard, Badge, PaymentBadge } from "@/os/components/ui";
import { fmtRWF } from "@/os/mock/data";

const tabs = ["Overview","Revenue","Expenses","Receivables","Payables","Profitability"] as const;

const Finance = () => {
  const { projects, payments, costs } = useOSStore();
  const [tab, setTab] = useState<typeof tabs[number]>("Overview");

  const totals = useMemo(() => {
    const revBooked = projects.reduce((s, p) => s + p.value, 0);
    const cash = payments.reduce((s, p) => s + p.amount, 0);
    const outstanding = projects.reduce((s, p) => s + Math.max(0, p.value - p.paid), 0);
    const expenses = costs.reduce((s, c) => s + c.amount, 0);
    const payablesPending = costs.filter((c) => c.status === "Pending").reduce((s, c) => s + c.amount, 0);
    const profit = revBooked - expenses;
    return { revBooked, cash, outstanding, expenses, payablesPending, profit };
  }, [projects, payments, costs]);

  return (
    <div>
      <PageHeader title="Finance" subtitle="Revenue, costs, cashflow and profitability across iKAMBA." />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard label="Revenue booked" value={fmtRWF(totals.revBooked)} accent />
        <KPICard label="Cash collected" value={fmtRWF(totals.cash)} />
        <KPICard label="Receivables" value={fmtRWF(totals.outstanding)} />
        <KPICard label="Payables" value={fmtRWF(totals.payablesPending)} />
        <KPICard label="Total expenses" value={fmtRWF(totals.expenses)} />
        <KPICard label="Est. profit" value={fmtRWF(totals.profit)} accent />
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-os mt-8 mb-5">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-semibold whitespace-nowrap border-b-2 ${tab === t ? "border-[hsl(var(--os-gold))] text-white" : "border-transparent text-os-muted hover:text-white"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Section title="Recent payments">
            <Table head={["Date","Project","Type","Amount"]}>
              {payments.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8).map((p) => {
                const proj = projects.find((x) => x.id === p.project_id);
                return <tr key={p.id} className="border-b border-os/50">
                  <td className="p-2.5 text-os-muted">{p.date}</td>
                  <td className="p-2.5 text-white">{proj?.name}</td>
                  <td className="p-2.5"><Badge tone="blue">{p.type}</Badge></td>
                  <td className="p-2.5 text-white font-semibold">{fmtRWF(p.amount)}</td>
                </tr>;
              })}
            </Table>
          </Section>
          <Section title="Recent costs">
            <Table head={["Date","Project","Category","Amount"]}>
              {costs.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8).map((c) => {
                const proj = projects.find((x) => x.id === c.project_id);
                return <tr key={c.id} className="border-b border-os/50">
                  <td className="p-2.5 text-os-muted">{c.date}</td>
                  <td className="p-2.5 text-white">{proj?.name}</td>
                  <td className="p-2.5 text-os-muted">{c.category}</td>
                  <td className="p-2.5 text-white font-semibold">{fmtRWF(c.amount)}</td>
                </tr>;
              })}
            </Table>
          </Section>
        </div>
      )}

      {tab === "Revenue" && (
        <Section title="Revenue by project">
          <Table head={["Project","Client","Value","Collected","Balance","Status"]}>
            {projects.map((p) => (
              <tr key={p.id} className="border-b border-os/50">
                <td className="p-2.5"><Link to={`/os/projects/${p.id}`} className="text-white font-semibold">{p.name}</Link></td>
                <td className="p-2.5 text-os-muted">{p.client}</td>
                <td className="p-2.5 text-white">{fmtRWF(p.value)}</td>
                <td className="p-2.5 text-emerald-300">{fmtRWF(p.paid)}</td>
                <td className="p-2.5 text-amber-300">{fmtRWF(p.value - p.paid)}</td>
                <td className="p-2.5"><PaymentBadge status={p.payment_status} /></td>
              </tr>
            ))}
          </Table>
        </Section>
      )}

      {tab === "Expenses" && (
        <Section title="All expenses">
          <Table head={["Date","Project","Category","Description","Paid to","Amount","Status"]}>
            {costs.map((c) => {
              const proj = projects.find((x) => x.id === c.project_id);
              return <tr key={c.id} className="border-b border-os/50">
                <td className="p-2.5 text-os-muted">{c.date}</td>
                <td className="p-2.5 text-white">{proj?.name}</td>
                <td className="p-2.5 text-os-muted">{c.category}</td>
                <td className="p-2.5 text-white">{c.description}</td>
                <td className="p-2.5 text-os-muted">{c.paid_to}</td>
                <td className="p-2.5 text-white font-semibold">{fmtRWF(c.amount)}</td>
                <td className="p-2.5"><Badge tone={c.status === "Paid" ? "green" : "amber"}>{c.status}</Badge></td>
              </tr>;
            })}
          </Table>
        </Section>
      )}

      {tab === "Receivables" && (
        <Section title="Outstanding receivables">
          <Table head={["Project","Client","Balance due","Status"]}>
            {projects.filter((p) => p.value > p.paid).map((p) => (
              <tr key={p.id} className="border-b border-os/50">
                <td className="p-2.5"><Link to={`/os/projects/${p.id}`} className="text-white font-semibold">{p.name}</Link></td>
                <td className="p-2.5 text-os-muted">{p.client}</td>
                <td className="p-2.5 text-amber-300 font-semibold">{fmtRWF(p.value - p.paid)}</td>
                <td className="p-2.5"><PaymentBadge status={p.payment_status} /></td>
              </tr>
            ))}
          </Table>
        </Section>
      )}

      {tab === "Payables" && (
        <Section title="Pending payables">
          <Table head={["Date","Project","Category","Paid to","Amount"]}>
            {costs.filter((c) => c.status === "Pending").map((c) => {
              const proj = projects.find((x) => x.id === c.project_id);
              return <tr key={c.id} className="border-b border-os/50">
                <td className="p-2.5 text-os-muted">{c.date}</td>
                <td className="p-2.5 text-white">{proj?.name}</td>
                <td className="p-2.5 text-os-muted">{c.category}</td>
                <td className="p-2.5 text-white">{c.paid_to}</td>
                <td className="p-2.5 text-white font-semibold">{fmtRWF(c.amount)}</td>
              </tr>;
            })}
          </Table>
        </Section>
      )}

      {tab === "Profitability" && (
        <Section title="Profitability per project">
          <Table head={["Project","Revenue","Costs","Profit","Margin"]}>
            {projects.map((p) => {
              const profit = p.value - p.costs_total;
              const margin = p.value > 0 ? Math.round((profit / p.value) * 100) : 0;
              return <tr key={p.id} className="border-b border-os/50">
                <td className="p-2.5"><Link to={`/os/projects/${p.id}`} className="text-white font-semibold">{p.name}</Link></td>
                <td className="p-2.5 text-white">{fmtRWF(p.value)}</td>
                <td className="p-2.5 text-rose-300">{fmtRWF(p.costs_total)}</td>
                <td className="p-2.5 text-emerald-300 font-semibold">{fmtRWF(profit)}</td>
                <td className="p-2.5"><Badge tone={margin >= 40 ? "green" : margin >= 20 ? "amber" : "red"}>{margin}%</Badge></td>
              </tr>;
            })}
          </Table>
        </Section>
      )}
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="os-card rounded-xl p-5">
    <h3 className="text-white font-bold mb-3">{title}</h3>
    <div className="overflow-x-auto">{children}</div>
  </section>
);
const Table = ({ head, children }: { head: string[]; children: React.ReactNode }) => (
  <table className="w-full text-sm min-w-[600px]">
    <thead><tr className="text-left text-os-muted text-xs uppercase border-b border-os">
      {head.map((h) => <th key={h} className="p-2.5">{h}</th>)}
    </tr></thead>
    <tbody>{children}</tbody>
  </table>
);

export default Finance;
