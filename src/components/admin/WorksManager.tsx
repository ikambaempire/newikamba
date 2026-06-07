import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Upload, Save, X, Pencil } from "lucide-react";

type Work = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  cover_url: string | null;
  video_url: string | null;
  category: string | null;
  year: string | null;
  client_name: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
  tags: string[] | null;
};

const empty = (): Partial<Work> => ({
  title: "", slug: "", summary: "", content: "",
  cover_url: "", video_url: "", category: "", year: String(new Date().getFullYear()),
  client_name: "", featured: false, published: true, sort_order: 0, tags: [],
});

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

const WorksManager = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Work[]>([]);
  const [editing, setEditing] = useState<Partial<Work> | null>(null);
  const [uploading, setUploading] = useState<"cover" | "video" | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from("works").select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    setItems((data as Work[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (file: File, kind: "cover" | "video") => {
    setUploading(kind);
    try {
      const ext = file.name.split(".").pop();
      const path = `${kind}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("works-media").upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const { data: signed } = await supabase.storage.from("works-media").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
      const url = signed?.signedUrl || "";
      if (!url) throw new Error("Could not generate file URL");
      setEditing((e) => e ? { ...e, [kind === "cover" ? "cover_url" : "video_url"]: url } : e);
      setEditing((e) => e ? { ...e, [kind === "cover" ? "cover_url" : "video_url"]: url } : e);
      toast({ title: "Uploaded", description: `${kind} uploaded successfully.` });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const save = async () => {
    if (!editing) return;
    const payload: any = {
      ...editing,
      slug: editing.slug?.trim() || slugify(editing.title || ""),
    };
    if (!payload.title || !payload.slug) {
      toast({ title: "Missing fields", description: "Title and slug are required.", variant: "destructive" });
      return;
    }
    let res;
    if ((editing as Work).id) {
      const { id, ...rest } = payload;
      res = await (supabase as any).from("works").update(rest).eq("id", id);
    } else {
      res = await (supabase as any).from("works").insert(payload);
    }
    if (res.error) {
      toast({ title: "Save failed", description: res.error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Saved", description: "Work item saved." });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this work? This cannot be undone.")) return;
    const { error } = await (supabase as any).from("works").delete().eq("id", id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Deleted" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Our Work · Portfolio Entries</h2>
          <p className="text-sm text-muted-foreground">Add, edit and publish project case studies shown on the public Our Work page.</p>
        </div>
        <Button onClick={() => setEditing(empty())} className="gap-2">
          <Plus size={16} /> New Work
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No works yet. Click "New Work" to add your first.</div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((w) => (
              <li key={w.id} className="flex items-center gap-4 p-4 hover:bg-muted/30">
                <div className="w-20 h-14 rounded bg-muted overflow-hidden shrink-0">
                  {w.cover_url && <img src={w.cover_url} alt={w.title} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{w.title}</p>
                    {!w.published && <span className="text-[10px] uppercase tracking-widest bg-muted text-muted-foreground px-1.5 py-0.5 rounded">Draft</span>}
                    {w.featured && <span className="text-[10px] uppercase tracking-widest bg-accent/15 text-accent px-1.5 py-0.5 rounded">Featured</span>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">/our-work/{w.slug} · {w.category || "—"} · {w.year || "—"}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setEditing(w)}><Pencil size={14} /></Button>
                <Button variant="ghost" size="sm" onClick={() => remove(w.id)} className="text-destructive"><Trash2 size={14} /></Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-background border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-background z-10">
              <h3 className="font-bold">{(editing as Work).id ? "Edit work" : "New work"}</h3>
              <Button variant="ghost" size="sm" onClick={() => setEditing(null)}><X size={16} /></Button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <Label>Title *</Label>
                <Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.slug || slugify(e.target.value) })} />
              </div>
              <div>
                <Label>Slug *</Label>
                <Input value={editing.slug || ""} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Category</Label>
                  <Input value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="Documentary" />
                </div>
                <div>
                  <Label>Year</Label>
                  <Input value={editing.year || ""} onChange={(e) => setEditing({ ...editing, year: e.target.value })} placeholder="2025" />
                </div>
                <div>
                  <Label>Client</Label>
                  <Input value={editing.client_name || ""} onChange={(e) => setEditing({ ...editing, client_name: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Summary</Label>
                <Textarea rows={2} value={editing.summary || ""} onChange={(e) => setEditing({ ...editing, summary: e.target.value })} />
              </div>
              <div>
                <Label>Full story / content</Label>
                <Textarea rows={8} value={editing.content || ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} placeholder="Write the full case study. Plain text or paragraphs." />
              </div>

              <div>
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={(editing.tags || []).join(", ")}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  placeholder="documentary, ngo, kigali"
                />
                {!!(editing.tags && editing.tags.length) && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {editing.tags!.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 bg-accent/15 text-accent text-[11px] uppercase tracking-widest font-semibold px-2 py-1 rounded">
                        {t}
                        <button type="button" onClick={() => setEditing({ ...editing, tags: editing.tags!.filter((x) => x !== t) })} className="hover:opacity-70">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cover image</Label>
                  {editing.cover_url && (
                    <div className="relative mb-2">
                      <img src={editing.cover_url} className="w-full h-28 object-cover rounded" />
                      <Button type="button" variant="destructive" size="sm" onClick={() => setEditing({ ...editing, cover_url: "" })}
                        className="absolute top-1 right-1 h-7 px-2 text-xs">Remove</Button>
                    </div>
                  )}
                  <Input value={editing.cover_url || ""} onChange={(e) => setEditing({ ...editing, cover_url: e.target.value })} placeholder="https://…" className="mb-2" />
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-accent">
                    <Upload size={14} />
                    <span>{uploading === "cover" ? "Uploading…" : editing.cover_url ? "Replace image" : "Upload image"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "cover")} />
                  </label>
                </div>
                <div>
                  <Label>Video (optional)</Label>
                  {editing.video_url && (
                    <div className="relative mb-2">
                      <video src={editing.video_url} className="w-full h-28 object-cover rounded bg-black" muted />
                      <Button type="button" variant="destructive" size="sm" onClick={() => setEditing({ ...editing, video_url: "" })}
                        className="absolute top-1 right-1 h-7 px-2 text-xs">Remove</Button>
                    </div>
                  )}
                  <Input value={editing.video_url || ""} onChange={(e) => setEditing({ ...editing, video_url: e.target.value })} placeholder="https://…/video.mp4" className="mb-2" />
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-accent">
                    <Upload size={14} />
                    <span>{uploading === "video" ? "Uploading…" : editing.video_url ? "Replace video" : "Upload video"}</span>
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "video")} />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <Switch checked={!!editing.published} onCheckedChange={(v) => setEditing({ ...editing, published: v })} />
                  <Label>Published</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={!!editing.featured} onCheckedChange={(v) => setEditing({ ...editing, featured: v })} />
                  <Label>Featured</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Label>Sort</Label>
                  <Input type="number" className="w-20" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-2 sticky bottom-0 bg-background">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save} className="gap-2"><Save size={14} /> Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorksManager;
