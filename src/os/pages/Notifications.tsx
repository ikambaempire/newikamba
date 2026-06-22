import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader, OSButton, Select, Input, Badge } from "@/os/components/ui";
import type { NotificationRow } from "@/os/notifications";
import { CheckCheck, Trash2, Search, RefreshCw, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";

const KIND_TONE: Record<string, "default" | "gold" | "green" | "red" | "amber" | "blue"> = {
  info: "blue",
  success: "green",
  warning: "amber",
  error: "red",
};

const Notifications = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterKind, setFilterKind] = useState<string>("All");
  const [filterRead, setFilterRead] = useState<"all" | "unread" | "read">("all");
  const [q, setQ] = useState("");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("os_notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) toast.error("Could not load notifications");
    setItems((data || []) as any);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((n) => {
      if (filterKind !== "All" && n.kind !== filterKind) return false;
      if (filterRead === "unread" && n.read) return false;
      if (filterRead === "read" && !n.read) return false;
      if (s && !`${n.title} ${n.message || ""}`.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [items, q, filterKind, filterRead]);

  const unread = items.filter((n) => !n.read).length;

  const groupedByDay = useMemo(() => {
    const m = new Map<string, NotificationRow[]>();
    for (const n of filtered) {
      const k = new Date(n.created_at).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(n);
    }
    return Array.from(m.entries());
  }, [filtered]);

  const markRead = async (ids: string[]) => {
    if (!ids.length) return;
    setItems((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)));
    await supabase.from("os_notifications").update({ read: true }).in("id", ids);
  };
  const markAllRead = () => markRead(items.filter((n) => !n.read).map((n) => n.id));

  const remove = async (id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    await supabase.from("os_notifications").delete().eq("id", id);
  };

  const clearAllRead = async () => {
    const ids = items.filter((n) => n.read).map((n) => n.id);
    if (!ids.length) return;
    setItems((prev) => prev.filter((n) => !n.read));
    await supabase.from("os_notifications").delete().in("id", ids);
    toast.success(`Cleared ${ids.length} read notifications`);
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${unread} unread · ${items.length} total`}
        actions={
          <>
            <Link to="/os/notifications/preferences">
              <OSButton variant="outline"><SettingsIcon size={14} /> Preferences</OSButton>
            </Link>
            <OSButton variant="outline" onClick={load}><RefreshCw size={14} /> Refresh</OSButton>
            <OSButton variant="outline" onClick={markAllRead} disabled={unread === 0}><CheckCheck size={14} /> Mark all read</OSButton>
            <OSButton variant="ghost" onClick={clearAllRead}><Trash2 size={14} /> Clear read</OSButton>
          </>
        }
      />

      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-os-muted" />
          <Input className="pl-9" placeholder="Search notifications…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="sm:w-40">
          <Select value={filterKind} onChange={(e) => setFilterKind(e.target.value)}>
            <option value="All">All types</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </Select>
        </div>
        <div className="sm:w-40">
          <Select value={filterRead} onChange={(e) => setFilterRead(e.target.value as any)}>
            <option value="all">All</option>
            <option value="unread">Unread only</option>
            <option value="read">Read only</option>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-os-muted text-sm">Loading…</div>
      ) : groupedByDay.length === 0 ? (
        <div className="os-card rounded-xl p-12 text-center text-os-muted">
          No notifications match your filters.
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByDay.map(([day, group]) => (
            <div key={day}>
              <div className="text-[11px] uppercase tracking-widest text-os-muted font-semibold mb-2">{day}</div>
              <div className="os-card rounded-xl divide-y divide-os/50 overflow-hidden">
                {group.map((n) => (
                  <div key={n.id} className={`p-4 flex items-start gap-3 hover:bg-white/[0.02] ${!n.read ? "bg-white/[0.03]" : ""}`}>
                    <div className="pt-1"><Badge tone={KIND_TONE[n.kind] || "default"}>{n.kind}</Badge></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className={`font-semibold text-sm ${n.read ? "text-os-muted" : "text-white"}`}>{n.title}</div>
                        <div className="text-[11px] text-os-muted shrink-0">
                          {new Date(n.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      {n.message && <div className="text-xs text-os-muted mt-1 whitespace-pre-wrap">{n.message}</div>}
                      {n.link && (
                        <Link to={n.link} className="text-xs text-os-gold font-semibold mt-1 inline-block hover:underline">
                          Open →
                        </Link>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!n.read && (
                        <button onClick={() => markRead([n.id])} className="p-1.5 rounded hover:bg-white/10 text-os-muted hover:text-white" title="Mark read">
                          <CheckCheck size={13} />
                        </button>
                      )}
                      <button onClick={() => remove(n.id)} className="p-1.5 rounded hover:bg-rose-500/15 text-os-muted hover:text-rose-300" title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
