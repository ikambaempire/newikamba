import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useOSStore } from "@/os/store";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader, Badge, PaymentBadge, OSButton, Input, Select, Modal, Field, Textarea } from "@/os/components/ui";
import { PIPELINE_STAGES, PRODUCT_LINES, fmtRWF, type PipelineStage } from "@/os/mock/data";
import { Plus, Search, ExternalLink, Upload, Download, Link2 } from "lucide-react";
import { parseCSV, rowsToObjects, toCSV, downloadCSV, fetchSheetAsCSV } from "@/os/utils/csv";
import { syncProjectDatesToCalendar } from "@/os/utils/calendarSync";
import { toast } from "sonner";

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
  const { projects, updateProjectStage, addProject } = useOSStore();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<"All" | PipelineStage>("All");
  const [lineFilter, setLineFilter] = useState<string>("All");
  const [importOpen, setImportOpen] = useState(false);

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

  const exportCsv = () => {
    const headers = ["name","client","contact_person","phone","email","product_line","service","stage","value","paid","shoot_date","deadline","location","owner","payment_status"];
    const rows = filtered.map((p) => headers.map((h) => (p as any)[h] ?? ""));
    downloadCSV(`ikamba-pipeline-${new Date().toISOString().slice(0,10)}.csv`, toCSV(headers, rows));
    toast.success(`Exported ${rows.length} projects`);
  };

  return (
    <div>
      <PageHeader
        title="Projects Pipeline"
        subtitle="Spreadsheet-style view. Import from CSV or Google Sheets, export anytime."
        actions={
          <>
            <OSButton variant="outline" onClick={() => setImportOpen(true)}><Upload size={14} /> Import</OSButton>
            <OSButton variant="outline" onClick={exportCsv}><Download size={14} /> Export CSV</OSButton>
            <Link to="/os/projects/new"><OSButton variant="primary"><Plus size={16} /> Create Project</OSButton></Link>
          </>
        }
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

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={async (objs) => {
          let added = 0, synced = 0, skipped = 0;
          const skipReasons: string[] = [];
          for (let i = 0; i < objs.length; i++) {
            const o = objs[i];
            const name = (o.name || "").trim();
            const client = (o.client || "").trim();
            if (!name && !client) { skipped++; skipReasons.push(`Row ${i + 2}: empty row`); continue; }
            if (!name) { skipped++; skipReasons.push(`Row ${i + 2}: missing project name`); continue; }
            const stageMatch = PIPELINE_STAGES.find(
              s => s.toLowerCase() === String(o.stage || "").toLowerCase()
            );
            const newId = addProject({
              name,
              client: client || "—",
              contact_person: o.contact_person || "",
              phone: o.phone || "", email: o.email || "",
              product_line: o.product_line || PRODUCT_LINES[0],
              service: o.service || "Other",
              objective: o.objective || "",
              deliverables: o.deliverables || "",
              shoot_date: o.shoot_date || "",
              location: o.location || "",
              deadline: o.deadline || "",
              budget_range: o.budget_range || "",
              payment_terms: o.payment_terms || "",
              owner: o.owner || "",
              notes: o.notes || "",
              references: o.references || "",
              stage: (stageMatch || "New Request") as PipelineStage,
              value: Number(String(o.value || "0").replace(/[^\d.-]/g, "")) || 0,
            } as any);
            added++;
            if (user && (o.shoot_date || o.deadline)) {
              const r = await syncProjectDatesToCalendar({
                userId: user.id, projectId: newId, projectName: name, client,
                shootDate: o.shoot_date || null, deadline: o.deadline || null,
                location: o.location || null,
              });
              if (r.ok && (r.count || 0) > 0) synced += r.count || 0;
            }
          }
          if (added > 0) {
            toast.success(`Imported ${added} project${added === 1 ? "" : "s"}${synced ? ` · ${synced} calendar event(s)` : ""}${skipped ? ` · ${skipped} skipped` : ""}`);
          } else {
            toast.error(`No projects imported. ${skipReasons[0] || "Check that your file has columns like name/project and client."}`);
          }
          setImportOpen(false);
        }}
      />
    </div>
  );
};

const ImportModal = ({ open, onClose, onImport }: { open: boolean; onClose: () => void; onImport: (objs: any[]) => void | Promise<void> }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [sheetUrl, setSheetUrl] = useState("");
  const [pasted, setPasted] = useState("");
  const [busy, setBusy] = useState(false);

  const runImport = async (csv: string) => {
    const rows = parseCSV(csv);
    const objs = rowsToObjects(rows);
    if (!objs.length) return toast.error("No rows found in CSV.");
    await onImport(objs);
  };

  const onFile = async (f: File) => {
    setBusy(true);
    try { await runImport(await f.text()); } finally { setBusy(false); }
  };

  const onSheet = async () => {
    if (!sheetUrl.trim()) return toast.error("Paste a Google Sheets link first.");
    setBusy(true);
    try {
      const csv = await fetchSheetAsCSV(sheetUrl.trim());
      await runImport(csv);
    } catch (e: any) { toast.error(e?.message || "Could not import sheet"); }
    finally { setBusy(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Import projects into pipeline">
      <div className="space-y-4 text-sm">
        <p className="text-os-muted text-xs">
          Accepted columns (case-insensitive): <b>name, client, contact_person, phone, email, product_line, service, stage, value, shoot_date, deadline, location, owner, notes</b>.
          Dates with values automatically appear in your calendar.
        </p>

        <Field label="Upload a CSV file">
          <input ref={fileRef} type="file" accept=".csv,text/csv" hidden
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          <OSButton variant="outline" onClick={() => fileRef.current?.click()} disabled={busy}>
            <Upload size={14} /> Choose CSV file
          </OSButton>
        </Field>

        <div className="border-t border-os pt-3">
          <Field label="…or paste a Google Sheets link (sheet must be 'Anyone with the link can view')">
            <div className="flex gap-2">
              <Input value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/…/edit#gid=0" />
              <OSButton variant="primary" onClick={onSheet} disabled={busy}>
                <Link2 size={14} /> {busy ? "Importing…" : "Pull data"}
              </OSButton>
            </div>
          </Field>
        </div>

        <div className="border-t border-os pt-3">
          <Field label="…or paste CSV text directly">
            <Textarea rows={5} value={pasted} onChange={(e) => setPasted(e.target.value)}
              placeholder="name,client,service,value,shoot_date,deadline&#10;Brand Launch,ACME,Corporate Video,1500000,2026-06-01,2026-06-15" />
            <div className="mt-2 flex justify-end">
              <OSButton variant="outline" onClick={() => pasted.trim() ? runImport(pasted) : toast.error("Paste some CSV first.")} disabled={busy}>
                Import pasted CSV
              </OSButton>
            </div>
          </Field>
        </div>
      </div>
    </Modal>
  );
};


const KPI = ({ label, value }: { label: string; value: string | number }) => (
  <div className="os-card rounded-xl p-4">
    <div className="text-[11px] uppercase tracking-wider text-os-muted font-medium">{label}</div>
    <div className="mt-1.5 text-lg font-bold text-white">{value}</div>
  </div>
);

export default Pipeline;
