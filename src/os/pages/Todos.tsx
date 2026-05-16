import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader, OSButton, Field, Input, Select, Textarea, Badge } from "@/os/components/ui";
import { Plus, Trash2, Check, Bell, BellOff, Clock, Target, ArrowDown, Crown } from "lucide-react";
import {
  type Todo, type WeeklyGoal, type Priority,
  fetchTodos, fetchGoals, addTodoFor, addGoalFor, removeTodoFor, removeGoalFor,
  toggleTodoFor, toggleGoalFor, updateRemindersFired,
  uid, mondayOf, ymd, addDays, fmtDue, minutesUntil, todayDueISO,
} from "@/os/todoStore";

const REMINDER_OFFSETS = [60, 15, 0];

const Todos = () => {
  const { user } = useAuth();
  const userId = user?.id || "";

  const [todos, setTodos] = useState<Todo[]>([]);
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default",
  );
  const [weekStart, setWeekStart] = useState<string>(ymd(mondayOf(new Date())));

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  const [goalTitle, setGoalTitle] = useState("");
  const [goalNotes, setGoalNotes] = useState("");
  const [goalPriority, setGoalPriority] = useState<Priority>("medium");

  const reload = async () => {
    if (!userId) return;
    const [t, g] = await Promise.all([fetchTodos(userId), fetchGoals(userId)]);
    setTodos(t); setGoals(g); setLoading(false);
  };

  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [userId]);
  // Light polling so admin-assigned items show up.
  useEffect(() => {
    if (!userId) return;
    const iv = window.setInterval(reload, 15000);
    return () => window.clearInterval(iv);
    // eslint-disable-next-line
  }, [userId]);

  // Reminders
  useEffect(() => {
    const check = () => {
      todos.forEach((t) => {
        if (t.done || !t.due) return;
        const mins = minutesUntil(t.due);
        const fired = new Set(t.remindersFired);
        let changed = false;
        for (const offset of REMINDER_OFFSETS) {
          if (mins <= offset && !fired.has(offset) && mins >= -1440) {
            fired.add(offset); changed = true;
            const label = offset === 0 ? "is due now" : offset === 15 ? "is due in 15 minutes" : "is due in 1 hour";
            try {
              if (typeof Notification !== "undefined" && Notification.permission === "granted") {
                new Notification(`Task ${label}: ${t.title}`, { body: t.notes || `Due ${fmtDue(t.due)}`, tag: t.id + ":" + offset });
              }
            } catch {}
          }
        }
        if (changed) {
          const arr = Array.from(fired);
          updateRemindersFired(t.id, arr);
          setTodos((prev) => prev.map((x) => (x.id === t.id ? { ...x, remindersFired: arr } : x)));
        }
      });
    };
    check();
    const iv = window.setInterval(check, 30000);
    return () => window.clearInterval(iv);
  }, [todos]);

  const requestPermission = async () => {
    if (typeof Notification === "undefined") return;
    const p = await Notification.requestPermission();
    setPermission(p);
    if (p === "granted") new Notification("Reminders enabled", { body: "iKAMBA Media OS will remind you when tasks are due." });
  };

  const addTodo = async () => {
    if (!title.trim() || !due) return;
    await addTodoFor(userId, { title: title.trim(), notes: notes.trim() || undefined, due, priority });
    setTitle(""); setNotes(""); setDue(""); setPriority("medium");
    reload();
    if (typeof Notification !== "undefined" && Notification.permission === "default") requestPermission();
  };
  const toggleDone = async (id: string, current: boolean) => {
    setTodos((p) => p.map((t) => (t.id === id ? { ...t, done: !current } : t)));
    await toggleTodoFor(userId, id, !current);
  };
  const removeTodo = async (id: string) => {
    setTodos((p) => p.filter((t) => t.id !== id));
    await removeTodoFor(userId, id);
  };

  const addGoal = async () => {
    if (!goalTitle.trim()) return;
    await addGoalFor(userId, { title: goalTitle.trim(), notes: goalNotes.trim() || undefined, weekStart, priority: goalPriority });
    setGoalTitle(""); setGoalNotes(""); setGoalPriority("medium");
    reload();
  };
  const toggleGoal = async (id: string, current: boolean) => {
    setGoals((p) => p.map((g) => (g.id === id ? { ...g, done: !current } : g)));
    await toggleGoalFor(userId, id, !current);
  };
  const removeGoal = async (id: string) => {
    setGoals((p) => p.filter((g) => g.id !== id));
    await removeGoalFor(userId, id);
  };

  const pullToToday = async (g: WeeklyGoal) => {
    await addTodoFor(userId, {
      title: g.title,
      notes: g.notes ? `From weekly goal: ${g.notes}` : "From weekly goal",
      due: todayDueISO(),
      priority: g.priority,
      byAdmin: g.byAdmin,
      assignedByName: g.assignedByName,
    });
    reload();
  };

  const open = todos.filter((t) => !t.done).sort((a, b) => (a.due || "").localeCompare(b.due || ""));
  const done = todos.filter((t) => t.done);
  const overdue = open.filter((t) => t.due && new Date(t.due) < new Date());

  const weekDate = new Date(weekStart);
  const weekEnd = addDays(weekDate, 6);
  const weeklyForThis = goals.filter((g) => g.weekStart === weekStart);
  const pastGoals = goals.filter((g) => g.weekStart < weekStart && !g.done);
  const fmtWeekLabel = `${weekDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  const shiftWeek = (delta: number) => setWeekStart(ymd(addDays(weekDate, delta * 7)));

  // Progress for this week's goals
  const goalsDone = weeklyForThis.filter((g) => g.done).length;
  const goalsTotal = weeklyForThis.length;
  const goalsPct = goalsTotal === 0 ? 0 : Math.round((goalsDone / goalsTotal) * 100);

  return (
    <div>
      <PageHeader
        title="My To-Do List"
        subtitle="Plan your week, pull from goals, and get reminded automatically."
        actions={
          permission === "granted" ? (
            <Badge tone="green"><Bell size={10} className="inline mr-1" /> Reminders on</Badge>
          ) : (
            <OSButton variant="outline" onClick={requestPermission}><BellOff size={14} /> Enable reminders</OSButton>
          )
        }
      />

      {/* Weekly Goals */}
      <section className="os-card rounded-xl p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-os-gold" />
            <h2 className="text-white font-bold">Weekly Goals</h2>
            <Badge tone="gold">{fmtWeekLabel}</Badge>
          </div>
          <div className="flex gap-2">
            <OSButton variant="ghost" onClick={() => shiftWeek(-1)}>← Previous</OSButton>
            <OSButton variant="ghost" onClick={() => setWeekStart(ymd(mondayOf(new Date())))}>This week</OSButton>
            <OSButton variant="ghost" onClick={() => shiftWeek(1)}>Next →</OSButton>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-os-muted font-semibold uppercase tracking-wider">Week progress</span>
            <span className="text-white font-bold">
              {goalsDone}/{goalsTotal} done
              {goalsTotal > 0 && <span className="text-os-muted font-normal"> · {goalsTotal - goalsDone} remaining</span>}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${goalsPct}%`,
                background: goalsPct === 100
                  ? "linear-gradient(90deg, #22c55e, #16a34a)"
                  : "linear-gradient(90deg, hsl(var(--os-gold)), #22c55e)",
              }}
            />
          </div>
          {goalsPct === 100 && goalsTotal > 0 && (
            <div className="text-emerald-400 text-xs font-semibold mt-1.5">🎉 All weekly goals complete!</div>
          )}
        </div>

        {pastGoals.length > 0 && (
          <div className="mb-5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
            <h3 className="text-amber-300 text-xs uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
              <Clock size={12} /> {pastGoals.length} unfinished from previous weeks
            </h3>
            <div className="space-y-2">
              {pastGoals.slice(0, 6).map((g) => (
                <GoalItem key={g.id} g={g} onToggle={toggleGoal} onRemove={removeGoal} onPull={pullToToday} showWeek />
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-5">
          <div className="space-y-3">
            <Field label="New weekly goal" required>
              <Input value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} placeholder="e.g. Lock 3 client briefs" />
            </Field>
            <Field label="Notes"><Input value={goalNotes} onChange={(e) => setGoalNotes(e.target.value)} placeholder="Optional" /></Field>
            <Field label="Priority">
              <Select value={goalPriority} onChange={(e) => setGoalPriority(e.target.value as Priority)}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </Select>
            </Field>
            <OSButton variant="primary" onClick={addGoal} className="w-full justify-center"><Plus size={16} /> Add goal</OSButton>
          </div>

          <div className="space-y-2">
            {loading ? <p className="text-os-muted text-sm">Loading…</p>
              : weeklyForThis.length === 0 ? (
                <p className="text-os-muted text-sm">No goals for this week yet. Set 3-5 outcomes you want to achieve.</p>
              ) : weeklyForThis.map((g) => (
                <GoalItem key={g.id} g={g} onToggle={toggleGoal} onRemove={removeGoal} onPull={pullToToday} />
              ))}
          </div>
        </div>
      </section>

      {/* Daily todos */}
      <div className="grid lg:grid-cols-3 gap-6">
        <section className="os-card rounded-xl p-5 lg:col-span-1 h-fit">
          <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">New Task</h3>
          <div className="space-y-3">
            <Field label="Task" required><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Edit Nyungwe documentary cut" /></Field>
            <Field label="Notes"><Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional details" /></Field>
            <Field label="Deliver by" required><Input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} /></Field>
            <Field label="Priority">
              <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </Select>
            </Field>
            <OSButton variant="primary" onClick={addTodo} className="w-full justify-center"><Plus size={16} /> Add Task</OSButton>
          </div>
        </section>

        <section className="lg:col-span-2 space-y-6">
          {overdue.length > 0 && (
            <div className="os-card rounded-xl p-5 border-rose-500/40">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2"><Clock size={16} className="text-rose-400" /> Overdue ({overdue.length})</h3>
              <TodoList items={overdue} onToggle={toggleDone} onRemove={removeTodo} accent="red" />
            </div>
          )}
          <div className="os-card rounded-xl p-5">
            <h3 className="text-white font-bold mb-3">Upcoming ({open.length - overdue.length})</h3>
            {open.filter((t) => !overdue.includes(t)).length === 0 ? (
              <p className="text-os-muted text-sm">Nothing scheduled. Add your first task or pull one from your weekly goals.</p>
            ) : (
              <TodoList items={open.filter((t) => !overdue.includes(t))} onToggle={toggleDone} onRemove={removeTodo} />
            )}
          </div>
          {done.length > 0 && (
            <div className="os-card rounded-xl p-5">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Check size={16} className="text-emerald-400" /> Completed ({done.length})
              </h3>
              <TodoList items={done} onToggle={toggleDone} onRemove={removeTodo} muted />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const GoalItem = ({
  g, onToggle, onRemove, onPull, showWeek,
}: {
  g: WeeklyGoal;
  onToggle: (id: string, current: boolean) => void;
  onRemove: (id: string) => void;
  onPull: (g: WeeklyGoal) => void;
  showWeek?: boolean;
}) => {
  const tone: "gold" | "green" | "red" = g.priority === "high" ? "red" : g.priority === "medium" ? "gold" : "green";
  const baseCls = g.done
    ? "border border-emerald-500/50 bg-emerald-500/10"
    : g.byAdmin
    ? "border border-[hsl(var(--os-gold))] bg-os-gold/10"
    : "os-card-2";
  return (
    <div className={`rounded-lg p-3 flex items-start gap-3 ${baseCls}`}>
      <button
        onClick={() => onToggle(g.id, g.done)}
        className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center shrink-0 ${g.done ? "bg-emerald-500 border-transparent" : "border-os hover:border-[hsl(var(--os-gold))]"}`}
        aria-label="Toggle goal"
      >
        {g.done && <Check size={12} className="text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold ${g.done ? "text-emerald-300 line-through" : g.byAdmin ? "text-os-gold" : "text-white"}`}>{g.title}</div>
        {g.notes && <div className="text-xs text-os-muted mt-0.5">{g.notes}</div>}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <Badge tone={tone}>{g.priority}</Badge>
          {g.done && <Badge tone="green">Done</Badge>}
          {g.byAdmin && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-os-gold">
              <Crown size={10} /> From admin{g.assignedByName ? ` · ${g.assignedByName}` : ""}
            </span>
          )}
          {showWeek && <span className="text-[11px] text-os-muted">Week of {g.weekStart}</span>}
        </div>
      </div>
      {!g.done && (
        <button
          onClick={() => onPull(g)}
          className="text-os-gold hover:text-white text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded border border-[hsl(var(--os-gold))]/40 hover:bg-os-gold/10"
          title="Add to today's to-do list"
        >
          <ArrowDown size={12} /> Today
        </button>
      )}
      <button onClick={() => onRemove(g.id)} className="text-os-muted hover:text-rose-300 p-1" aria-label="Delete"><Trash2 size={14} /></button>
    </div>
  );
};

const TodoList = ({
  items, onToggle, onRemove, accent, muted,
}: {
  items: Todo[];
  onToggle: (id: string, current: boolean) => void;
  onRemove: (id: string) => void;
  accent?: "red";
  muted?: boolean;
}) => (
  <ul className="space-y-2">
    {items.map((t) => {
      const mins = t.due ? minutesUntil(t.due) : null;
      const tone: "gold" | "green" | "red" = t.priority === "high" ? "red" : t.priority === "medium" ? "gold" : "green";
      const baseCls = t.done
        ? "border border-emerald-500/50 bg-emerald-500/10"
        : t.byAdmin
        ? "border border-[hsl(var(--os-gold))] bg-os-gold/10"
        : "os-card-2";
      return (
        <li key={t.id} className={`rounded-lg p-3 flex items-start gap-3 ${baseCls} ${accent === "red" ? "ring-1 ring-rose-500/30" : ""} ${muted ? "opacity-70" : ""}`}>
          <button
            onClick={() => onToggle(t.id, t.done)}
            className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-colors ${t.done ? "bg-emerald-500 border-transparent" : "border-os hover:border-[hsl(var(--os-gold))]"}`}
            aria-label={t.done ? "Mark incomplete" : "Mark complete"}
          >
            {t.done && <Check size={12} className="text-white" />}
          </button>
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-semibold ${t.done ? "text-emerald-300 line-through" : t.byAdmin ? "text-os-gold" : "text-white"}`}>{t.title}</div>
            {t.notes && <div className="text-xs text-os-muted mt-0.5">{t.notes}</div>}
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <Badge tone={tone}>{t.priority}</Badge>
              {t.done && <Badge tone="green">Done</Badge>}
              {t.byAdmin && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-os-gold">
                  <Crown size={10} /> Assigned by admin{t.assignedByName ? ` · ${t.assignedByName}` : ""}
                </span>
              )}
              {!t.done && (
                <span className={`text-[11px] font-medium ${mins !== null && mins < 0 ? "text-rose-300" : "text-os-gold"}`}>
                  {fmtDue(t.due)}
                  {mins !== null && (<> · {mins < 0 ? `${Math.abs(mins)} min overdue` : mins < 60 ? `in ${mins} min` : `in ${Math.round(mins / 60)} h`}</>)}
                </span>
              )}
            </div>
          </div>
          <button onClick={() => onRemove(t.id)} className="text-os-muted hover:text-rose-300 p-1" aria-label="Delete"><Trash2 size={14} /></button>
        </li>
      );
    })}
  </ul>
);

export default Todos;
