import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { loadPrefs, categorize, DEFAULT_PREFS, type NotificationPrefs } from "@/os/notificationPrefs";

// Listens to os_notifications for the current user via Postgres realtime,
// and also polls as a safety net. New notifications trigger:
//  - sonner toast popup
//  - browser system notification (if user granted permission)
//  - a short notification sound
// Seen IDs are tracked per-device in localStorage so we never toast the same
// item twice, while still leaving them unread until the bell/page marks read.
const NotificationsListener = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const seenKey = `os_seen_toast_${user.id}`;
    let seen: Set<string>;
    try { seen = new Set<string>(JSON.parse(localStorage.getItem(seenKey) || "[]")); }
    catch { seen = new Set<string>(); }

    let firstLoad = true;
    let cancelled = false;
    let prefs: NotificationPrefs = loadPrefs(user.id);
    const onPrefsChanged = (e: any) => {
      if (!e?.detail || e.detail.userId === user.id) prefs = loadPrefs(user.id);
    };
    window.addEventListener("ikamba:notif-prefs-changed", onPrefsChanged as any);

    // Ask once for browser notification permission (no-op if already decided).
    if (prefs.browserNotif && typeof Notification !== "undefined" && Notification.permission === "default") {
      try { Notification.requestPermission().catch(() => {}); } catch {}
    }

    const playSound = () => {
      try {
        const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!AC) return;
        const ctx = new AC();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "sine";
        o.frequency.setValueAtTime(880, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
        g.gain.setValueAtTime(0.0001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
        o.start();
        o.stop(ctx.currentTime + 0.36);
        setTimeout(() => { try { ctx.close(); } catch {} }, 600);
      } catch {}
    };

    const popup = (n: any) => {
      if (seen.has(n.id)) return;
      seen.add(n.id);

      // Honor per-device preferences (kind + category filters).
      const kindOK = prefs.kinds[(n.kind as keyof typeof prefs.kinds)] ?? true;
      const cat = categorize(n);
      const catOK = prefs.categories[cat] ?? true;
      const allowed = kindOK && catOK;

      if (allowed && prefs.showPopup) {
        const opts: any = { description: n.message || undefined, duration: 8000 };
        const fn =
          n.kind === "success" ? toast.success
          : n.kind === "error" ? toast.error
          : n.kind === "warning" ? toast.warning
          : toast.info;
        try { fn(n.title, opts); } catch { toast(n.title, opts); }
      }

      // Browser system notification (shows even if tab is in background).
      if (
        allowed && prefs.browserNotif &&
        typeof Notification !== "undefined" &&
        Notification.permission === "granted" &&
        document.visibilityState !== "visible"
      ) {
        try {
          const bn = new Notification(n.title, {
            body: n.message || "",
            tag: n.id,
            icon: "/favicon.ico",
          });
          bn.onclick = () => { window.focus(); if (n.link) window.location.href = n.link; bn.close(); };
        } catch {}
      }
      if (allowed && prefs.playSound) playSound();
    };

    const trim = () => {
      const arr = Array.from(seen);
      const trimmed = arr.slice(Math.max(0, arr.length - 500));
      seen = new Set(trimmed);
      try { localStorage.setItem(seenKey, JSON.stringify(trimmed)); } catch {}
    };

    const check = async () => {
      const { data, error } = await supabase
        .from("os_notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("read", false)
        .order("created_at", { ascending: true })
        .limit(20);
      if (error || cancelled || !data || data.length === 0) return;
      // On the very first load, treat existing unread items as already seen so
      // we don't flood the user with toasts on page refresh.
      if (firstLoad) {
        firstLoad = false;
        for (const n of data as any[]) seen.add(n.id);
        trim();
        return;
      }
      for (const n of data as any[]) popup(n);
      trim();
    };

    // Realtime channel — instant popups.
    const channel = supabase
      .channel(`notif-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "os_notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          firstLoad = false;
          popup(payload.new);
          trim();
        }
      )
      .subscribe();

    const t0 = window.setTimeout(check, 800);
    const iv = window.setInterval(check, 20000);
    const onFocus = () => check();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.clearTimeout(t0);
      window.clearInterval(iv);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("ikamba:notif-prefs-changed", onPrefsChanged as any);
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [user]);

  return null;
};

export default NotificationsListener;
export { Bell };
