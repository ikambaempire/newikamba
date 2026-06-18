import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOSStore } from "@/os/store";
import { PageHeader, OSButton, Field, Input, Textarea, Select, Badge } from "@/os/components/ui";
import { fmtRWF, PRODUCT_LINES, SERVICE_CATEGORIES } from "@/os/mock/data";
import {
  CLIENT_TYPES, COST_CATEGORIES, DEFAULT_ADDONS, DEFAULT_DELIVERABLES, DEFAULT_TERMS,
  Q_STATUS_LABEL, Q_STATUS_TONE, numberToWords, recalcTotals, type QCost, type QItem, type QStatus,
} from "@/os/quotations/types";
import { ArrowLeft, ArrowRight, Plus, Trash2, Save, Eye, CheckCircle2, Send, FolderPlus, AlertTriangle, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";
import CanvasEditor, { type CanvasBlock } from "@/os/quotations/CanvasEditor";
import { QuotationSheet } from "@/os/quotations/QuotationSheet";

type StepId = "client" | "project" | "deliverables" | "pricing" | "costs" | "terms" | "canvas" | "preview";
const STEPS: { id: StepId; label: string }[] = [
  { id: "client", label: "Client" },
  { id: "project", label: "Project" },
  { id: "deliverables", label: "Deliverables" },
  { id: "pricing", label: "Pricing" },
  { id: "costs", label: "Internal Costs" },
  { id: "terms", label: "Terms" },
  { id: "canvas", label: "Canvas Design" },
  { id: "preview", label: "Review" },
];

const blankItem = (kind: "deliverable" | "addon", position: number): QItem => ({
  kind, position, name: "", description: "", quantity: 1, unit_price: 0, amount: 0, included: true,
});

const QuotationBuilder = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { addProject } = useOSStore();

  const [step, setStep] = useState<StepId>("client");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(isNew);

  const [q, setQ] = useState<any>({
    status: "draft" as QStatus,
    company_name: "iKAMBA",
    company_address: "Kigali, Rwanda",
    company_email: "ikambaempireltd@gmail.com",
    company_phone: "",
    company_tin: "",
    prepared_by_name: profile?.full_name || "",
    client_name: "", client_contact_person: "", client_email: "", client_phone: "",
    client_address: "", client_type: "Corporate",
    project_name: "", product_line: PRODUCT_LINES[0], service_category: SERVICE_CATEGORIES[0],
    project_objective: "", location: "", shoot_date: "", delivery_timeline: "",
    quotation_date: new Date().toISOString().slice(0, 10),
    valid_until: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    currency: "RWF",
    discount_type: "none", discount_value: 0, tax_percent: 0, advance_percent: 50,
    terms: DEFAULT_TERMS, notes: "", show_internal_costs_on_pdf: false,
    quotation_number: "(auto-generated on save)",
    canvas_blocks: [] as CanvasBlock[],
    canvas_enabled: false,
  });

  const [items, setItems] = useState<QItem[]>([
    { ...blankItem("deliverable", 0), name: "" },
  ]);
  const [costs, setCosts] = useState<QCost[]>([]);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const [{ data: qd, error }, { data: it }, { data: cs }] = await Promise.all([
        (supabase as any).from("os_quotations").select("*").eq("id", id).single(),
        (supabase as any).from("os_quotation_items").select("*").eq("quotation_id", id).order("position"),
        (supabase as any).from("os_quotation_costs").select("*").eq("quotation_id", id),
      ]);
      if (error || !qd) { toast.error("Could not load quotation"); navigate("/os/quotations"); return; }
      setQ(qd);
      setItems(it || []);
      setCosts(cs || []);
      setLoaded(true);
    })();
  }, [id, isNew, navigate]);

  const totals = useMemo(
    () => recalcTotals(items, q.discount_type, Number(q.discount_value) || 0, Number(q.tax_percent) || 0, Number(q.advance_percent) || 0, costs),
    [items, costs, q.discount_type, q.discount_value, q.tax_percent, q.advance_percent],
  );

  const update = (patch: any) => setQ((p: any) => ({ ...p, ...patch }));
  const updateItem = (i: number, patch: Partial<QItem>) => setItems(items.map((it, idx) => idx === i ? { ...it, ...patch, amount: (patch.quantity ?? it.quantity) * (patch.unit_price ?? it.unit_price) } : it));
  const addItem = (kind: "deliverable" | "addon") => setItems([...items, blankItem(kind, items.length)]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const addCost = () => setCosts([...costs, { category: COST_CATEGORIES[0], amount: 0 }]);
  const removeCost = (i: number) => setCosts(costs.filter((_, idx) => idx !== i));

  const persist = async (overrideStatus?: QStatus): Promise<string | null> => {
    if (!q.client_name?.trim()) { toast.error("Client name is required"); setStep("client"); return null; }
    setSaving(true);
    const payload: any = {
      ...q,
      ...totals,
      amount_in_words: numberToWords(totals.total_amount) + " Rwandan Francs",
      status: overrideStatus || q.status,
      prepared_by_user_id: q.prepared_by_user_id || user?.id,
      prepared_by_name: q.prepared_by_name || profile?.full_name || user?.email,
      shoot_date: q.shoot_date || null,
      valid_until: q.valid_until || null,
    };
    delete payload.quotation_number; // let DB default keep / DB-managed
    let qid = q.id;
    if (isNew && !qid) {
      const { data, error } = await (supabase as any).from("os_quotations").insert(payload).select("*").single();
      setSaving(false);
      if (error) { toast.error(error.message); return null; }
      setQ(data); qid = data.id;
    } else {
      const { error } = await (supabase as any).from("os_quotations").update(payload).eq("id", qid);
      if (error) { setSaving(false); toast.error(error.message); return null; }
    }
    // Replace items + costs (strip client-only fields and surface errors)
    await (supabase as any).from("os_quotation_items").delete().eq("quotation_id", qid);
    if (items.length) {
      const rows = items.map((it, idx) => ({
        quotation_id: qid,
        kind: it.kind,
        position: idx,
        name: it.name || "Item",
        description: it.description || null,
        quantity: Number(it.quantity) || 0,
        unit_price: Number(it.unit_price) || 0,
        amount: (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
        included: it.included !== false,
      }));
      const { error: itErr } = await (supabase as any).from("os_quotation_items").insert(rows);
      if (itErr) { setSaving(false); toast.error("Items: " + itErr.message); return null; }
    }
    await (supabase as any).from("os_quotation_costs").delete().eq("quotation_id", qid);
    if (costs.length) {
      const rows = costs.map((c) => ({ quotation_id: qid, category: c.category, description: c.description || null, amount: Number(c.amount) || 0 }));
      const { error: cErr } = await (supabase as any).from("os_quotation_costs").insert(rows);
      if (cErr) { setSaving(false); toast.error("Costs: " + cErr.message); return null; }
    }
    setSaving(false);
    toast.success("Saved");
    if (isNew) navigate(`/os/quotations/${qid}`, { replace: true });
    return qid;
  };

  const validateForSend = () => {
    if (!q.client_name?.trim()) return "Client name is required";
    if (!items.some(i => i.included && i.name.trim() && i.unit_price > 0)) return "At least one deliverable with a price is required";
    return null;
  };

  const markSent = async () => {
    const err = validateForSend(); if (err) return toast.error(err);
    const qid = await persist("sent"); if (qid) update({ status: "sent" });
  };
  const markApproved = async () => {
    if (!totals.total_amount) return toast.error("Cannot approve a zero-total quotation");
    const qid = await persist("approved"); if (qid) update({ status: "approved" });
  };

  const convertToProject = async () => {
    if (q.status !== "approved") return toast.error("Only Approved quotations can be converted");
    const qid = await persist(); if (!qid) return;

    // 1. OS Pipeline project (zustand store)
    const osId = addProject({
      client: q.client_name, contact_person: q.client_contact_person, phone: q.client_phone, email: q.client_email,
      name: q.project_name || q.client_name + " project",
      product_line: q.product_line || "iKAMBA Media",
      service: q.service_category || "Other",
      objective: q.project_objective, deliverables: items.filter(i => i.included).map(i => i.name).join(", "),
      shoot_date: q.shoot_date, location: q.location, deadline: q.shoot_date,
      payment_terms: `${q.advance_percent}% advance / balance on delivery`,
      owner: q.prepared_by_name || "iKAMBA",
      stage: "Approved", value: totals.total_amount,
      next_action: "Collect advance payment",
    } as any);

    // 2. Legacy projects table
    let legacyId: string | undefined;
    try {
      const { data, error } = await supabase.from("projects").insert({
        name: q.project_name || q.client_name + " project",
        project_type: q.service_category,
        objective: q.project_objective,
        status: "strategy_alignment",
        priority: "medium",
        deadline: q.shoot_date || null,
        budget_range: `${fmtRWF(totals.total_amount)}`,
        created_by: user?.id,
      } as any).select("id").single();
      if (!error && data) legacyId = data.id;
    } catch { /* non-fatal */ }

    await (supabase as any).from("os_quotations").update({
      status: "converted",
      converted_legacy_project_id: legacyId || null,
    }).eq("id", qid);

    update({ status: "converted", converted_legacy_project_id: legacyId });
    toast.success("Converted — project created in OS Pipeline" + (legacyId ? " and Admin" : ""));
    navigate("/os/pipeline");
  };

  const goNext = () => {
    const idx = STEPS.findIndex(s => s.id === step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].id);
  };
  const goPrev = () => {
    const idx = STEPS.findIndex(s => s.id === step);
    if (idx > 0) setStep(STEPS[idx - 1].id);
  };

  if (!loaded) return <div className="p-10 text-center text-os-muted text-sm">Loading…</div>;

  const marginColor = totals.profit_margin < 20 ? "text-rose-400" : totals.profit_margin < 30 ? "text-amber-300" : "text-emerald-300";
  const expired = q.valid_until && new Date(q.valid_until) < new Date();

  return (
    <div>
      <PageHeader
        title={isNew ? "New Quotation" : q.quotation_number}
        subtitle={isNew ? "Build a branded quotation step by step" : `${q.client_name} • ${Q_STATUS_LABEL[q.status as QStatus]}`}
        actions={
          <div className="flex gap-2 flex-wrap">
            <OSButton variant="outline" onClick={() => navigate("/os/quotations")}>Back to list</OSButton>
            <OSButton variant="outline" onClick={() => persist()} disabled={saving}><Save size={14} /> Save Draft</OSButton>
            {!isNew && <OSButton variant="outline" onClick={() => navigate(`/os/quotations/${q.id}/preview`)}><Eye size={14} /> Preview / Print PDF</OSButton>}
          </div>
        }
      />

      {/* Stepper */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {STEPS.map((s, i) => {
          const active = s.id === step;
          const done = STEPS.findIndex(x => x.id === step) > i;
          return (
            <button key={s.id} onClick={() => setStep(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${active ? "bg-os-gold text-[hsl(var(--os-navy-deep))]" : done ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-os-muted hover:text-white"}`}>
              {i + 1}. {s.label}
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1fr,300px] gap-5">
        <div className="os-card rounded-xl p-5 space-y-4">
          {step === "client" && (
            <>
              <h2 className="text-white font-bold">Client information</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Client / company name" required><Input value={q.client_name} onChange={(e) => update({ client_name: e.target.value })} /></Field>
                <Field label="Contact person"><Input value={q.client_contact_person || ""} onChange={(e) => update({ client_contact_person: e.target.value })} /></Field>
                <Field label="Email"><Input type="email" value={q.client_email || ""} onChange={(e) => update({ client_email: e.target.value })} /></Field>
                <Field label="Phone"><Input value={q.client_phone || ""} onChange={(e) => update({ client_phone: e.target.value })} /></Field>
                <Field label="Address"><Input value={q.client_address || ""} onChange={(e) => update({ client_address: e.target.value })} /></Field>
                <Field label="Client type">
                  <Select value={q.client_type || "Corporate"} onChange={(e) => update({ client_type: e.target.value })}>
                    {CLIENT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </Select>
                </Field>
              </div>
              <h2 className="text-white font-bold pt-3">Prepared by</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Prepared by"><Input value={q.prepared_by_name || ""} onChange={(e) => update({ prepared_by_name: e.target.value })} /></Field>
                <Field label="TIN / RDB reg."><Input value={q.company_tin || ""} onChange={(e) => update({ company_tin: e.target.value })} placeholder="(optional)" /></Field>
              </div>
            </>
          )}

          {step === "project" && (
            <>
              <h2 className="text-white font-bold">Project details</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Project name"><Input value={q.project_name || ""} onChange={(e) => update({ project_name: e.target.value })} /></Field>
                <Field label="Product line">
                  <Select value={q.product_line || ""} onChange={(e) => update({ product_line: e.target.value })}>
                    {PRODUCT_LINES.map(p => <option key={p}>{p}</option>)}
                  </Select>
                </Field>
                <Field label="Service category">
                  <Select value={q.service_category || ""} onChange={(e) => update({ service_category: e.target.value })}>
                    {SERVICE_CATEGORIES.map(s => <option key={s}>{s}</option>)}
                  </Select>
                </Field>
                <Field label="Location"><Input value={q.location || ""} onChange={(e) => update({ location: e.target.value })} /></Field>
                <Field label="Shoot date"><Input type="date" value={q.shoot_date || ""} onChange={(e) => update({ shoot_date: e.target.value })} /></Field>
                <Field label="Delivery timeline"><Input value={q.delivery_timeline || ""} onChange={(e) => update({ delivery_timeline: e.target.value })} placeholder="e.g. 6 weeks" /></Field>
                <Field label="Quotation date"><Input type="date" value={q.quotation_date || ""} onChange={(e) => update({ quotation_date: e.target.value })} /></Field>
                <Field label="Valid until"><Input type="date" value={q.valid_until || ""} onChange={(e) => update({ valid_until: e.target.value })} /></Field>
              </div>
              <Field label="Project objective"><Textarea rows={3} value={q.project_objective || ""} onChange={(e) => update({ project_objective: e.target.value })} /></Field>
            </>
          )}

          {step === "deliverables" && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold">Deliverables & add-ons</h2>
              </div>
              <ItemTable items={items} kind="deliverable" onUpdate={updateItem} onRemove={removeItem} suggestions={DEFAULT_DELIVERABLES} />
              <OSButton variant="outline" onClick={() => addItem("deliverable")}><Plus size={14} /> Add deliverable</OSButton>

              <h3 className="text-white font-semibold pt-4">Optional add-ons</h3>
              <ItemTable items={items} kind="addon" onUpdate={updateItem} onRemove={removeItem} suggestions={DEFAULT_ADDONS} />
              <OSButton variant="outline" onClick={() => addItem("addon")}><Plus size={14} /> Add add-on</OSButton>
            </>
          )}

          {step === "pricing" && (
            <>
              <h2 className="text-white font-bold">Pricing summary</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Currency"><Input value={q.currency} onChange={(e) => update({ currency: e.target.value })} /></Field>
                <Field label="Advance %"><Input type="number" min={0} max={100} value={q.advance_percent} onChange={(e) => update({ advance_percent: Number(e.target.value) })} /></Field>
                <Field label="Discount type">
                  <Select value={q.discount_type} onChange={(e) => update({ discount_type: e.target.value })}>
                    <option value="none">None</option>
                    <option value="fixed">Fixed amount</option>
                    <option value="percent">Percentage</option>
                  </Select>
                </Field>
                <Field label="Discount value"><Input type="number" min={0} value={q.discount_value} onChange={(e) => update({ discount_value: Number(e.target.value) })} disabled={q.discount_type === "none"} /></Field>
                <Field label="VAT / tax %"><Input type="number" min={0} max={100} value={q.tax_percent} onChange={(e) => update({ tax_percent: Number(e.target.value) })} /></Field>
              </div>
              <div className="rounded-lg bg-white/[0.03] border border-os p-4 space-y-1 text-sm">
                <Row label="Subtotal" value={fmtRWF(totals.subtotal)} />
                <Row label="Discount" value={"− " + fmtRWF(totals.discount_amount)} />
                <Row label="Tax" value={fmtRWF(totals.tax_amount)} />
                <Row label="Total" value={fmtRWF(totals.total_amount)} bold />
                <Row label={`Advance (${q.advance_percent}%)`} value={fmtRWF(totals.advance_amount)} />
                <Row label="Balance" value={fmtRWF(totals.balance_amount)} />
                <div className="text-xs text-os-muted pt-2 italic">{numberToWords(totals.total_amount)} Rwandan Francs</div>
              </div>
            </>
          )}

          {step === "costs" && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold">Internal cost estimate</h2>
                <label className="text-xs text-os-muted flex items-center gap-1.5">
                  <input type="checkbox" checked={!!q.show_internal_costs_on_pdf} onChange={(e) => update({ show_internal_costs_on_pdf: e.target.checked })} />
                  Show on client PDF
                </label>
              </div>
              <p className="text-xs text-os-muted">Visible to your team only. Used to calculate estimated profit and margin.</p>
              <div className="space-y-2">
                {costs.map((c, i) => (
                  <div key={i} className="grid grid-cols-[140px,1fr,120px,32px] gap-2">
                    <Select value={c.category} onChange={(e) => { const v = [...costs]; v[i] = { ...c, category: e.target.value }; setCosts(v); }}>
                      {COST_CATEGORIES.map(x => <option key={x}>{x}</option>)}
                    </Select>
                    <Input placeholder="Description" value={c.description || ""} onChange={(e) => { const v = [...costs]; v[i] = { ...c, description: e.target.value }; setCosts(v); }} />
                    <Input type="number" value={c.amount} onChange={(e) => { const v = [...costs]; v[i] = { ...c, amount: Number(e.target.value) }; setCosts(v); }} />
                    <button onClick={() => removeCost(i)} className="text-os-muted hover:text-rose-400"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
              <OSButton variant="outline" onClick={addCost}><Plus size={14} /> Add cost line</OSButton>

              <div className="rounded-lg bg-white/[0.03] border border-os p-4 space-y-1 text-sm">
                <Row label="Total estimated cost" value={fmtRWF(totals.total_cost_estimate)} />
                <Row label="Estimated profit" value={fmtRWF(totals.estimated_profit)} />
                <Row label="Profit margin" value={<span className={marginColor + " font-bold"}>{totals.profit_margin.toFixed(1)}%</span>} />
                {totals.profit_margin < 30 && totals.total_amount > 0 && (
                  <div className={`flex items-center gap-1.5 text-xs pt-2 ${marginColor}`}>
                    <AlertTriangle size={12} /> {totals.profit_margin < 20 ? "Margin below 20% — review pricing or costs" : "Margin below 30%"}
                  </div>
                )}
              </div>
            </>
          )}

          {step === "terms" && (
            <>
              <h2 className="text-white font-bold">Terms & notes</h2>
              <Field label="Terms and conditions"><Textarea rows={10} value={q.terms || ""} onChange={(e) => update({ terms: e.target.value })} /></Field>
              <Field label="Additional notes (logistics, client responsibilities, assumptions…)"><Textarea rows={4} value={q.notes || ""} onChange={(e) => update({ notes: e.target.value })} /></Field>
            </>
          )}

          {step === "canvas" && (
            <>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-white font-bold flex items-center gap-2"><LayoutTemplate size={16} /> Canvas design</h2>
                  <p className="text-xs text-os-muted mt-1 max-w-xl">
                    Drag, drop, and rearrange text, images and shapes — Canva-style. Click a block to edit, drag the gold corner to resize. Save as draft to keep your work.
                  </p>
                </div>
                <label className="text-xs text-os-muted flex items-center gap-1.5">
                  <input type="checkbox" checked={!!q.canvas_enabled} onChange={(e) => update({ canvas_enabled: e.target.checked })} />
                  Enable canvas layout
                </label>
              </div>
              <CanvasEditor
                blocks={(q.canvas_blocks as CanvasBlock[]) || []}
                onChange={(next) => update({ canvas_blocks: next })}
              />
            </>
          )}

          {step === "preview" && (
            <>
              <h2 className="text-white font-bold">Review & finalize</h2>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <Info label="Quotation number" value={q.quotation_number} />
                <Info label="Status" value={<Badge tone={Q_STATUS_TONE[q.status as QStatus]}>{Q_STATUS_LABEL[q.status as QStatus]}</Badge>} />
                <Info label="Client" value={q.client_name} />
                <Info label="Project" value={q.project_name || "—"} />
                <Info label="Total" value={fmtRWF(totals.total_amount)} />
                <Info label="Advance" value={fmtRWF(totals.advance_amount)} />
                <Info label="Profit margin" value={<span className={marginColor + " font-bold"}>{totals.profit_margin.toFixed(1)}%</span>} />
                <Info label="Valid until" value={q.valid_until || "—"} />
              </div>
              {expired && <div className="text-xs text-rose-300 flex items-center gap-1.5"><AlertTriangle size={12} /> This quotation has expired — extend the validity before sending.</div>}
              <div className="flex flex-wrap gap-2 pt-2">
                {!isNew && <OSButton variant="outline" onClick={() => navigate(`/os/quotations/${q.id}/preview`)}><Eye size={14} /> Preview PDF</OSButton>}
                <OSButton onClick={markSent} disabled={saving}><Send size={14} /> Mark as Sent</OSButton>
                <OSButton onClick={markApproved} disabled={saving}><CheckCircle2 size={14} /> Mark as Approved</OSButton>
                <OSButton onClick={convertToProject} disabled={saving || q.status !== "approved"}><FolderPlus size={14} /> Convert to Project</OSButton>
              </div>
            </>
          )}

          <div className="flex justify-between pt-4 border-t border-os/50 mt-4">
            <OSButton variant="ghost" onClick={goPrev} disabled={step === STEPS[0].id}><ArrowLeft size={14} /> Back</OSButton>
            <OSButton onClick={goNext} disabled={step === STEPS[STEPS.length - 1].id}>Next <ArrowRight size={14} /></OSButton>
          </div>
        </div>

        {/* Sticky summary */}
        <aside className="os-card rounded-xl p-5 h-fit lg:sticky lg:top-4 space-y-3 text-sm">
          <div className="text-xs uppercase tracking-widest text-os-muted">Live summary</div>
          <Row label="Items" value={items.filter(i => i.included).length} />
          <Row label="Subtotal" value={fmtRWF(totals.subtotal)} />
          <Row label="Total" value={fmtRWF(totals.total_amount)} bold />
          <Row label="Advance" value={fmtRWF(totals.advance_amount)} />
          <Row label="Costs" value={fmtRWF(totals.total_cost_estimate)} />
          <Row label="Margin" value={<span className={marginColor + " font-bold"}>{totals.profit_margin.toFixed(1)}%</span>} />
        </aside>
      </div>
    </div>
  );
};

const Row = ({ label, value, bold }: { label: string; value: any; bold?: boolean }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-os-muted">{label}</span>
    <span className={bold ? "text-white font-bold text-base" : "text-white"}>{value}</span>
  </div>
);

const Info = ({ label, value }: { label: string; value: any }) => (
  <div>
    <div className="text-[10px] uppercase tracking-widest text-os-muted">{label}</div>
    <div className="text-white">{value}</div>
  </div>
);

const ItemTable = ({ items, kind, onUpdate, onRemove, suggestions }: {
  items: QItem[]; kind: "deliverable" | "addon";
  onUpdate: (i: number, p: Partial<QItem>) => void; onRemove: (i: number) => void;
  suggestions: string[];
}) => {
  const rows = items.map((it, idx) => ({ it, idx })).filter(r => r.it.kind === kind);
  if (rows.length === 0) return <p className="text-xs text-os-muted">No {kind === "deliverable" ? "deliverables" : "add-ons"} added.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[700px]">
        <thead><tr className="text-left text-os-muted text-xs uppercase">
          {kind === "addon" && <th className="p-2 w-8">Inc.</th>}
          <th className="p-2">Name</th><th className="p-2">Description</th>
          <th className="p-2 w-20">Qty</th><th className="p-2 w-32">Unit price</th>
          <th className="p-2 w-32">Amount</th><th className="p-2 w-8"></th>
        </tr></thead>
        <tbody>
          {rows.map(({ it, idx }) => (
            <tr key={idx} className="border-t border-os/40 align-top">
              {kind === "addon" && (
                <td className="p-2"><input type="checkbox" checked={it.included} onChange={(e) => onUpdate(idx, { included: e.target.checked })} /></td>
              )}
              <td className="p-2">
                <Input value={it.name} list={`sug-${kind}`} onChange={(e) => onUpdate(idx, { name: e.target.value })} placeholder="Name" />
              </td>
              <td className="p-2"><Input value={it.description || ""} onChange={(e) => onUpdate(idx, { description: e.target.value })} placeholder="(optional)" /></td>
              <td className="p-2"><Input type="number" min={0} value={it.quantity} onChange={(e) => onUpdate(idx, { quantity: Number(e.target.value) })} /></td>
              <td className="p-2"><Input type="number" min={0} value={it.unit_price} onChange={(e) => onUpdate(idx, { unit_price: Number(e.target.value) })} /></td>
              <td className="p-2 text-white pt-3">{fmtRWF(it.quantity * it.unit_price)}</td>
              <td className="p-2"><button onClick={() => onRemove(idx)} className="text-os-muted hover:text-rose-400 mt-2"><Trash2 size={14} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <datalist id={`sug-${kind}`}>
        {suggestions.map(s => <option key={s} value={s} />)}
      </datalist>
    </div>
  );
};

export default QuotationBuilder;
