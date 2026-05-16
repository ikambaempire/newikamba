// Supabase-backed store for per-user todos & weekly goals.
// Tables: os_todos, os_weekly_goals (RLS: own rows + super_admin override).
import { supabase } from "@/integrations/supabase/client";

export type Priority = "low" | "medium" | "high";

export type Todo = {
  id: string;
  title: string;
  notes?: string | null;
  due: string; // ISO
  priority: Priority;
  done: boolean;
  remindersFired: number[];
  createdAt: string;
  byAdmin?: boolean;
  assignedByName?: string | null;
};

export type WeeklyGoal = {
  id: string;
  title: string;
  notes?: string | null;
  weekStart: string; // YYYY-MM-DD
  priority: Priority;
  done: boolean;
  createdAt: string;
  byAdmin?: boolean;
  assignedByName?: string | null;
};

// ───── helpers
export const uid = () => Math.random().toString(36).slice(2, 10);
export const mondayOf = (d: Date) => {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
};
export const ymd = (d: Date) => {
  const x = new Date(d);
  const off = x.getTimezoneOffset();
  return new Date(x.getTime() - off * 60000).toISOString().slice(0, 10);
};
export const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const fmtDue = (iso: string) =>
  !iso ? "—" : new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
export const minutesUntil = (iso: string) =>
  Math.round((new Date(iso).getTime() - Date.now()) / 60000);
export const todayDueISO = () => {
  const today = new Date(); today.setHours(17, 0, 0, 0);
  return new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

// ───── mappers
type TodoRow = {
  id: string; user_id: string; title: string; notes: string | null; due: string | null;
  priority: Priority; done: boolean; reminders_fired: number[]; by_admin: boolean;
  assigned_by_name: string | null; created_at: string;
};
type GoalRow = {
  id: string; user_id: string; title: string; notes: string | null; week_start: string;
  priority: Priority; done: boolean; by_admin: boolean; assigned_by_name: string | null; created_at: string;
};

const toTodo = (r: TodoRow): Todo => ({
  id: r.id, title: r.title, notes: r.notes ?? undefined, due: r.due || "",
  priority: r.priority, done: r.done, remindersFired: r.reminders_fired || [],
  byAdmin: r.by_admin, assignedByName: r.assigned_by_name, createdAt: r.created_at,
});
const toGoal = (r: GoalRow): WeeklyGoal => ({
  id: r.id, title: r.title, notes: r.notes ?? undefined, weekStart: r.week_start,
  priority: r.priority, done: r.done, byAdmin: r.by_admin,
  assignedByName: r.assigned_by_name, createdAt: r.created_at,
});

// ───── fetch
export const fetchTodos = async (userId: string): Promise<Todo[]> => {
  const { data, error } = await supabase
    .from("os_todos")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return (data as TodoRow[]).map(toTodo);
};
export const fetchGoals = async (userId: string): Promise<WeeklyGoal[]> => {
  const { data, error } = await supabase
    .from("os_weekly_goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return (data as GoalRow[]).map(toGoal);
};

// ───── mutations
export const addTodoFor = async (userId: string, t: Omit<Todo, "id" | "createdAt" | "remindersFired" | "done">) => {
  const { error } = await supabase.from("os_todos").insert({
    user_id: userId, title: t.title, notes: t.notes ?? null, due: t.due || null,
    priority: t.priority, by_admin: !!t.byAdmin, assigned_by_name: t.assignedByName ?? null,
  });
  if (error) console.error(error);
};
export const addGoalFor = async (userId: string, g: Omit<WeeklyGoal, "id" | "createdAt" | "done">) => {
  const { error } = await supabase.from("os_weekly_goals").insert({
    user_id: userId, title: g.title, notes: g.notes ?? null, week_start: g.weekStart,
    priority: g.priority, by_admin: !!g.byAdmin, assigned_by_name: g.assignedByName ?? null,
  });
  if (error) console.error(error);
};
export const removeTodoFor = async (_userId: string, id: string) => {
  const { error } = await supabase.from("os_todos").delete().eq("id", id);
  if (error) console.error(error);
};
export const removeGoalFor = async (_userId: string, id: string) => {
  const { error } = await supabase.from("os_weekly_goals").delete().eq("id", id);
  if (error) console.error(error);
};
export const toggleTodoFor = async (_userId: string, id: string, done: boolean) => {
  const { error } = await supabase.from("os_todos").update({ done }).eq("id", id);
  if (error) console.error(error);
};
export const toggleGoalFor = async (_userId: string, id: string, done: boolean) => {
  const { error } = await supabase.from("os_weekly_goals").update({ done }).eq("id", id);
  if (error) console.error(error);
};
export const updateRemindersFired = async (id: string, remindersFired: number[]) => {
  const { error } = await supabase.from("os_todos").update({ reminders_fired: remindersFired }).eq("id", id);
  if (error) console.error(error);
};
