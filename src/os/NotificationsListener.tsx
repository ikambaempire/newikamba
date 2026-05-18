import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell } from "lucide-react";

// Polls unread notifications for the current user every 15s, surfaces them as toasts,
// then marks them read so they don't repeat.
const NotificationsListener = () => {
  const { user } = useAuth();
  const lastCheckRef = useRef<number>(0);

  useEffect(() => {
    if (!user) return;
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

      const ids: string[] = [];
      for (const n of data as any[]) {
        ids.push(n.id);
        const opts: any = { description: n.message || undefined, duration: 7000 };
        const fn =
          n.kind === "success" ? toast.success
          : n.kind === "error" ? toast.error
          : n.kind === "warning" ? toast.warning
          : toast.info;
        try { fn(n.title, opts); } catch { toast(n.title, opts); }
      }
      await supabase.from("os_notifications").update({ read: true }).in("id", ids);
    };

    // First check after small delay, then poll.
    const t0 = window.setTimeout(check, 800);
    const iv = window.setInterval(check, 15000);
    const onFocus = () => check();
    window.addEventListener("focus", onFocus);
    lastCheckRef.current = Date.now();

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
