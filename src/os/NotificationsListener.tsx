import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell } from "lucide-react";

// Polls unread notifications and toasts only ones not yet shown on this device.
// Does NOT mark them read — the bell + notifications page handles that, so users
// can review past events.
const NotificationsListener = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const seenKey = `os_seen_toast_${user.id}`;
    let seen: Set<string>;
    try { seen = new Set<string>(JSON.parse(localStorage.getItem(seenKey) || "[]")); }
    catch { seen = new Set<string>(); }

    let cancelled = false;
    const check = async () => {
      const { data, error } = await supabase
        .from("os_notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("read", false)
        .order("created_at", { ascending: true })
        .limit(20);
      if (error || cancelled || !data || data.length === 0) return;
      let added = false;
      for (const n of data as any[]) {
        if (seen.has(n.id)) continue;
        seen.add(n.id);
        added = true;
        const opts: any = { description: n.message || undefined, duration: 7000 };
        const fn =
          n.kind === "success" ? toast.success
          : n.kind === "error" ? toast.error
          : n.kind === "warning" ? toast.warning
          : toast.info;
        try { fn(n.title, opts); } catch { toast(n.title, opts); }
      }
      if (added) {
        // Trim to last 500 to avoid unbounded growth
        const arr = Array.from(seen);
        const trimmed = arr.slice(Math.max(0, arr.length - 500));
        seen = new Set(trimmed);
        try { localStorage.setItem(seenKey, JSON.stringify(trimmed)); } catch {}
      }
    };

    const t0 = window.setTimeout(check, 800);
    const iv = window.setInterval(check, 15000);
    const onFocus = () => check();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.clearTimeout(t0);
      window.clearInterval(iv);
      window.removeEventListener("focus", onFocus);
    };
  }, [user]);

  return null;
};

export default NotificationsListener;
export { Bell };
