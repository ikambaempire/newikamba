import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Printer } from "lucide-react";
import { type QItem, type QCost } from "@/os/quotations/types";
import { QuotationSheet } from "@/os/quotations/QuotationSheet";
import { QuotationSheetSectioned } from "@/os/quotations/QuotationSheetSectioned";

const NAVY = "#0C2C47";

const QuotationPreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [q, setQ] = useState<any>(null);
  const [items, setItems] = useState<QItem[]>([]);
  const [, setCosts] = useState<QCost[]>([]);
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

  const Sheet = q.template_format === "sectioned" ? QuotationSheetSectioned : QuotationSheet;

  return (
    <div className="min-h-screen bg-slate-200 py-6 print:bg-white print:p-0">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { size: A4; margin: 12mm; }
          body { background: white; }
        }
        .qtn { font-family: 'Poppins','Plus Jakarta Sans',-apple-system,system-ui,sans-serif; color: #1a1a1a; }
        .qtn h1,.qtn h2,.qtn h3,.qtn p,.qtn div,.qtn span,.qtn td,.qtn th,.qtn li { color: #1a1a1a; }
      `}</style>

      <div className="no-print max-w-[860px] mx-auto mb-3 flex items-center justify-between px-4">
        <button onClick={() => navigate(`/os/quotations/${id}`)} className="inline-flex items-center gap-1.5 text-sm text-slate-700 hover:text-slate-900">
          <ArrowLeft size={14} /> Back to builder
        </button>
        <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow" style={{ background: NAVY }}>
          <Printer size={14} /> Print / Save as PDF
        </button>
      </div>

      <div className="max-w-[860px] mx-auto bg-white shadow-lg print:shadow-none">
        <Sheet q={q} items={items} />
      </div>
    </div>
  );
};

export default QuotationPreview;
