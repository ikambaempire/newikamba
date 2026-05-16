import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader, OSButton, Field, Input, Select, Textarea, Badge } from "@/os/components/ui";
import { getProfile, upsertProfile, pickAvatarColor, type OSProfile } from "@/os/access";
import { Save, Check } from "lucide-react";

const ROLES = ["Founder", "Producer", "Project Manager", "Editor", "Designer", "Writer", "Marketing", "Finance", "Operations", "Other"];
const DEPTS = ["Leadership", "Production", "Post-Production", "Creative", "Marketing", "Finance & Ops", "Sales"];
const COLORS = ["#D4A739", "#5b8def", "#22c55e", "#ef4444", "#a855f7", "#06b6d4", "#f97316", "#ec4899"];

const Profile = () => {
  const { user } = useAuth();
  const [p, setP] = useState<OSProfile | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    setP(getProfile(user.id));
  }, [user]);

  if (!user || !p) {
    return <div className="text-os-muted">Loading profile…</div>;
  }

  const save = () => {
    upsertProfile(p);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="Update how you appear across iKAMBA Media OS."
        actions={
          <OSButton variant="primary" onClick={save}>
            {saved ? <><Check size={16} /> Saved</> : <><Save size={16} /> Save changes</>}
          </OSButton>
        }
      />

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <div className="os-card rounded-xl p-5 h-fit">
          <div
            className="h-24 w-24 rounded-full mx-auto flex items-center justify-center text-white font-extrabold text-3xl"
            style={{ background: p.avatarColor }}
          >
            {(p.fullName || "?").charAt(0).toUpperCase()}
          </div>
          <div className="text-center mt-3">
            <div className="text-white font-bold">{p.fullName}</div>
            <div className="text-xs text-os-muted">{p.email}</div>
            <div className="flex justify-center gap-2 mt-2">
              <Badge tone="gold">{p.role}</Badge>
              <Badge>{p.department}</Badge>
            </div>
          </div>
          <div className="mt-5">
            <div className="text-xs font-semibold text-os-muted mb-2">Avatar color</div>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setP({ ...p, avatarColor: c })}
                  className={`h-7 w-7 rounded-full border-2 ${p.avatarColor === c ? "border-white" : "border-transparent"}`}
                  style={{ background: c }}
                  aria-label="Pick color"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="os-card rounded-xl p-5 space-y-4">
          <Field label="Full name" required>
            <Input value={p.fullName} onChange={(e) => setP({ ...p, fullName: e.target.value })} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Role">
              <Select value={p.role} onChange={(e) => setP({ ...p, role: e.target.value })}>
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </Select>
            </Field>
            <Field label="Department">
              <Select value={p.department} onChange={(e) => setP({ ...p, department: e.target.value })}>
                {DEPTS.map((d) => <option key={d}>{d}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Phone / WhatsApp">
            <Input value={p.phone || ""} onChange={(e) => setP({ ...p, phone: e.target.value })} placeholder="+250 ..." />
          </Field>
          <Field label="Short bio">
            <Textarea rows={3} value={p.bio || ""} onChange={(e) => setP({ ...p, bio: e.target.value })} placeholder="One line about what you do" />
          </Field>
          <div className="text-[11px] text-os-muted pt-1">
            Last updated {new Date(p.updatedAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
