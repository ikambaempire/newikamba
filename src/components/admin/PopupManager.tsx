import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Clock, MousePointer2, RefreshCw, Upload, Trash2, Image as ImageIcon, Film, Plus, Eye, Palette, LayoutTemplate, Type } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type PopupSetting = any;

const BUCKET = "popup-media";
const PAGE_TARGETS = [
  { value: "all", label: "All website pages" },
  { value: "/", label: "Home page" },
  { value: "/solutions", label: "Solutions" },
  { value: "/work", label: "Work / Portfolio" },
  { value: "/how-it-works", label: "How it works" },
  { value: "/insights", label: "Insights" },
  { value: "/about", label: "About" },
  { value: "/contact", label: "Contact" },
  { value: "/start-a-project", label: "Start a Project" },
  { value: "/login", label: "Login" },
  { value: "/signup", label: "Signup" },
  { value: "/os", label: "User dashboards" },
];

const LAYOUTS = [
  { value: "media_left", label: "Media left / Text right" },
  { value: "media_right", label: "Text left / Media right" },
  { value: "media_top", label: "Media top / Text below" },
  { value: "media_background", label: "Full background media" },
  { value: "text_only", label: "Text only (no media)" },
];

const ALIGNS = [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }];
const SIZES = [{ value: "md", label: "Medium" }, { value: "lg", label: "Large" }, { value: "xl", label: "Extra large" }];

const ColorField = ({ label, value, onChange }: { label: string; value?: string | null; onChange: (v: string) => void }) => (
  <div>
    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">{label}</label>
    <div className="flex gap-1.5 items-center">
      <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 rounded border border-input cursor-pointer bg-background" />
      <Input value={value || ""} onChange={(e) => onChange(e.target.value)} className="h-9 text-xs font-mono" />
    </div>
  </div>
);

