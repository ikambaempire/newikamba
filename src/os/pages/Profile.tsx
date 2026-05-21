import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader, OSButton, Field, Input, Select, Textarea, Badge } from "@/os/components/ui";
import { getProfile, upsertProfile, pickAvatarColor, type OSProfile } from "@/os/access";
import { supabase } from "@/integrations/supabase/client";
import { Save, Check, Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";

const ROLES = ["Founder", "Producer", "Project Manager", "Editor", "Designer", "Writer", "Marketing", "Finance", "Operations", "Other"];
const DEPTS = ["Leadership", "Production", "Post-Production", "Creative", "Marketing", "Finance & Ops", "Sales"];
const COLORS = ["#D4A739", "#5b8def", "#22c55e", "#ef4444", "#a855f7", "#06b6d4", "#f97316", "#ec4899"];

const Profile = () => {
  const { user } = useAuth();
  const [p, setP] = useState<OSProfile | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load from DB (fall back to localStorage)
  useEffect(() => {
    if (!user) return;
    (async () => {
      const local = getProfile(user.id);
      const base: OSProfile = local || {
        userId: user.id,
        email: user.email || "",
        fullName: (user.user_metadata as any)?.full_name || user.email?.split("@")[0] || "",
        role: "Other", department: "Leadership",
        avatarColor: pickAvatarColor(user.id),
        setupComplete: true, allowedTools: [],
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (data) {
        const merged: OSProfile = {
          ...base,
          fullName: data.full_name || base.fullName,
          phone: (data as any).whatsapp_number || base.phone,
          bio: (data as any).bio || base.bio,
          role: (data as any).role_title || base.role,
          department: (data as any).department || base.department,
          avatarUrl: (data as any).avatar_url || base.avatarUrl,
        };
        upsertProfile(merged);
        setP(merged);
      } else {
        setP(base);
      }
    })();
  }, [user]);

  if (!user || !p) return <div className="text-os-muted">Loading profile…</div>;

  const save = async () => {
    if (!user) return;
    setSaving(true);
    upsertProfile(p);
    const { error } = await supabase.from("profiles").upsert({
      user_id: user.id,
      full_name: p.fullName?.trim() || null,
      whatsapp_number: p.phone?.trim() || null,
      bio: p.bio?.trim() || null,
      role_title: p.role || null,
      department: p.department || null,
      avatar_url: p.avatarUrl || null,
    } as any, { onConflict: "user_id" });
    setSaving(false);
    if (error) { toast.error("Could not save profile: " + error.message); return; }
    toast.success("Profile updated");
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const persistAvatar = async (url: string | null) => {
    if (!user) return;
    await supabase.from("profiles").upsert({ user_id: user.id, avatar_url: url } as any, { onConflict: "user_id" });
  };

  const handleUpload = async (file: File) => {
    if (!file || !user) return;
    setUploadError(null);
    if (file.size > 5 * 1024 * 1024) { setUploadError("Image must be under 5 MB."); return; }
    if (!file.type.startsWith("image/")) { setUploadError("Please choose an image file."); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const updated = { ...p, avatarUrl: data.publicUrl };
      setP(updated);
      upsertProfile(updated);
      await persistAvatar(data.publicUrl);
      toast.success("Photo updated");
    } catch (e: any) {
      setUploadError(e?.message || "Upload failed");
    } finally { setUploading(false); }
  };

  const removeAvatar = async () => {
    const updated = { ...p, avatarUrl: undefined };
    setP(updated); upsertProfile(updated);
    await persistAvatar(null);
  };

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="Update how you appear across iKAMBA Media OS."
        actions={
          <OSButton variant="primary" onClick={save} disabled={saving}>
            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : saved ? <><Check size={16} /> Saved</> : <><Save size={16} /> Save changes</>}
          </OSButton>
        }
      />

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <div className="os-card rounded-xl p-5 h-fit">
          <div className="relative h-24 w-24 mx-auto">
            {p.avatarUrl ? (
              <img src={p.avatarUrl} alt="avatar" className="h-24 w-24 rounded-full object-cover" />
            ) : (
              <div className="h-24 w-24 rounded-full flex items-center justify-center text-white font-extrabold text-3xl" style={{ background: p.avatarColor }}>
                {(p.fullName || "?").charAt(0).toUpperCase()}
              </div>
            )}
            {p.avatarUrl && (
              <button onClick={removeAvatar} className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow" aria-label="Remove avatar">
                <X size={12} />
              </button>
            )}
          </div>
          <div className="text-center mt-3">
            <div className="text-white font-bold">{p.fullName}</div>
            <div className="text-xs text-os-muted">{p.email}</div>
            <div className="flex justify-center gap-2 mt-2 flex-wrap">
              <Badge tone="gold">{p.role}</Badge>
              <Badge>{p.department}</Badge>
            </div>
          </div>

          <div className="mt-5">
            <div className="text-xs font-semibold text-os-muted mb-2">Profile photo</div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.currentTarget.value = ""; }} />
            <OSButton variant="outline" onClick={() => fileRef.current?.click()} className="w-full justify-center">
              {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : <><Upload size={14} /> {p.avatarUrl ? "Change photo" : "Upload photo"}</>}
            </OSButton>
            {uploadError && <div className="text-xs text-rose-300 mt-2">{uploadError}</div>}
          </div>

          <div className="mt-5">
            <div className="text-xs font-semibold text-os-muted mb-2">Fallback color</div>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button key={c} onClick={() => setP({ ...p, avatarColor: c })}
                  className={`h-7 w-7 rounded-full border-2 ${p.avatarColor === c ? "border-white" : "border-transparent"}`}
                  style={{ background: c }} aria-label="Pick color" />
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
          <Field label="WhatsApp number (for notifications)">
            <Input value={p.phone || ""} onChange={(e) => setP({ ...p, phone: e.target.value })} placeholder="+250 7XX XXX XXX" />
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
