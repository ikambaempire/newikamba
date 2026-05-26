import { supabase } from "@/integrations/supabase/client";

// Auto-add a project's shoot date / deadline to the user's calendar.
// Silently no-ops if user is signed out or dates are missing.
export async function syncProjectDatesToCalendar(opts: {
  userId: string;
  projectId?: string | null;
  projectName: string;
  client?: string;
  shootDate?: string | null;
  deadline?: string | null;
  location?: string | null;
}) {
  const rows: any[] = [];
  if (opts.shootDate) {
    rows.push({
      user_id: opts.userId,
      created_by: opts.userId,
      project_id: null, // OS projects are in-memory; keep null
      title: `🎬 Shoot: ${opts.projectName}`,
      event_type: "Shoot day",
      event_date: opts.shootDate,
      event_time: null,
      location: opts.location || null,
      notes: opts.client ? `Client: ${opts.client}` : null,
    });
  }
  if (opts.deadline && opts.deadline !== opts.shootDate) {
    rows.push({
      user_id: opts.userId,
      created_by: opts.userId,
      project_id: null,
      title: `⏰ Deadline: ${opts.projectName}`,
      event_type: "Editing deadline",
      event_date: opts.deadline,
      event_time: null,
      location: null,
      notes: opts.client ? `Client: ${opts.client}` : null,
    });
  }
  if (!rows.length) return { ok: true, count: 0 };
  const { error } = await (supabase as any).from("os_calendar_events").insert(rows);
  if (error) return { ok: false, error };
  return { ok: true, count: rows.length };
}
