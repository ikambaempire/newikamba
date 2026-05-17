import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOSStore } from "@/os/store";
import { getProfile, hasAdminRole } from "@/os/access";
import { PageHeader, Badge, Field, Input, Modal, OSButton, Select, Textarea } from "@/os/components/ui";
import { ChevronLeft, ChevronRight, Plus, CalendarPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type CalendarEvent = {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  event_type: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  notes: string | null;
  created_by: string | null;
};

const EVENT_TYPES = ["Schedule", "Meeting", "Shoot day", "Editing deadline", "Client review", "Payment follow-up", "Internal review", "Other"];

const Calendar = () => {
  const { schedule, projects } = useOSStore();
  const { user, roles, profile } = useAuth();
  const isAdmin = hasAdminRole(roles);
  const [cursor, setCursor] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const requesterName = useMemo(() => {
    if (!user) return "";
    const p = getProfile(user.id);
    return p?.fullName || profile?.full_name || user.email || "Team member";
  }, [user, profile?.full_name]);

  const reload = async () => {
    const { data, error } = await (supabase as any).from("os_calendar_events").select("*").order("event_date", { ascending: true }).order("event_time", { ascending: true });
    if (error) return toast.error("Could not load calendar", { description: error.message });
    setEvents((data || []) as CalendarEvent[]);
  };

  useEffect(() => { reload(); }, []);

  const allEvents = useMemo(() => {
    const projectEvents = schedule.map((e) => ({ ...e, source: "project" as const, event_date: e.date, event_time: e.time || null, event_type: e.type }));
    const ownEvents = events.map((e) => ({ ...e, source: "calendar" as const, date: e.event_date, time: e.event_time || undefined, type: e.event_type }));
    return [...projectEvents, ...ownEvents];
  }, [schedule, events]);

  const { days, monthLabel } = useMemo(() => {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const startWeekday = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells: { date: string | null; events: any[] }[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ date: null, events: [] });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ date: dateStr, events: allEvents.filter((e) => e.event_date === dateStr) });
    }
    return { days: cells, monthLabel: cursor.toLocaleString("en-US", { month: "long", year: "numeric" }) };
  }, [cursor, allEvents]);

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle="Click any date to schedule meetings, shoot days, reviews, or internal work."
        actions={<OSButton variant="primary" onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}><Plus size={16} /> New Event</OSButton>}
      />
      <div className="os-card rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="text-os-muted hover:text-white p-1"><ChevronLeft /></button>
          <h2 className="text-white font-bold text-lg">{monthLabel}</h2>
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="text-os-muted hover:text-white p-1"><ChevronRight /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-[10px] text-os-muted uppercase tracking-wider mb-1">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d} className="text-center py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((cell, i) => (
            <button key={i} disabled={!cell.date} onClick={() => cell.date && setSelectedDate(cell.date)} className={`min-h-[96px] rounded-lg p-1.5 text-left ${cell.date ? "os-card-2 hover:border-[hsl(var(--os-gold))]/50" : ""}`}>
              {cell.date && <>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-os-muted font-semibold">{Number(cell.date.slice(-2))}</span>
                  <Plus size={11} className="text-os-muted" />
                </div>
                <div className="space-y-1">
                  {cell.events.slice(0, 4).map((e: any) => {
                    const proj = projects.find((p) => p.id === e.project_id);
                    const content = <span>{e.event_type === "Shoot day" ? "🎬" : "📅"} {e.event_time ? `${String(e.event_time).slice(0,5)} · ` : ""}{proj?.name || e.title}</span>;
                    return e.source === "project" ? (
                      <Link onClick={(ev) => ev.stopPropagation()} to={`/os/projects/${e.project_id}`} key={e.id} className="block text-[10px] bg-[hsl(var(--os-gold))]/20 text-[hsl(var(--os-gold))] rounded px-1.5 py-0.5 truncate hover:bg-[hsl(var(--os-gold))]/30">{content}</Link>
                    ) : (
                      <span onClick={(ev) => { ev.stopPropagation(); setSelectedEvent(e); }} key={e.id} className="block text-[10px] bg-sky-500/15 text-sky-300 rounded px-1.5 py-0.5 truncate hover:bg-sky-500/25">{content}</span>
                    );
                  })}
                  {cell.events.length > 4 && <div className="text-[10px] text-os-muted">+{cell.events.length - 4} more</div>}
                </div>
              </>}
            </button>
          ))}
        </div>
      </div>

      {selectedDate && user && <EventModal date={selectedDate} userId={user.id} createdBy={user.id} creatorName={requesterName} isAdmin={isAdmin} onClose={() => setSelectedDate(null)} onSaved={() => { setSelectedDate(null); reload(); }} />}
      {selectedEvent && <ViewEventModal event={selectedEvent} canDelete={isAdmin || selectedEvent.user_id === user?.id || selectedEvent.created_by === user?.id} onClose={() => setSelectedEvent(null)} onDeleted={() => { setSelectedEvent(null); reload(); }} />}
    </div>
  );
};

