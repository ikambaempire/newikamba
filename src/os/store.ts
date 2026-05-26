import { create } from "zustand";
import {
  COSTS, PAYMENTS, QUOTATIONS, SCHEDULE,
  type OSProject, type OSCost, type OSPayment, type OSQuotation, type OSScheduleEvent, type PipelineStage,
} from "@/os/mock/data";
import { supabase } from "@/integrations/supabase/client";

interface OSStore {
  projects: OSProject[];
  costs: OSCost[];
  payments: OSPayment[];
  quotations: OSQuotation[];
  schedule: OSScheduleEvent[];
  tasksByProject: Record<string, { id: string; title: string; done: boolean }[]>;
  _pipelineLoaded: boolean;
  _pipelineChannel: any;

  loadPipeline: () => Promise<void>;
  subscribePipeline: () => void;
  unsubscribePipeline: () => void;

  addProject: (p: Omit<OSProject, "id" | "paid" | "costs_total" | "payment_status">) => string;
  updateProjectStage: (id: string, stage: PipelineStage) => void;
  updateProject: (id: string, patch: Partial<OSProject>) => void;
  deleteProject: (id: string) => void;

  addCost: (c: Omit<OSCost, "id">) => void;
  addPayment: (p: Omit<OSPayment, "id">) => void;
  addQuotation: (q: Omit<OSQuotation, "id" | "created_at">) => void;
  addScheduleEvent: (e: Omit<OSScheduleEvent, "id">) => void;

  toggleTask: (project_id: string, task_id: string) => void;
  ensureTasks: (project_id: string, defaults: string[]) => void;
}

const id = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10));

const rowToProject = (r: any): OSProject => ({
  id: r.id,
  client: r.client || "",
  contact_person: r.contact_person || "",
  phone: r.phone || "",
  email: r.email || "",
  name: r.name,
  product_line: r.product_line || "",
  service: r.service || "",
  objective: r.objective || "",
  brief: r.brief || "",
  deliverables: r.deliverables || "",
  shoot_date: r.shoot_date || "",
  location: r.location || "",
  deadline: r.deadline || "",
  budget_range: r.budget_range || "",
  payment_terms: r.payment_terms || "",
  owner: r.owner || "",
  assigned_to_user_id: r.assigned_to_user_id || undefined,
  assigned_to_name: r.assigned_to_name || undefined,
  notes: r.notes || "",
  references: r.references || "",
  stage: (r.stage || "New Request") as PipelineStage,
  value: Number(r.value) || 0,
  paid: Number(r.paid) || 0,
  costs_total: Number(r.costs_total) || 0,
  next_action: r.next_action || undefined,
  payment_status: (r.payment_status || "Pending") as any,
  ...(r.custom_fields ? { custom_fields: r.custom_fields } : {}),
} as any);

const projectToRow = (p: Partial<OSProject> & { id?: string }) => {
  const { custom_fields, ...rest } = p as any;
  const row: any = { ...rest };
  if (custom_fields !== undefined) row.custom_fields = custom_fields;
  return row;
};

