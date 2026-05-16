// Per-user profile + tool-access store (localStorage-backed).
// Profiles stay client-side; permissions changes broadcast to listeners.

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
  | "/os/settings";

export const ALL_TOOLS: { key: OSToolKey; label: string }[] = [
  { key: "/os", label: "Dashboard" },
  { key: "/os/todos", label: "My To-Dos" },
  { key: "/os/pipeline", label: "Pipeline" },
  { key: "/os/projects/new", label: "New Project" },
  { key: "/os/calendar", label: "Calendar" },
  { key: "/os/finance", label: "Finance" },
  { key: "/os/quotations", label: "Quotations" },
  { key: "/os/team", label: "Team" },
  { key: "/os/reports", label: "Reports" },
  { key: "/os/access", label: "User Access (admin)" },
  { key: "/os/profile", label: "My Profile" },
  { key: "/os/settings", label: "Settings" },
];

// Always-on tools every user keeps (even after permission changes).
export const LOCKED_TOOLS: OSToolKey[] = ["/os", "/os/todos", "/os/profile", "/os/settings"];

export const DEFAULT_TOOLS: OSToolKey[] = [...LOCKED_TOOLS, "/os/calendar", "/os/pipeline"];
export const ADMIN_TOOLS: OSToolKey[] = ALL_TOOLS.map((t) => t.key);

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
export const deleteProfile = (userId: string) => {
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