const EventModal = ({ date, userId, createdBy, creatorName, isAdmin, onClose, onSaved }: { date: string; userId: string; createdBy: string; creatorName: string; isAdmin: boolean; onClose: () => void; onSaved: () => void }) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState(EVENT_TYPES[0]);
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const save = async () => {
    if (!title.trim()) return toast.error("Event title required");
    const { error } = await (supabase as any).from("os_calendar_events").insert({ user_id: userId, created_by: createdBy, title: title.trim(), event_type: type, event_date: date, event_time: time || null, location: location.trim() || null, notes: notes.trim() || null });
    if (error) return toast.error("Could not save event", { description: error.message });
    toast.success("Event scheduled"); onSaved();
  };
  return <Modal open onClose={onClose} title={`Schedule on ${date}`}><div className="space-y-3">
    <Field label="Title" required><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Client review meeting" /></Field>
    <div className="grid grid-cols-2 gap-3"><Field label="Type"><Select value={type} onChange={(e) => setType(e.target.value)}>{EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}</Select></Field><Field label="Time"><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></Field></div>
    <Field label="Location"><Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Optional" /></Field>
    <Field label="Notes"><Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional details" /></Field>
    <div className="flex items-center justify-between gap-2 pt-2"><Badge tone={isAdmin ? "gold" : "blue"}>{isAdmin ? "Admin schedule" : creatorName}</Badge><div className="flex gap-2"><OSButton variant="outline" onClick={onClose}>Cancel</OSButton><OSButton variant="primary" onClick={save}><CalendarPlus size={14} /> Save event</OSButton></div></div>
  </div></Modal>;
};

const ViewEventModal = ({ event, canDelete, onClose, onDeleted }: { event: CalendarEvent; canDelete: boolean; onClose: () => void; onDeleted: () => void }) => {
  const remove = async () => {
    if (!confirm("Delete this calendar event?")) return;
    const { error } = await (supabase as any).from("os_calendar_events").delete().eq("id", event.id);
    if (error) return toast.error("Could not delete event", { description: error.message });
    toast.success("Event deleted"); onDeleted();
  };
  return <Modal open onClose={onClose} title={event.title}><div className="space-y-3 text-sm">
    <Row k="Type" v={event.event_type} /><Row k="Date" v={`${event.event_date}${event.event_time ? ` · ${String(event.event_time).slice(0,5)}` : ""}`} /><Row k="Location" v={event.location || "—"} />
    <div><div className="text-os-muted text-xs uppercase tracking-wider mb-1">Notes</div><div className="text-white bg-white/5 rounded-lg p-3 whitespace-pre-wrap">{event.notes || "—"}</div></div>
    <div className="flex justify-end gap-2 pt-2 border-t border-os">{canDelete && <OSButton variant="ghost" onClick={remove} className="text-rose-300 hover:text-rose-200"><Trash2 size={14} /> Delete</OSButton>}<OSButton variant="outline" onClick={onClose}>Close</OSButton></div>
  </div></Modal>;
};

const Row = ({ k, v }: { k: string; v: React.ReactNode }) => <div className="flex justify-between gap-3"><span className="text-os-muted">{k}</span><span className="text-white text-right">{v}</span></div>;

export default Calendar;