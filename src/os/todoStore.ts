// Shared localStorage-backed store for per-user todos & weekly goals.
// Used by Todos.tsx (self) and Team admin view (anyone).
// TODO: move to Supabase tables: os_todos, os_weekly_goals (with RLS by user_id + admin override).

export type Priority = "low" | "medium" | "high";

export type Todo = {
  id: string;
  title: string;
  notes?: string;
  due: string;
  priority: Priority;
  done: boolean;
  remindersFired: number[];
  createdAt: string;
  byAdmin?: boolean;        // true => assigned by admin, rendered gold
  assignedByName?: string;  // admin display name
};

export type WeeklyGoal = {
  id: string;
  title: string;
  notes?: string;
  weekStart: string;        // YYYY-MM-DD (Monday)
  priority: Priority;
  done: boolean;
  createdAt: string;
  byAdmin?: boolean;
  assignedByName?: string;
};

export const TODO_PREFIX = "ikamba.todos.v1.";
export const GOAL_PREFIX = "ikamba.weeklygoals.v1.";

export const uid = () => Math.random().toString(36).slice(2, 10);

export const mondayOf = (d: Date) => {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
};
export const ymd = (d: Date) => d.toISOString().slice(0, 10);
export const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

const readJSON = <T,>(key: string, fallback: T): T => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; }
};
const writeJSON = (key: string, v: unknown) => localStorage.setItem(key, JSON.stringify(v));

export const getTodos = (userId: string): Todo[] => readJSON<Todo[]>(TODO_PREFIX + userId, []);
export const setTodos = (userId: string, todos: Todo[]) => writeJSON(TODO_PREFIX + userId, todos);
export const getGoals = (userId: string): WeeklyGoal[] => readJSON<WeeklyGoal[]>(GOAL_PREFIX + userId, []);
export const setGoals = (userId: string, goals: WeeklyGoal[]) => writeJSON(GOAL_PREFIX + userId, goals);

export const addTodoFor = (userId: string, t: Omit<Todo, "id" | "createdAt" | "remindersFired" | "done">) => {
  const list = getTodos(userId);
  list.unshift({ ...t, id: uid(), createdAt: new Date().toISOString(), remindersFired: [], done: false });
  setTodos(userId, list);
};
export const addGoalFor = (userId: string, g: Omit<WeeklyGoal, "id" | "createdAt" | "done">) => {
  const list = getGoals(userId);
  list.unshift({ ...g, id: uid(), createdAt: new Date().toISOString(), done: false });
  setGoals(userId, list);
};
export const removeTodoFor = (userId: string, id: string) =>
  setTodos(userId, getTodos(userId).filter((t) => t.id !== id));
export const removeGoalFor = (userId: string, id: string) =>
  setGoals(userId, getGoals(userId).filter((g) => g.id !== id));
export const toggleTodoFor = (userId: string, id: string) =>
  setTodos(userId, getTodos(userId).map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
export const toggleGoalFor = (userId: string, id: string) =>
  setGoals(userId, getGoals(userId).map((g) => (g.id === id ? { ...g, done: !g.done } : g)));

export const fmtDue = (iso: string) =>
  !iso ? "—" : new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
export const minutesUntil = (iso: string) =>
  Math.round((new Date(iso).getTime() - Date.now()) / 60000);

export const todayDueISO = () => {
  const today = new Date(); today.setHours(17, 0, 0, 0);
  return new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
