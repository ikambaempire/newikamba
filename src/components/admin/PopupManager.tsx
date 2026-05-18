import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Clock, MousePointer2, RefreshCw, Upload, Trash2, Image as ImageIcon, Film } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Database } from "@/integrations/supabase/types";

type PopupSetting = Database["public"]["Tables"]["popup_settings"]["Row"] & {
  media_url?: string | null;
  media_type?: string | null;
};

const BUCKET = "popup-media";

const MediaBlock = ({ popup, onUpload, onRemove, busy }: { popup: PopupSetting; onUpload: (f: File) => void; onRemove: () => void; busy: boolean }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
          {popup.media_type === "video" ? <Film size={12} /> : <ImageIcon size={12} />} Popup media
        </span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={busy}>
            <Upload size={12} /> {popup.media_url ? "Replace" : "Upload"}
          </Button>
          {popup.media_url && (
            <Button size="sm" variant="ghost" onClick={onRemove} disabled={busy}>
              <Trash2 size={12} />
            </Button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }} />
      </div>
      {popup.media_url ? (
        popup.media_type === "video" ? (
          <video src={popup.media_url} controls className="w-full max-h-48 rounded bg-black" />
        ) : (
          <img src={popup.media_url} alt="Popup media preview" className="w-full max-h-48 object-contain rounded bg-background" />
        )
      ) : (
        <p className="text-xs text-muted-foreground">No custom media. Default carousel will be shown. Upload an image or short video (max 25 MB).</p>
      )}
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
    if (error) toast.error("Could not load popup settings");
    if (data) setPopups(data);
    setLoading(false);
  };

  useEffect(() => { fetchPopups(); }, []);

  const updateLocal = (id: string, changes: Partial<PopupSetting>) => {
    setPopups((items) => items.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  };

  const savePopup = async (popup: PopupSetting) => {
    setSavingId(popup.id);
    const { error } = await supabase.from("popup_settings").update({
      enabled: popup.enabled,
      title: popup.title,
      message: popup.message,
      button_text: popup.button_text,
      button_link: popup.button_link,
      delay_seconds: popup.delay_seconds,
      media_url: popup.media_url ?? null,
      media_type: popup.media_type ?? null,
    } as any).eq("id", popup.id);
    setSavingId(null);
    if (error) {
      toast.error("Could not save popup settings");
      return;
    }
    toast.success("Popup settings saved");
  };

  const uploadMedia = async (popup: PopupSetting, file: File) => {
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) { toast.error("Only image or video files"); return; }
    if (file.size > 25 * 1024 * 1024) { toast.error("Max 25 MB"); return; }
    setSavingId(popup.id);
    const path = `${popup.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { setSavingId(null); toast.error(upErr.message); return; }
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const url = pub.publicUrl;
    const type = isVideo ? "video" : "image";
    const { error } = await supabase.from("popup_settings").update({ media_url: url, media_type: type } as any).eq("id", popup.id);
    setSavingId(null);
    if (error) { toast.error(error.message); return; }
    updateLocal(popup.id, { media_url: url, media_type: type } as any);
    toast.success("Media uploaded");
  };

  const removeMedia = async (popup: PopupSetting) => {
    if (!popup.media_url) return;
    setSavingId(popup.id);
    const { error } = await supabase.from("popup_settings").update({ media_url: null, media_type: null } as any).eq("id", popup.id);
    setSavingId(null);
    if (error) { toast.error(error.message); return; }
    updateLocal(popup.id, { media_url: null, media_type: null } as any);
    toast.success("Media removed");
  };

  if (loading) return <div className="p-12 text-center text-muted-foreground">Loading popup settings...</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Popup System</h2>
          <p className="text-sm text-muted-foreground">Enable, disable, and edit lead capture popups.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPopups}><RefreshCw size={14} /> Refresh</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {popups.map((popup) => {
          const Icon = popup.popup_type === "exit_intent" ? MousePointer2 : Clock;
          return (
            <div key={popup.id} className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center"><Icon size={18} /></div>
                  <div>
                    <h3 className="font-bold text-foreground">{popup.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{popup.popup_type.replace("_", " ")}</p>
                  </div>
                </div>
                <Switch checked={popup.enabled} onCheckedChange={(enabled) => updateLocal(popup.id, { enabled })} />
              </div>

              <div className="space-y-3">
                <Input value={popup.title} onChange={(e) => updateLocal(popup.id, { title: e.target.value })} placeholder="Popup title" />
                <Textarea value={popup.message} onChange={(e) => updateLocal(popup.id, { message: e.target.value })} placeholder="Popup message" />
                <div className="grid grid-cols-2 gap-3">
                  <Input value={popup.button_text} onChange={(e) => updateLocal(popup.id, { button_text: e.target.value })} placeholder="Button text" />
                  <Input value={popup.button_link} onChange={(e) => updateLocal(popup.id, { button_link: e.target.value })} placeholder="Button link" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5 block">Delay seconds</label>
                  <Input type="number" min={1} max={120} value={popup.delay_seconds} onChange={(e) => updateLocal(popup.id, { delay_seconds: Number(e.target.value) })} />
                </div>
              </div>

              <MediaBlock popup={popup} onUpload={(f) => uploadMedia(popup, f)} onRemove={() => removeMedia(popup)} busy={savingId === popup.id} />

              <Button variant="hero" onClick={() => savePopup(popup)} disabled={savingId === popup.id}>
                {savingId === popup.id ? "Saving..." : "Save Popup"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PopupManager;