export const useOSStore = create<OSStore>((set, get) => ({
  projects: [],
  costs: COSTS,
  payments: PAYMENTS,
  quotations: QUOTATIONS,
  schedule: SCHEDULE,
  tasksByProject: {},
  _pipelineLoaded: false,
  _pipelineChannel: null,

  loadPipeline: async () => {
    const { data, error } = await supabase
      .from("os_pipeline_projects" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { console.warn("loadPipeline", error); return; }
    set({ projects: (data || []).map(rowToProject), _pipelineLoaded: true });
  },

  subscribePipeline: () => {
    if (get()._pipelineChannel) return;
    const ch = supabase
      .channel("os_pipeline_projects_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "os_pipeline_projects" }, (payload: any) => {
        const cur = get().projects;
        if (payload.eventType === "INSERT") {
          const p = rowToProject(payload.new);
          if (!cur.some(x => x.id === p.id)) set({ projects: [p, ...cur] });
        } else if (payload.eventType === "UPDATE") {
          const p = rowToProject(payload.new);
          set({ projects: cur.map(x => x.id === p.id ? { ...x, ...p } : x) });
        } else if (payload.eventType === "DELETE") {
          set({ projects: cur.filter(x => x.id !== payload.old.id) });
        }
      })
      .subscribe();
    set({ _pipelineChannel: ch });
  },

  unsubscribePipeline: () => {
    const ch = get()._pipelineChannel;
    if (ch) { supabase.removeChannel(ch); set({ _pipelineChannel: null }); }
  },

  addProject: (p) => {
    const nid = id();
    const newP: OSProject = { ...p, id: nid, paid: 0, costs_total: 0, payment_status: "Pending" };
    set({ projects: [newP, ...get().projects] });
    // Write-through to Supabase (fire & forget)
    (async () => {
      const { error } = await supabase.from("os_pipeline_projects" as any).insert(projectToRow(newP));
      if (error) console.warn("addProject persist failed:", error);
    })();
    return nid;
  },

  updateProjectStage: (id, stage) => {
    set({ projects: get().projects.map((p) => (p.id === id ? { ...p, stage } : p)) });
    supabase.from("os_pipeline_projects" as any).update({ stage }).eq("id", id).then(({ error }) => {
      if (error) console.warn("updateProjectStage persist failed:", error);
    });
  },

  updateProject: (id, patch) => {
    set({ projects: get().projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
    supabase.from("os_pipeline_projects" as any).update(projectToRow(patch)).eq("id", id).then(({ error }) => {
      if (error) console.warn("updateProject persist failed:", error);
    });
  },

  deleteProject: (id) => {
    set({ projects: get().projects.filter((p) => p.id !== id) });
    supabase.from("os_pipeline_projects" as any).delete().eq("id", id).then(({ error }) => {
      if (error) console.warn("deleteProject persist failed:", error);
    });
  },

  addCost: (c) => {
    const cost = { ...c, id: id() };
    set({
      costs: [cost, ...get().costs],
      projects: get().projects.map((p) =>
        p.id === c.project_id ? { ...p, costs_total: p.costs_total + c.amount } : p,
      ),
    });
  },
  addPayment: (pay) => {
    const payment = { ...pay, id: id() };
    set({
      payments: [payment, ...get().payments],
      projects: get().projects.map((p) => {
        if (p.id !== pay.project_id) return p;
        const newPaid = p.paid + pay.amount;
        const status = newPaid >= p.value ? "Paid" : newPaid > 0 ? "Partially Paid" : "Pending";
        return { ...p, paid: newPaid, payment_status: status as any };
      }),
    });
    // Persist paid + payment_status to shared pipeline so others see updates
    const target = get().projects.find(p => p.id === pay.project_id);
    if (target) {
      supabase.from("os_pipeline_projects" as any)
        .update({ paid: target.paid, payment_status: target.payment_status })
        .eq("id", pay.project_id)
        .then(({ error }) => { if (error) console.warn("payment persist failed", error); });
    }
  },
  addQuotation: (q) => set({ quotations: [{ ...q, id: id(), created_at: new Date().toISOString().slice(0, 10) }, ...get().quotations] }),
  addScheduleEvent: (e) => set({ schedule: [{ ...e, id: id() }, ...get().schedule] }),

  toggleTask: (project_id, task_id) => {
    const tasks = (get().tasksByProject[project_id] || []).map((t) =>
      t.id === task_id ? { ...t, done: !t.done } : t,
    );
    set({ tasksByProject: { ...get().tasksByProject, [project_id]: tasks } });
  },
  ensureTasks: (project_id, defaults) => {
    if (get().tasksByProject[project_id]) return;
    set({
      tasksByProject: {
        ...get().tasksByProject,
        [project_id]: defaults.map((title) => ({ id: id(), title, done: false })),
      },
    });
  },
}));
