import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useOSStore } from "@/os/store";
import { useAuth } from "@/hooks/useAuth";
import { hasAdminRole } from "@/os/access";
import { PageHeader, Badge, PaymentBadge, OSButton, Input, Select, Modal, Field, Textarea } from "@/os/components/ui";
import { PIPELINE_STAGES, PRODUCT_LINES, fmtRWF, type PipelineStage } from "@/os/mock/data";
import { Plus, Search, ExternalLink, Upload, Download, Link2, Columns3, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import { parseCSV, rowsToObjects, toCSV, downloadCSV, fetchSheetAsCSV } from "@/os/utils/csv";
import { syncProjectDatesToCalendar } from "@/os/utils/calendarSync";
import { usePipelineColumns, savePipelineColumns, BUILTIN_COLUMNS, type PipelineColumn } from "@/os/pipelineColumns";
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
  const { projects, updateProjectStage, updateProject, addProject, deleteProject, clearAllProjects } = useOSStore();
  const { user, roles } = useAuth();
  const isAdmin = hasAdminRole(roles);
  const { cols, setCols } = usePipelineColumns();
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<"All" | PipelineStage>("All");
  const [lineFilter, setLineFilter] = useState<string>("All");
  const [importOpen, setImportOpen] = useState(false);
  const [colsOpen, setColsOpen] = useState(false);

  const visibleCols = useMemo(() => cols.filter((c) => c.visible), [cols]);
  const customCols = useMemo(() => visibleCols.filter((c) => !c.builtin), [visibleCols]);

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
            {isAdmin && (
              <OSButton variant="outline" onClick={() => setColsOpen(true)}>
                <Columns3 size={14} /> Columns
              </OSButton>
            )}
            <OSButton variant="outline" onClick={() => setImportOpen(true)}><Upload size={14} /> Import</OSButton>
            <OSButton variant="outline" onClick={exportCsv}><Download size={14} /> Export CSV</OSButton>
            {isAdmin && projects.length > 0 && (
              <OSButton
                variant="outline"
                onClick={async () => {
                  const first = window.prompt(`Delete ALL ${projects.length} projects from the pipeline? This cannot be undone.\n\nType DELETE to confirm.`);
                  if (first !== "DELETE") return;
                  const r = await clearAllProjects();
                  if (r.ok) toast.success(`Cleared ${r.count || 0} projects`);
                  else toast.error(r.error || "Could not clear pipeline");
                }}
              >
                <Trash2 size={14} /> Clear all
              </OSButton>
            )}
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
                {visibleCols.map((c) => (
                  <th key={c.key} className={`p-3 ${c.key === "value" || c.key === "paid" ? "text-right" : ""} ${c.key === "stage" ? "w-56" : ""}`}>{c.label}</th>
                ))}
                <th className="p-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} className={`border-t border-os/50 hover:bg-white/5 ${i % 2 === 1 ? "bg-white/[0.02]" : ""}`}>
                  {visibleCols.map((c) => {
                    if (c.builtin) {
                      switch (c.key) {
                        case "name": return (
                          <td key={c.key} className="p-3 min-w-[220px]">
                            <div className="flex items-center gap-1.5">
                              <Link to={`/os/projects/${p.id}`} className="text-os-gold hover:text-white shrink-0" title="Open"><ExternalLink size={12} /></Link>
                              <InlineText value={p.name} onSave={(v) => v && v !== p.name && updateProject(p.id, { name: v })} />
                            </div>
                            <div className="text-[10px] text-os-muted mt-0.5 pl-5">{p.product_line}</div>
                          </td>
                        );
                        case "client":  return <td key={c.key} className="p-3"><InlineText value={p.client} onSave={(v) => v !== p.client && updateProject(p.id, { client: v })} /></td>;
                        case "service": return <td key={c.key} className="p-3"><InlineText value={p.service} onSave={(v) => v !== p.service && updateProject(p.id, { service: v })} /></td>;
                        case "owner":   return <td key={c.key} className="p-3"><InlineText value={p.owner} onSave={(v) => v !== p.owner && updateProject(p.id, { owner: v })} /></td>;
                        case "stage":   return (
                          <td key={c.key} className="p-3">
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full shrink-0 bg-current text-${STAGE_TONE[p.stage] === "green" ? "emerald" : STAGE_TONE[p.stage] === "amber" ? "amber" : STAGE_TONE[p.stage] === "red" ? "rose" : STAGE_TONE[p.stage] === "blue" ? "sky" : "yellow"}-400`} />
                              <Select value={p.stage} onChange={(e) => updateProjectStage(p.id, e.target.value as PipelineStage)} className="!py-1.5 text-xs">
                                {PIPELINE_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                              </Select>
                            </div>
                          </td>
                        );
                        case "value": return (
                          <td key={c.key} className="p-3 text-right whitespace-nowrap min-w-[130px]">
                            <InlineNumber value={p.value} align="right" onSave={(n) => n !== p.value && updateProject(p.id, { value: n })} />
                          </td>
                        );
                        case "paid": return (
                          <td key={c.key} className="p-3 text-right whitespace-nowrap min-w-[130px]">
                            <InlineNumber
                              value={p.paid}
                              align="right"
                              className="text-emerald-300"
                              onSave={(n) => {
                                if (n === p.paid) return;
                                const status = n >= p.value && p.value > 0 ? "Paid" : n > 0 ? "Partially Paid" : "Pending";
                                updateProject(p.id, { paid: n, payment_status: status as any });
                              }}
                            />
                          </td>
                        );
                        case "payment_status": return <td key={c.key} className="p-3"><PaymentBadge status={p.payment_status} /></td>;
                        case "deadline": return (
                          <td key={c.key} className="p-3 whitespace-nowrap">
                            <InlineDate value={p.deadline} onSave={(v) => v !== p.deadline && updateProject(p.id, { deadline: v })} />
                          </td>
                        );
                        default: return <td key={c.key} className="p-3"><InlineText value={(p as any)[c.key] || ""} onSave={(v) => updateProject(p.id, { [c.key]: v } as any)} /></td>;
                      }
                    }
                    // Custom column — inline editable, stored in custom_fields JSONB
                    const cf = ((p as any).custom_fields || {}) as Record<string, any>;
                    const val = cf[c.key] ?? "";
                    return (
                      <td key={c.key} className="p-3">
                        <Input
                          type={c.type === "date" ? "date" : c.type === "number" ? "number" : "text"}
                          value={val}
                          onChange={(e) => {
                            const next = { ...cf, [c.key]: e.target.value };
                            updateProject(p.id, { custom_fields: next } as any);
                          }}
                          className="!py-1.5 text-xs"
                        />
                      </td>
                    );

                    // Custom column — inline editable, stored in custom_fields JSONB
                    const cf = ((p as any).custom_fields || {}) as Record<string, any>;
                    const val = cf[c.key] ?? "";
                    return (
                      <td key={c.key} className="p-3">
                        <Input
                          type={c.type === "date" ? "date" : c.type === "number" ? "number" : "text"}
                          value={val}
                          onChange={(e) => {
                            const next = { ...cf, [c.key]: e.target.value };
                            updateProject(p.id, { custom_fields: next } as any);
                          }}
                          className="!py-1.5 text-xs"
                        />
                      </td>
                    );
                  })}
                  <td className="p-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link to={`/os/projects/${p.id}`} className="text-os-muted hover:text-os-gold p-1 rounded hover:bg-white/5" title="Open">
                        <ExternalLink size={14} />
                      </Link>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            if (!window.confirm(`Delete project "${p.name}"? This cannot be undone.`)) return;
                            deleteProject(p.id);
                            toast.success("Project deleted");
                          }}
                          className="text-os-muted hover:text-rose-300 p-1 rounded hover:bg-rose-500/10"
                          title="Delete project"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={visibleCols.length + 1} className="p-8 text-center text-os-muted">No projects match your filters.</td></tr>
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

      <ColumnsModal
        open={colsOpen}
        onClose={() => setColsOpen(false)}
        cols={cols}
        onSave={async (next) => {
          setCols(next);
          const r = await savePipelineColumns(next);
          if (r.ok) toast.success("Columns updated for everyone");
          else toast.error(r.error || "Could not save columns");
          setColsOpen(false);
        }}
      />
    </div>
  );
};

// ── Admin column manager ───────────────────────────────────────────────────
const slugifyKey = (s: string) =>
  "cf_" + s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40);

const ColumnsModal = ({ open, onClose, cols, onSave }: { open: boolean; onClose: () => void; cols: PipelineColumn[]; onSave: (next: PipelineColumn[]) => void }) => {
  const [draft, setDraft] = useState<PipelineColumn[]>(cols);
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<"text" | "date" | "number">("text");

  // Re-sync when modal reopens
  useEffect(() => { if (open) setDraft(cols); }, [open, cols]);

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= draft.length) return;
    const next = [...draft];
    [next[i], next[j]] = [next[j], next[i]];
    setDraft(next);
  };
  const rename = (i: number, label: string) => setDraft(draft.map((c, k) => k === i ? { ...c, label } : c));
  const toggleVis = (i: number) => setDraft(draft.map((c, k) => k === i ? { ...c, visible: !c.visible } : c));
  const remove = (i: number) => setDraft(draft.filter((_, k) => k !== i));
  const addCol = () => {
    const label = newLabel.trim();
    if (!label) return;
    const key = slugifyKey(label);
    if (draft.some((c) => c.key === key)) return toast.error("A column with a similar name already exists");
    setDraft([...draft, { key, label, builtin: false, visible: true, type: newType }]);
    setNewLabel(""); setNewType("text");
  };
  const resetDefaults = () => setDraft(BUILTIN_COLUMNS);

  return (
    <Modal open={open} onClose={onClose} title="Manage pipeline columns">
      <div className="space-y-4 text-sm">
        <p className="text-os-muted text-xs">
          Rename, reorder, hide built-in columns, or add your own (text, date, number). Changes apply to everyone on the team.
        </p>

        <div className="rounded-lg border border-os overflow-hidden">
          <div className="grid grid-cols-[1fr_120px_110px_60px] gap-2 px-3 py-2 bg-white/5 text-[11px] uppercase tracking-wider text-os-muted">
            <div>Label</div>
            <div>Type</div>
            <div>Order</div>
            <div className="text-right">…</div>
          </div>
          <div className="divide-y divide-os/50 max-h-[50vh] overflow-y-auto">
            {draft.map((c, i) => (
              <div key={c.key} className="grid grid-cols-[1fr_120px_110px_60px] gap-2 items-center px-3 py-2">
                <div className="flex items-center gap-2">
                  <Input value={c.label} onChange={(e) => rename(i, e.target.value)} className="!py-1.5" />
                  {c.builtin && <span className="text-[10px] text-os-muted">built-in</span>}
                </div>
                <div className="text-os-muted text-xs">{c.builtin ? "—" : (c.type || "text")}</div>
                <div className="flex gap-1">
                  <button onClick={() => move(i, -1)} className="p-1.5 rounded hover:bg-white/10 text-os-muted hover:text-white" title="Move up"><ArrowUp size={13} /></button>
                  <button onClick={() => move(i, 1)} className="p-1.5 rounded hover:bg-white/10 text-os-muted hover:text-white" title="Move down"><ArrowDown size={13} /></button>
                </div>
                <div className="flex justify-end gap-1">
                  <button onClick={() => toggleVis(i)} className="p-1.5 rounded hover:bg-white/10 text-os-muted hover:text-white" title={c.visible ? "Hide" : "Show"}>
                    {c.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  {!c.builtin && (
                    <button onClick={() => remove(i)} className="p-1.5 rounded hover:bg-rose-500/15 text-rose-300" title="Delete column"><Trash2 size={13} /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-os bg-white/[0.02] p-3">
          <div className="text-white font-semibold text-[13px] mb-2">Add a new column</div>
          <div className="grid grid-cols-[1fr_140px_auto] gap-2 items-end">
            <Field label="Column name"><Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="e.g. Meeting date" /></Field>
            <Field label="Type">
              <Select value={newType} onChange={(e) => setNewType(e.target.value as any)}>
                <option value="text">Text</option>
                <option value="date">Date</option>
                <option value="number">Number</option>
              </Select>
            </Field>
            <OSButton variant="primary" onClick={addCol}><Plus size={14} /> Add</OSButton>
          </div>
        </div>

        <div className="flex justify-between">
          <OSButton variant="ghost" onClick={resetDefaults}>Reset to defaults</OSButton>
          <div className="flex gap-2">
            <OSButton variant="outline" onClick={onClose}>Cancel</OSButton>
            <OSButton variant="primary" onClick={() => onSave(draft)}>Save for team</OSButton>
          </div>
        </div>
      </div>
    </Modal>
  );
};


const REQUIRED_HINT = ["name", "client"];
const KNOWN_FIELDS = ["name","client","contact_person","phone","email","product_line","service","stage","value","shoot_date","deadline","location","owner","notes","budget_range","objective","deliverables"];

const ImportModal = ({ open, onClose, onImport }: { open: boolean; onClose: () => void; onImport: (objs: any[]) => void | Promise<void> }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [sheetUrl, setSheetUrl] = useState("");
  const [pasted, setPasted] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<{ rows: Record<string, string>[]; headers: string[]; source: string } | null>(null);
  const [drag, setDrag] = useState(false);

  const reset = () => { setPreview(null); setPasted(""); setSheetUrl(""); };

  const loadPreview = (csv: string, source: string) => {
    const rows = parseCSV(csv);
    if (rows.length < 2) { toast.error("CSV needs a header row and at least one data row."); return; }
    const objs = rowsToObjects(rows);
    const headers = Object.keys(objs[0] || {});
    setPreview({ rows: objs, headers, source });
  };

  const onFile = async (f: File) => {
    setBusy(true);
    try { loadPreview(await f.text(), f.name); } finally { setBusy(false); }
  };

  const onSheet = async () => {
    if (!sheetUrl.trim()) return toast.error("Paste a Google Sheets link first.");
    setBusy(true);
    try { loadPreview(await fetchSheetAsCSV(sheetUrl.trim()), "Google Sheet"); }
    catch (e: any) { toast.error(e?.message || "Could not import sheet"); }
    finally { setBusy(false); }
  };

  const downloadSample = () => {
    const sample = `name,client,service,product_line,stage,value,shoot_date,deadline,location,owner,notes\nBrand Launch Film,ACME Corp,Corporate Video,iKAMBA Media,New Request,1500000,2026-06-01,2026-06-15,Kigali,Eric,Hero film + 3 cutdowns\nWedding Highlights,John & Jane,Wedding,iKAMBA Weddings,Scheduled,800000,2026-07-12,2026-07-26,Serena Hotel,Aline,Full day coverage`;
    downloadCSV("ikamba-sample-pipeline.csv", sample);
  };

  const handleClose = () => { reset(); onClose(); };

  const missingRequired = preview ? REQUIRED_HINT.filter(r => !preview.headers.includes(r)) : [];
  const validCount = preview ? preview.rows.filter(o => (o.name || "").trim()).length : 0;

  return (
    <Modal open={open} onClose={handleClose} title={preview ? `Preview · ${preview.source}` : "Import projects into pipeline"}>
      {!preview ? (
        <div className="space-y-4 text-sm">
          <div className="rounded-lg border border-os bg-white/[0.02] p-3 text-xs text-os-muted">
            <div className="text-white font-semibold text-[13px] mb-1">How it works</div>
            We auto-detect your columns (case-insensitive, spaces OK). Common names like <b>Project Name</b>, <b>Client</b>, <b>Status</b>, <b>Amount</b>, <b>Due Date</b> all work.{" "}
            <button type="button" className="text-os-gold underline" onClick={downloadSample}>Download a sample CSV</button>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault(); setDrag(false);
              const f = e.dataTransfer.files?.[0];
              if (f) onFile(f);
            }}
            onClick={() => fileRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${drag ? "border-os-gold bg-os-gold/10" : "border-os hover:border-os-gold/50 hover:bg-white/[0.03]"}`}
          >
            <Upload size={22} className="mx-auto text-os-muted mb-2" />
            <div className="text-white font-semibold">Drop a CSV file here</div>
            <div className="text-os-muted text-xs mt-1">or click to choose · supports .csv (comma, semicolon, or tab)</div>
            <input ref={fileRef} type="file" accept=".csv,text/csv,.tsv,text/tab-separated-values" hidden
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          </div>

          <div className="border-t border-os pt-4">
            <Field label="Import from Google Sheets (sheet must be shared as 'Anyone with the link can view')">
              <div className="flex gap-2">
                <Input value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/…/edit#gid=0" />
                <OSButton variant="primary" onClick={onSheet} disabled={busy}>
                  <Link2 size={14} /> {busy ? "Loading…" : "Load"}
                </OSButton>
              </div>
            </Field>
          </div>

          <div className="border-t border-os pt-4">
            <Field label="Or paste CSV text">
              <Textarea rows={4} value={pasted} onChange={(e) => setPasted(e.target.value)}
                placeholder="name,client,service,value,shoot_date,deadline&#10;Brand Launch,ACME,Corporate Video,1500000,2026-06-01,2026-06-15" />
              <div className="mt-2 flex justify-end">
                <OSButton variant="outline" onClick={() => pasted.trim() ? loadPreview(pasted, "Pasted CSV") : toast.error("Paste some CSV first.")} disabled={busy}>
                  Preview
                </OSButton>
              </div>
            </Field>
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="blue">{preview.rows.length} rows</Badge>
            <Badge tone={validCount > 0 ? "green" : "red"}>{validCount} valid</Badge>
            {missingRequired.length > 0 && <Badge tone="amber">Missing column: {missingRequired.join(", ")}</Badge>}
            <div className="ml-auto flex gap-2">
              <OSButton variant="ghost" onClick={() => setPreview(null)}>← Back</OSButton>
              <OSButton
                variant="primary"
                disabled={busy || validCount === 0}
                onClick={async () => { setBusy(true); try { await onImport(preview.rows); reset(); } finally { setBusy(false); } }}
              >
                Import {validCount} project{validCount === 1 ? "" : "s"}
              </OSButton>
            </div>
          </div>

          <div className="rounded-lg border border-os overflow-hidden">
            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-xs">
                <thead className="bg-white/5 sticky top-0">
                  <tr>
                    {preview.headers.slice(0, 8).map(h => (
                      <th key={h} className={`px-2 py-1.5 text-left font-semibold ${KNOWN_FIELDS.includes(h) ? "text-os-gold" : "text-os-muted"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.slice(0, 25).map((r, i) => (
                    <tr key={i} className="border-t border-os/50">
                      {preview.headers.slice(0, 8).map(h => (
                        <td key={h} className="px-2 py-1.5 text-white/80 whitespace-nowrap max-w-[180px] truncate">{r[h] || "—"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.rows.length > 25 && (
              <div className="text-[10px] text-os-muted px-2 py-1 border-t border-os bg-white/5">…showing first 25 of {preview.rows.length}</div>
            )}
          </div>

          <p className="text-[11px] text-os-muted">
            Columns highlighted in gold are recognized. Unrecognized columns are ignored.
            Rows without a project name are skipped.
          </p>
        </div>
      )}
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
