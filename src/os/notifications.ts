import { supabase } from "@/integrations/supabase/client";

export type NotificationRow = {
  id: string;
  user_id: string;
  kind: string;
  title: string;
  message: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
  created_by: string | null;
};

export const notify = async (
  userId: string,
  title: string,
  message?: string,
  kind: string = "info",
  link?: string,
) => {
  try {
    const { data } = await supabase.auth.getUser();
    const me = data.user?.id || null;
    const { error } = await supabase.from("os_notifications").insert({
      user_id: userId,
      title,
      message: message || null,
      kind,
      link: link || null,
      created_by: me,
    });
    if (error) console.error("notify failed", error);
  } catch (e) {
    console.error("notify exception", e);
  }
};
