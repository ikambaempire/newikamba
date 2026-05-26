import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOSStore } from "@/os/store";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { notify } from "@/os/notifications";
import { PageHeader, Field, Input, Textarea, Select, OSButton } from "@/os/components/ui";
import { PRODUCT_LINES, SERVICE_CATEGORIES } from "@/os/mock/data";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";

type Form = {
  client: string; contact_person: string; phone: string; email: string;
  name: string; product_line: string; service: string;
  objective: string; deliverables: string; brief: string;
  shoot_date: string; location: string; deadline: string;
  budget_range: string; payment_terms: string; value: string;
  owner: string; owner_user_id: string; notes: string; references: string;
};

const STEPS = [
  { key: "client",    label: "Client" },
  { key: "project",   label: "Project" },
  { key: "brief",     label: "Brief" },
  { key: "schedule",  label: "Schedule" },
  { key: "money",     label: "Commercials" },
  { key: "assignee",  label: "Assignee" },
  { key: "review",    label: "Review" },
] as const;

type Member = { user_id: string; full_name: string | null };

const NewProject = () => {
  const navigate = useNavigate();
  const addProject = useOSStore((s) => s.addProject);
  const { user, profile } = useAuth();

  const [step, setStep] = useState(0);
  const [members, setMembers] = useState<Member[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [f, setF] = useState<Form>({
    client: "", contact_person: "", phone: "", email: "",
    name: "", product_line: PRODUCT_LINES[0], service: SERVICE_CATEGORIES[0],
    objective: "", deliverables: "", brief: "",
    shoot_date: "", location: "", deadline: "",
    budget_range: "", payment_terms: "", value: "",
    owner: "", owner_user_id: "", notes: "", references: "",
  });
  const set = (k: keyof Form, v: string) => setF((p) => ({ ...p, [k]: v }));

  // Load team via edge function (admins get full list) with profile-table fallback.
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.functions.invoke("manage-admins", { body: { action: "list_users" } });
        const list = (data?.users || []) as any[];
        if (list.length) {
          setMembers(list.map((u) => ({ user_id: u.id, full_name: u.full_name || u.email })));
          return;
        }
      } catch { /* ignore */ }
      const { data } = await supabase.from("profiles").select("user_id, full_name");
      setMembers((data as Member[]) || []);
    })();
  }, []);

  const canNext = useMemo(() => {
    if (step === 0) return f.client.trim().length > 0;
    if (step === 1) return f.name.trim().length > 0;
    return true;
  }, [step, f]);

  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  const submit = async () => {
    if (!f.client.trim() || !f.name.trim()) {
      toast.error("Client and project name are required");
      setStep(f.client.trim() ? 1 : 0);
      return;
    }
    setSubmitting(true);
    const combinedNotes = [f.notes, f.brief && `Brief:\n${f.brief}`].filter(Boolean).join("\n\n");
    const id = addProject({
      ...f,
      notes: combinedNotes,
      value: Number(f.value) || 0,
      stage: "New Request",
      next_action: "Schedule discovery meeting",
    } as any);

    if (f.owner_user_id && f.owner_user_id !== user?.id) {
      const me = profile?.full_name || user?.email || "An admin";
      await notify(
        f.owner_user_id,
        `New project assigned: ${f.name}`,
        `${me} assigned you to "${f.name}" for ${f.client}.`,
        "info",
        `/os/projects/${id}`,
      );
    }
    if (user && (f.shoot_date || f.deadline)) {
      const { syncProjectDatesToCalendar } = await import("@/os/utils/calendarSync");
      const r = await syncProjectDatesToCalendar({
        userId: user.id, projectId: id, projectName: f.name, client: f.client,
        shootDate: f.shoot_date || null, deadline: f.deadline || null, location: f.location || null,
      });
      if (r.ok && (r.count || 0) > 0) toast.success(`${r.count} calendar event(s) added`);
    }
    toast.success("Project created");
    setSubmitting(false);
    navigate(`/os/projects/${id}`);
  };

  return (
    <div>
      <PageHeader title="Create Project" subtitle="Step-by-step. Capture the brief, assign an owner, notify the team." />

      <div className="os-card rounded-xl p-5 sm:p-6 max-w-4xl">
        {/* Progress bar + step pills */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-os-muted mb-2">
            <span>Step {step + 1} of {STEPS.length} · {STEPS[step].label}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-[hsl(var(--os-gold))] transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex gap-1 mt-3 overflow-x-auto">
            {STEPS.map((s, i) => (
              <button key={s.key} onClick={() => setStep(i)}
                className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap border ${
                  i === step ? "bg-[hsl(var(--os-gold))]/15 border-[hsl(var(--os-gold))]/60 text-white"
                  : i < step ? "border-emerald-500/40 text-emerald-300" : "border-os text-os-muted"
                }`}>
                {i < step && <Check size={10} className="inline mr-1" />}{s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[260px]">
          {step === 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Client name" required><Input value={f.client} onChange={(e) => set("client", e.target.value)} /></Field>
              <Field label="Contact person"><Input value={f.contact_person} onChange={(e) => set("contact_person", e.target.value)} /></Field>
              <Field label="Phone"><Input value={f.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
              <Field label="Email"><Input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} /></Field>
            </div>
          )}

          {step === 1 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Project name" required><Input value={f.name} onChange={(e) => set("name", e.target.value)} /></Field>
              <Field label="Product line">
                <Select value={f.product_line} onChange={(e) => set("product_line", e.target.value)}>
                  {PRODUCT_LINES.map((p) => <option key={p}>{p}</option>)}
                </Select>
              </Field>
              <Field label="Service category">
                <Select value={f.service} onChange={(e) => set("service", e.target.value)}>
                  {SERVICE_CATEGORIES.map((s) => <option key={s}>{s}</option>)}
                </Select>
              </Field>
              <Field label="Objective"><Textarea rows={3} value={f.objective} onChange={(e) => set("objective", e.target.value)} /></Field>
              <Field label="Deliverables">
                <Textarea rows={3} value={f.deliverables} onChange={(e) => set("deliverables", e.target.value)} placeholder="e.g. 3-min film + 5 cutdowns + 30 stills" />
              </Field>
            </div>
          )}

          {step === 2 && (
            <Field label="Creative brief">
              <Textarea rows={10} value={f.brief} onChange={(e) => set("brief", e.target.value)}
                placeholder="Tell the team what success looks like. Audience, tone, references, must-haves, must-avoids…" />
            </Field>
          )}

          {step === 3 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Shoot date"><Input type="date" value={f.shoot_date} onChange={(e) => set("shoot_date", e.target.value)} /></Field>
              <Field label="Location"><Input value={f.location} onChange={(e) => set("location", e.target.value)} /></Field>
              <Field label="Deadline"><Input type="date" value={f.deadline} onChange={(e) => set("deadline", e.target.value)} /></Field>
              <Field label="Reference links"><Input value={f.references} onChange={(e) => set("references", e.target.value)} placeholder="Drive / Pinterest / brief link" /></Field>
            </div>
          )}

          {step === 4 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Project value (RWF)"><Input type="number" value={f.value} onChange={(e) => set("value", e.target.value)} /></Field>
              <Field label="Budget range"><Input value={f.budget_range} onChange={(e) => set("budget_range", e.target.value)} placeholder="e.g. RWF 3M – 5M" /></Field>
              <Field label="Payment terms"><Input value={f.payment_terms} onChange={(e) => set("payment_terms", e.target.value)} placeholder="50% advance, 50% on delivery" /></Field>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <Field label="Assign to (team member)">
                <Select
                  value={f.owner_user_id}
                  onChange={(e) => {
                    const id = e.target.value;
                    const m = members.find((x) => x.user_id === id);
                    setF((p) => ({ ...p, owner_user_id: id, owner: m?.full_name || p.owner }));
                  }}
                >
                  <option value="">— Unassigned —</option>
                  {members.map((m) => (
                    <option key={m.user_id} value={m.user_id}>{m.full_name || m.user_id}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Owner display name">
                <Input value={f.owner} onChange={(e) => set("owner", e.target.value)} placeholder="Shown on the project card" />
              </Field>
              <Field label="Notes for the assignee">
                <Textarea rows={3} value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Anything they should know to start" />
              </Field>
              {f.owner_user_id && (
                <p className="text-xs text-os-muted">A popup notification will be sent to the assignee when you create the project.</p>
              )}
            </div>
          )}

          {step === 6 && (
            <div className="space-y-2 text-sm">
              <Summary label="Client" value={`${f.client}${f.contact_person ? ` · ${f.contact_person}` : ""}`} />
              <Summary label="Project" value={f.name} />
              <Summary label="Product line / service" value={`${f.product_line} · ${f.service}`} />
              <Summary label="Brief" value={f.brief ? `${f.brief.slice(0, 120)}${f.brief.length > 120 ? "…" : ""}` : "—"} />
              <Summary label="Shoot / deadline" value={`${f.shoot_date || "—"} → ${f.deadline || "—"}`} />
              <Summary label="Value" value={f.value ? `RWF ${Number(f.value).toLocaleString()}` : "—"} />
              <Summary label="Assignee" value={f.owner || "Unassigned"} />
            </div>
          )}
        </div>

        <div className="flex justify-between gap-2 pt-6 mt-6 border-t border-os">
          <OSButton variant="outline" onClick={() => (step === 0 ? navigate(-1) : setStep(step - 1))}>
            <ChevronLeft size={14} /> {step === 0 ? "Cancel" : "Back"}
          </OSButton>
          {step < STEPS.length - 1 ? (
            <OSButton variant="primary" onClick={() => setStep(step + 1)} disabled={!canNext}>
              Next <ChevronRight size={14} />
            </OSButton>
          ) : (
            <OSButton variant="primary" onClick={submit} disabled={submitting}>
              {submitting ? "Creating…" : "Create Project"}
            </OSButton>
          )}
        </div>
      </div>
    </div>
  );
};

const Summary = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-3 border-b border-os/50 py-2">
    <span className="text-os-muted">{label}</span>
    <span className="text-white text-right max-w-[60%] truncate" title={value}>{value}</span>
  </div>
);

export default NewProject;
