import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader, OSButton, Field, Input, Select, Textarea, Badge } from "@/os/components/ui";
import { Plus, Trash2, Check, Bell, BellOff, Clock, Target, ArrowDown } from "lucide-react";

type Priority = "low" | "medium" | "high";
type Todo = {
  id: string;
  title: string;
  notes?: string;
  due: string;
  priority: Priority;
  done: boolean;
  remindersFired: number[];
  createdAt: string;
};
type WeeklyGoal = {
  id: string;
  title: string;
  notes?: string;
  weekStart: string; // YYYY-MM-DD (Monday)
  priority: Priority;
  done: boolean;
  createdAt: string;
};

const STORAGE_PREFIX = "ikamba.todos.v1.";
const GOALS_PREFIX = "ikamba.weeklygoals.v1.";
const REMINDER_OFFSETS = [60, 15, 0];
const uid = () => Math.random().toString(36).slice(2, 10);

const mondayOf = (d: Date) => {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // 0=Mon
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
};
const ymd = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

const loadJSON = <T,>(key: string, fallback: T): T => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; }
};
const fmtDue = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};
const minutesUntil = (iso: string) => Math.round((new Date(iso).getTime() - Date.now()) / 60000);

const Todos = () => {
  const { user } = useAuth();
  const todoKey = useMemo(() => STORAGE_PREFIX + (user?.id || "guest"), [user?.id]);
  const goalKey = useMemo(() => GOALS_PREFIX + (user?.id || "guest"), [user?.id]);

  const [todos, setTodos] = useState<Todo[]>([]);
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default",
  );
  const [weekStart, setWeekStart] = useState<string>(ymd(mondayOf(new Date())));

  // todo form
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  // goal form
  const [goalTitle, setGoalTitle] = useState("");
  const [goalNotes, setGoalNotes] = useState("");
  const [goalPriority, setGoalPriority] = useState<Priority>("medium");

  useEffect(() => { setTodos(loadJSON<Todo[]>(todoKey, [])); }, [todoKey]);
  useEffect(() => { localStorage.setItem(todoKey, JSON.stringify(todos)); }, [todoKey, todos]);
  useEffect(() => { setGoals(loadJSON<WeeklyGoal[]>(goalKey, [])); }, [goalKey]);
  useEffect(() => { localStorage.setItem(goalKey, JSON.stringify(goals)); }, [goalKey, goals]);

  useEffect(() => {
    const check = () => {
      setTodos((prev) => {
        let changed = false;
        const next = prev.map((t) => {
          if (t.done || !t.due) return t;
          const mins = minutesUntil(t.due);
          const fired = new Set(t.remindersFired);
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
          if (mins < 0) {
            const overdueKey = -Math.floor(Math.abs(mins) / 60) - 1;
            if (!fired.has(overdueKey)) {
              fired.add(overdueKey); changed = true;
              try {
                if (typeof Notification !== "undefined" && Notification.permission === "granted") {
                  new Notification(`Overdue: ${t.title}`, { body: `Was due ${fmtDue(t.due)} — please complete or reschedule.`, tag: t.id + ":overdue:" + overdueKey });
                }
              } catch {}
            }
          }
          return changed ? { ...t, remindersFired: Array.from(fired) } : t;
        });
        return changed ? next : prev;
      });
    };
    check();
    const iv = window.setInterval(check, 30000);
    return () => window.clearInterval(iv);
  }, []);

  const requestPermission = async () => {
    if (typeof Notification === "undefined") return;
    const p = await Notification.requestPermission();
    setPermission(p);
    if (p === "granted") new Notification("Reminders enabled", { body: "iKAMBA Media OS will remind you when tasks are due." });
  };

  const addTodo = () => {
    if (!title.trim() || !due) return;
    setTodos((p) => [{ id: uid(), title: title.trim(), notes: notes.trim() || undefined, due, priority, done: false, remindersFired: [], createdAt: new Date().toISOString() }, ...p]);
    setTitle(""); setNotes(""); setDue(""); setPriority("medium");
    if (typeof Notification !== "undefined" && Notification.permission === "default") requestPermission();
  };
  const toggleDone = (id: string) => setTodos((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const removeTodo = (id: string) => setTodos((p) => p.filter((t) => t.id !== id));

  const addGoal = () => {
    if (!goalTitle.trim()) return;
    setGoals((p) => [{ id: uid(), title: goalTitle.trim(), notes: goalNotes.trim() || undefined, weekStart, priority: goalPriority, done: false, createdAt: new Date().toISOString() }, ...p]);
    setGoalTitle(""); setGoalNotes(""); setGoalPriority("medium");
  };
  const toggleGoal = (id: string) => setGoals((p) => p.map((g) => (g.id === id ? { ...g, done: !g.done } : g)));
  const removeGoal = (id: string) => setGoals((p) => p.filter((g) => g.id !== id));

  // Pull a weekly goal into today's todos
  const pullToToday = (g: WeeklyGoal) => {
    const today = new Date(); today.setHours(17, 0, 0, 0);
    const iso = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setTodos((p) => [{
      id: uid(),
      title: g.title,
      notes: g.notes ? `From weekly goal: ${g.notes}` : "From weekly goal",
      due: iso,
      priority: g.priority,
      done: false,
      remindersFired: [],
      createdAt: new Date().toISOString(),
    }, ...p]);
  };

  const open = todos.filter((t) => !t.done).sort((a, b) => (a.due || "").localeCompare(b.due || ""));
  const done = todos.filter((t) => t.done);
  const overdue = open.filter((t) => t.due && new Date(t.due) < new Date());

  // Week navigation
  const weekDate = new Date(weekStart);
  const weekEnd = addDays(weekDate, 6);
  const weeklyForThis = goals.filter((g) => g.weekStart === weekStart);
  const pastGoals = goals.filter((g) => g.weekStart < weekStart && !g.done);
  const fmtWeekLabel = `${weekDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  const shiftWeek = (delta: number) => setWeekStart(ymd(addDays(weekDate, delta * 7)));

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
            {weeklyForThis.length === 0 ? (
              <p className="text-os-muted text-sm">No goals for this week yet. Set 3-5 outcomes you want to achieve.</p>
            ) : weeklyForThis.map((g) => (
              <GoalItem key={g.id} g={g} onToggle={toggleGoal} onRemove={removeGoal} onPull={pullToToday} />
            ))}
          </div>
        </div>

        {pastGoals.length > 0 && (
          <div className="mt-5 pt-5 border-t border-os">
            <h3 className="text-os-muted text-xs uppercase tracking-wider font-semibold mb-2">Unfinished from previous weeks ({pastGoals.length})</h3>
            <div className="space-y-2">
              {pastGoals.slice(0, 6).map((g) => (
                <GoalItem key={g.id} g={g} onToggle={toggleGoal} onRemove={removeGoal} onPull={pullToToday} showWeek />
              ))}
            </div>
          </div>
        )}
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
              <h3 className="text-white font-bold mb-3">Completed ({done.length})</h3>
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
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onPull: (g: WeeklyGoal) => void;
  showWeek?: boolean;
}) => {
  const tone: "gold" | "green" | "red" = g.priority === "high" ? "red" : g.priority === "medium" ? "gold" : "green";
  return (
    <div className={`os-card-2 rounded-lg p-3 flex items-start gap-3 ${g.done ? "opacity-60" : ""}`}>
      <button
        onClick={() => onToggle(g.id)}
        className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center shrink-0 ${g.done ? "bg-os-gold border-transparent" : "border-os hover:border-[hsl(var(--os-gold))]"}`}
        aria-label="Toggle goal"
      >
        {g.done && <Check size={12} className="text-[hsl(var(--os-navy-deep))]" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold text-white ${g.done ? "line-through" : ""}`}>{g.title}</div>
        {g.notes && <div className="text-xs text-os-muted mt-0.5">{g.notes}</div>}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <Badge tone={tone}>{g.priority}</Badge>
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
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  accent?: "red";
  muted?: boolean;
}) => (
  <ul className="space-y-2">
    {items.map((t) => {
      const mins = t.due ? minutesUntil(t.due) : null;
      const tone: "gold" | "green" | "red" = t.priority === "high" ? "red" : t.priority === "medium" ? "gold" : "green";
      return (
        <li key={t.id} className={`os-card-2 rounded-lg p-3 flex items-start gap-3 ${accent === "red" ? "border-rose-500/30" : ""} ${muted ? "opacity-60" : ""}`}>
          <button
            onClick={() => onToggle(t.id)}
            className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-colors ${t.done ? "bg-os-gold border-transparent" : "border-os hover:border-[hsl(var(--os-gold))]"}`}
            aria-label={t.done ? "Mark incomplete" : "Mark complete"}
          >
            {t.done && <Check size={12} className="text-[hsl(var(--os-navy-deep))]" />}
          </button>
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-semibold text-white ${t.done ? "line-through" : ""}`}>{t.title}</div>
            {t.notes && <div className="text-xs text-os-muted mt-0.5">{t.notes}</div>}
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <Badge tone={tone}>{t.priority}</Badge>
              <span className={`text-[11px] font-medium ${mins !== null && mins < 0 && !t.done ? "text-rose-300" : "text-os-gold"}`}>
                {fmtDue(t.due)}
                {mins !== null && !t.done && (<> · {mins < 0 ? `${Math.abs(mins)} min overdue` : mins < 60 ? `in ${mins} min` : `in ${Math.round(mins / 60)} h`}</>)}
              </span>
            </div>
          </div>
          <button onClick={() => onRemove(t.id)} className="text-os-muted hover:text-rose-300 p-1" aria-label="Delete"><Trash2 size={14} /></button>
        </li>
      );
    })}
  </ul>
);

export default Todos;
