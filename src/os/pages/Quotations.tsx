import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Badge, OSButton } from "@/os/components/ui";
import { fmtRWF } from "@/os/mock/data";
import { Plus, FileText, Eye, Pencil, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Q_STATUS_LABEL, Q_STATUS_TONE, type Quotation, type QStatus } from "@/os/quotations/types";

const Quotations = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | QStatus>("all");

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("os_quotations").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const duplicate = async (q: Quotation) => {
    const { data: full } = await (supabase as any).from("os_quotations").select("*").eq("id", q.id).single();
    if (!full) return;
    const { id, quotation_number, created_at, updated_at, ...rest } = full;
    const { data: created, error } = await (supabase as any)
      .from("os_quotations").insert({ ...rest, status: "draft" }).select("id").single();
    if (error) return toast.error(error.message);
    // Copy items + costs
    const [{ data: items }, { data: costs }] = await Promise.all([
      (supabase as any).from("os_quotation_items").select("*").eq("quotation_id", q.id),
      (supabase as any).from("os_quotation_costs").select("*").eq("quotation_id", q.id),
    ]);
    if (items?.length) await (supabase as any).from("os_quotation_items").insert(items.map((i: any) => ({ ...i, id: undefined, quotation_id: created.id })));
    if (costs?.length) await (supabase as any).from("os_quotation_costs").insert(costs.map((c: any) => ({ ...c, id: undefined, quotation_id: created.id })));
    toast.success("Duplicated");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this quotation? Items and costs are removed too.")) return;
    const { error } = await (supabase as any).from("os_quotations").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const visible = rows.filter(r => filter === "all" || r.status === filter);
  const isExpired = (q: Quotation) => q.valid_until && new Date(q.valid_until) < new Date() && q.status !== "converted";

  const statusCounts = (["draft","sent","approved","rejected","converted"] as QStatus[]).map(s => ({ s, n: rows.filter(r => r.status === s).length }));

  return (
    <div>
      <PageHeader
        title="Quotations"
        subtitle="Build, send and track client quotations — IK-QTN-YYYY-#### numbering."
        actions={<OSButton onClick={() => navigate("/os/quotations/new")}><Plus size={14} /> Create New Quotation</OSButton>}
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filter === "all" ? "bg-os-gold text-[hsl(var(--os-navy-deep))]" : "bg-white/5 text-os-muted hover:text-white"}`}>
          All <span className="opacity-70">({rows.length})</span>
        </button>
        {statusCounts.map(({ s, n }) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filter === s ? "bg-os-gold text-[hsl(var(--os-navy-deep))]" : "bg-white/5 text-os-muted hover:text-white"}`}>
            {Q_STATUS_LABEL[s]} <span className="opacity-70">({n})</span>
          </button>
        ))}
      </div>

      <div className="os-card rounded-xl overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-os-muted text-sm">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto text-os-muted mb-2" size={28} />
            <p className="text-os-muted text-sm mb-4">No quotations yet.</p>
            <OSButton onClick={() => navigate("/os/quotations/new")}><Plus size={14} /> Create first quotation</OSButton>
          </div>
        ) : (
          <table className="w-full text-sm min-w-[1000px]">
            <thead><tr className="text-left text-os-muted text-xs uppercase border-b border-os">
              <th className="p-3">Number</th><th className="p-3">Client</th><th className="p-3">Project</th>
              <th className="p-3">Product Line</th><th className="p-3">Total</th><th className="p-3">Status</th>
              <th className="p-3">Created</th><th className="p-3">Valid until</th><th className="p-3 text-right">Actions</th>
            </tr></thead>
            <tbody>
              {visible.map((q) => (
                <tr key={q.id} className="border-b border-os/40 hover:bg-white/[0.02]">
                  <td className="p-3 text-white font-mono text-xs">{q.quotation_number}</td>
                  <td className="p-3 text-white">{q.client_name}</td>
                  <td className="p-3 text-os-muted">{q.project_name || "—"}</td>
                  <td className="p-3 text-os-muted text-xs">{q.product_line || "—"}</td>
                  <td className="p-3 text-white font-semibold">{fmtRWF(q.total_amount || 0)}</td>
                  <td className="p-3">
                    <Badge tone={Q_STATUS_TONE[q.status]}>{Q_STATUS_LABEL[q.status]}</Badge>
                    {isExpired(q) && <span className="ml-1 text-[10px] text-rose-400">EXPIRED</span>}
                  </td>
                  <td className="p-3 text-os-muted text-xs">{new Date(q.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-os-muted text-xs">{q.valid_until || "—"}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => navigate(`/os/quotations/${q.id}/preview`)} title="Preview" className="p-1.5 text-os-muted hover:text-white"><Eye size={14} /></button>
                      <button onClick={() => navigate(`/os/quotations/${q.id}`)} title="Edit" className="p-1.5 text-os-muted hover:text-white"><Pencil size={14} /></button>
                      <button onClick={() => duplicate(q)} title="Duplicate" className="p-1.5 text-os-muted hover:text-white"><Copy size={14} /></button>
                      <button onClick={() => remove(q.id)} title="Delete" className="p-1.5 text-os-muted hover:text-rose-400"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Quotations;
