import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getProfile, hasAdminRole } from "@/os/access";
import { PageHeader, Badge, OSButton, Field, Input, Select, Textarea, Modal } from "@/os/components/ui";
import { fmtRWF } from "@/os/mock/data";
import { Plus, Receipt, Check, X, Trash2, Shield, Upload, Pencil, FileText, Image as ImageIcon } from "lucide-react";
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
  receipt_url: string | null; // storage path inside expense-receipts bucket, OR external URL
  status: Status;
  admin_notes: string | null;
  decided_at: string | null;
  created_at: string;
};

const CATEGORIES = [
  "Travel / Transport", "Meals", "Equipment", "Software / Subscription",
  "Office supplies", "Accommodation", "Internet / Data", "Training", "Other",
];

const statusTone: Record<Status, "amber" | "green" | "red"> = {
  pending: "amber", approved: "green", rejected: "red",
};

const BUCKET = "expense-receipts";
const isStoragePath = (s?: string | null) => !!s && !/^https?:\/\//i.test(s);

const Expenses = () => {
  const { user, roles, profile } = useAuth();
  const isAdmin = hasAdminRole(roles);
  const [rows, setRows] = useState<ExpenseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [reviewing, setReviewing] = useState<ExpenseRequest | null>(null);
  const [editing, setEditing] = useState<ExpenseRequest | null>(null);
  const [tab, setTab] = useState<"all" | Status>("all");

  const requesterName = useMemo(() => {
    if (!user) return "";
    const p = getProfile(user.id);
    return p?.fullName || profile?.full_name || user.email || "";
  }, [user, profile?.full_name]);

  const reload = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("os_expense_requests").select("*").order("created_at", { ascending: false });
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
        subtitle={isAdmin ? "Review reimbursements, view proof of payment, approve or reject." : "Submit reimbursements, attach proof, edit while pending."}
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
          <p className="text-os-muted text-sm mt-1">{isAdmin ? "Team requests will appear here." : "Submit your first expense request."}</p>
        </div>
      ) : (
        <div className="os-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead className="bg-white/5">
                <tr className="text-left text-os-muted text-xs uppercase tracking-wider">
                  <th className="p-3">Date</th>
                  {isAdmin && <th className="p-3">Requester</th>}
                  <th className="p-3">Category</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3">Proof</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 w-40" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const isMine = r.user_id === user?.id;
                  const canEdit = isMine && r.status === "pending";
                  return (
                    <tr key={r.id} className="border-t border-os/50 hover:bg-white/5">
                      <td className="p-3 text-os-muted whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</td>
                      {isAdmin && <td className="p-3 text-white">{r.requester_name}</td>}
                      <td className="p-3 text-os-muted">{r.category}</td>
                      <td className="p-3 text-white max-w-[260px] truncate" title={r.description}>{r.description}</td>
                      <td className="p-3 text-white font-semibold text-right whitespace-nowrap">{fmtRWF(Number(r.amount))}</td>
                      <td className="p-3">
                        {r.receipt_url
                          ? <Badge tone="gold"><FileText size={10} className="inline mr-1" /> Attached</Badge>
                          : <span className="text-os-muted text-xs">—</span>}
                      </td>
                      <td className="p-3"><Badge tone={statusTone[r.status]}>{r.status}</Badge></td>
                      <td className="p-3 text-right whitespace-nowrap">
                        {canEdit && (
                          <button onClick={() => setEditing(r)} className="text-os-muted text-xs font-semibold hover:text-white mr-3">
                            <Pencil size={12} className="inline" /> Edit
                          </button>
                        )}
                        <button onClick={() => setReviewing(r)} className="text-os-gold text-xs font-semibold hover:underline">
                          {isAdmin && r.status === "pending" ? "Review" : "Open"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showNew && user && (
        <RequestFormModal
          mode="new" userId={user.id} requesterName={requesterName}
          onClose={() => setShowNew(false)}
          onSaved={() => { setShowNew(false); reload(); }}
        />
      )}
      {editing && user && (
        <RequestFormModal
          mode="edit" userId={user.id} requesterName={requesterName} existing={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload(); }}
        />
      )}
      {reviewing && (
        <ReviewModal
          row={reviewing} isAdmin={isAdmin} currentUserId={user?.id || ""}
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

const RequestFormModal = ({
  mode, userId, requesterName, existing, onClose, onSaved,
}: {
  mode: "new" | "edit"; userId: string; requesterName: string;
  existing?: ExpenseRequest; onClose: () => void; onSaved: () => void;
}) => {
  const [category, setCategory] = useState(existing?.category || CATEGORIES[0]);
  const [description, setDescription] = useState(existing?.description || "");
  const [amount, setAmount] = useState(existing ? String(existing.amount) : "");
  const [neededBy, setNeededBy] = useState(existing?.needed_by || "");
  const [receiptPath, setReceiptPath] = useState<string | null>(existing?.receipt_url || null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadIfNeeded = async (): Promise<string | null> => {
    if (!file) return receiptPath;
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600", upsert: false, contentType: file.type || undefined,
    });
    if (error) { toast.error("Upload failed", { description: error.message }); return null; }
    return path;
  };

  const submit = async () => {
    if (!description.trim()) return toast.error("Please describe the expense.");
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount.");
    setSaving(true);
    const finalPath = await uploadIfNeeded();
    if (file && !finalPath) { setSaving(false); return; }

    if (mode === "new") {
      const { error } = await supabase.from("os_expense_requests").insert({
        user_id: userId, requester_name: requesterName,
        category, description: description.trim(), amount: amt,
        needed_by: neededBy || null, receipt_url: finalPath,
      });
      if (error) { setSaving(false); return toast.error("Could not submit", { description: error.message }); }
      toast.success("Request submitted");
    } else if (existing) {
      const { error } = await supabase.from("os_expense_requests").update({
        category, description: description.trim(), amount: amt,
        needed_by: neededBy || null, receipt_url: finalPath,
      }).eq("id", existing.id);
      if (error) { setSaving(false); return toast.error("Could not update", { description: error.message }); }
      toast.success("Request updated");
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Modal open onClose={onClose} title={mode === "new" ? "New expense request" : "Edit request"}>
      <div className="space-y-3">
        <Field label="Category" required>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="What's the expense for?" required>
          <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Uber to client meeting" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount (RWF)" required>
            <Input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
          </Field>
          <Field label="Needed by">
            <Input type="date" value={neededBy} onChange={(e) => setNeededBy(e.target.value)} />
          </Field>
        </div>

        <Field label="Proof of payment / receipt (image or PDF)">
          <div className="space-y-2">
            <input
              ref={fileRef} type="file" accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden"
            />
            <div className="flex items-center gap-2">
              <OSButton variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload size={14} /> {file ? "Replace file" : (receiptPath ? "Replace existing" : "Upload file")}
              </OSButton>
              {file && <span className="text-os-muted text-xs truncate">{file.name}</span>}
              {!file && receiptPath && <span className="text-os-muted text-xs">Existing proof attached</span>}
            </div>
          </div>
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <OSButton variant="outline" onClick={onClose}>Cancel</OSButton>
          <OSButton variant="primary" onClick={submit} disabled={saving}>
            {saving ? "Saving…" : (mode === "new" ? "Submit request" : "Save changes")}
          </OSButton>
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
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const canDelete = isAdmin || (row.user_id === currentUserId && row.status === "pending");

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!row.receipt_url) return;
      if (!isStoragePath(row.receipt_url)) { setProofUrl(row.receipt_url); return; }
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(row.receipt_url, 3600);
      if (!cancel && !error && data?.signedUrl) setProofUrl(data.signedUrl);
    })();
    return () => { cancel = true; };
  }, [row.receipt_url]);

  const decide = async (status: Status) => {
    setBusy(true);
    const { error } = await supabase.from("os_expense_requests").update({
      status, admin_notes: adminNotes.trim() || null,
      decided_by: currentUserId || null, decided_at: new Date().toISOString(),
    }).eq("id", row.id);
    setBusy(false);
    if (error) return toast.error("Could not update", { description: error.message });
    try {
      const { notify } = await import("@/os/notifications");
      await notify(
        row.user_id,
        status === "approved" ? "Expense request approved ✅" : "Expense request rejected ❌",
        `${row.category} — ${row.description.slice(0, 80)}${adminNotes.trim() ? ` · Note: ${adminNotes.trim()}` : ""}`,
        status === "approved" ? "success" : "error",
        "/os/expenses",
      );
    } catch (e) { console.error(e); }
    toast.success(`Request ${status}`);
    onChanged();
  };

  const remove = async () => {
    if (!confirm("Delete this request?")) return;
    setBusy(true);
    // best-effort cleanup of stored file
    if (row.receipt_url && isStoragePath(row.receipt_url)) {
      await supabase.storage.from(BUCKET).remove([row.receipt_url]);
    }
    const { error } = await supabase.from("os_expense_requests").delete().eq("id", row.id);
    setBusy(false);
    if (error) return toast.error("Could not delete", { description: error.message });
    toast.success("Deleted");
    onChanged();
  };

  const isImage = proofUrl && /\.(png|jpe?g|webp|gif|heic)(\?|$)/i.test(proofUrl);

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

        <div>
          <div className="text-os-muted text-xs uppercase tracking-wider mb-1">Proof of payment</div>
          {!row.receipt_url && <div className="text-os-muted">— no proof attached —</div>}
          {row.receipt_url && !proofUrl && <div className="text-os-muted">Loading proof…</div>}
          {proofUrl && isImage && (
            <a href={proofUrl} target="_blank" rel="noreferrer" className="block">
              <img src={proofUrl} alt="Receipt proof" className="rounded-lg max-h-64 border border-os" />
            </a>
          )}
          {proofUrl && !isImage && (
            <a href={proofUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 text-os-gold hover:underline">
              <FileText size={14} /> Open attachment
            </a>
          )}
        </div>

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
              <OSButton variant="outline" onClick={() => decide("rejected")} disabled={busy}><X size={14} /> Reject</OSButton>
              <OSButton variant="primary" onClick={() => decide("approved")} disabled={busy}><Check size={14} /> Approve</OSButton>
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
