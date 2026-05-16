import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOSStore } from "@/os/store";
import { PageHeader, Field, Input, Textarea, Select, OSButton } from "@/os/components/ui";
import { PRODUCT_LINES, SERVICE_CATEGORIES, PIPELINE_STAGES } from "@/os/mock/data";
import { toast } from "sonner";

const NewProject = () => {
  const navigate = useNavigate();
  const addProject = useOSStore((s) => s.addProject);
  const [f, setF] = useState({
    client: "", contact_person: "", phone: "", email: "",
    name: "", product_line: PRODUCT_LINES[0] as string, service: SERVICE_CATEGORIES[0] as string,
    objective: "", deliverables: "", shoot_date: "", location: "", deadline: "",
    budget_range: "", payment_terms: "", owner: "", notes: "", references: "",
    value: "",
  });

  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.client || !f.name) { toast.error("Client and project name are required"); return; }
    const id = addProject({
      ...f,
      value: Number(f.value) || 0,
      stage: "New Request",
      next_action: "Schedule discovery meeting",
    } as any);
    toast.success("Project created");
    navigate(`/os/projects/${id}`);
  };

  return (
    <div>
      <PageHeader title="Create Project" subtitle="Capture the brief once. Move it forward from here." />
      <form onSubmit={submit} className="os-card rounded-xl p-5 sm:p-6 space-y-6 max-w-4xl">
        <section>
          <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Client</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Client name" required><Input value={f.client} onChange={(e) => set("client", e.target.value)} /></Field>
            <Field label="Contact person"><Input value={f.contact_person} onChange={(e) => set("contact_person", e.target.value)} /></Field>
            <Field label="Phone"><Input value={f.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
            <Field label="Email"><Input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} /></Field>
          </div>
        </section>

        <section>
          <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Project</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Project name" required><Input value={f.name} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label="Owner"><Input value={f.owner} onChange={(e) => set("owner", e.target.value)} placeholder="Assign to..." /></Field>
            <Field label="Product line"><Select value={f.product_line} onChange={(e) => set("product_line", e.target.value)}>{PRODUCT_LINES.map((p) => <option key={p}>{p}</option>)}</Select></Field>
            <Field label="Service category"><Select value={f.service} onChange={(e) => set("service", e.target.value)}>{SERVICE_CATEGORIES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
            <Field label="Objective"><Textarea rows={3} value={f.objective} onChange={(e) => set("objective", e.target.value)} /></Field>
            <Field label="Deliverables"><Textarea rows={3} value={f.deliverables} onChange={(e) => set("deliverables", e.target.value)} placeholder="e.g. 3-min film + 5 cutdowns + 30 stills" /></Field>
          </div>
        </section>

        <section>
          <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Schedule & Logistics</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Shoot date"><Input type="date" value={f.shoot_date} onChange={(e) => set("shoot_date", e.target.value)} /></Field>
            <Field label="Location"><Input value={f.location} onChange={(e) => set("location", e.target.value)} /></Field>
            <Field label="Deadline"><Input type="date" value={f.deadline} onChange={(e) => set("deadline", e.target.value)} /></Field>
            <Field label="Reference links"><Input value={f.references} onChange={(e) => set("references", e.target.value)} placeholder="Drive / Pinterest / brief link" /></Field>
          </div>
        </section>

        <section>
          <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Commercials</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Project value (RWF)"><Input type="number" value={f.value} onChange={(e) => set("value", e.target.value)} /></Field>
            <Field label="Budget range"><Input value={f.budget_range} onChange={(e) => set("budget_range", e.target.value)} placeholder="e.g. RWF 3M – 5M" /></Field>
            <Field label="Payment terms"><Input value={f.payment_terms} onChange={(e) => set("payment_terms", e.target.value)} placeholder="e.g. 50% advance, 50% on delivery" /></Field>
          </div>
        </section>

        <section>
          <Field label="Notes"><Textarea rows={3} value={f.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
        </section>

        <div className="flex gap-2 justify-end">
          <OSButton variant="outline" onClick={() => navigate(-1)}>Cancel</OSButton>
          <OSButton type="submit" variant="primary">Create Project</OSButton>
        </div>
      </form>
    </div>
  );
};

export default NewProject;
