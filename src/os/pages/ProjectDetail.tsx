import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useOSStore } from "@/os/store";
import { PageHeader, KPICard, Badge, PaymentBadge, OSButton, Modal, Field, Input, Textarea, Select } from "@/os/components/ui";
import { COST_CATEGORIES, DEFAULT_TASKS, PIPELINE_STAGES, PRODUCT_LINES, SERVICE_CATEGORIES, fmtRWF, type PipelineStage } from "@/os/mock/data";
import { ArrowLeft, Plus, CalendarPlus, Wallet, Receipt, Pencil } from "lucide-react";
import { toast } from "sonner";

const TABS = ["Overview","Scope","Schedule","Tasks","Team","Quotation","Costs","Payments","Files","Notes","Activity Log"] as const;

const ProjectDetail = () => {
  const { id = "" } = useParams();
  const {
    projects, costs, payments, schedule, quotations, tasksByProject,
    updateProject, updateProjectStage, addCost, addPayment, addScheduleEvent, ensureTasks, toggleTask,
  } = useOSStore();

  const p = projects.find((x) => x.id === id);
  useEffect(() => { if (p) ensureTasks(p.id, DEFAULT_TASKS); }, [p?.id]);

  const [tab, setTab] = useState<typeof TABS[number]>("Overview");
  const [costOpen, setCostOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [schedOpen, setSchedOpen] = useState(false);

  if (!p) return <div className="text-white">Project not found. <Link to="/os/pipeline" className="text-os-gold">Back to pipeline</Link></div>;

  const projectCosts = costs.filter((c) => c.project_id === p.id);
  const projectPayments = payments.filter((x) => x.project_id === p.id);
  const projectEvents = schedule.filter((s) => s.project_id === p.id);
  const projectQuote = quotations.find((q) => q.project_id === p.id);
  const tasks = tasksByProject[p.id] || [];

  const balance = p.value - p.paid;
  const estProfit = p.value - p.costs_total;
  const margin = p.value > 0 ? Math.round((estProfit / p.value) * 100) : 0;

  return (
    <div>
      <Link to="/os/pipeline" className="inline-flex items-center text-os-muted hover:text-white text-sm mb-3"><ArrowLeft size={14} className="mr-1" /> Back to pipeline</Link>
      <PageHeader
        title={p.name}
        subtitle={`${p.client} · ${p.product_line} · ${p.service}`}
        actions={
          <Select value={p.stage} onChange={(e) => { updateProjectStage(p.id, e.target.value as PipelineStage); toast.success("Stage updated"); }} className="max-w-[200px]">
            {PIPELINE_STAGES.map((s) => <option key={s}>{s}</option>)}
          </Select>
        }
      />

      <div className="flex gap-1 overflow-x-auto border-b border-os mb-5 -mx-4 px-4 sm:mx-0 sm:px-0">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${tab === t ? "border-[hsl(var(--os-gold))] text-white" : "border-transparent text-os-muted hover:text-white"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <KPICard label="Status" value={p.stage} />
            <KPICard label="Project value" value={fmtRWF(p.value)} accent />
            <KPICard label="Amount paid" value={fmtRWF(p.paid)} />
            <KPICard label="Balance due" value={fmtRWF(balance)} />
            <KPICard label="Est. profit" value={fmtRWF(estProfit)} hint={`${margin}% margin`} />
            <KPICard label="Owner" value={p.owner} />
          </div>
          <div className="os-card rounded-xl p-5">
            <div className="grid sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
              <Row label="Client">{p.client}</Row>
              <Row label="Contact">{p.contact_person} · {p.phone}</Row>
              <Row label="Email">{p.email}</Row>
              <Row label="Shoot date">{p.shoot_date || "—"}</Row>
              <Row label="Location">{p.location || "—"}</Row>
              <Row label="Deadline">{p.deadline || "—"}</Row>
              <Row label="Payment terms">{p.payment_terms || "—"}</Row>
              <Row label="Payment status"><PaymentBadge status={p.payment_status} /></Row>
              <Row label="Next action"><span className="text-os-gold">{p.next_action || "—"}</span></Row>
            </div>
          </div>
        </div>
      )}

      {tab === "Scope" && (
        <div className="os-card rounded-xl p-5 space-y-4">
          <Block title="Objective">{p.objective}</Block>
          <Block title="Deliverables">{p.deliverables}</Block>
          <Block title="References">{p.references}</Block>
          <Block title="Notes">{p.notes}</Block>
        </div>
      )}

      {tab === "Schedule" && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-bold">Events</h3>
            <div className="flex gap-2">
              <OSButton variant="outline" onClick={() => {
                const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`[iKAMBA] ${p.name}`)}&dates=${(p.shoot_date || "").replace(/-/g, "")}/${(p.deadline || p.shoot_date || "").replace(/-/g, "")}&details=${encodeURIComponent(`${p.client} · ${p.objective || ""}`)}&location=${encodeURIComponent(p.location || "")}`;
                window.open(url, "_blank");
              }}><CalendarPlus size={14} /> Add to Google Calendar</OSButton>
              <OSButton onClick={() => setSchedOpen(true)}><Plus size={14} /> Add Schedule</OSButton>
            </div>
          </div>
          <div className="os-card rounded-xl divide-y divide-[hsl(var(--os-border))]">
            {projectEvents.length === 0 && <div className="p-5 text-os-muted text-sm">No events scheduled.</div>}
            {projectEvents.map((e) => (
              <div key={e.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold text-sm">{e.title}</div>
                  <div className="text-xs text-os-muted">{e.type} · {e.location || "—"}</div>
                </div>
                <div className="text-xs text-os-gold font-semibold">{e.date}{e.time ? ` · ${e.time}` : ""}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "Tasks" && (
        <div className="os-card rounded-xl p-5">
          <h3 className="text-white font-bold mb-3">Checklist</h3>
          <div className="space-y-1.5">
            {tasks.map((t) => (
              <label key={t.id} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer">
                <input type="checkbox" checked={t.done} onChange={() => toggleTask(p.id, t.id)} className="h-4 w-4 accent-[hsl(var(--os-gold))]" />
                <span className={`text-sm ${t.done ? "text-os-muted line-through" : "text-white"}`}>{t.title}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {tab === "Team" && (
        <div className="os-card rounded-xl p-5">
          <h3 className="text-white font-bold mb-3">Assigned team</h3>
          <div className="text-sm text-white">Owner: {p.owner}</div>
          <p className="text-os-muted text-xs mt-2">Crew assignment coming soon.</p>
        </div>
      )}

      {tab === "Quotation" && (
        <div className="os-card rounded-xl p-5">
          {projectQuote ? (
            <div className="space-y-2 text-sm">
              <Row label="Package">{projectQuote.package}</Row>
              <Row label="Price">{fmtRWF(projectQuote.price)}</Row>
              <Row label="Timeline">{projectQuote.timeline}</Row>
              <Row label="Terms">{projectQuote.payment_terms}</Row>
              <Row label="Status"><Badge tone="gold">{projectQuote.status}</Badge></Row>
              <OSButton variant="outline" onClick={() => toast.info("PDF export coming soon")}>Generate Quotation Summary</OSButton>
            </div>
          ) : (
            <p className="text-os-muted text-sm">No quotation yet. <Link to="/os/quotations" className="text-os-gold">Create one</Link>.</p>
          )}
        </div>
      )}

      {tab === "Costs" && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="text-white font-bold">Total costs: <span className="text-os-gold">{fmtRWF(p.costs_total)}</span></div>
            <OSButton onClick={() => setCostOpen(true)}><Plus size={14} /> Add Cost</OSButton>
          </div>
          <div className="os-card rounded-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead><tr className="text-left text-os-muted text-xs uppercase border-b border-os">
                <th className="p-3">Date</th><th className="p-3">Category</th><th className="p-3">Description</th><th className="p-3">Paid to</th><th className="p-3">Amount</th><th className="p-3">Status</th>
              </tr></thead>
              <tbody>
                {projectCosts.length === 0 && <tr><td colSpan={6} className="p-5 text-os-muted text-center">No costs recorded.</td></tr>}
                {projectCosts.map((c) => (
                  <tr key={c.id} className="border-b border-os/50">
                    <td className="p-3 text-os-muted">{c.date}</td>
                    <td className="p-3 text-white">{c.category}</td>
                    <td className="p-3 text-white">{c.description}</td>
                    <td className="p-3 text-os-muted">{c.paid_to}</td>
                    <td className="p-3 text-white font-semibold">{fmtRWF(c.amount)}</td>
                    <td className="p-3"><Badge tone={c.status === "Paid" ? "green" : "amber"}>{c.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Payments" && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="text-white font-bold">Collected: <span className="text-os-gold">{fmtRWF(p.paid)}</span> / {fmtRWF(p.value)} · Balance: {fmtRWF(balance)}</div>
            <OSButton onClick={() => setPayOpen(true)}><Plus size={14} /> Record Payment</OSButton>
          </div>
          <div className="os-card rounded-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead><tr className="text-left text-os-muted text-xs uppercase border-b border-os">
                <th className="p-3">Date</th><th className="p-3">Type</th><th className="p-3">Amount</th><th className="p-3">Method</th><th className="p-3">Reference</th>
              </tr></thead>
              <tbody>
                {projectPayments.length === 0 && <tr><td colSpan={5} className="p-5 text-os-muted text-center">No payments recorded.</td></tr>}
                {projectPayments.map((x) => (
                  <tr key={x.id} className="border-b border-os/50">
                    <td className="p-3 text-os-muted">{x.date}</td>
                    <td className="p-3 text-white">{x.type}</td>
                    <td className="p-3 text-white font-semibold">{fmtRWF(x.amount)}</td>
                    <td className="p-3 text-white">{x.method}</td>
                    <td className="p-3 text-os-muted">{x.reference || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Files" && <div className="os-card rounded-xl p-8 text-center text-os-muted">File uploads coming soon — connect storage to enable.</div>}
      {tab === "Notes" && (
        <div className="os-card rounded-xl p-5">
          <Textarea rows={6} defaultValue={p.notes} onBlur={(e) => updateProject(p.id, { notes: e.target.value })} placeholder="Add notes..." />
        </div>
      )}
      {tab === "Activity Log" && <div className="os-card rounded-xl p-8 text-center text-os-muted">Activity tracking coming soon.</div>}

      {/* Cost modal */}
      <Modal open={costOpen} onClose={() => setCostOpen(false)} title="Add Cost">
        <CostForm onSubmit={(c) => { addCost({ ...c, project_id: p.id }); setCostOpen(false); toast.success("Cost added"); }} />
      </Modal>
      <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Record Payment">
        <PaymentForm onSubmit={(x) => { addPayment({ ...x, project_id: p.id }); setPayOpen(false); toast.success("Payment recorded"); }} />
      </Modal>
      <Modal open={schedOpen} onClose={() => setSchedOpen(false)} title="Add Schedule">
        <ScheduleForm onSubmit={(e) => { addScheduleEvent({ ...e, project_id: p.id }); setSchedOpen(false); toast.success("Event added"); }} />
      </Modal>
    </div>
  );
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div><div className="text-os-muted text-xs uppercase tracking-wider">{label}</div><div className="text-white mt-0.5">{children}</div></div>
);
const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div><div className="text-os-muted text-xs uppercase tracking-wider mb-1">{title}</div><div className="text-white whitespace-pre-wrap">{children || "—"}</div></div>
);

const CostForm = ({ onSubmit }: { onSubmit: (c: any) => void }) => {
  const [f, setF] = useState({ date: new Date().toISOString().slice(0,10), category: COST_CATEGORIES[0], description: "", amount: "", paid_to: "", status: "Pending" });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...f, amount: Number(f.amount) || 0 }); }} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date"><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
        <Field label="Category"><Select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{COST_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
      </div>
      <Field label="Description"><Input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Amount (RWF)"><Input type="number" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field>
        <Field label="Paid to"><Input value={f.paid_to} onChange={(e) => setF({ ...f, paid_to: e.target.value })} /></Field>
      </div>
      <Field label="Status"><Select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option>Pending</option><option>Paid</option></Select></Field>
      <OSButton type="submit"><Wallet size={14}/> Add Cost</OSButton>
    </form>
  );
};
const PaymentForm = ({ onSubmit }: { onSubmit: (p: any) => void }) => {
  const [f, setF] = useState({ date: new Date().toISOString().slice(0,10), amount: "", method: "Bank transfer", reference: "", type: "Advance" });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...f, amount: Number(f.amount) || 0 }); }} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date"><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
        <Field label="Type"><Select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}><option>Advance</option><option>Balance</option><option>Full</option></Select></Field>
        <Field label="Amount (RWF)"><Input type="number" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field>
        <Field label="Method"><Select value={f.method} onChange={(e) => setF({ ...f, method: e.target.value })}><option>Bank transfer</option><option>MoMo</option><option>Cash</option><option>Cheque</option></Select></Field>
      </div>
      <Field label="Reference"><Input value={f.reference} onChange={(e) => setF({ ...f, reference: e.target.value })} placeholder="Invoice / txn ref" /></Field>
      <OSButton type="submit"><Receipt size={14}/> Record Payment</OSButton>
    </form>
  );
};
const ScheduleForm = ({ onSubmit }: { onSubmit: (e: any) => void }) => {
  const [f, setF] = useState({ title: "", type: "Shoot day", date: "", time: "", location: "" });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(f); }} className="space-y-3">
      <Field label="Title"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type"><Select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
          {["Discovery meeting","Shoot day","Editing deadline","Client review deadline","Final delivery date","Payment follow-up","Internal review"].map((t) => <option key={t}>{t}</option>)}
        </Select></Field>
        <Field label="Date"><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
        <Field label="Time"><Input type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></Field>
        <Field label="Location"><Input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></Field>
      </div>
      <OSButton type="submit"><CalendarPlus size={14}/> Add Event</OSButton>
    </form>
  );
};

export default ProjectDetail;