// LIVE PREVIEW that mirrors how the popup renders on the public site
const LivePreview = ({ p }: { p: PopupSetting }) => {
  const align = p.text_align || "left";
  const sizeClass = p.heading_size === "xl" ? "text-3xl" : p.heading_size === "md" ? "text-xl" : "text-2xl";
  const isBg = p.layout === "media_background";

  const media = p.media_url ? (
    p.media_type === "video"
      ? <video src={p.media_url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
      : <img src={p.media_url} alt="popup" className="w-full h-full object-cover" />
  ) : <div className="w-full h-full flex items-center justify-center text-xs opacity-60" style={{ background: "rgba(255,255,255,0.05)" }}>No media uploaded</div>;

  const textBlock = (
    <div className="p-5 flex flex-col justify-center" style={{ textAlign: align as any, color: p.text_color || "#fff" }}>
      {p.eyebrow && <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-2" style={{ color: p.accent_color || "#D4A739" }}>{p.eyebrow}</div>}
      <h3 className={`${sizeClass} font-extrabold mb-2 leading-tight`}>{p.title}</h3>
      <p className="text-sm opacity-90 mb-4">{p.message}</p>
      <div className={align === "center" ? "mx-auto" : align === "right" ? "ml-auto" : ""}>
        <button className="px-4 py-2 rounded font-bold text-xs shadow" style={{ background: p.button_bg_color || "#D4A739", color: p.button_text_color || "#0C2C47" }}>
          {p.button_text}
        </button>
      </div>
    </div>
  );

  return (
    <div className="rounded-lg overflow-hidden border-2 border-dashed border-border" style={{ background: p.bg_color || "#0C2C47", minHeight: 240 }}>
      {p.layout === "text_only" && textBlock}
      {p.layout === "media_left" && <div className="grid grid-cols-2 min-h-[240px]"><div>{media}</div>{textBlock}</div>}
      {p.layout === "media_right" && <div className="grid grid-cols-2 min-h-[240px]">{textBlock}<div>{media}</div></div>}
      {p.layout === "media_top" && <div className="flex flex-col min-h-[240px]"><div className="h-32">{media}</div>{textBlock}</div>}
      {isBg && (
        <div className="relative min-h-[260px]">
          <div className="absolute inset-0">{media}</div>
          <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${(p.overlay_opacity ?? 60) / 100})` }} />
          <div className="relative">{textBlock}</div>
        </div>
      )}
    </div>
  );
};

const PopupEditor = ({ popup, onChange, onSave, onDelete, onUpload, onRemoveMedia, busy }: any) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const Icon = popup.popup_type === "exit_intent" ? MousePointer2 : Clock;
  const upd = (k: string, v: any) => onChange({ ...popup, [k]: v });

  return (
    <div className="bg-card border border-border rounded-lg p-5 space-y-5">
      <div className="flex items-start justify-between gap-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center"><Icon size={18} /></div>
          <div>
            <Input value={popup.name} onChange={(e) => upd("name", e.target.value)} className="font-bold text-base h-8 px-2" />
            <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{(popup.popup_type || "").replace("_", " ")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{popup.enabled ? "Live" : "Off"}</span>
          <Switch checked={popup.enabled} onCheckedChange={(v) => upd("enabled", v)} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* CONTROLS */}
        <div className="space-y-4">
          {/* Content */}
          <section className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Type size={11} /> Content</h4>
            <Input placeholder="Eyebrow (e.g. Free Resource)" value={popup.eyebrow || ""} onChange={(e) => upd("eyebrow", e.target.value)} />
            <Input placeholder="Title" value={popup.title || ""} onChange={(e) => upd("title", e.target.value)} />
            <Textarea placeholder="Message" value={popup.message || ""} onChange={(e) => upd("message", e.target.value)} rows={2} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Button text" value={popup.button_text || ""} onChange={(e) => upd("button_text", e.target.value)} />
              <Input placeholder="Button link" value={popup.button_link || ""} onChange={(e) => upd("button_link", e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={popup.show_form !== false} onChange={(e) => upd("show_form", e.target.checked)} />
              Show lead capture form (instead of just a button)
            </label>
          </section>

          {/* Layout */}
          <section className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><LayoutTemplate size={11} /> Layout</h4>
            <div className="grid grid-cols-2 gap-2">
              <select value={popup.layout || "media_left"} onChange={(e) => upd("layout", e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-xs">
                {LAYOUTS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
              <select value={popup.text_align || "left"} onChange={(e) => upd("text_align", e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-xs">
                {ALIGNS.map((a) => <option key={a.value} value={a.value}>Align: {a.label}</option>)}
              </select>
              <select value={popup.heading_size || "lg"} onChange={(e) => upd("heading_size", e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-xs">
                {SIZES.map((s) => <option key={s.value} value={s.value}>Size: {s.label}</option>)}
              </select>
              <select value={popup.popup_type} onChange={(e) => upd("popup_type", e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-xs">
                <option value="time_delay">Time delay</option>
                <option value="exit_intent">Exit intent</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={popup.target_path || "all"} onChange={(e) => upd("target_path", e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-xs">
                {PAGE_TARGETS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <Input type="number" min={1} max={120} value={popup.delay_seconds} onChange={(e) => upd("delay_seconds", Number(e.target.value))} placeholder="Delay sec" />
            </div>
            {popup.layout === "media_background" && (
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Overlay darkness: {popup.overlay_opacity ?? 60}%</label>
                <input type="range" min={0} max={90} value={popup.overlay_opacity ?? 60} onChange={(e) => upd("overlay_opacity", Number(e.target.value))} className="w-full" />
              </div>
            )}
          </section>

          {/* Colors */}
          <section className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Palette size={11} /> Colors</h4>
            <div className="grid grid-cols-2 gap-2">
              <ColorField label="Background" value={popup.bg_color} onChange={(v) => upd("bg_color", v)} />
              <ColorField label="Text" value={popup.text_color} onChange={(v) => upd("text_color", v)} />
              <ColorField label="Accent / eyebrow" value={popup.accent_color} onChange={(v) => upd("accent_color", v)} />
              <ColorField label="Button bg" value={popup.button_bg_color} onChange={(v) => upd("button_bg_color", v)} />
              <ColorField label="Button text" value={popup.button_text_color} onChange={(v) => upd("button_text_color", v)} />
            </div>
          </section>

          {/* Media */}
          <section className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              {popup.media_type === "video" ? <Film size={11} /> : <ImageIcon size={11} />} Media (image or video)
            </h4>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={busy}>
                <Upload size={12} /> {popup.media_url ? "Replace" : "Upload"}
              </Button>
              {popup.media_url && <Button size="sm" variant="ghost" onClick={onRemoveMedia} disabled={busy}><Trash2 size={12} /> Remove</Button>}
            </div>
            <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }} />
            <p className="text-[10px] text-muted-foreground">Max 25 MB. Used in the layout you picked above.</p>
          </section>
        </div>

        {/* PREVIEW */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Eye size={11} /> Live preview</h4>
          <LivePreview p={popup} />
        </div>
      </div>

      <div className="flex justify-between pt-2 border-t border-border">
        <Button variant="destructive" size="sm" onClick={onDelete} disabled={busy}><Trash2 size={14} /> Delete</Button>
        <Button variant="hero" onClick={onSave} disabled={busy}>{busy ? "Saving…" : "Save popup"}</Button>
      </div>
    </div>
  );
};

const PopupManager = () => {
  const [popups, setPopups] = useState<PopupSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchPopups = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("popup_settings").select("*").order("created_at", { ascending: true });
    if (error) toast.error("Could not load popups: " + error.message);
    if (data) setPopups(data as any);
    setLoading(false);
  };

  useEffect(() => { fetchPopups(); }, []);

  const updateLocal = (id: string, next: PopupSetting) => setPopups((items) => items.map((i) => (i.id === id ? next : i)));

  const savePopup = async (popup: PopupSetting) => {
    setSavingId(popup.id);
    const { id, created_at, updated_at, ...payload } = popup;
    const { error } = await supabase.from("popup_settings").update(payload as any).eq("id", popup.id);
    setSavingId(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Popup saved");
  };

  const createPopup = async () => {
    setSavingId("new");
    const { data, error } = await supabase.from("popup_settings").insert({
      name: "New Popup", popup_type: "time_delay", enabled: false,
      title: "Your headline here", message: "Tell visitors what they get.",
      button_text: "Get Started", button_link: "/contact", delay_seconds: 8,
      target_path: "all", layout: "media_left", text_align: "left", heading_size: "lg",
      bg_color: "#0C2C47", text_color: "#FFFFFF", accent_color: "#D4A739",
      button_bg_color: "#D4A739", button_text_color: "#0C2C47", overlay_opacity: 60,
      show_form: true, eyebrow: "Free Resource",
    } as any).select("*").single();
    setSavingId(null);
    if (error) { toast.error(error.message); return; }
    if (data) setPopups((items) => [...items, data as any]);
    toast.success("Popup created");
  };

  const deletePopup = async (popup: PopupSetting) => {
    if (!confirm(`Delete "${popup.name}"?`)) return;
    setSavingId(popup.id);
    const { error } = await supabase.from("popup_settings").delete().eq("id", popup.id);
    setSavingId(null);
    if (error) { toast.error(error.message); return; }
    setPopups((items) => items.filter((i) => i.id !== popup.id));
    toast.success("Deleted");
  };

  const uploadMedia = async (popup: PopupSetting, file: File) => {
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) { toast.error("Only images or videos"); return; }
    if (file.size > 25 * 1024 * 1024) { toast.error("Max 25 MB"); return; }
    setSavingId(popup.id);
    const path = `${popup.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { setSavingId(null); toast.error(upErr.message); return; }
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const type = isVideo ? "video" : "image";
    const { error } = await supabase.from("popup_settings").update({ media_url: pub.publicUrl, media_type: type } as any).eq("id", popup.id);
    setSavingId(null);
    if (error) { toast.error(error.message); return; }
    updateLocal(popup.id, { ...popup, media_url: pub.publicUrl, media_type: type });
    toast.success("Media uploaded");
  };

  const removeMedia = async (popup: PopupSetting) => {
    if (!popup.media_url) return;
    setSavingId(popup.id);
    const { error } = await supabase.from("popup_settings").update({ media_url: null, media_type: null } as any).eq("id", popup.id);
    setSavingId(null);
    if (error) { toast.error(error.message); return; }
    updateLocal(popup.id, { ...popup, media_url: null, media_type: null });
    toast.success("Media removed");
  };

  if (loading) return <div className="p-12 text-center text-muted-foreground">Loading popups…</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Popup Designer</h2>
          <p className="text-sm text-muted-foreground">Design popups with layouts, colors, images & videos — Canva-style. Live preview updates as you edit.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="hero" size="sm" onClick={createPopup} disabled={savingId === "new"}><Plus size={14} /> New popup</Button>
          <Button variant="outline" size="sm" onClick={fetchPopups}><RefreshCw size={14} /> Refresh</Button>
        </div>
      </div>

      {popups.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No popups yet. Click <strong>New popup</strong> to create one.
        </div>
      )}

      <div className="space-y-5">
        {popups.map((popup) => (
          <PopupEditor
            key={popup.id}
            popup={popup}
            busy={savingId === popup.id}
            onChange={(next: PopupSetting) => updateLocal(popup.id, next)}
            onSave={() => savePopup(popup)}
            onDelete={() => deletePopup(popup)}
            onUpload={(f: File) => uploadMedia(popup, f)}
            onRemoveMedia={() => removeMedia(popup)}
          />
        ))}
      </div>
    </div>
  );
};

export default PopupManager;
