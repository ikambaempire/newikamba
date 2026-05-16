import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getProfile } from "@/os/access";
import { PageHeader, Badge, OSButton, Field, Input, Select, Textarea, Modal } from "@/os/components/ui";
import { fmtRWF } from "@/os/mock/data";
import { Plus, Receipt, Check, X, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";

type Status = "pending" | "approved" | "rejected";
type ExpenseRequest = {
  id: string;
  user_id: string;
  requester_name: string;
  category: string;
  description: string;
  amount: number;
  needed_by: string | null;
  receipt_url: string | null;
  status: Status;
  admin_notes: string | null;
  decided_at: string | null;
  created_at: string;
};

const CATEGORIES = [
  "Travel / Transport",
  "Meals",
  "Equipment",
  "Software / Subscription",
  "Office supplies",
  "Accommodation",
  "Internet / Data",
  "Training",
  "Other",
];

const statusTone: Record<Status, "amber" | "green" | "red"> = {
  pending: "amber",
  approved: "green",
  rejected: "red",
};

const Expenses = () => {
  const { user, roles, profile } = useAuth();
  const isAdmin = roles.includes("super_admin");
  const [rows, setRows] = useState<ExpenseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [reviewing, setReviewing] = useState<ExpenseRequest | null>(null);
  const [tab, setTab] = useState<"all" | Status>("all");

  const requesterName = useMemo(() => {
    if (!user) return "";
    const p = getProfile(user.id);
    return p?.fullName || profile?.full_name || user.email || "";
  }, [user, profile?.full_name]);

  const reload = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("os_expense_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Could not load requests", { description: error.message });
    setRows((data as ExpenseRequest[]) || []);
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  const filtered = rows.filter((r) => (tab === "all" ? true : r.status === tab));

  const totals = useMemo(() => {
    const pending = rows.filter((r) => r.status === "pending");
    const approved = rows.filter((r) => r.status === "approved");
    return {
      pendingCount: pending.length,
      pendingAmount: pending.reduce((s, r) => s + Number(r.amount), 0),
      approvedAmount: approved.reduce((s, r) => s + Number(r.amount), 0),
    };
  }, [rows]);

  return (
    <div>
      <PageHeader
        title="Expense Requests"
        subtitle={isAdmin
          ? "Review and approve reimbursement and side-expense requests from the team."
          : "Submit reimbursements and side expenses for admin approval."}
        actions={
          <>
            {isAdmin && <Badge tone="gold"><Shield size={10} className="inline mr-1" /> Admin view</Badge>}
            <OSButton variant="primary" onClick={() => setShowNew(true)}><Plus size={16} /> New Request</OSButton>
          </>
        }
      />

      <div className="grid grid-cols-3 gap-3 mb-6">
        <KPI label="Pending" value={totals.pendingCount} hint={fmtRWF(totals.pendingAmount)} />
        <KPI label="Approved (total)" value={fmtRWF(totals.approvedAmount)} />
        <KPI label="All requests" value={rows.length} />
      </div>

      <div className="flex gap-1 border-b border-os mb-4">
        {(["all", "pending", "approved", "rejected"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-semibold capitalize border-b-2 ${tab === t ? "border-[hsl(var(--os-gold))] text-white" : "border-transparent text-os-muted hover:text-white"}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-os-muted text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="os-card rounded-xl p-10 text-center">
          <Receipt className="mx-auto text-os-muted mb-3" size={28} />
          <p className="text-white font-semibold">No requests yet</p>
          <p className="text-os-muted text-sm mt-1">{isAdmin ? "Team requests will appear here." : "Submit your first expense request to get started."}</p>
        </div>
      ) : (
        <div className="os-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-white/5">
                <tr className="text-left text-os-muted text-xs uppercase tracking-wider">
                  <th className="p-3">Date</th>
                  {isAdmin && <th className="p-3">Requester</th>}
                  <th className="p-3">Category</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3">Needed by</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 w-24" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-os/50 hover:bg-white/5">
                    <td className="p-3 text-os-muted whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</td>
                    {isAdmin && <td className="p-3 text-white">{r.requester_name}</td>}
                    <td className="p-3 text-os-muted">{r.category}</td>
                    <td className="p-3 text-white max-w-[280px] truncate" title={r.description}>{r.description}</td>
                    <td className="p-3 text-white font-semibold text-right whitespace-nowrap">{fmtRWF(Number(r.amount))}</td>
                    <td className="p-3 text-os-muted whitespace-nowrap">{r.needed_by || "—"}</td>
                    <td className="p-3"><Badge tone={statusTone[r.status]}>{r.status}</Badge></td>
                    <td className="p-3 text-right">
                      <button onClick={() => setReviewing(r)} className="text-os-gold text-xs font-semibold hover:underline">
                        {isAdmin && r.status === "pending" ? "Review" : "Open"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showNew && user && (
        <NewRequestModal
          userId={user.id}
          requesterName={requesterName}
          onClose={() => setShowNew(false)}
          onCreated={() => { setShowNew(false); reload(); }}
        />
      )}

      {reviewing && (
        <ReviewModal
          row={reviewing}
          isAdmin={isAdmin}
          currentUserId={user?.id || ""}
          onClose={() => setReviewing(null)}
          onChanged={() => { setReviewing(null); reload(); }}
        />
      )}
    </div>
  );
};

const KPI = ({ label, value, hint }: { label: string; value: string | number; hint?: string }) => (
  <div className="os-card rounded-xl p-4">
    <div className="text-[11px] uppercase tracking-wider text-os-muted font-medium">{label}</div>
    <div className="mt-1.5 text-xl font-bold text-white">{value}</div>
    {hint && <div className="text-xs text-os-muted mt-1">{hint}</div>}
  </div>
);

const NewRequestModal = ({ userId, requesterName, onClose, onCreated }: {
  userId: string; requesterName: string; onClose: () => void; onCreated: () => void;
}) => {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [neededBy, setNeededBy] = useState("");
  const [receipt, setReceipt] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!description.trim()) return toast.error("Please describe the expense.");
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount.");
    setSaving(true);
    const { error } = await supabase.from("os_expense_requests").insert({
      user_id: userId,
      requester_name: requesterName,
      category,
      description: description.trim(),
      amount: amt,
      needed_by: neededBy || null,
      receipt_url: receipt.trim() || null,
    });
    setSaving(false);
    if (error) return toast.error("Could not submit", { description: error.message });
    toast.success("Request submitted");
    onCreated();
  };

  return (
    <Modal open onClose={onClose} title="New expense request">
      <div className="space-y-3">
        <Field label="Category" required>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="What's the expense for?" required>
          <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Uber to client meeting at BK HQ" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount (RWF)" required>
            <Input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
          </Field>
          <Field label="Needed by">
            <Input type="date" value={neededBy} onChange={(e) => setNeededBy(e.target.value)} />
          </Field>
        </div>
        <Field label="Receipt link (optional)">
          <Input value={receipt} onChange={(e) => setReceipt(e.target.value)} placeholder="https://…" />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <OSButton variant="outline" onClick={onClose}>Cancel</OSButton>
          <OSButton variant="primary" onClick={submit} disabled={saving}>{saving ? "Submitting…" : "Submit request"}</OSButton>
        </div>
      </div>
    </Modal>
  );
};

const ReviewModal = ({ row, isAdmin, currentUserId, onClose, onChanged }: {
  row: ExpenseRequest; isAdmin: boolean; currentUserId: string; onClose: () => void; onChanged: () => void;
}) => {
  const [adminNotes, setAdminNotes] = useState(row.admin_notes || "");
  const [busy, setBusy] = useState(false);
  const canDelete = isAdmin || (row.user_id === currentUserId && row.status === "pending");

  const decide = async (status: Status) => {
    setBusy(true);
    const { error } = await supabase
      .from("os_expense_requests")
      .update({
        status,
        admin_notes: adminNotes.trim() || null,
        decided_by: currentUserId || null,
        decided_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    setBusy(false);
    if (error) return toast.error("Could not update", { description: error.message });
    toast.success(`Request ${status}`);
    onChanged();
  };

  const remove = async () => {
    if (!confirm("Delete this request?")) return;
    setBusy(true);
    const { error } = await supabase.from("os_expense_requests").delete().eq("id", row.id);
    setBusy(false);
    if (error) return toast.error("Could not delete", { description: error.message });
    toast.success("Deleted");
    onChanged();
  };

  return (
    <Modal open onClose={onClose} title={`Request from ${row.requester_name}`}>
      <div className="space-y-3 text-sm">
        <Row k="Category" v={row.category} />
        <Row k="Amount" v={<span className="text-white font-bold">{fmtRWF(Number(row.amount))}</span>} />
        <Row k="Needed by" v={row.needed_by || "—"} />
        <Row k="Status" v={<Badge tone={statusTone[row.status]}>{row.status}</Badge>} />
        <div>
          <div className="text-os-muted text-xs uppercase tracking-wider mb-1">Description</div>
          <div className="text-white bg-white/5 rounded-lg p-3 whitespace-pre-wrap">{row.description}</div>
        </div>
        {row.receipt_url && (
          <Row k="Receipt" v={<a href={row.receipt_url} target="_blank" rel="noreferrer" className="text-os-gold hover:underline">Open link</a>} />
        )}
        {(isAdmin || row.admin_notes) && (
          <Field label="Admin notes">
            {isAdmin && row.status === "pending" ? (
              <Textarea rows={2} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Optional note to requester" />
            ) : (
              <div className="text-white bg-white/5 rounded-lg p-3">{row.admin_notes || "—"}</div>
            )}
          </Field>
        )}

        <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-os">
          {canDelete && (
            <OSButton variant="ghost" onClick={remove} disabled={busy} className="text-rose-300 hover:text-rose-200">
              <Trash2 size={14} /> Delete
            </OSButton>
          )}
          {isAdmin && row.status === "pending" && (
            <>
              <OSButton variant="outline" onClick={() => decide("rejected")} disabled={busy}>
                <X size={14} /> Reject
              </OSButton>
              <OSButton variant="primary" onClick={() => decide("approved")} disabled={busy}>
                <Check size={14} /> Approve
              </OSButton>
            </>
          )}
          {(!isAdmin || row.status !== "pending") && <OSButton variant="outline" onClick={onClose}>Close</OSButton>}
        </div>
      </div>
    </Modal>
  );
};

const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div className="flex justify-between gap-3">
    <span className="text-os-muted">{k}</span>
    <span className="text-white text-right">{v}</span>
  </div>
);

export default Expenses;
