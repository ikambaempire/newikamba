import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

const BOOTSTRAP_EMAIL = "ikambaempireltd@gmail.com";
const BOOTSTRAP_PASSWORD = "EMPIRE@IKAMBA2025";

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

async function ensureBootstrap() {
  // The Ikamba Empire email must always be the permanent super admin.
  const { data: list } = await admin.auth.admin.listUsers();
  let user = list?.users.find((u) => u.email?.toLowerCase() === BOOTSTRAP_EMAIL);
  if (!user) {
    const { data: created, error } = await admin.auth.admin.createUser({
      email: BOOTSTRAP_EMAIL,
      password: BOOTSTRAP_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "iKAMBA Empire" },
    });
    if (error) throw error;
    user = created.user!;
  }

  await admin.from("profiles").upsert({ user_id: user.id, full_name: "iKAMBA Empire" }, { onConflict: "user_id" });
  await admin.from("user_roles").upsert({ user_id: user.id, role: "super_admin" }, { onConflict: "user_id,role" });
  return { ensured: true, user_id: user.id };
}

async function getCallerRoles(authHeader: string | null) {
  if (!authHeader) return { user: null, roles: [] as string[] };
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return { user: null, roles: [] };
  const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", user.id);
  return { user, roles: (roles ?? []).map((r) => r.role) };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    // Public bootstrap — only works if no super_admin exists
    if (action === "bootstrap") {
      const result = await ensureBootstrap();
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auto-bootstrap on first call too
    await ensureBootstrap();

    const { user, roles } = await getCallerRoles(req.headers.get("Authorization"));
    if (!user) return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!roles.includes("super_admin")) {
      return new Response(JSON.stringify({ error: "Forbidden — super_admin required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "list") {
      const { data: list } = await admin.auth.admin.listUsers();
      const users = list?.users ?? [];
      const { data: allRoles } = await admin.from("user_roles").select("user_id, role");
      const { data: profiles } = await admin.from("profiles").select("user_id, full_name");
      const enriched = users.map((u) => ({
        id: u.id,
        email: u.email ?? "",
        full_name: profiles?.find((p) => p.user_id === u.id)?.full_name ?? "",
        roles: (allRoles ?? []).filter((r) => r.user_id === u.id).map((r) => r.role),
        created_at: u.created_at,
      }));
      return new Response(JSON.stringify({ users: enriched }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "add_admin") {
      const { email, password, full_name, role } = body;
      if (!email) throw new Error("email required");
      const { data: list } = await admin.auth.admin.listUsers();
      let target = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (!target) {
        const { data: created, error } = await admin.auth.admin.createUser({
          email,
          password: password || crypto.randomUUID(),
          email_confirm: true,
          user_metadata: { full_name },
        });
        if (error) throw error;
        target = created.user!;
      } else if (password) {
        await admin.auth.admin.updateUserById(target.id, { password });
      }
      await admin.from("profiles").upsert({ user_id: target.id, full_name }, { onConflict: "user_id" });
      await admin.from("user_roles").upsert({ user_id: target.id, role: role || "org_admin" }, { onConflict: "user_id,role" });
      return new Response(JSON.stringify({ ok: true, user_id: target.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "update_role") {
      const { user_id, new_role } = body;
      const { data: targetUser } = await admin.auth.admin.getUserById(user_id);
      if (targetUser.user?.email?.toLowerCase() === BOOTSTRAP_EMAIL && new_role !== "super_admin") {
        return new Response(JSON.stringify({ error: "The Ikamba Empire account must stay super admin" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      // remove non-super_admin roles, add new
      await admin.from("user_roles").delete().eq("user_id", user_id).neq("role", "super_admin");
      await admin.from("user_roles").upsert({ user_id, role: new_role }, { onConflict: "user_id,role" });
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "remove_role") {
      const { user_id, role } = body;
      const { data: targetUser } = await admin.auth.admin.getUserById(user_id);
      if (targetUser.user?.email?.toLowerCase() === BOOTSTRAP_EMAIL && role === "super_admin") {
        return new Response(JSON.stringify({ error: "The Ikamba Empire account must stay super admin" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      await admin.from("user_roles").delete().eq("user_id", user_id).eq("role", role);
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message ?? String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
