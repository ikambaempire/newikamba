import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useOSStore } from "@/os/store";
import { PageHeader, Badge } from "@/os/components/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Calendar = () => {
  const { schedule, projects } = useOSStore();
  const [cursor, setCursor] = useState(new Date());

  const { days, monthLabel } = useMemo(() => {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const firstDay = new Date(y, m, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells: { date: string | null; events: any[] }[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ date: null, events: [] });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ date: dateStr, events: schedule.filter((e) => e.date === dateStr) });
    }
    return { days: cells, monthLabel: cursor.toLocaleString("en-US", { month: "long", year: "numeric" }) };
  }, [cursor, schedule]);

  return (
    <div>
      <PageHeader title="Calendar" subtitle="All shoots, deadlines and reviews — at a glance." />
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
            <div key={i} className={`min-h-[80px] rounded-lg p-1.5 ${cell.date ? "os-card-2" : ""}`}>
              {cell.date && (
                <>
                  <div className="text-[11px] text-os-muted font-semibold mb-1">{Number(cell.date.slice(-2))}</div>
                  <div className="space-y-1">
                    {cell.events.slice(0, 3).map((e) => {
                      const proj = projects.find((p) => p.id === e.project_id);
                      return (
                        <Link to={`/os/projects/${e.project_id}`} key={e.id} className="block text-[10px] bg-[hsl(var(--os-gold))]/20 text-[hsl(var(--os-gold))] rounded px-1.5 py-0.5 truncate hover:bg-[hsl(var(--os-gold))]/30">
                          {e.type === "Shoot day" ? "🎬" : "📅"} {proj?.name || e.title}
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
