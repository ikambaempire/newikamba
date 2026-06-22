import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader, OSButton } from "@/os/components/ui";
import {
  DEFAULT_PREFS,
  loadPrefs,
  savePrefs,
  type NotificationPrefs,
  type NotificationKind,
  type NotificationCategory,
} from "@/os/notificationPrefs";
import { Bell, Volume2, MonitorSmartphone, MessageSquare, ArrowLeft, RotateCcw, BellRing } from "lucide-react";
import { toast } from "sonner";

const KIND_LABELS: Record<NotificationKind, { label: string; desc: string }> = {
  info: { label: "Info", desc: "General updates and confirmations." },
  success: { label: "Success", desc: "Wins — approvals granted, things completed." },
  warning: { label: "Warning", desc: "Heads-up items that need attention soon." },
  error: { label: "Important", desc: "Critical issues, rejections, urgent fixes." },
};

const CATEGORY_LABELS: Record<NotificationCategory, { label: string; desc: string }> = {
  task: { label: "Tasks & assignments", desc: "When a task or to-do is assigned to you or changes." },
  approval: { label: "Approvals & requests", desc: "Expense decisions, approval workflows." },
  status: { label: "Project status", desc: "Pipeline stage changes and project progress." },
  broadcast: { label: "Platform announcements", desc: "New features, updates, and admin announcements." },
  comment: { label: "Comments & mentions", desc: "Replies and @mentions from teammates." },
  other: { label: "Everything else", desc: "Notifications that don't fit the categories above." },
};

const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    aria-pressed={checked}
    aria-label={label}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
      checked ? "bg-os-gold" : "bg-white/15"
    }`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
        checked ? "translate-x-5" : "translate-x-0.5"
      }`}
    />
  </button>
);

const Row = ({
  icon, title, desc, checked, onChange,
}: { icon: React.ReactNode; title: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-start justify-between gap-4 py-3">
    <div className="flex items-start gap-3 min-w-0">
      <div className="mt-0.5 text-os-gold shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="text-xs text-os-muted mt-0.5">{desc}</div>
      </div>
    </div>
    <Toggle checked={checked} onChange={onChange} label={title} />
  </div>
);

const NotificationPreferences = () => {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    if (!user) return;
    setPrefs(loadPrefs(user.id));
  }, [user]);

  if (!user) return <div className="text-os-muted">Loading…</div>;

  const update = (next: NotificationPrefs) => {
    setPrefs(next);
    savePrefs(user.id, next);
  };
  const setChannel = (k: "showPopup" | "playSound" | "browserNotif") => (v: boolean) => update({ ...prefs, [k]: v });
  const setKind = (k: NotificationKind) => (v: boolean) => update({ ...prefs, kinds: { ...prefs.kinds, [k]: v } });
  const setCategory = (c: NotificationCategory) => (v: boolean) => update({ ...prefs, categories: { ...prefs.categories, [c]: v } });

  const reset = () => {
    update(DEFAULT_PREFS);
    toast.success("Notification preferences reset");
  };

  const testBrowserNotif = async () => {
    if (typeof Notification === "undefined") {
      toast.error("Browser notifications aren't supported on this device");
      return;
    }
    if (Notification.permission === "denied") {
      toast.error("Browser notifications are blocked. Enable them in your browser settings.");
      return;
    }
    if (Notification.permission === "default") {
      const res = await Notification.requestPermission();
      if (res !== "granted") return;
    }
    try {
      new Notification("iKAMBA Media OS", { body: "Test notification — you're all set!", icon: "/favicon.ico" });
      toast.success("Test notification sent");
    } catch {
      toast.error("Could not show test notification");
    }
  };

  return (
    <div>
      <PageHeader
        title="Notification Preferences"
        subtitle="Control how iKAMBA Media OS alerts you on this device."
        actions={
          <>
            <Link to="/os/notifications">
              <OSButton variant="outline"><ArrowLeft size={14} /> Back to Notifications</OSButton>
            </Link>
            <OSButton variant="ghost" onClick={reset}><RotateCcw size={14} /> Reset</OSButton>
          </>
        }
      />

      <div className="grid lg:grid-cols-2 gap-4">
        <section className="os-card rounded-xl p-5">
          <h3 className="text-white font-bold mb-1">How alerts reach you</h3>
          <p className="text-xs text-os-muted mb-2">These preferences are saved on this device.</p>
          <div className="divide-y divide-os/50">
            <Row
              icon={<Bell size={18} />}
              title="In-app popup"
              desc="Show a toast at the corner of the screen when something new arrives."
              checked={prefs.showPopup}
              onChange={setChannel("showPopup")}
            />
            <Row
              icon={<MonitorSmartphone size={18} />}
              title="Browser notifications"
              desc="Get system notifications even when this tab is in the background."
              checked={prefs.browserNotif}
              onChange={setChannel("browserNotif")}
            />
            <Row
              icon={<Volume2 size={18} />}
              title="Notification sound"
              desc="Play a short chime when a new notification arrives."
              checked={prefs.playSound}
              onChange={setChannel("playSound")}
            />
          </div>
          <div className="mt-4">
            <OSButton variant="outline" onClick={testBrowserNotif}>
              <BellRing size={14} /> Send a test notification
            </OSButton>
          </div>
        </section>

        <section className="os-card rounded-xl p-5">
          <h3 className="text-white font-bold mb-1">Severity</h3>
          <p className="text-xs text-os-muted mb-2">Choose which severity levels are allowed to pop up.</p>
          <div className="divide-y divide-os/50">
            {(Object.keys(KIND_LABELS) as NotificationKind[]).map((k) => (
              <Row
                key={k}
                icon={<Bell size={18} />}
                title={KIND_LABELS[k].label}
                desc={KIND_LABELS[k].desc}
                checked={prefs.kinds[k]}
                onChange={setKind(k)}
              />
            ))}
          </div>
        </section>

        <section className="os-card rounded-xl p-5 lg:col-span-2">
          <h3 className="text-white font-bold mb-1">Event types</h3>
          <p className="text-xs text-os-muted mb-2">Pick which kinds of events trigger a notification for you. Items you turn off still appear on the Notifications page — they just don't pop up.</p>
          <div className="grid sm:grid-cols-2 gap-x-6 divide-y divide-os/50 sm:divide-y-0">
            {(Object.keys(CATEGORY_LABELS) as NotificationCategory[]).map((c) => (
              <Row
                key={c}
                icon={<MessageSquare size={18} />}
                title={CATEGORY_LABELS[c].label}
                desc={CATEGORY_LABELS[c].desc}
                checked={prefs.categories[c]}
                onChange={setCategory(c)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default NotificationPreferences;
