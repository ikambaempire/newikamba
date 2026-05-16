import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader, Badge, OSButton, Field, Input, Select, Textarea, Modal } from "@/os/components/ui";
import {
  ALL_TOOLS, listProfiles, setAllowedTools, type OSProfile, type OSToolKey, getProfile,
} from "@/os/access";
import {
  getTodos, getGoals, addTodoFor, addGoalFor, removeTodoFor, removeGoalFor, toggleTodoFor, toggleGoalFor,
  type Todo, type WeeklyGoal, type Priority, mondayOf, ymd, fmtDue,
} from "@/os/todoStore";
import { Users, Crown, Check, Trash2, Plus, ChevronRight, Shield, Mail, Phone } from "lucide-react";

const Team = () => {
  const { roles, user, profile } = useAuth();
  const isSuperAdmin = roles.includes("super_admin");
  const [profiles, setProfiles] = useState<OSProfile[]>([]);
  const [selected, setSelected] = useState<OSProfile | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => { setProfiles(listProfiles()); }, [tick]);

  const adminName = useMemo(() => {
    if (!user) return "Admin";
    const p = getProfile(user.id);
    return p?.fullName || profile?.full_name || user.email || "Admin";
  }, [user, profile?.full_name]);

  const refresh = () => setTick((t) => t + 1);

  if (!isSuperAdmin) {
    // Non-admin view: simple directory of teammates.
    return (
      <div>
        <PageHeader title="Team" subtitle="The people you work with on iKAMBA Media OS." />
        {profiles.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((p) => <MemberCard key={p.userId} p={p} />)}
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
      {profiles.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((p) => {
            const tCount = getTodos(p.userId).filter((t) => !t.done).length;
            const gCount = getGoals(p.userId).filter((g) => !g.done).length;
            return (
              <button
                key={p.userId}
                onClick={() => setSelected(p)}
                className="os-card rounded-xl p-5 text-left hover:ring-1 hover:ring-[hsl(var(--os-gold))]/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                    style={{ background: p.avatarColor }}
                  >
                    {p.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold truncate">{p.fullName}</div>
                    <div className="text-xs text-os-muted truncate">{p.role} · {p.department}</div>
                  </div>
                  <ChevronRight size={18} className="text-os-muted group-hover:text-os-gold" />
                </div>
                <div className="mt-4 pt-4 border-t border-os grid grid-cols-3 gap-2 text-center">
                  <Stat label="Open" value={tCount} />
                  <Stat label="Goals" value={gCount} />
                  <Stat label="Tools" value={`${p.allowedTools.length}/${ALL_TOOLS.length}`} />
                </div>
              </button>
            );
          })}
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

const EmptyState = () => (
  <div className="os-card rounded-xl p-10 text-center">
    <Users className="mx-auto text-os-muted mb-3" size={28} />
    <p className="text-white font-semibold">No team members yet</p>
    <p className="text-os-muted text-sm mt-1">When teammates sign in and complete the setup wizard they'll appear here automatically.</p>
  </div>
);

const Stat = ({ label, value }: { label: string; value: number | string }) => (
  <div>
    <div className="text-white font-bold text-sm">{value}</div>
    <div className="text-[10px] uppercase tracking-wider text-os-muted">{label}</div>
  </div>
);

const MemberCard = ({ p }: { p: OSProfile }) => (
  <div className="os-card rounded-xl p-5">
    <div className="flex items-center gap-3">
      <div className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: p.avatarColor }}>
        {p.fullName.charAt(0).toUpperCase()}
      </div>
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
  const [tab, setTab] = useState<"info" | "todos" | "goals" | "tools">("info");
  const [todos, setLocalTodos] = useState<Todo[]>(getTodos(member.userId));
  const [goals, setLocalGoals] = useState<WeeklyGoal[]>(getGoals(member.userId));
  const [allowed, setAllowed] = useState<OSToolKey[]>(member.allowedTools);

  const reload = () => {
    setLocalTodos(getTodos(member.userId));
    setLocalGoals(getGoals(member.userId));
    onAnyChange();
  };

  // Assign new todo
  const [tTitle, setTTitle] = useState("");
  const [tNotes, setTNotes] = useState("");
  const [tDue, setTDue] = useState("");
  const [tPri, setTPri] = useState<Priority>("high");

  const assignTodo = () => {
    if (!tTitle.trim() || !tDue) return;
    addTodoFor(member.userId, {
      title: tTitle.trim(), notes: tNotes.trim() || undefined, due: tDue, priority: tPri,
      byAdmin: true, assignedByName: adminName,
    });
    setTTitle(""); setTNotes(""); setTDue(""); setTPri("high");
    reload();
  };

  // Assign new goal
  const [gTitle, setGTitle] = useState("");
  const [gNotes, setGNotes] = useState("");
  const [gPri, setGPri] = useState<Priority>("high");
  const [gWeek, setGWeek] = useState(ymd(mondayOf(new Date())));

  const assignGoal = () => {
    if (!gTitle.trim()) return;
    addGoalFor(member.userId, {
      title: gTitle.trim(), notes: gNotes.trim() || undefined, priority: gPri, weekStart: gWeek,
      byAdmin: true, assignedByName: adminName,
    });
    setGTitle(""); setGNotes(""); setGPri("high");
    reload();
  };

  const toggleTool = (k: OSToolKey) => {
    const next = allowed.includes(k) ? allowed.filter((x) => x !== k) : [...allowed, k];
    setAllowed(next);
    setAllowedTools(member.userId, next);
    onAnyChange();
  };

  const openTodos = todos.filter((t) => !t.done);
  const doneTodos = todos.filter((t) => t.done);
  const weeklyForThis = goals.filter((g) => g.weekStart === gWeek);
  const pastGoals = goals.filter((g) => g.weekStart < gWeek && !g.done);

  return (
    <Modal open onClose={onClose} title={member.fullName}>
      {/* Header */}
      <div className="flex items-center gap-3 -mt-2 mb-4 pb-4 border-b border-os">
        <div className="h-14 w-14 rounded-full flex items-center justify-center text-white font-extrabold text-xl shrink-0" style={{ background: member.avatarColor }}>
          {member.fullName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="text-white font-bold">{member.fullName}</div>
          <div className="text-xs text-os-muted truncate">{member.email}</div>
          <div className="flex gap-1.5 mt-1 flex-wrap">
            <Badge tone="gold">{member.role}</Badge>
            <Badge>{member.department}</Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
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
                onToggle={() => { toggleTodoFor(member.userId, t.id); reload(); }}
                onDelete={() => { removeTodoFor(member.userId, t.id); reload(); }}
              />
            ))}
          </ListSection>
          {doneTodos.length > 0 && (
            <ListSection title={`Completed (${doneTodos.length})`} empty="">
              {doneTodos.map((t) => (
                <AdminTodoRow key={t.id} t={t} muted
                  onToggle={() => { toggleTodoFor(member.userId, t.id); reload(); }}
                  onDelete={() => { removeTodoFor(member.userId, t.id); reload(); }}
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
                  onToggle={() => { toggleGoalFor(member.userId, g.id); reload(); }}
                  onDelete={() => { removeGoalFor(member.userId, g.id); reload(); }}
                />
              ))}
            </ListSection>
          )}
          <ListSection title={`This week (${weeklyForThis.length})`} empty="No goals for this week.">
            {weeklyForThis.map((g) => (
              <AdminGoalRow key={g.id} g={g}
                onToggle={() => { toggleGoalFor(member.userId, g.id); reload(); }}
                onDelete={() => { removeGoalFor(member.userId, g.id); reload(); }}
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

const AdminTodoRow = ({ t, onToggle, onDelete, muted }: { t: Todo; onToggle: () => void; onDelete: () => void; muted?: boolean }) => (
  <div className={`rounded-lg p-2.5 flex items-start gap-2 ${t.byAdmin ? "border border-[hsl(var(--os-gold))] bg-os-gold/10" : "os-card-2"} ${muted ? "opacity-60" : ""}`}>
    <button onClick={onToggle} className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 ${t.done ? "bg-os-gold border-transparent" : "border-os"}`}>
      {t.done && <Check size={10} className="text-[hsl(var(--os-navy-deep))]" />}
    </button>
    <div className="flex-1 min-w-0">
      <div className={`text-sm font-semibold ${t.byAdmin ? "text-os-gold" : "text-white"} ${t.done ? "line-through" : ""}`}>{t.title}</div>
      <div className="flex flex-wrap gap-1.5 items-center mt-0.5">
        <span className="text-[10px] text-os-muted">{fmtDue(t.due)}</span>
        <Badge tone={t.priority === "high" ? "red" : t.priority === "medium" ? "gold" : "green"}>{t.priority}</Badge>
        {t.byAdmin && <span className="text-[10px] text-os-gold font-bold uppercase flex items-center gap-1"><Crown size={9} /> Admin</span>}
      </div>
    </div>
    <button onClick={onDelete} className="text-os-muted hover:text-rose-300 p-1"><Trash2 size={13} /></button>
  </div>
);

const AdminGoalRow = ({ g, onToggle, onDelete }: { g: WeeklyGoal; onToggle: () => void; onDelete: () => void }) => (
  <div className={`rounded-lg p-2.5 flex items-start gap-2 ${g.byAdmin ? "border border-[hsl(var(--os-gold))] bg-os-gold/10" : "os-card-2"}`}>
    <button onClick={onToggle} className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 ${g.done ? "bg-os-gold border-transparent" : "border-os"}`}>
      {g.done && <Check size={10} className="text-[hsl(var(--os-navy-deep))]" />}
    </button>
    <div className="flex-1 min-w-0">
      <div className={`text-sm font-semibold ${g.byAdmin ? "text-os-gold" : "text-white"} ${g.done ? "line-through" : ""}`}>{g.title}</div>
      <div className="flex flex-wrap gap-1.5 items-center mt-0.5">
        <span className="text-[10px] text-os-muted">Week of {g.weekStart}</span>
        <Badge tone={g.priority === "high" ? "red" : g.priority === "medium" ? "gold" : "green"}>{g.priority}</Badge>
        {g.byAdmin && <span className="text-[10px] text-os-gold font-bold uppercase flex items-center gap-1"><Crown size={9} /> Admin</span>}
      </div>
    </div>
    <button onClick={onDelete} className="text-os-muted hover:text-rose-300 p-1"><Trash2 size={13} /></button>
  </div>
);

export default Team;
