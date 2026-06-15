import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { NotificationRow } from "@/os/notifications";

const KIND_DOT: Record<string, string> = {
  success: "bg-emerald-400",
  error: "bg-rose-400",
  warning: "bg-amber-400",
  info: "bg-sky-400",
};

const timeAgo = (iso: string) => {
  const d = new Date(iso).getTime();
  const s = Math.max(1, Math.floor((Date.now() - d) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

const NotificationsBell = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationRow[]>([]);
  const unread = items.filter((n) => !n.read).length;
  const wrapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("os_notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(15);
    setItems((data || []) as any);
  };

  useEffect(() => {
    if (!user) return;
    load();
    const iv = window.setInterval(load, 20000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => { window.clearInterval(iv); window.removeEventListener("focus", onFocus); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const markRead = async (ids: string[]) => {
    if (ids.length === 0) return;
    setItems((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)));
    await supabase.from("os_notifications").update({ read: true }).in("id", ids);
  };

  const markAllRead = () => markRead(items.filter((n) => !n.read).map((n) => n.id));

  const onClickItem = async (n: NotificationRow) => {
    if (!n.read) await markRead([n.id]);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => { setOpen((o) => !o); if (!open) load(); }}
        className="relative h-9 w-9 rounded-lg flex items-center justify-center text-os-muted hover:text-white hover:bg-white/5 transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-os-gold text-[hsl(var(--os-navy-deep))] text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[hsl(var(--os-surface))] border border-os rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-os">
            <div className="text-white font-semibold text-sm">Notifications</div>
            <button
              onClick={markAllRead}
              disabled={unread === 0}
              className="inline-flex items-center gap-1 text-[11px] text-os-muted hover:text-white disabled:opacity-40"
              title="Mark all read"
            >
              <CheckCheck size={12} /> Mark all read
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto divide-y divide-os/50">
            {items.length === 0 && (
              <div className="p-6 text-center text-os-muted text-sm">No notifications yet.</div>
            )}
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => onClickItem(n)}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-colors ${!n.read ? "bg-white/[0.03]" : ""}`}
              >
                <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${KIND_DOT[n.kind] || "bg-white/40"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`text-sm font-semibold truncate ${n.read ? "text-os-muted" : "text-white"}`}>{n.title}</div>
                    <div className="text-[10px] text-os-muted shrink-0">{timeAgo(n.created_at)}</div>
                  </div>
                  {n.message && <div className="text-xs text-os-muted mt-0.5 line-clamp-2">{n.message}</div>}
                </div>
                {!n.read && (
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); markRead([n.id]); }}
                    className="text-os-muted hover:text-white p-1"
                    title="Mark read"
                  >
                    <Check size={12} />
                  </span>
                )}
              </button>
            ))}
          </div>
          <Link
            to="/os/notifications"
            onClick={() => setOpen(false)}
            className="block text-center text-xs text-os-gold font-semibold py-2.5 border-t border-os hover:bg-white/5"
          >
            View all notifications →
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
