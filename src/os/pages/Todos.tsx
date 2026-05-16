import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader, OSButton, Field, Input, Select, Textarea, Badge } from "@/os/components/ui";
import { Plus, Trash2, Check, Bell, BellOff, Clock } from "lucide-react";

type Priority = "low" | "medium" | "high";
type Todo = {
  id: string;
  title: string;
  notes?: string;
  due: string; // ISO datetime-local
  priority: Priority;
  done: boolean;
  remindersFired: number[]; // minutes-before values already notified
  createdAt: string;
};

const STORAGE_PREFIX = "ikamba.todos.v1.";
const REMINDER_OFFSETS = [60, 15, 0]; // minutes before due to remind at
const uid = () => Math.random().toString(36).slice(2, 10);

const loadTodos = (key: string): Todo[] => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
};
const saveTodos = (key: string, todos: Todo[]) => {
  localStorage.setItem(key, JSON.stringify(todos));
};

const fmtDue = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};
const minutesUntil = (iso: string) => Math.round((new Date(iso).getTime() - Date.now()) / 60000);

const Todos = () => {
  const { user } = useAuth();
  const storageKey = useMemo(
    () => STORAGE_PREFIX + (user?.id || "guest"),
    [user?.id],
  );

  const [todos, setTodos] = useState<Todo[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default",
  );

  // form
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  // Load on mount / user change
  useEffect(() => { setTodos(loadTodos(storageKey)); }, [storageKey]);
  // Persist on change
  useEffect(() => { saveTodos(storageKey, todos); }, [storageKey, todos]);

  // Reminder loop — checks every 30s for due/upcoming items
  useEffect(() => {
    const check = () => {
      setTodos((prev) => {
        let changed = false;
        const next = prev.map((t) => {
          if (t.done || !t.due) return t;
          const mins = minutesUntil(t.due);
          const fired = new Set(t.remindersFired);
          for (const offset of REMINDER_OFFSETS) {
            // Fire when we cross the threshold (mins <= offset and not yet fired)
            if (mins <= offset && !fired.has(offset) && mins >= -1440) {
              fired.add(offset);
              changed = true;
              const label =
                offset === 0 ? "is due now" :
                offset === 15 ? "is due in 15 minutes" :
                "is due in 1 hour";
              try {
                if (typeof Notification !== "undefined" && Notification.permission === "granted") {
                  new Notification(`Task ${label}: ${t.title}`, {
                    body: t.notes || `Due ${fmtDue(t.due)}`,
                    tag: t.id + ":" + offset,
                  });
                }
              } catch {}
            }
          }
          // Also keep reminding while overdue — every check, fire a soft toast-less notification once per hour
          if (mins < 0) {
            const overdueKey = -Math.floor(Math.abs(mins) / 60) - 1; // unique per hour overdue
            if (!fired.has(overdueKey)) {
              fired.add(overdueKey);
              changed = true;
              try {
                if (typeof Notification !== "undefined" && Notification.permission === "granted") {
                  new Notification(`Overdue: ${t.title}`, {
                    body: `Was due ${fmtDue(t.due)} — please complete or reschedule.`,
                    tag: t.id + ":overdue:" + overdueKey,
                  });
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
    if (p === "granted") {
      new Notification("Reminders enabled", { body: "iKAMBA Media OS will remind you when tasks are due." });
    }
  };

  const addTodo = () => {
    if (!title.trim() || !due) return;
    setTodos((p) => [
      { id: uid(), title: title.trim(), notes: notes.trim() || undefined, due, priority, done: false, remindersFired: [], createdAt: new Date().toISOString() },
      ...p,
    ]);
    setTitle(""); setNotes(""); setDue(""); setPriority("medium");
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      requestPermission();
    }
  };

  const toggleDone = (id: string) =>
    setTodos((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const removeTodo = (id: string) => setTodos((p) => p.filter((t) => t.id !== id));

  const open = todos.filter((t) => !t.done).sort((a, b) => (a.due || "").localeCompare(b.due || ""));
  const done = todos.filter((t) => t.done);
  const overdue = open.filter((t) => t.due && new Date(t.due) < new Date());

  return (
    <div>
      <PageHeader
        title="My To-Do List"
        subtitle="Plan your day, set deadlines, get reminded — automatically."
        actions={
          permission === "granted" ? (
            <Badge tone="green"><Bell size={10} className="inline mr-1" /> Reminders on</Badge>
          ) : (
            <OSButton variant="outline" onClick={requestPermission}>
              <BellOff size={14} /> Enable reminders
            </OSButton>
          )
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <section className="os-card rounded-xl p-5 lg:col-span-1 h-fit">
          <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">New Task</h3>
          <div className="space-y-3">
            <Field label="Task" required>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Edit Nyungwe documentary cut" />
            </Field>
            <Field label="Notes">
              <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional details" />
            </Field>
            <Field label="Deliver by" required>
              <Input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
            </Field>
            <Field label="Priority">
              <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </Field>
            <OSButton variant="primary" onClick={addTodo} className="w-full justify-center">
              <Plus size={16} /> Add Task
            </OSButton>
            {permission !== "granted" && (
              <p className="text-[11px] text-os-muted">
                Enable browser notifications to get pinged 1 hour before, 15 min before, at deadline, and while overdue.
              </p>
            )}
          </div>
        </section>

        {/* Lists */}
        <section className="lg:col-span-2 space-y-6">
          {overdue.length > 0 && (
            <div className="os-card rounded-xl p-5 border-rose-500/40">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Clock size={16} className="text-rose-400" /> Overdue ({overdue.length})
              </h3>
              <TodoList items={overdue} onToggle={toggleDone} onRemove={removeTodo} accent="red" />
            </div>
          )}

          <div className="os-card rounded-xl p-5">
            <h3 className="text-white font-bold mb-3">Upcoming ({open.length - overdue.length})</h3>
            {open.filter((t) => !overdue.includes(t)).length === 0 ? (
              <p className="text-os-muted text-sm">Nothing scheduled. Add your first task.</p>
            ) : (
              <TodoList
                items={open.filter((t) => !overdue.includes(t))}
                onToggle={toggleDone}
                onRemove={removeTodo}
              />
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
        <li
          key={t.id}
          className={`os-card-2 rounded-lg p-3 flex items-start gap-3 ${accent === "red" ? "border-rose-500/30" : ""} ${muted ? "opacity-60" : ""}`}
        >
          <button
            onClick={() => onToggle(t.id)}
            className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
              t.done ? "bg-os-gold border-transparent" : "border-os hover:border-[hsl(var(--os-gold))]"
            }`}
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
                {mins !== null && !t.done && (
                  <> · {mins < 0 ? `${Math.abs(mins)} min overdue` : mins < 60 ? `in ${mins} min` : `in ${Math.round(mins / 60)} h`}</>
                )}
              </span>
            </div>
          </div>
          <button onClick={() => onRemove(t.id)} className="text-os-muted hover:text-rose-300 p-1" aria-label="Delete">
            <Trash2 size={14} />
          </button>
        </li>
      );
    })}
  </ul>
);

export default Todos;
