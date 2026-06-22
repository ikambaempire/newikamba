// Per-device notification preferences. Stored in localStorage so each user
// controls how the platform alerts them on the browser/device they're on.
// The NotificationsListener consults these before showing toasts, playing the
// chime, or raising browser system notifications.

export type NotificationKind = "info" | "success" | "warning" | "error";
export type NotificationCategory =
  | "task"        // assigned to a task, task updates
  | "approval"    // approvals, expense decisions
  | "status"      // project status / stage changes
  | "broadcast"   // platform-wide announcements
  | "comment"     // mentions, comments, replies
  | "other";      // anything else

export type NotificationPrefs = {
  showPopup: boolean;       // sonner toast pop-up
  playSound: boolean;       // audio chime
  browserNotif: boolean;    // OS-level Notification API
  kinds: Record<NotificationKind, boolean>;
  categories: Record<NotificationCategory, boolean>;
};

export const DEFAULT_PREFS: NotificationPrefs = {
  showPopup: true,
  playSound: true,
  browserNotif: true,
  kinds: { info: true, success: true, warning: true, error: true },
  categories: { task: true, approval: true, status: true, broadcast: true, comment: true, other: true },
};

const keyFor = (userId: string) => `ikamba.os.notif_prefs.${userId}`;

export const loadPrefs = (userId: string): NotificationPrefs => {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PREFS,
      ...parsed,
      kinds: { ...DEFAULT_PREFS.kinds, ...(parsed.kinds || {}) },
      categories: { ...DEFAULT_PREFS.categories, ...(parsed.categories || {}) },
    };
  } catch {
    return DEFAULT_PREFS;
  }
};

export const savePrefs = (userId: string, prefs: NotificationPrefs) => {
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(prefs));
    window.dispatchEvent(new CustomEvent("ikamba:notif-prefs-changed", { detail: { userId } }));
  } catch {}
};

// Lightweight categorization: looks at the title/message for keywords.
// Keeps the schema unchanged while letting users filter what pops up.
export const categorize = (n: { title?: string | null; message?: string | null; link?: string | null }): NotificationCategory => {
  const text = `${n.title || ""} ${n.message || ""} ${n.link || ""}`.toLowerCase();
  if (/(announc|broadcast|platform|update|release|new feature)/.test(text)) return "broadcast";
  if (/(assign|task|to-?do|todo)/.test(text)) return "task";
  if (/(approv|reject|decision|expense|request)/.test(text)) return "approval";
  if (/(status|stage|moved|progress|complete|deliver)/.test(text)) return "status";
  if (/(comment|reply|mention|@)/.test(text)) return "comment";
  return "other";
};
