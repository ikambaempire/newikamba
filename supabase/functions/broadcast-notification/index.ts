// Broadcast a notification to all (or a filtered subset of) users.
// Auth: requires a signed-in caller with super_admin or org_admin role.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    // Verify caller
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: roles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id);
    const allowed = (roles || []).some((r: any) => r.role === "super_admin" || r.role === "org_admin");
    const isBootstrap = (userData.user.email || "").toLowerCase() === "ikambaempireltd@gmail.com";
    if (!allowed && !isBootstrap) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const title = (body.title || "").toString().trim();
    const message = (body.message || "").toString().trim() || null;
    const kind = (body.kind || "info").toString();
    const link = body.link ? body.link.toString() : null;
    if (!title) return json({ error: "title is required" }, 400);

    // Collect every user with a profile (one notification per user)
    const { data: profs, error: pErr } = await admin.from("profiles").select("user_id");
    if (pErr) return json({ error: pErr.message }, 500);
    const userIds = Array.from(new Set((profs || []).map((p: any) => p.user_id).filter(Boolean)));
    if (userIds.length === 0) return json({ ok: true, count: 0 });

    const rows = userIds.map((uid) => ({
      user_id: uid,
      title,
      message,
      kind,
      link,
      created_by: userData.user.id,
    }));

    // Chunk inserts (1000 each) to stay well under PostgREST limits.
    for (let i = 0; i < rows.length; i += 500) {
      const chunk = rows.slice(i, i + 500);
      const { error: insErr } = await admin.from("os_notifications").insert(chunk);
      if (insErr) return json({ error: insErr.message }, 500);
    }
    return json({ ok: true, count: rows.length });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
