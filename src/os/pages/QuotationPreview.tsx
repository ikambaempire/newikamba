import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Printer } from "lucide-react";
import { fmtRWF } from "@/os/mock/data";
import { Q_STATUS_LABEL, type QItem, type QCost } from "@/os/quotations/types";
import officialLogo from "@/assets/ikamba-logo-official.png";

// Brand colors
const NAVY = "#0C2C47";
const GOLD = "#D4A739";
const SOFT_GOLD = "#FDF5E3"; // peach-equivalent tint of gold for highlighted rows/cards

const QuotationPreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [q, setQ] = useState<any>(null);
  const [items, setItems] = useState<QItem[]>([]);
  const [costs, setCosts] = useState<QCost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: qd }, { data: it }, { data: cs }] = await Promise.all([
        (supabase as any).from("os_quotations").select("*").eq("id", id).single(),
        (supabase as any).from("os_quotation_items").select("*").eq("quotation_id", id).order("position"),
        (supabase as any).from("os_quotation_costs").select("*").eq("quotation_id", id),
      ]);
      setQ(qd); setItems(it || []); setCosts(cs || []); setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="p-10 text-center text-slate-500">Loading…</div>;
  if (!q) return <div className="p-10 text-center text-slate-500">Quotation not found</div>;

  const allItems = items.filter(i => i.included);

  return (
    <div className="min-h-screen bg-slate-200 py-6 print:bg-white print:p-0">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { size: A4; margin: 12mm; }
          body { background: white; }
        }
        .qtn { font-family: 'Poppins', 'Plus Jakarta Sans', -apple-system, system-ui, sans-serif; color: #1a1a1a; }
        .qtn h1, .qtn h2, .qtn h3, .qtn p, .qtn div, .qtn span, .qtn td, .qtn th, .qtn li { color: #1a1a1a; }
      `}</style>

      {/* Action bar */}
      <div className="no-print max-w-[860px] mx-auto mb-3 flex items-center justify-between px-4">
        <button onClick={() => navigate(`/os/quotations/${id}`)} className="inline-flex items-center gap-1.5 text-sm text-slate-700 hover:text-slate-900">
          <ArrowLeft size={14} /> Back to builder
        </button>
        <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow" style={{ background: NAVY }}>
          <Printer size={14} /> Print / Save as PDF
        </button>
      </div>

      {/* Sheet */}
      <div className="qtn max-w-[860px] mx-auto bg-white shadow-lg print:shadow-none p-10">
        {/* Header: centered title + logo left + meta right */}
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

        {/* Quotation by / Quotation to — soft gold tinted cards */}
        <div className="grid grid-cols-2 gap-5 mb-6">
          <PartyCard title="Quotation by" data={[
            ["", q.company_name, true],
            ["", q.company_address],
            ["", [q.company_email, q.company_phone].filter(Boolean).join(" · ")],
            ["TIN/RDB", q.company_tin],
          ]} />
          <PartyCard title="Quotation to" data={[
            ["", q.client_name, true],
            ["", q.client_contact_person],
            ["", [q.client_email, q.client_phone].filter(Boolean).join(" · ")],
            ["", q.client_address],
            ["TYPE", q.client_type],
          ]} />
        </div>

        {/* Place / Country bar */}
        <div className="flex justify-between text-sm mb-6 px-2">
          <div><span className="text-slate-500">Project</span> <span className="font-bold ml-3" style={{ color: NAVY }}>{q.project_name || "—"}</span></div>
          <div><span className="text-slate-500">Location</span> <span className="font-bold ml-3" style={{ color: NAVY }}>{q.location || "Rwanda"}</span></div>
        </div>

        {/* Items table */}
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
            {allItems.map((it, i) => (
              <tr key={i} style={i % 2 === 1 ? { background: SOFT_GOLD } : undefined}>
                <td className="p-3 align-top">
                  <span className="font-semibold">{i + 1}. {it.name}</span>
                  {it.description && <div className="text-xs text-slate-600 mt-0.5">{it.description}</div>}
                </td>
                <td className="p-3 text-right align-top">{it.quantity}</td>
                <td className="p-3 text-right align-top">{fmtRWF(it.unit_price)}</td>
                <td className="p-3 text-right align-top font-semibold">{fmtRWF(it.quantity * it.unit_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Terms (left) + Totals (right) */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            {q.terms && (
              <>
                <h3 className="font-extrabold mb-3" style={{ color: GOLD }}>Terms and Conditions</h3>
                <pre className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-700">{q.terms}</pre>
              </>
            )}
            {q.notes && (
              <div className="mt-5">
                <h3 className="font-extrabold mb-2" style={{ color: GOLD }}>Additional Notes</h3>
                <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">{q.notes}</p>
              </div>
            )}
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

        {/* Footer: contact info + signature */}
        <div className="grid grid-cols-2 gap-8 pt-6 mt-6 border-t border-slate-200">
          <div className="text-sm text-slate-700 leading-relaxed">
            For any enquiries, email us on{" "}
            <span className="font-bold" style={{ color: NAVY }}>{q.company_email || "ikambaempireltd@gmail.com"}</span>
            {q.company_phone && <> or call us on <span className="font-bold" style={{ color: NAVY }}>{q.company_phone}</span></>}
          </div>
          <div className="text-right">
            <div className="h-14" />
            <div className="text-sm font-semibold text-slate-700">{q.prepared_by_name || "iKAMBA Empire Ltd"}</div>
            <div className="text-xs text-slate-500">Authorized Signature</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatDate = (d?: string) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase();
  } catch { return d; }
};

const PartyCard = ({ title, data }: { title: string; data: [string, any, boolean?][] }) => (
  <div className="rounded-md p-4" style={{ background: SOFT_GOLD }}>
    <h3 className="font-extrabold mb-3 text-base" style={{ color: GOLD }}>{title}</h3>
    <div className="space-y-1 text-sm">
      {data.filter(([, v]) => v).map(([label, value, bold], i) => (
        <div key={i} className={bold ? "font-bold" : ""} style={bold ? { color: NAVY } : {}}>
          {label && <span className="inline-block w-16 text-xs font-bold text-slate-500 uppercase">{label}</span>}
          <span>{value}</span>
        </div>
      ))}
    </div>
  </div>
);

const Row = ({ label, value, accent, labelAccent }: { label: string; value: string; accent?: string; labelAccent?: boolean }) => (
  <div className="flex items-baseline justify-between">
    <span className="text-base" style={labelAccent && accent ? { color: accent, fontWeight: 600 } : {}}>{label}</span>
    <span className="text-base font-bold" style={accent ? { color: accent } : { color: NAVY }}>{value}</span>
  </div>
);

export default QuotationPreview;
