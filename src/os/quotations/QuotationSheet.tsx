import officialLogo from "@/assets/ikamba-logo-official.png";
import { fmtRWF } from "@/os/mock/data";
import { Q_STATUS_LABEL, type QItem } from "@/os/quotations/types";
import EditableText from "@/os/quotations/EditableText";

const NAVY = "#0C2C47";
const GOLD = "#D4A739";
const SOFT_GOLD = "#FDF5E3";

const formatDate = (d?: string) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase();
  } catch { return d; }
};

type SheetProps = {
  q: any;
  items: QItem[];
  editable?: boolean;
  onUpdate?: (patch: any) => void;
  onUpdateItem?: (idx: number, patch: Partial<QItem>) => void;
};

const E = (props: any) => <EditableText {...props} />;

/**
 * Re-usable iKAMBA quotation template (Standard, branded).
 * Used by QuotationPreview and as a CanvasEditor background — fully editable
 * inline when `editable` is true.
 */
export const QuotationSheet = ({ q, items, editable, onUpdate, onUpdateItem }: SheetProps) => {
  const allItems = (items || []).filter((i) => i.included);
  const set = (k: string) => (v: string) => onUpdate?.({ [k]: v });
  const setItem = (origIdx: number, k: keyof QItem) => (v: string) => {
    if (!onUpdateItem) return;
    if (k === "quantity" || k === "unit_price") onUpdateItem(origIdx, { [k]: Number(v) || 0 } as any);
    else onUpdateItem(origIdx, { [k]: v } as any);
  };

  return (
    <div className="qtn bg-white p-10" style={{ fontFamily: "'Poppins', 'Plus Jakarta Sans', sans-serif", color: "#1a1a1a" }}>
      <h1 className="text-center text-3xl font-extrabold tracking-wide mb-8" style={{ color: GOLD }}>Quotation</h1>

      <div className="flex items-start justify-between mb-8">
        <img src={officialLogo} alt="iKAMBA" className="h-20 w-auto object-contain" />
        <div className="text-right">
          <div className="grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-sm">
            <span className="text-slate-500">Quotation #</span><span className="font-bold" style={{ color: NAVY }}>{q.quotation_number}</span>
            <span className="text-slate-500">Quotation Date</span><span className="font-bold" style={{ color: NAVY }}>{formatDate(q.quotation_date)}</span>
            {q.valid_until && <><span className="text-slate-500">Valid Until</span><span className="font-bold" style={{ color: NAVY }}>{formatDate(q.valid_until)}</span></>}
            <span className="text-slate-500">Status</span><span className="font-bold uppercase tracking-wide" style={{ color: GOLD }}>{Q_STATUS_LABEL[q.status as keyof typeof Q_STATUS_LABEL]}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-6">
        <div className="rounded-md p-4" style={{ background: SOFT_GOLD }}>
          <h3 className="font-extrabold mb-3 text-base" style={{ color: GOLD }}>Quotation by</h3>
          <div className="space-y-1 text-sm">
            <div className="font-bold" style={{ color: NAVY }}><E value={q.company_name} editable={editable} onChange={set("company_name")} placeholder="Company name" /></div>
            <div><E value={q.company_address} editable={editable} onChange={set("company_address")} placeholder="Address" /></div>
            <div><E value={q.company_email} editable={editable} onChange={set("company_email")} placeholder="email@company" /> {q.company_phone && "· "}<E value={q.company_phone} editable={editable} onChange={set("company_phone")} placeholder="phone" /></div>
            <div><span className="inline-block w-16 text-xs font-bold text-slate-500 uppercase">TIN/RDB</span><E value={q.company_tin} editable={editable} onChange={set("company_tin")} placeholder="—" /></div>
          </div>
        </div>
        <div className="rounded-md p-4" style={{ background: SOFT_GOLD }}>
          <h3 className="font-extrabold mb-3 text-base" style={{ color: GOLD }}>Quotation to</h3>
          <div className="space-y-1 text-sm">
            <div className="font-bold" style={{ color: NAVY }}><E value={q.client_name} editable={editable} onChange={set("client_name")} placeholder="Client name" /></div>
            <div><E value={q.client_contact_person} editable={editable} onChange={set("client_contact_person")} placeholder="Contact person" /></div>
            <div><E value={q.client_email} editable={editable} onChange={set("client_email")} placeholder="email" /> {q.client_phone && "· "}<E value={q.client_phone} editable={editable} onChange={set("client_phone")} placeholder="phone" /></div>
            <div><E value={q.client_address} editable={editable} onChange={set("client_address")} placeholder="Address" /></div>
            <div><span className="inline-block w-16 text-xs font-bold text-slate-500 uppercase">TYPE</span><E value={q.client_type} editable={editable} onChange={set("client_type")} /></div>
          </div>
        </div>
      </div>

      <div className="flex justify-between text-sm mb-6 px-2">
        <div><span className="text-slate-500">Project</span> <span className="font-bold ml-3" style={{ color: NAVY }}><E value={q.project_name} editable={editable} onChange={set("project_name")} placeholder="Project name" /></span></div>
        <div><span className="text-slate-500">Location</span> <span className="font-bold ml-3" style={{ color: NAVY }}><E value={q.location || "Rwanda"} editable={editable} onChange={set("location")} /></span></div>
      </div>

      <table className="w-full text-sm border-collapse mb-6">
        <thead>
          <tr style={{ background: GOLD, color: "#FFFFFF" }}>
            <th className="text-left p-3 font-bold rounded-l-md">Item # / Item description</th>
            <th className="text-right p-3 font-bold w-16">Qty.</th>
            <th className="text-right p-3 font-bold w-28">Rate</th>
            <th className="text-right p-3 font-bold w-32 rounded-r-md">Amount</th>
          </tr>
        </thead>
        <tbody>
          {allItems.map((it, i) => {
            const origIdx = (items || []).indexOf(it);
            return (
              <tr key={i} style={i % 2 === 1 ? { background: SOFT_GOLD } : undefined}>
                <td className="p-3 align-top">
                  <span className="font-semibold">{i + 1}. <E value={it.name} editable={editable} onChange={setItem(origIdx, "name")} placeholder="Item name" /></span>
                  <div className="text-xs text-slate-600 mt-0.5"><E value={it.description} editable={editable} onChange={setItem(origIdx, "description")} placeholder={editable ? "Description (optional)" : ""} /></div>
                </td>
                <td className="p-3 text-right align-top"><E value={it.quantity} editable={editable} onChange={setItem(origIdx, "quantity")} /></td>
                <td className="p-3 text-right align-top"><E value={editable ? it.unit_price : fmtRWF(it.unit_price)} editable={editable} onChange={setItem(origIdx, "unit_price")} /></td>
                <td className="p-3 text-right align-top font-semibold">{fmtRWF(it.quantity * it.unit_price)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="font-extrabold mb-3" style={{ color: GOLD }}>Terms and Conditions</h3>
          <pre className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-700"><E value={q.terms} editable={editable} multiline onChange={set("terms")} placeholder={editable ? "Terms…" : ""} /></pre>
          <div className="mt-5">
            <h3 className="font-extrabold mb-2" style={{ color: GOLD }}>Additional Notes</h3>
            <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap"><E value={q.notes} editable={editable} multiline onChange={set("notes")} placeholder={editable ? "Notes…" : ""} /></p>
          </div>
        </div>
        <div>
          <div className="space-y-3">
            <Row label="Sub Total" value={fmtRWF(q.subtotal)} />
            {q.discount_amount > 0 && <Row label={`Discount${q.discount_percent ? ` (${q.discount_percent}%)` : ""}`} value={"− " + fmtRWF(q.discount_amount)} accent="#16a34a" labelAccent />}
            {q.tax_amount > 0 && <Row label={`Tax (${q.tax_percent}%)`} value={fmtRWF(q.tax_amount)} />}
            <div className="border-t pt-3 mt-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-light">Total</span>
                <span className="text-2xl font-extrabold" style={{ color: NAVY }}>{fmtRWF(q.total_amount)}</span>
              </div>
            </div>
            {q.amount_in_words && (
              <div className="border-t pt-3">
                <div className="text-xs text-slate-500 mb-1">Invoice Total (in words)</div>
                <div className="text-sm font-bold" style={{ color: NAVY }}>{q.amount_in_words}</div>
              </div>
            )}
            {q.advance_amount > 0 && <Row label={`Advance (${q.advance_percent}%)`} value={fmtRWF(q.advance_amount)} />}
            {q.balance_amount > 0 && <Row label="Balance Due" value={fmtRWF(q.balance_amount)} />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 pt-6 mt-6 border-t border-slate-200">
        <div className="text-sm text-slate-700 leading-relaxed">
          For any enquiries, email us on{" "}
          <span className="font-bold" style={{ color: NAVY }}>{q.company_email || "ikambaempireltd@gmail.com"}</span>
          {q.company_phone && <> or call us on <span className="font-bold" style={{ color: NAVY }}>{q.company_phone}</span></>}
        </div>
        <div className="text-right">
          <div className="h-14" />
          <div className="text-sm font-semibold text-slate-700"><E value={q.prepared_by_name || "iKAMBA Empire Ltd"} editable={editable} onChange={set("prepared_by_name")} /></div>
          <div className="text-xs text-slate-500">Authorized Signature</div>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, accent, labelAccent }: { label: string; value: string; accent?: string; labelAccent?: boolean }) => (
  <div className="flex items-baseline justify-between">
    <span className="text-base" style={labelAccent && accent ? { color: accent, fontWeight: 600 } : {}}>{label}</span>
    <span className="text-base font-bold" style={accent ? { color: accent } : { color: NAVY }}>{value}</span>
  </div>
);

export default QuotationSheet;
