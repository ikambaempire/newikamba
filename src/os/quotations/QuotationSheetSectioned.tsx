import officialLogo from "@/assets/ikamba-logo-official.png";
import { fmtRWF } from "@/os/mock/data";
import type { QItem } from "@/os/quotations/types";
import EditableText from "@/os/quotations/EditableText";

const NAVY = "#0C2C47";
const GOLD = "#D4A739";
const HEAD = "#F4E7C2";
const ROW_ALT = "#FAF6EB";

const fmtDate = (d?: string) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }); }
  catch { return d; }
};

type Props = {
  q: any;
  items: QItem[];
  editable?: boolean;
  onUpdate?: (patch: any) => void;
  onUpdateItem?: (idx: number, patch: Partial<QItem>) => void;
};

const E = (props: any) => <EditableText {...props} />;

/**
 * "Sectioned" quotation template — matches a banking/operations
 * spreadsheet style (Bank info, Item table, Team, Deliverables,
 * Equipment, Contact & Delivery Timeline).
 */
export const QuotationSheetSectioned = ({ q, items, editable, onUpdate, onUpdateItem }: Props) => {
  const set = (k: string) => (v: string) => onUpdate?.({ [k]: v });
  const setItem = (origIdx: number, k: keyof QItem) => (v: string) => {
    if (!onUpdateItem) return;
    if (k === "quantity" || k === "unit_price") onUpdateItem(origIdx, { [k]: Number(v) || 0 } as any);
    else onUpdateItem(origIdx, { [k]: v } as any);
  };

  const allItems = (items || []).filter((i) => i.included);

  return (
    <div className="qtn bg-white px-10 py-8" style={{ fontFamily: "'Poppins','Plus Jakarta Sans',sans-serif", color: "#1a1a1a" }}>
      {/* Top: logo + QUOTE title */}
      <div className="flex items-start justify-between mb-4">
        <img src={officialLogo} alt="iKAMBA" className="h-20 w-auto object-contain" />
        <div className="text-right">
          <div className="text-4xl font-extrabold tracking-[0.25em]" style={{ color: GOLD }}>QUOTE</div>
          <div className="text-xs text-slate-500 mt-1">No. <span className="font-bold" style={{ color: NAVY }}>{q.quotation_number}</span></div>
        </div>
      </div>

      {/* Bank info (left) — To: (right) */}
      <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
        <div className="space-y-1">
          <div className="font-bold" style={{ color: NAVY }}><E value={q.company_name || "Ikamba Empire"} editable={editable} onChange={set("company_name")} /></div>
          <div><span className="text-slate-500">TIN:</span> <E value={q.company_tin} editable={editable} onChange={set("company_tin")} placeholder="—" /></div>
          <div><span className="text-slate-500">Name:</span> <E value={q.company_legal_name || q.company_name || "Ikamba Empire Ltd"} editable={editable} onChange={set("company_legal_name")} /></div>
          <div><span className="text-slate-500">Bank Account:</span> <E value={q.bank_name || "BK"} editable={editable} onChange={set("bank_name")} /></div>
          <div><span className="text-slate-500">Account Number (Rwf):</span> <E value={q.bank_account || ""} editable={editable} onChange={set("bank_account")} placeholder="—" /></div>
          <div><span className="text-slate-500">Momo:</span> <E value={q.momo || ""} editable={editable} onChange={set("momo")} placeholder="—" /></div>
        </div>
        <div className="space-y-1 text-right">
          <div><span className="text-slate-500">Date:</span> <span className="font-bold" style={{ color: NAVY }}>{fmtDate(q.quotation_date)}</span></div>
          <div className="pt-2"><span className="text-slate-500 mr-2">To</span></div>
          <div className="font-bold" style={{ color: NAVY }}><E value={q.client_name} editable={editable} onChange={set("client_name")} placeholder="Client name" /></div>
          <div><E value={q.client_contact_person} editable={editable} onChange={set("client_contact_person")} placeholder="Contact person" /></div>
          <div><E value={q.client_address || "Kigali, Rwanda"} editable={editable} onChange={set("client_address")} /></div>
          <div><E value={q.client_email} editable={editable} onChange={set("client_email")} placeholder="email" /></div>
        </div>
      </div>

      {/* Project subject line */}
      <div className="mb-2 text-sm">
        <span className="font-bold" style={{ color: NAVY }}>
          <E value={q.project_name} editable={editable} onChange={set("project_name")} placeholder="Project title (e.g. Videography & Photography Services for…)" />
        </span>
      </div>

      {/* Items table */}
      <table className="w-full text-sm border-collapse mb-6" style={{ border: `1px solid ${GOLD}` }}>
        <thead>
          <tr style={{ background: HEAD, color: NAVY }}>
            <th className="text-left p-2 border-r" style={{ borderColor: GOLD, width: 40 }}>No</th>
            <th className="text-left p-2 border-r" style={{ borderColor: GOLD }}>Description</th>
            <th className="text-right p-2 border-r" style={{ borderColor: GOLD, width: 80 }}>Qty (Day)</th>
            <th className="text-right p-2 border-r" style={{ borderColor: GOLD, width: 110 }}>Unit (RWF)</th>
            <th className="text-right p-2" style={{ width: 120 }}>Total (RWF)</th>
          </tr>
        </thead>
        <tbody>
          {allItems.map((it, i) => {
            const origIdx = (items || []).indexOf(it);
            return (
              <tr key={i} style={i % 2 === 1 ? { background: ROW_ALT } : undefined}>
                <td className="p-2 border-r align-top" style={{ borderColor: GOLD }}>{i + 1}.0</td>
                <td className="p-2 border-r align-top" style={{ borderColor: GOLD }}>
                  <div className="font-semibold"><E value={it.name} editable={editable} onChange={setItem(origIdx, "name")} placeholder="Item" /></div>
                  {(editable || it.description) && (
                    <div className="text-xs text-slate-600"><E value={it.description} editable={editable} onChange={setItem(origIdx, "description")} placeholder={editable ? "Description (optional)" : ""} /></div>
                  )}
                </td>
                <td className="p-2 text-right border-r align-top" style={{ borderColor: GOLD }}><E value={it.quantity} editable={editable} onChange={setItem(origIdx, "quantity")} /></td>
                <td className="p-2 text-right border-r align-top" style={{ borderColor: GOLD }}><E value={editable ? it.unit_price : fmtRWF(it.unit_price)} editable={editable} onChange={setItem(origIdx, "unit_price")} /></td>
                <td className="p-2 text-right align-top font-semibold">{fmtRWF(it.quantity * it.unit_price)}</td>
              </tr>
            );
          })}
          <tr style={{ background: ROW_ALT }}>
            <td className="p-2 border-r" style={{ borderColor: GOLD }} colSpan={4}><span className="font-bold">Sub-Total</span></td>
            <td className="p-2 text-right font-bold">{fmtRWF(q.subtotal)}</td>
          </tr>
          {q.tax_amount > 0 && (
            <tr>
              <td className="p-2 border-r" style={{ borderColor: GOLD }} colSpan={4}><span className="font-bold">VAT ({q.tax_percent}%)</span></td>
              <td className="p-2 text-right font-bold">{fmtRWF(q.tax_amount)}</td>
            </tr>
          )}
          <tr style={{ background: HEAD }}>
            <td className="p-2 border-r" style={{ borderColor: GOLD }} colSpan={4}><span className="font-extrabold" style={{ color: NAVY }}>Total</span></td>
            <td className="p-2 text-right font-extrabold" style={{ color: NAVY }}>{fmtRWF(q.total_amount)}</td>
          </tr>
        </tbody>
      </table>

      {/* Team */}
      <Section title="Team">
        <pre className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-700">
          <E value={q.team_section} editable={editable} multiline onChange={set("team_section")} placeholder={editable ? "e.g.\n1. Videographer — 3\n2. Photographer — 2\n3. Video Editor — 1" : ""} />
        </pre>
      </Section>

      {/* Deliverables — use deliverable items as a numbered list */}
      <Section title="Deliverables">
        {editable ? (
          <pre className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-700">
            <E value={q.deliverables_section} editable onChange={set("deliverables_section")} multiline placeholder={"e.g.\n1. 500+ Edited High-Resolution Photos\n2. 5–10 Short Social Media Video Clips"} />
          </pre>
        ) : q.deliverables_section ? (
          <pre className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-700">{q.deliverables_section}</pre>
        ) : (
          <ol className="text-xs text-slate-700 list-decimal pl-5 space-y-0.5">
            {allItems.map((it, i) => <li key={i}>{it.name}{it.description ? ` — ${it.description}` : ""}</li>)}
          </ol>
        )}
      </Section>

      {/* Equipment */}
      <Section title="Equipment for Project">
        <pre className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-700">
          <E value={q.equipment_section} editable={editable} multiline onChange={set("equipment_section")} placeholder={editable ? "e.g.\n1. Sony Alpha A7 IV + stabilizer — 3\n2. Sigma Sony Lens — 3" : ""} />
        </pre>
      </Section>

      {/* Contact + Delivery Timeline */}
      <div className="grid grid-cols-2 gap-6 mt-6 text-sm">
        <div>
          <div className="font-bold mb-1" style={{ color: NAVY }}>Project Contact Person</div>
          <div className="text-slate-700">
            <E value={q.prepared_by_name} editable={editable} onChange={set("prepared_by_name")} placeholder="Name" />
            {(q.company_phone || editable) && <> · <E value={q.company_phone} editable={editable} onChange={set("company_phone")} placeholder="phone" /></>}
          </div>
        </div>
        <div>
          <div className="font-bold mb-1" style={{ color: NAVY }}>Delivery Timeline</div>
          <pre className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-700">
            <E value={q.delivery_timeline} editable={editable} multiline onChange={set("delivery_timeline")} placeholder={editable ? "e.g.\n- Daily Event Highlight Videos: 6-12 hrs after each day\n- Social Media Clips: during the event" : ""} />
          </pre>
        </div>
      </div>

      {/* Terms */}
      {(q.terms || editable) && (
        <Section title="Terms and Conditions">
          <pre className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-700">
            <E value={q.terms} editable={editable} multiline onChange={set("terms")} placeholder={editable ? "Terms…" : ""} />
          </pre>
        </Section>
      )}
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mt-4">
    <div className="px-3 py-1.5 font-extrabold text-sm" style={{ background: HEAD, color: NAVY, border: `1px solid ${GOLD}`, borderBottom: "none" }}>{title}</div>
    <div className="border p-3" style={{ borderColor: GOLD }}>{children}</div>
  </div>
);

export default QuotationSheetSectioned;
