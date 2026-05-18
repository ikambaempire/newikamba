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
  const nextRoles = (roles ?? []).map((r) => r.role);
  if (user.email?.toLowerCase() === BOOTSTRAP_EMAIL && !nextRoles.includes("super_admin")) nextRoles.push("super_admin");
  return { user, roles: nextRoles };
}

const isAdminRole = (roles: string[]) => roles.includes("super_admin") || roles.includes("org_admin");

const todoPatch = (patch: Record<string, unknown>) => {
  const next: Record<string, unknown> = {};
  if (typeof patch.title === "string") next.title = patch.title.trim();
  if ("notes" in patch) next.notes = typeof patch.notes === "string" && patch.notes.trim() ? patch.notes.trim() : null;
  if ("due" in patch) next.due = typeof patch.due === "string" && patch.due ? patch.due : null;
  if (["low", "medium", "high"].includes(String(patch.priority))) next.priority = patch.priority;
  if (typeof patch.done === "boolean") next.done = patch.done;
  return next;
};

const goalPatch = (patch: Record<string, unknown>) => {
  const next: Record<string, unknown> = {};
  if (typeof patch.title === "string") next.title = patch.title.trim();
  if ("notes" in patch) next.notes = typeof patch.notes === "string" && patch.notes.trim() ? patch.notes.trim() : null;
  if (typeof patch.week_start === "string" && patch.week_start) next.week_start = patch.week_start;
  if (["low", "medium", "high"].includes(String(patch.priority))) next.priority = patch.priority;
  if (typeof patch.done === "boolean") next.done = patch.done;
  return next;
};

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

    const { user, roles } = await getCallerRoles(req.headers.get("Authorization"));
    if (!user) return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!isAdminRole(roles)) {
      return new Response(JSON.stringify({ error: "Forbidden — admin required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "list") {
      const { data: list } = await admin.auth.admin.listUsers();
      const users = list?.users ?? [];
      const { data: allRoles } = await admin.from("user_roles").select("user_id, role");
      const { data: profiles } = await admin.from("profiles").select("user_id, full_name");
      const { data: toolAccess } = await admin.from("os_tool_access").select("user_id, tool_key");
      const enriched = users.map((u) => ({
        id: u.id,
        email: u.email ?? "",
        full_name: profiles?.find((p) => p.user_id === u.id)?.full_name ?? "",
        roles: Array.from(new Set([
          ...(allRoles ?? []).filter((r) => r.user_id === u.id).map((r) => r.role),
          ...(u.email?.toLowerCase() === BOOTSTRAP_EMAIL ? ["super_admin"] : []),
        ])),
        tools: (toolAccess ?? []).filter((t) => t.user_id === u.id).map((t) => t.tool_key),
        created_at: u.created_at,
      }));
      return new Response(JSON.stringify({ users: enriched }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "add_admin") {
      if (!roles.includes("super_admin")) return new Response(JSON.stringify({ error: "Only the super admin can create admins" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
      if (!roles.includes("super_admin")) return new Response(JSON.stringify({ error: "Only the super admin can change roles" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const { user_id, new_role } = body;
      if (!user_id || !new_role) throw new Error("user_id and new_role required");
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
      if (!roles.includes("super_admin")) return new Response(JSON.stringify({ error: "Only the super admin can remove roles" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const { user_id, role } = body;
      if (!user_id || !role) throw new Error("user_id and role required");
      const { data: targetUser } = await admin.auth.admin.getUserById(user_id);
      if (targetUser.user?.email?.toLowerCase() === BOOTSTRAP_EMAIL && role === "super_admin") {
        return new Response(JSON.stringify({ error: "The Ikamba Empire account must stay super admin" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      await admin.from("user_roles").delete().eq("user_id", user_id).eq("role", role);
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "delete_user") {
      const { user_id } = body;
      if (!user_id) throw new Error("user_id required");
      const { data: targetUser } = await admin.auth.admin.getUserById(user_id);
      if (!targetUser.user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (targetUser.user.email?.toLowerCase() === BOOTSTRAP_EMAIL) {
        return new Response(JSON.stringify({ error: "The Ikamba Empire super admin account cannot be deleted" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const { data: targetRoles } = await admin.from("user_roles").select("role").eq("user_id", user_id);
      if ((targetRoles ?? []).some((r) => r.role === "super_admin")) {
        return new Response(JSON.stringify({ error: "Super admin accounts cannot be deleted here" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      await Promise.all([
        admin.from("os_tool_access").delete().eq("user_id", user_id),
        admin.from("os_todos").delete().eq("user_id", user_id),
        admin.from("os_weekly_goals").delete().eq("user_id", user_id),
        admin.from("os_calendar_events").delete().eq("user_id", user_id),
        admin.from("os_expense_requests").delete().eq("user_id", user_id),
        admin.from("profiles").delete().eq("user_id", user_id),
        admin.from("user_roles").delete().eq("user_id", user_id),
      ]);
      const { error } = await admin.auth.admin.deleteUser(user_id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "member_work") {
      const { user_id } = body;
      if (!user_id) throw new Error("user_id required");
      const [{ data: todos, error: todosError }, { data: goals, error: goalsError }] = await Promise.all([
        admin.from("os_todos").select("*").eq("user_id", user_id).order("created_at", { ascending: false }),
        admin.from("os_weekly_goals").select("*").eq("user_id", user_id).order("created_at", { ascending: false }),
      ]);
      if (todosError) throw todosError;
      if (goalsError) throw goalsError;
      return new Response(JSON.stringify({ todos: todos ?? [], goals: goals ?? [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "add_member_todo") {
      const { user_id, title, notes, due, priority, assigned_by_name } = body;
      if (!user_id || !title || !due) throw new Error("user_id, title and due required");
      const { data, error } = await admin.from("os_todos").insert({
        user_id, title: String(title).trim(), notes: notes ? String(notes).trim() : null,
        due, priority: ["low", "medium", "high"].includes(priority) ? priority : "high",
        by_admin: true, assigned_by_name: assigned_by_name ?? user.email ?? "Admin",
      }).select("*").single();
      if (error) throw error;
      return new Response(JSON.stringify({ todo: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "add_member_goal") {
      const { user_id, title, notes, week_start, priority, assigned_by_name } = body;
      if (!user_id || !title || !week_start) throw new Error("user_id, title and week_start required");
      const { data, error } = await admin.from("os_weekly_goals").insert({
        user_id, title: String(title).trim(), notes: notes ? String(notes).trim() : null,
        week_start, priority: ["low", "medium", "high"].includes(priority) ? priority : "high",
        by_admin: true, assigned_by_name: assigned_by_name ?? user.email ?? "Admin",
      }).select("*").single();
      if (error) throw error;
      return new Response(JSON.stringify({ goal: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "update_member_todo") {
      const { todo_id, patch } = body;
      if (!todo_id) throw new Error("todo_id required");
      const { error } = await admin.from("os_todos").update(todoPatch(patch ?? {})).eq("id", todo_id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "update_member_goal") {
      const { goal_id, patch } = body;
      if (!goal_id) throw new Error("goal_id required");
      const { error } = await admin.from("os_weekly_goals").update(goalPatch(patch ?? {})).eq("id", goal_id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "delete_member_todo") {
      const { todo_id } = body;
      if (!todo_id) throw new Error("todo_id required");
      const { error } = await admin.from("os_todos").delete().eq("id", todo_id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "delete_member_goal") {
      const { goal_id } = body;
      if (!goal_id) throw new Error("goal_id required");
      const { error } = await admin.from("os_weekly_goals").delete().eq("id", goal_id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "update_member_profile") {
      const { user_id, full_name, email } = body;
      if (!user_id) throw new Error("user_id required");
      if (typeof full_name === "string") {
        await admin.from("profiles").upsert({ user_id, full_name: full_name.trim() || null }, { onConflict: "user_id" });
      }
      if (typeof email === "string" && email.trim()) {
        await admin.auth.admin.updateUserById(user_id, { email: email.trim() });
      }
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message ?? String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
