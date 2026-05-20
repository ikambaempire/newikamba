import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Printer } from "lucide-react";
import { fmtRWF } from "@/os/mock/data";
import { Q_STATUS_LABEL, type QItem, type QCost } from "@/os/quotations/types";
import officialLogo from "@/assets/ikamba-logo-official.png";

// Brand-locked print preview. Uses Midnight Blue #0C2C47 + Warm Gold #D4A739
// Routed outside OSLayout so the print sheet is clean (no sidebar).
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

  const deliverables = items.filter(i => i.kind === "deliverable" && i.included);
  const addons = items.filter(i => i.kind === "addon" && i.included);

  const NAVY = "#0C2C47";
  const GOLD = "#D4A739";

  return (
    <div className="min-h-screen bg-slate-200 py-6 print:bg-white print:p-0">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { size: A4; margin: 14mm; }
          body { background: white; }
        }
        .qtn-sheet { font-family: 'Poppins', 'Plus Jakarta Sans', -apple-system, system-ui, sans-serif; color: #111111; }
        .qtn-sheet p, .qtn-sheet div, .qtn-sheet span, .qtn-sheet td, .qtn-sheet th, .qtn-sheet pre { color: #111111; }
      `}</style>

      <div className="no-print max-w-[820px] mx-auto mb-3 flex items-center justify-between px-4">
        <button onClick={() => navigate(`/os/quotations/${id}`)} className="inline-flex items-center gap-1.5 text-sm text-slate-700 hover:text-slate-900">
          <ArrowLeft size={14} /> Back to builder
        </button>
        <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow" style={{ background: NAVY }}>
          <Printer size={14} /> Print / Save as PDF
        </button>
      </div>

      <div className="qtn-sheet max-w-[820px] mx-auto bg-white shadow-lg print:shadow-none">
        {/* Header */}
        <div className="px-10 py-8 flex items-start justify-between border-b-4" style={{ borderColor: GOLD }}>
          <div className="flex items-center gap-3">
            <img src={officialLogo} alt="iKAMBA" className="h-16 w-48 object-contain object-left" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold uppercase tracking-wide" style={{ color: "#111111" }}>Quotation</div>
            <div className="text-xs mt-1 font-mono" style={{ color: "#111111" }}>{q.quotation_number}</div>
            <div className="text-xs" style={{ color: "#111111" }}>Status: {Q_STATUS_LABEL[q.status as keyof typeof Q_STATUS_LABEL]}</div>
          </div>
        </div>

        <div className="px-10 py-6 grid grid-cols-2 gap-5">
          <Card title="Quotation By" color={NAVY} accent={GOLD}>
            <div className="font-bold">{q.company_name}</div>
            {q.company_address && <div>{q.company_address}</div>}
            {q.company_email && <div>{q.company_email}</div>}
            {q.company_phone && <div>{q.company_phone}</div>}
            {q.company_tin && <div className="text-xs mt-1">TIN/RDB: {q.company_tin}</div>}
            {q.prepared_by_name && <div className="text-xs mt-2">Prepared by: <span>{q.prepared_by_name}</span></div>}
          </Card>
          <Card title="Quotation To" color={NAVY} accent={GOLD}>
            <div className="font-bold">{q.client_name}</div>
            {q.client_contact_person && <div>{q.client_contact_person}</div>}
            {q.client_email && <div>{q.client_email}</div>}
            {q.client_phone && <div>{q.client_phone}</div>}
            {q.client_address && <div>{q.client_address}</div>}
            {q.client_type && <div className="text-xs mt-1">{q.client_type}</div>}
          </Card>
        </div>

        <div className="px-10 pb-2 grid grid-cols-4 gap-3 text-xs">
          <Meta label="Date" value={q.quotation_date} />
          <Meta label="Valid until" value={q.valid_until || "—"} />
          <Meta label="Currency" value={q.currency} />
          <Meta label="Product line" value={q.product_line || "—"} />
          <Meta label="Service" value={q.service_category || "—"} />
          <Meta label="Project" value={q.project_name || "—"} />
          <Meta label="Location" value={q.location || "—"} />
          <Meta label="Shoot date" value={q.shoot_date || "—"} />
        </div>

        {q.project_objective && (
          <div className="px-10 py-4">
            <SectionTitle color={NAVY} accent={GOLD}>Project Summary</SectionTitle>
            <p className="text-sm mt-2 leading-relaxed">{q.project_objective}</p>
            {q.delivery_timeline && <p className="text-xs mt-2"><b>Timeline:</b> {q.delivery_timeline}</p>}
          </div>
        )}

        <div className="px-10 pb-2">
          <SectionTitle color={NAVY} accent={GOLD}>Deliverables</SectionTitle>
          <PriceTable items={deliverables} navy={NAVY} gold={GOLD} />
        </div>

        {addons.length > 0 && (
          <div className="px-10 py-2">
            <SectionTitle color={NAVY} accent={GOLD}>Optional Add-ons</SectionTitle>
            <PriceTable items={addons} navy={NAVY} gold={GOLD} />
          </div>
        )}

        {/* Pricing summary */}
        <div className="px-10 py-4 flex justify-end">
          <div className="w-80 border rounded-lg overflow-hidden">
            <SumRow label="Subtotal" value={fmtRWF(q.subtotal)} />
            {q.discount_amount > 0 && <SumRow label="Discount" value={"− " + fmtRWF(q.discount_amount)} />}
            {q.tax_amount > 0 && <SumRow label={`Tax (${q.tax_percent}%)`} value={fmtRWF(q.tax_amount)} />}
            <SumRow label="TOTAL" value={fmtRWF(q.total_amount)} highlight navy={NAVY} gold={GOLD} />
            <SumRow label={`Advance (${q.advance_percent}%)`} value={fmtRWF(q.advance_amount)} />
            <SumRow label="Balance" value={fmtRWF(q.balance_amount)} />
          </div>
        </div>
        {q.amount_in_words && <div className="px-10 -mt-2 text-xs italic">In words: {q.amount_in_words}</div>}

        {q.show_internal_costs_on_pdf && costs.length > 0 && (
          <div className="px-10 py-4">
            <SectionTitle color={NAVY} accent={GOLD}>Internal Cost Estimate</SectionTitle>
            <table className="w-full text-sm mt-2 border">
              <tbody>{costs.map((c, i) => (
                <tr key={i} className="border-t"><td className="p-2">{c.category}{c.description && <span className="text-slate-500"> — {c.description}</span>}</td><td className="p-2 text-right">{fmtRWF(c.amount)}</td></tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {q.terms && (
          <div className="px-10 py-4">
            <SectionTitle color={NAVY} accent={GOLD}>Terms & Conditions</SectionTitle>
            <pre className="text-xs text-slate-700 mt-2 whitespace-pre-wrap font-sans leading-relaxed">{q.terms}</pre>
          </div>
        )}

        {q.notes && (
          <div className="px-10 py-2">
            <SectionTitle color={NAVY} accent={GOLD}>Additional Notes</SectionTitle>
            <p className="text-xs text-slate-700 mt-2 leading-relaxed whitespace-pre-wrap">{q.notes}</p>
          </div>
        )}

        {/* Signature */}
        <div className="px-10 pt-8 pb-10 grid grid-cols-2 gap-8">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500">Prepared by</div>
            <div className="text-sm text-slate-700 mt-1">{q.prepared_by_name || "—"}</div>
            <div className="mt-10 border-t border-slate-400 pt-1 text-[10px] text-slate-500">Signature & Date</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500">Client approval</div>
            <div className="text-sm text-slate-700 mt-1">{q.client_contact_person || q.client_name}</div>
            <div className="mt-10 border-t border-slate-400 pt-1 text-[10px] text-slate-500">Signature & Date</div>
          </div>
        </div>
        <div className="text-center text-[10px] text-slate-400 pb-6">iKAMBA • Creative Production • {q.company_email || "ikambaempireltd@gmail.com"}</div>
      </div>
    </div>
  );
};

const Card = ({ title, children, color, accent }: any) => (
  <div className="rounded-lg border border-slate-200 overflow-hidden">
    <div className="px-4 py-2 text-xs font-bold uppercase tracking-widest" style={{ background: color, color: accent }}>{title}</div>
    <div className="p-4 text-sm space-y-0.5">{children}</div>
  </div>
);

const SectionTitle = ({ children, color, accent }: any) => (
  <div className="flex items-center gap-2">
    <div className="h-3 w-1 rounded" style={{ background: accent }} />
    <h3 className="text-sm font-extrabold uppercase tracking-widest" style={{ color }}>{children}</h3>
  </div>
);

const Meta = ({ label, value }: any) => (
  <div className="border-l-2 border-slate-200 pl-2">
    <div className="text-[9px] uppercase tracking-widest">{label}</div>
    <div className="font-semibold">{value}</div>
  </div>
);

const PriceTable = ({ items, navy, gold }: any) => (
  <table className="w-full text-sm mt-2 border">
    <thead>
      <tr style={{ background: navy, color: gold }} className="text-left text-[10px] uppercase tracking-widest">
        <th className="p-2 w-8">#</th><th className="p-2">Item</th><th className="p-2 w-12 text-right">Qty</th>
        <th className="p-2 w-28 text-right">Unit price</th><th className="p-2 w-28 text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      {items.map((it: QItem, i: number) => (
        <tr key={i} className="border-t align-top">
          <td className="p-2 text-slate-500">{i + 1}</td>
          <td className="p-2">
            <div className="font-semibold">{it.name}</div>
            {it.description && <div className="text-xs">{it.description}</div>}
          </td>
          <td className="p-2 text-right">{it.quantity}</td>
          <td className="p-2 text-right">{fmtRWF(it.unit_price)}</td>
          <td className="p-2 text-right font-semibold">{fmtRWF(it.quantity * it.unit_price)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const SumRow = ({ label, value, highlight, navy, gold }: any) => (
  <div className="flex items-center justify-between px-3 py-2 border-b last:border-b-0" style={highlight ? { background: navy, color: gold } : undefined}>
    <span className={highlight ? "font-extrabold uppercase text-xs tracking-widest" : "text-sm"}>{label}</span>
    <span className={highlight ? "font-extrabold" : "text-sm font-semibold"}>{value}</span>
  </div>
);

export default QuotationPreview;
