import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Badge, OSButton } from "@/os/components/ui";
import { ALL_TOOLS, DEFAULT_TOOLS, listProfiles, setAllowedTools, saveAllowedTools, fetchAllowedTools, pickAvatarColor, type OSProfile, type OSToolKey } from "@/os/access";
import { Shield, Users, Check } from "lucide-react";
import { Navigate } from "react-router-dom";

const UserAccess = () => {
  const { roles, user } = useAuth();
  const isSuperAdmin = roles.includes("super_admin");
  const [profiles, setProfiles] = useState<OSProfile[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    (async () => {
      const local = listProfiles();
      const localById = new Map(local.map((p) => [p.userId, p]));
      try {
        const { data, error } = await supabase.functions.invoke("manage-admins", { body: { action: "list" } });
        if (error) throw error;
        const rows = await Promise.all((data?.users || []).map(async (u: any) => {
          const lp = localById.get(u.id);
          const tools = await fetchAllowedTools(u.id);
          return lp ? { ...lp, email: lp.email || u.email, fullName: lp.fullName || u.full_name || "Team member", allowedTools: u.roles?.includes("super_admin") ? ALL_TOOLS.map((t) => t.key) : tools || lp.allowedTools }
            : { userId: u.id, email: u.email || "", fullName: u.full_name || "Team member", role: u.roles?.includes("super_admin") ? "Super Admin" : u.roles?.includes("org_admin") ? "Admin" : "Member", department: "Unassigned", avatarColor: pickAvatarColor(u.id), setupComplete: false, allowedTools: u.roles?.includes("super_admin") ? ALL_TOOLS.map((t) => t.key) : tools || DEFAULT_TOOLS, createdAt: u.created_at, updatedAt: u.created_at } as OSProfile;
        }));
        setProfiles(rows);
      } catch {
        setProfiles(local);
      }
    })();
  }, [tick]);

  if (!isSuperAdmin) return <Navigate to="/os" replace />;

  const toggle = async (userId: string, key: OSToolKey, current: OSToolKey[]) => {
    const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
    setAllowedTools(userId, next);
    await saveAllowedTools(userId, next, user?.id);
    setTick((t) => t + 1);
  };

  return (
    <div>
      <PageHeader
        title="User Access"
        subtitle="Manage team profiles and which tools each member can see in the OS."
        actions={<Badge tone="gold"><Shield size={10} className="inline mr-1" /> Admin only</Badge>}
      />

      {profiles.length === 0 ? (
        <div className="os-card rounded-xl p-10 text-center">
          <Users className="mx-auto text-os-muted mb-3" size={28} />
          <p className="text-white font-semibold">No team profiles yet</p>
          <p className="text-os-muted text-sm mt-1">When teammates log in and complete the setup wizard, they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {profiles.map((p) => (
            <div key={p.userId} className="os-card rounded-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center font-bold text-white text-lg shrink-0"
                  style={{ background: p.avatarColor }}
                >
                  {p.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold">{p.fullName}</div>
                  <div className="text-xs text-os-muted truncate">{p.email}</div>
                  <div className="flex gap-2 mt-1.5">
                    <Badge tone="gold">{p.role}</Badge>
                    <Badge>{p.department}</Badge>
                  </div>
                </div>
                <div className="text-xs text-os-muted">
                  {p.allowedTools.length} of {ALL_TOOLS.length} tools
                </div>
              </div>
              {p.bio && <p className="text-os-muted text-sm mb-3 italic">"{p.bio}"</p>}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ALL_TOOLS.map((t) => {
                  const active = p.allowedTools.includes(t.key);
                  return (
                    <button
                      key={t.key}
                      onClick={() => toggle(p.userId, t.key, p.allowedTools)}
                      className={`text-left rounded-lg border px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                        active
                          ? "border-[hsl(var(--os-gold))] bg-os-gold/10 text-white"
                          : "border-os text-os-muted hover:text-white"
                      }`}
                    >
                      <span>{t.label}</span>
                      {active && <Check size={14} className="text-os-gold" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserAccess;
