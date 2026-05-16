import { useState } from "react";
import { useOSStore } from "@/os/store";
import { PageHeader, Badge, OSButton, Modal, Field, Input, Textarea, Select } from "@/os/components/ui";
import { fmtRWF } from "@/os/mock/data";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const Quotations = () => {
  const { quotations, addQuotation } = useOSStore();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ client: "", project_name: "", package: "", deliverables: "", timeline: "", price: "", payment_terms: "", notes: "", status: "Draft" as const });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.client || !f.project_name) { toast.error("Client and project required"); return; }
    addQuotation({ ...f, price: Number(f.price) || 0, status: f.status as any });
    toast.success("Quotation created");
    setOpen(false);
    setF({ client: "", project_name: "", package: "", deliverables: "", timeline: "", price: "", payment_terms: "", notes: "", status: "Draft" });
  };

  return (
    <div>
      <PageHeader title="Quotations" actions={<OSButton onClick={() => setOpen(true)}><Plus size={14} /> New Quotation</OSButton>} />
      <div className="os-card rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead><tr className="text-left text-os-muted text-xs uppercase border-b border-os">
            <th className="p-3">Date</th><th className="p-3">Client</th><th className="p-3">Project</th><th className="p-3">Package</th><th className="p-3">Price</th><th className="p-3">Status</th>
          </tr></thead>
          <tbody>
            {quotations.map((q) => (
              <tr key={q.id} className="border-b border-os/50">
                <td className="p-3 text-os-muted">{q.created_at}</td>
                <td className="p-3 text-white">{q.client}</td>
                <td className="p-3 text-white">{q.project_name}</td>
                <td className="p-3 text-os-muted">{q.package}</td>
                <td className="p-3 text-white font-semibold">{fmtRWF(q.price)}</td>
                <td className="p-3"><Badge tone={q.status === "Approved" ? "green" : q.status === "Rejected" ? "red" : q.status === "Sent" ? "blue" : "default"}>{q.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New Quotation">
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Client" required><Input value={f.client} onChange={(e) => setF({ ...f, client: e.target.value })} /></Field>
            <Field label="Project name" required><Input value={f.project_name} onChange={(e) => setF({ ...f, project_name: e.target.value })} /></Field>
            <Field label="Package"><Input value={f.package} onChange={(e) => setF({ ...f, package: e.target.value })} /></Field>
            <Field label="Timeline"><Input value={f.timeline} onChange={(e) => setF({ ...f, timeline: e.target.value })} /></Field>
            <Field label="Price (RWF)"><Input type="number" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></Field>
            <Field label="Status"><Select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as any })}><option>Draft</option><option>Sent</option><option>Approved</option><option>Rejected</option></Select></Field>
          </div>
          <Field label="Deliverables"><Textarea rows={2} value={f.deliverables} onChange={(e) => setF({ ...f, deliverables: e.target.value })} /></Field>
          <Field label="Payment terms"><Input value={f.payment_terms} onChange={(e) => setF({ ...f, payment_terms: e.target.value })} /></Field>
          <Field label="Notes"><Textarea rows={2} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
          <div className="flex justify-end gap-2"><OSButton variant="outline" onClick={() => setOpen(false)}>Cancel</OSButton><OSButton type="submit">Save</OSButton></div>
        </form>
      </Modal>
    </div>
  );
};

export default Quotations;
