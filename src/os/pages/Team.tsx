import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Badge, OSButton, Field, Input, Select, Textarea, Modal } from "@/os/components/ui";
import {
  ALL_TOOLS, listProfiles, setAllowedTools, saveAllowedTools, fetchAllowedTools, type OSProfile, type OSToolKey, getProfile,
  DEFAULT_TOOLS, ADMIN_TOOLS, pickAvatarColor,
} from "@/os/access";
import {
  fetchTodos, fetchGoals, addTodoFor, addGoalFor, removeTodoFor, removeGoalFor,
  toggleTodoFor, toggleGoalFor, updateTodoFor, updateGoalFor,
  type Todo, type WeeklyGoal, type Priority, mondayOf, ymd, fmtDue,
} from "@/os/todoStore";
import { Users, Crown, Check, Trash2, Plus, ChevronRight, Shield, Mail, Phone, Search, Pencil } from "lucide-react";

const Team = () => {
  const { roles, user, profile } = useAuth();
  const isSuperAdmin = roles.includes("super_admin");
  const [profiles, setProfiles] = useState<OSProfile[]>([]);
  const [selected, setSelected] = useState<OSProfile | null>(null);
  const [tick, setTick] = useState(0);
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  // Load: real signed-up users from DB + overlay any localStorage OS profile data.
  // Admins use the edge function to get full user list with emails.
  useEffect(() => {
    (async () => {
      const local = listProfiles();
      const localById = new Map(local.map((p) => [p.userId, p]));

      type Row = { user_id: string; full_name: string | null; email?: string; created_at?: string; updated_at?: string; roles?: string[]; tools?: OSToolKey[] | null };
      let dbRows: Row[] = [];

      if (isSuperAdmin) {
        try {
          const { data, error } = await supabase.functions.invoke("manage-admins", { body: { action: "list" } });
          if (error) throw error;
          const users = data?.users || [];
          const toolRows = await Promise.all(users.map(async (u: any) => ({ id: u.id, tools: await fetchAllowedTools(u.id) })));
          const toolMap = new Map(toolRows.map((r) => [r.id, r.tools]));
          dbRows = users.map((u: any) => ({
            user_id: u.id, full_name: u.full_name, email: u.email,
            created_at: u.created_at, updated_at: u.created_at, roles: u.roles || [], tools: toolMap.get(u.id) || null,
          }));
        } catch {
          // fallback to profiles table
          const { data } = await supabase.from("profiles").select("user_id, full_name, created_at, updated_at");
          dbRows = (data as Row[]) || [];
        }
      } else {
        const { data } = await supabase.from("profiles").select("user_id, full_name, created_at, updated_at");
        dbRows = (data as Row[]) || [];
      }

      const dbIds = new Set(dbRows.map((r) => r.user_id));
      const merged: OSProfile[] = dbRows.map((r) => {
        const lp = localById.get(r.user_id);
        if (lp) return {
          ...lp,
          fullName: lp.fullName || r.full_name || "Team member",
          email: lp.email || r.email || "",
          role: r.roles?.includes("super_admin") ? "Super Admin" : r.roles?.includes("org_admin") ? "Admin" : lp.role,
          allowedTools: r.roles?.includes("super_admin") ? ADMIN_TOOLS : r.tools || lp.allowedTools,
        };
        const isAdmin = r.roles?.includes("super_admin") || r.roles?.includes("org_admin");
        return {
          userId: r.user_id,
          email: r.email || "",
          fullName: r.full_name || "Team member",
          role: r.roles?.includes("super_admin") ? "Super Admin" : isAdmin ? "Admin" : "Member",
          department: "Unassigned",
          avatarColor: pickAvatarColor(r.user_id),
          setupComplete: false,
          allowedTools: r.roles?.includes("super_admin") ? ADMIN_TOOLS : r.tools || DEFAULT_TOOLS,
          createdAt: r.created_at || new Date().toISOString(),
          updatedAt: r.updated_at || new Date().toISOString(),
        };
      });
      local.forEach((p) => { if (!dbIds.has(p.userId)) merged.push(p); });
      merged.sort((a, b) => a.fullName.localeCompare(b.fullName));
      setProfiles(merged);
    })();
  }, [tick, isSuperAdmin]);


  const adminName = useMemo(() => {
    if (!user) return "Admin";
    const p = getProfile(user.id);
    return p?.fullName || profile?.full_name || user.email || "Admin";
  }, [user, profile?.full_name]);

  const refresh = () => setTick((t) => t + 1);

  const departments = useMemo(() => {
    const set = new Set<string>(); profiles.forEach((p) => p.department && set.add(p.department));
    return ["All", ...Array.from(set).sort()];
  }, [profiles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return profiles.filter((p) => {
      if (deptFilter !== "All" && p.department !== deptFilter) return false;
      if (!q) return true;
      return [p.fullName, p.email, p.role, p.department].some((v) => v?.toLowerCase().includes(q));
    });
  }, [profiles, query, deptFilter]);

  const SearchBar = (
    <div className="flex flex-col sm:flex-row gap-2 mb-5">
      <div className="relative flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-os-muted" />
        <Input className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, email or role…" />
      </div>
      <div className="sm:w-48">
        <Select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
          {departments.map((d) => <option key={d}>{d}</option>)}
        </Select>
      </div>
    </div>
  );

  if (!isSuperAdmin) {
    return (
      <div>
        <PageHeader title="Team" subtitle="The people you work with on iKAMBA Media OS." />
        {SearchBar}
        {filtered.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => <MemberCard key={p.userId} p={p} />)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Team"
        subtitle="Real team members. Click any profile to view their to-dos, weekly goals, and tool permissions."
        actions={<Badge tone="gold"><Shield size={10} className="inline mr-1" /> Admin view</Badge>}
      />
      {SearchBar}
      {filtered.length === 0 ? (
        <EmptyState query={query} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <button
              key={p.userId}
              onClick={() => setSelected(p)}
              className="os-card rounded-xl p-5 text-left hover:ring-1 hover:ring-[hsl(var(--os-gold))]/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                {p.avatarUrl ? (
                  <img src={p.avatarUrl} className="h-12 w-12 rounded-full object-cover shrink-0" alt="" />
                ) : (
                  <div className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0" style={{ background: p.avatarColor }}>
                    {p.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold truncate">{p.fullName}</div>
                  <div className="text-xs text-os-muted truncate">{p.role} · {p.department}</div>
                </div>
                <ChevronRight size={18} className="text-os-muted group-hover:text-os-gold" />
              </div>
              <div className="mt-4 pt-4 border-t border-os grid grid-cols-3 gap-2 text-center">
                <Stat label="Tools" value={`${p.allowedTools.length}/${ALL_TOOLS.length}`} />
                <Stat label="Dept" value={p.department.split(" ")[0]} />
                <Stat label="Role" value={p.role.split(" ")[0]} />
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <MemberDetailModal
          key={selected.userId + tick}
          member={selected}
          adminName={adminName}
          onClose={() => setSelected(null)}
          onAnyChange={refresh}
        />
      )}
    </div>
  );
};

const EmptyState = ({ query }: { query?: string }) => (
  <div className="os-card rounded-xl p-10 text-center">
    <Users className="mx-auto text-os-muted mb-3" size={28} />
    <p className="text-white font-semibold">{query ? "No matches" : "No team members yet"}</p>
    <p className="text-os-muted text-sm mt-1">
      {query ? "Try a different name, email, or role." : "When teammates sign in and complete the setup wizard they'll appear here automatically."}
    </p>
  </div>
);

const Stat = ({ label, value }: { label: string; value: number | string }) => (
  <div>
    <div className="text-white font-bold text-sm truncate">{value}</div>
    <div className="text-[10px] uppercase tracking-wider text-os-muted">{label}</div>
  </div>
);

const MemberCard = ({ p }: { p: OSProfile }) => (
  <div className="os-card rounded-xl p-5">
    <div className="flex items-center gap-3">
      {p.avatarUrl ? (
        <img src={p.avatarUrl} className="h-12 w-12 rounded-full object-cover" alt="" />
      ) : (
        <div className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: p.avatarColor }}>
          {p.fullName.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0">
        <div className="text-white font-semibold truncate">{p.fullName}</div>
        <div className="text-xs text-os-muted truncate">{p.role}</div>
      </div>
    </div>
    <div className="mt-3 text-xs text-os-muted flex items-center gap-1.5"><Mail size={12} /> {p.email}</div>
    {p.phone && <div className="text-xs text-os-muted flex items-center gap-1.5 mt-1"><Phone size={12} /> {p.phone}</div>}
  </div>
);

/* ─── Detail modal ─── */
const MemberDetailModal = ({
  member, adminName, onClose, onAnyChange,
}: {
  member: OSProfile; adminName: string; onClose: () => void; onAnyChange: () => void;
}) => {
  const { user } = useAuth();
  const [tab, setTab] = useState<"info" | "todos" | "goals" | "tools">("info");
  const [todos, setLocalTodos] = useState<Todo[]>([]);
  const [goals, setLocalGoals] = useState<WeeklyGoal[]>([]);
  const [allowed, setAllowed] = useState<OSToolKey[]>(member.allowedTools);

  const reload = async () => {
    const [t, g] = await Promise.all([fetchTodos(member.userId), fetchGoals(member.userId)]);
    setLocalTodos(t); setLocalGoals(g);
  };
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [member.userId]);

  const [tTitle, setTTitle] = useState("");
  const [tNotes, setTNotes] = useState("");
  const [tDue, setTDue] = useState("");
  const [tPri, setTPri] = useState<Priority>("high");

  const assignTodo = async () => {
    if (!tTitle.trim() || !tDue) return;
    await addTodoFor(member.userId, {
      title: tTitle.trim(), notes: tNotes.trim() || undefined, due: tDue, priority: tPri,
      byAdmin: true, assignedByName: adminName,
    });
    setTTitle(""); setTNotes(""); setTDue(""); setTPri("high");
    reload();
  };

  const [gTitle, setGTitle] = useState("");
  const [gNotes, setGNotes] = useState("");
  const [gPri, setGPri] = useState<Priority>("high");
  const [gWeek, setGWeek] = useState(ymd(mondayOf(new Date())));

  const assignGoal = async () => {
    if (!gTitle.trim()) return;
    await addGoalFor(member.userId, {
      title: gTitle.trim(), notes: gNotes.trim() || undefined, priority: gPri, weekStart: gWeek,
      byAdmin: true, assignedByName: adminName,
    });
    setGTitle(""); setGNotes(""); setGPri("high");
    reload();
  };

  const toggleTool = async (k: OSToolKey) => {
    const next = allowed.includes(k) ? allowed.filter((x) => x !== k) : [...allowed, k];
    setAllowed(next);
    setAllowedTools(member.userId, next);
    await saveAllowedTools(member.userId, next, user?.id);
    onAnyChange();
  };

  const setAdminRole = async (makeAdmin: boolean) => {
    const role = makeAdmin ? "org_admin" : "user";
    const { error } = await supabase.functions.invoke("manage-admins", { body: { action: "update_role", user_id: member.userId, new_role: role } });
    if (!error) onAnyChange();
  };

  const openTodos = todos.filter((t) => !t.done);
  const doneTodos = todos.filter((t) => t.done);
  const weeklyForThis = goals.filter((g) => g.weekStart === gWeek);
  const pastGoals = goals.filter((g) => g.weekStart < gWeek && !g.done);

  return (
    <Modal open onClose={onClose} title={member.fullName}>
      <div className="flex items-center gap-3 -mt-2 mb-4 pb-4 border-b border-os">
        {member.avatarUrl ? (
          <img src={member.avatarUrl} className="h-14 w-14 rounded-full object-cover shrink-0" alt="" />
        ) : (
          <div className="h-14 w-14 rounded-full flex items-center justify-center text-white font-extrabold text-xl shrink-0" style={{ background: member.avatarColor }}>
            {member.fullName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-white font-bold">{member.fullName}</div>
          <div className="text-xs text-os-muted truncate">{member.email}</div>
          <div className="flex gap-1.5 mt-1 flex-wrap">
            <Badge tone="gold">{member.role}</Badge>
            <Badge>{member.department}</Badge>
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-4 border-b border-os">
        {(["info", "todos", "goals", "tools"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-semibold capitalize border-b-2 transition-colors ${
              tab === t ? "border-[hsl(var(--os-gold))] text-white" : "border-transparent text-os-muted hover:text-white"
            }`}
          >
            {t === "todos" ? "To-Dos" : t === "goals" ? "Weekly Goals" : t === "tools" ? "Permissions" : "Info"}
          </button>
        ))}
      </div>

      {tab === "info" && (
        <div className="space-y-2 text-sm">
          <Row label="Email" value={member.email} />
          {member.phone && <Row label="Phone" value={member.phone} />}
          <Row label="Role" value={member.role} />
          <Row label="Department" value={member.department} />
          {member.bio && <div className="pt-2 text-os-muted italic">"{member.bio}"</div>}
          <div className="pt-2 text-[11px] text-os-muted">
            Joined {new Date(member.createdAt).toLocaleDateString()} · Last updated {new Date(member.updatedAt).toLocaleDateString()}
          </div>
          <div className="pt-4 border-t border-os flex flex-wrap gap-2">
            {member.role === "Super Admin" ? (
              <Badge tone="gold"><Crown size={10} className="inline mr-1" /> Permanent super admin</Badge>
            ) : member.role === "Admin" ? (
              <OSButton variant="outline" onClick={() => setAdminRole(false)}><Shield size={14} /> Remove admin</OSButton>
            ) : (
              <OSButton variant="primary" onClick={() => setAdminRole(true)}><Shield size={14} /> Make admin</OSButton>
            )}
          </div>
        </div>
      )}

      {tab === "todos" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-[hsl(var(--os-gold))]/40 bg-os-gold/5 p-3 space-y-2">
            <div className="text-os-gold text-xs uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Crown size={12} /> Assign new task (gold = from admin)
            </div>
            <Input value={tTitle} onChange={(e) => setTTitle(e.target.value)} placeholder="Task title" />
            <Textarea rows={2} value={tNotes} onChange={(e) => setTNotes(e.target.value)} placeholder="Notes (optional)" />
            <div className="grid grid-cols-2 gap-2">
              <Input type="datetime-local" value={tDue} onChange={(e) => setTDue(e.target.value)} />
              <Select value={tPri} onChange={(e) => setTPri(e.target.value as Priority)}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </Select>
            </div>
            <OSButton variant="primary" onClick={assignTodo} className="w-full justify-center">
              <Plus size={14} /> Assign task
            </OSButton>
          </div>

          <ListSection title={`Open (${openTodos.length})`} empty="No open tasks.">
            {openTodos.map((t) => (
              <AdminTodoRow key={t.id} t={t}
                onToggle={async () => { await toggleTodoFor(member.userId, t.id, !t.done); reload(); }}
                onDelete={async () => { await removeTodoFor(member.userId, t.id); reload(); }}
              />
            ))}
          </ListSection>
          {doneTodos.length > 0 && (
            <ListSection title={`Completed (${doneTodos.length})`} empty="">
              {doneTodos.map((t) => (
                <AdminTodoRow key={t.id} t={t} muted
                  onToggle={async () => { await toggleTodoFor(member.userId, t.id, !t.done); reload(); }}
                  onDelete={async () => { await removeTodoFor(member.userId, t.id); reload(); }}
                />
              ))}
            </ListSection>
          )}
        </div>
      )}

      {tab === "goals" && (
        <div className="space-y-4">
          <Field label="Week"><Input type="date" value={gWeek} onChange={(e) => setGWeek(ymd(mondayOf(new Date(e.target.value))))} /></Field>

          <div className="rounded-lg border border-[hsl(var(--os-gold))]/40 bg-os-gold/5 p-3 space-y-2">
            <div className="text-os-gold text-xs uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Crown size={12} /> Assign weekly goal
            </div>
            <Input value={gTitle} onChange={(e) => setGTitle(e.target.value)} placeholder="Goal title" />
            <Input value={gNotes} onChange={(e) => setGNotes(e.target.value)} placeholder="Notes (optional)" />
            <Select value={gPri} onChange={(e) => setGPri(e.target.value as Priority)}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </Select>
            <OSButton variant="primary" onClick={assignGoal} className="w-full justify-center">
              <Plus size={14} /> Assign goal
            </OSButton>
          </div>

          {pastGoals.length > 0 && (
            <ListSection title={`Unfinished from past weeks (${pastGoals.length})`} empty="">
              {pastGoals.map((g) => (
                <AdminGoalRow key={g.id} g={g}
                  onToggle={async () => { await toggleGoalFor(member.userId, g.id, !g.done); reload(); }}
                  onDelete={async () => { await removeGoalFor(member.userId, g.id); reload(); }}
                />
              ))}
            </ListSection>
          )}
          <ListSection title={`This week (${weeklyForThis.length})`} empty="No goals for this week.">
            {weeklyForThis.map((g) => (
              <AdminGoalRow key={g.id} g={g}
                onToggle={async () => { await toggleGoalFor(member.userId, g.id, !g.done); reload(); }}
                onDelete={async () => { await removeGoalFor(member.userId, g.id); reload(); }}
              />
            ))}
          </ListSection>
        </div>
      )}

      {tab === "tools" && (
        <div>
          <p className="text-os-muted text-sm mb-3">Toggle which tools {member.fullName.split(" ")[0]} can access in the OS sidebar.</p>
          <div className="grid grid-cols-2 gap-2">
            {ALL_TOOLS.map((t) => {
              const active = allowed.includes(t.key);
              return (
                <button
                  key={t.key}
                  onClick={() => toggleTool(t.key)}
                  className={`text-left rounded-lg border px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                    active ? "border-[hsl(var(--os-gold))] bg-os-gold/10 text-white" : "border-os text-os-muted hover:text-white"
                  }`}
                >
                  <span>{t.label}</span>
                  {active && <Check size={14} className="text-os-gold" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-3">
    <span className="text-os-muted">{label}</span>
    <span className="text-white text-right truncate">{value}</span>
  </div>
);

const ListSection = ({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) => {
  const arr = Array.isArray(children) ? children : [children];
  const hasContent = arr.filter(Boolean).length > 0;
  return (
    <div>
      <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-2">{title}</h4>
      {hasContent ? <div className="space-y-2">{children}</div> : <p className="text-os-muted text-sm">{empty}</p>}
    </div>
  );
};

const AdminTodoRow = ({ t, onToggle, onDelete, muted }: { t: Todo; onToggle: () => void; onDelete: () => void; muted?: boolean }) => {
  const cls = t.done ? "border border-emerald-500/50 bg-emerald-500/10" : t.byAdmin ? "border border-[hsl(var(--os-gold))] bg-os-gold/10" : "os-card-2";
  return (
    <div className={`rounded-lg p-2.5 flex items-start gap-2 ${cls} ${muted ? "opacity-70" : ""}`}>
      <button onClick={onToggle} className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 ${t.done ? "bg-emerald-500 border-transparent" : "border-os"}`}>
        {t.done && <Check size={10} className="text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold ${t.done ? "text-emerald-300 line-through" : t.byAdmin ? "text-os-gold" : "text-white"}`}>{t.title}</div>
        <div className="flex flex-wrap gap-1.5 items-center mt-0.5">
          <span className="text-[10px] text-os-muted">{fmtDue(t.due)}</span>
          <Badge tone={t.priority === "high" ? "red" : t.priority === "medium" ? "gold" : "green"}>{t.priority}</Badge>
          {t.done && <Badge tone="green">Done</Badge>}
          {t.byAdmin && <span className="text-[10px] text-os-gold font-bold uppercase flex items-center gap-1"><Crown size={9} /> Admin</span>}
        </div>
      </div>
      <button onClick={onDelete} className="text-os-muted hover:text-rose-300 p-1"><Trash2 size={13} /></button>
    </div>
  );
};

const AdminGoalRow = ({ g, onToggle, onDelete }: { g: WeeklyGoal; onToggle: () => void; onDelete: () => void }) => {
  const cls = g.done ? "border border-emerald-500/50 bg-emerald-500/10" : g.byAdmin ? "border border-[hsl(var(--os-gold))] bg-os-gold/10" : "os-card-2";
  return (
    <div className={`rounded-lg p-2.5 flex items-start gap-2 ${cls}`}>
      <button onClick={onToggle} className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 ${g.done ? "bg-emerald-500 border-transparent" : "border-os"}`}>
        {g.done && <Check size={10} className="text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold ${g.done ? "text-emerald-300 line-through" : g.byAdmin ? "text-os-gold" : "text-white"}`}>{g.title}</div>
        <div className="flex flex-wrap gap-1.5 items-center mt-0.5">
          <span className="text-[10px] text-os-muted">Week of {g.weekStart}</span>
          <Badge tone={g.priority === "high" ? "red" : g.priority === "medium" ? "gold" : "green"}>{g.priority}</Badge>
          {g.done && <Badge tone="green">Done</Badge>}
          {g.byAdmin && <span className="text-[10px] text-os-gold font-bold uppercase flex items-center gap-1"><Crown size={9} /> Admin</span>}
        </div>
      </div>
      <button onClick={onDelete} className="text-os-muted hover:text-rose-300 p-1"><Trash2 size={13} /></button>
    </div>
  );
};

export default Team;
