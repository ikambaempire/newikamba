// Per-user profile + tool-access store (localStorage-backed).
// Profiles stay client-side; permissions changes broadcast to listeners.
import { supabase } from "@/integrations/supabase/client";

export type OSToolKey =
  | "/os"
  | "/os/todos"
  | "/os/pipeline"
  | "/os/projects/new"
  | "/os/calendar"
  | "/os/finance"
  | "/os/quotations"
  | "/os/team"
  | "/os/reports"
  | "/os/access"
  | "/os/profile"
  | "/os/settings"
  | "/os/expenses";

export const ALL_TOOLS: { key: OSToolKey; label: string }[] = [
  { key: "/os", label: "Dashboard" },
  { key: "/os/todos", label: "My To-Dos" },
  { key: "/os/pipeline", label: "Pipeline" },
  { key: "/os/projects/new", label: "New Project" },
  { key: "/os/calendar", label: "Calendar" },
  { key: "/os/finance", label: "Finance" },
  { key: "/os/quotations", label: "Quotations" },
  { key: "/os/expenses", label: "Expense Requests" },
  { key: "/os/team", label: "Team" },
  { key: "/os/reports", label: "Reports" },
  { key: "/os/access", label: "User Access (admin)" },
  { key: "/os/profile", label: "My Profile" },
  { key: "/os/settings", label: "Settings" },
];

// Always-on tools every user keeps (even after permission changes).
export const LOCKED_TOOLS: OSToolKey[] = ["/os", "/os/todos", "/os/profile", "/os/settings", "/os/expenses"];

export const DEFAULT_TOOLS: OSToolKey[] = [...LOCKED_TOOLS, "/os/calendar", "/os/pipeline"];
export const ADMIN_TOOLS: OSToolKey[] = ALL_TOOLS.map((t) => t.key);

export const hasSuperAdminRole = (roles: string[]) => roles.includes("super_admin");
export const hasAdminRole = (roles: string[]) => roles.includes("super_admin") || roles.includes("org_admin");

export type OSProfile = {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  department: string;
  phone?: string;
  bio?: string;
  avatarColor: string;
  avatarUrl?: string;
  setupComplete: boolean;
  allowedTools: OSToolKey[];
  createdAt: string;
  updatedAt: string;
};

const KEY = "ikamba.os.users.v1";
const CHANGE_EVT = "ikamba:access-changed";

type Store = Record<string, OSProfile>;

const read = (): Store => {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
};
const write = (s: Store) => {
  localStorage.setItem(KEY, JSON.stringify(s));
  try { window.dispatchEvent(new CustomEvent(CHANGE_EVT)); } catch {}
};

export const getProfile = (userId: string): OSProfile | null => read()[userId] || null;
export const listProfiles = (): OSProfile[] =>
  Object.values(read()).sort((a, b) => a.fullName.localeCompare(b.fullName));

export const upsertProfile = (p: OSProfile) => {
  const s = read();
  s[p.userId] = { ...p, updatedAt: new Date().toISOString() };
  write(s);
};
export const setAllowedTools = (userId: string, tools: OSToolKey[]) => {
  const s = read();
  if (!s[userId]) return;
  s[userId] = { ...s[userId], allowedTools: tools, updatedAt: new Date().toISOString() };
  write(s);
};

export const fetchAllowedTools = async (userId: string): Promise<OSToolKey[] | null> => {
  const { data, error } = await (supabase as any).from("os_tool_access").select("tool_key").eq("user_id", userId);
  if (error) { console.error("fetchAllowedTools failed", error); return null; }
  if (!data || data.length === 0) return null;
  return data.map((r: any) => r.tool_key as OSToolKey).filter(Boolean);
};

export const saveAllowedTools = async (userId: string, tools: OSToolKey[], grantedBy?: string) => {
  const unique = Array.from(new Set([...tools, ...LOCKED_TOOLS]));
  const { error: deleteError } = await (supabase as any).from("os_tool_access").delete().eq("user_id", userId);
  if (deleteError) { console.error("delete tool access failed", deleteError); throw deleteError; }
  if (unique.length === 0) return;
  const { error } = await (supabase as any).from("os_tool_access").insert(unique.map((tool_key) => ({ user_id: userId, tool_key, granted_by: grantedBy ?? null })));
  if (error) { console.error("save tool access failed", error); throw error; }
  const s = read();
  if (s[userId]) {
    s[userId] = { ...s[userId], allowedTools: unique, updatedAt: new Date().toISOString() };
    write(s);
  }
};
export const deleteProfile = (userId: string) => {
  const s = read();
  delete s[userId];
  write(s);
};

export const clearUserAccessCache = (userId: string) => {
  const s = read();
  delete s[userId];
  write(s);
};

// Subscribe to permission/profile changes (same tab + cross-tab).
export const onAccessChange = (cb: () => void) => {
  const h = () => cb();
  window.addEventListener(CHANGE_EVT, h);
  window.addEventListener("storage", h);
  return () => {
    window.removeEventListener(CHANGE_EVT, h);
    window.removeEventListener("storage", h);
  };
};

const COLORS = ["#D4A739", "#5b8def", "#22c55e", "#ef4444", "#a855f7", "#06b6d4", "#f97316", "#ec4899"];
export const pickAvatarColor = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
};
