import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useOSStore } from "@/os/store";
import { PageHeader, Badge, PaymentBadge, OSButton, Input, Select } from "@/os/components/ui";
import { PIPELINE_STAGES, PRODUCT_LINES, fmtRWF, type PipelineStage } from "@/os/mock/data";
import { Plus, Search, ExternalLink } from "lucide-react";

const STAGE_TONE: Record<string, "default" | "gold" | "green" | "amber" | "blue" | "red"> = {
  "New Request": "blue",
  "Discovery / Meeting": "blue",
  "Scope Confirmed": "blue",
  "Quotation Sent": "amber",
  "Approved": "gold",
  "Contract / Agreement": "gold",
  "Advance Pending": "amber",
  "Scheduled": "gold",
  "Production": "gold",
  "Editing": "gold",
  "Client Review": "amber",
  "Revision": "amber",
  "Delivered": "green",
  "Invoice Sent": "amber",
  "Payment Pending": "amber",
  "Paid": "green",
  "Closed": "default",
};

const Pipeline = () => {
  const { projects, updateProjectStage } = useOSStore();
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<"All" | PipelineStage>("All");
  const [lineFilter, setLineFilter] = useState<string>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (stageFilter !== "All" && p.stage !== stageFilter) return false;
      if (lineFilter !== "All" && p.product_line !== lineFilter) return false;
      if (!q) return true;
      return [p.name, p.client, p.owner, p.service, p.product_line].some((v) => v?.toLowerCase().includes(q));
    });
  }, [projects, query, stageFilter, lineFilter]);

  const totals = useMemo(() => {
    const value = filtered.reduce((s, p) => s + p.value, 0);
    const paid = filtered.reduce((s, p) => s + p.paid, 0);
    return { count: filtered.length, value, paid, balance: value - paid };
  }, [filtered]);

  return (
    <div>
      <PageHeader
        title="Projects Pipeline"
        subtitle="Spreadsheet-style view. Update any project's status from its row dropdown."
        actions={<Link to="/os/projects/new"><OSButton variant="primary"><Plus size={16} /> Create Project</OSButton></Link>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <KPI label="Projects" value={totals.count} />
        <KPI label="Pipeline value" value={fmtRWF(totals.value)} />
        <KPI label="Collected" value={fmtRWF(totals.paid)} />
        <KPI label="Balance" value={fmtRWF(totals.balance)} />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-os-muted" />
          <Input className="pl-9" placeholder="Search by project, client, owner…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="sm:w-48">
          <Select value={lineFilter} onChange={(e) => setLineFilter(e.target.value)}>
            <option value="All">All product lines</option>
            {PRODUCT_LINES.map((l) => <option key={l} value={l}>{l}</option>)}
          </Select>
        </div>
        <div className="sm:w-56">
          <Select value={stageFilter} onChange={(e) => setStageFilter(e.target.value as any)}>
            <option value="All">All stages</option>
            {PIPELINE_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
      </div>

      <div className="os-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1000px]">
            <thead className="bg-white/5 sticky top-0">
              <tr className="text-left text-os-muted text-xs uppercase tracking-wider">
                <th className="p-3">Project</th>
                <th className="p-3">Client</th>
                <th className="p-3">Service</th>
                <th className="p-3">Owner</th>
                <th className="p-3 w-56">Status</th>
                <th className="p-3 text-right">Value</th>
                <th className="p-3 text-right">Paid</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Deadline</th>
                <th className="p-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} className={`border-t border-os/50 hover:bg-white/5 ${i % 2 === 1 ? "bg-white/[0.02]" : ""}`}>
                  <td className="p-3">
                    <Link to={`/os/projects/${p.id}`} className="text-white font-semibold hover:text-os-gold">{p.name}</Link>
                    <div className="text-[10px] text-os-muted mt-0.5">{p.product_line}</div>
                  </td>
                  <td className="p-3 text-os-muted">{p.client}</td>
                  <td className="p-3"><Badge tone="blue">{p.service}</Badge></td>
                  <td className="p-3 text-os-muted">{p.owner}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full shrink-0 bg-current text-${STAGE_TONE[p.stage] === "green" ? "emerald" : STAGE_TONE[p.stage] === "amber" ? "amber" : STAGE_TONE[p.stage] === "red" ? "rose" : STAGE_TONE[p.stage] === "blue" ? "sky" : "yellow"}-400`} />
                      <Select
                        value={p.stage}
                        onChange={(e) => updateProjectStage(p.id, e.target.value as PipelineStage)}
                        className="!py-1.5 text-xs"
                      >
                        {PIPELINE_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </Select>
                    </div>
                  </td>
                  <td className="p-3 text-white font-semibold text-right whitespace-nowrap">{fmtRWF(p.value)}</td>
                  <td className="p-3 text-emerald-300 text-right whitespace-nowrap">{fmtRWF(p.paid)}</td>
                  <td className="p-3"><PaymentBadge status={p.payment_status} /></td>
                  <td className="p-3 text-os-muted whitespace-nowrap">{p.deadline || "—"}</td>
                  <td className="p-3 text-right">
                    <Link to={`/os/projects/${p.id}`} className="text-os-muted hover:text-os-gold inline-block">
                      <ExternalLink size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="p-8 text-center text-os-muted">No projects match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const KPI = ({ label, value }: { label: string; value: string | number }) => (
  <div className="os-card rounded-xl p-4">
    <div className="text-[11px] uppercase tracking-wider text-os-muted font-medium">{label}</div>
    <div className="mt-1.5 text-lg font-bold text-white">{value}</div>
  </div>
);

export default Pipeline;
