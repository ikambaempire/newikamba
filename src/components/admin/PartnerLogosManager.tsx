import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Upload } from "lucide-react";

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  visible: boolean;
  sort_order: number;
}

const PartnerLogosManager = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newWebsite, setNewWebsite] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("partner_logos").select("*").order("sort_order").order("created_at");
    setPartners(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const onAdd = async (file: File) => {
    if (!newName.trim()) return toast.error("Enter a partner name first");
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${newName.toLowerCase().replace(/[^a-z0-9]/g, "-")}.${ext}`;
    const { error: uErr } = await supabase.storage.from("partner-logos").upload(path, file);
    if (uErr) { setUploading(false); return toast.error(uErr.message); }
    const { data: pub } = supabase.storage.from("partner-logos").getPublicUrl(path);
    const { error } = await (supabase as any).from("partner_logos").insert({
      name: newName.trim(), logo_url: pub.publicUrl, website_url: newWebsite.trim() || null,
      sort_order: partners.length,
    });
    setUploading(false);
    if (error) return toast.error(error.message);
    toast.success("Partner added"); setNewName(""); setNewWebsite(""); load();
  };

  const toggleVisible = async (p: Partner) => {
    const { error } = await (supabase as any).from("partner_logos").update({ visible: !p.visible }).eq("id", p.id);
    if (error) return toast.error(error.message);
    load();
  };

  const remove = async (p: Partner) => {
    if (!confirm(`Remove ${p.name}?`)) return;
    const { error } = await (supabase as any).from("partner_logos").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Removed"); load();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <h3 className="font-semibold">Add new partner</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input placeholder="Partner name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Input placeholder="Website (optional)" value={newWebsite} onChange={(e) => setNewWebsite(e.target.value)} />
        </div>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && onAdd(e.target.files[0])} />
          <Button asChild disabled={uploading}><span><Upload className="mr-2 h-4 w-4" />{uploading ? "Uploading..." : "Upload logo & add"}</span></Button>
        </label>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="p-4 border-b border-border font-semibold">Current partners ({partners.length})</div>
        {loading ? <div className="p-6 text-sm text-muted-foreground">Loading…</div> :
          partners.length === 0 ? <div className="p-6 text-sm text-muted-foreground">No partners yet.</div> :
            <div className="divide-y divide-border">
              {partners.map((p) => (
                <div key={p.id} className="flex items-center gap-4 p-4">
                  <img src={p.logo_url} alt={p.name} className="h-12 w-24 object-contain bg-muted/30 rounded" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{p.name}</div>
                    {p.website_url && <div className="text-xs text-muted-foreground truncate">{p.website_url}</div>}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span>{p.visible ? "Visible" : "Hidden"}</span>
                    <Switch checked={p.visible} onCheckedChange={() => toggleVisible(p)} />
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => remove(p)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>}
      </div>
    </div>
  );
};

export default PartnerLogosManager;
