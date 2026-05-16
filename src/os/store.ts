import { create } from "zustand";
import {
  PROJECTS, COSTS, PAYMENTS, QUOTATIONS, SCHEDULE,
  type OSProject, type OSCost, type OSPayment, type OSQuotation, type OSScheduleEvent, type PipelineStage,
} from "@/os/mock/data";

// TODO: replace with supabase queries + realtime subscriptions
interface OSStore {
  projects: OSProject[];
  costs: OSCost[];
  payments: OSPayment[];
  quotations: OSQuotation[];
  schedule: OSScheduleEvent[];
  tasksByProject: Record<string, { id: string; title: string; done: boolean }[]>;

  addProject: (p: Omit<OSProject, "id" | "paid" | "costs_total" | "payment_status">) => string;
  updateProjectStage: (id: string, stage: PipelineStage) => void;
  updateProject: (id: string, patch: Partial<OSProject>) => void;

  addCost: (c: Omit<OSCost, "id">) => void;
  addPayment: (p: Omit<OSPayment, "id">) => void;
  addQuotation: (q: Omit<OSQuotation, "id" | "created_at">) => void;
  addScheduleEvent: (e: Omit<OSScheduleEvent, "id">) => void;

  toggleTask: (project_id: string, task_id: string) => void;
  ensureTasks: (project_id: string, defaults: string[]) => void;
}

const id = () => Math.random().toString(36).slice(2, 10);

export const useOSStore = create<OSStore>((set, get) => ({
  projects: PROJECTS,
  costs: COSTS,
  payments: PAYMENTS,
  quotations: QUOTATIONS,
  schedule: SCHEDULE,
  tasksByProject: {},

  addProject: (p) => {
    const nid = id();
    const newP: OSProject = { ...p, id: nid, paid: 0, costs_total: 0, payment_status: "Pending" };
    set({ projects: [newP, ...get().projects] });
    return nid;
  },
  updateProjectStage: (id, stage) =>
    set({ projects: get().projects.map((p) => (p.id === id ? { ...p, stage } : p)) }),
  updateProject: (id, patch) =>
    set({ projects: get().projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) }),

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
