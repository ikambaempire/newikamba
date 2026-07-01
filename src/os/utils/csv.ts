// CSV parser/serializer + Google Sheets URL → CSV helper.
// Handles quoted fields, escaped quotes, CRLF, BOM, and auto-detects comma vs semicolon vs tab.

function detectDelimiter(text: string): string {
  const sample = text.split(/\r?\n/).slice(0, 5).join("\n");
  const counts: Record<string, number> = {
    ",": (sample.match(/,/g) || []).length,
    ";": (sample.match(/;/g) || []).length,
    "\t": (sample.match(/\t/g) || []).length,
  };
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] > 0 ? best[0] : ",";
}

export function parseCSV(text: string, delimiter?: string): string[][] {
  // strip BOM
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const delim = delimiter || detectDelimiter(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; }
        else inQ = false;
      } else cur += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === delim) { row.push(cur); cur = ""; }
      else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
      else if (c === "\r") { /* skip */ }
      else cur += c;
    }
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim().length));
}

export function toCSV(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const esc = (v: any) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.map(esc).join(","), ...rows.map(r => r.map(esc).join(","))].join("\n");
}

export function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function sheetsLinkToCsvUrl(link: string): string | null {
  const m = link.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!m) return null;
  const id = m[1];
  const gidMatch = link.match(/[#&?]gid=(\d+)/);
  const gid = gidMatch ? gidMatch[1] : "0";
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
}

export async function fetchSheetAsCSV(link: string): Promise<string> {
  const url = sheetsLinkToCsvUrl(link);
  if (!url) throw new Error("Not a valid Google Sheets link.");
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Could not fetch sheet (HTTP ${res.status}). Make sure it's shared as 'Anyone with the link can view'.`);
  return await res.text();
}

// Normalize header tokens: lowercase, strip non-alphanum, collapse to underscore
function normHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

// Map raw header → canonical field name (fuzzy: ignores spaces, case, punctuation)
const HEADER_ALIASES: Record<string, string> = {
  // name
  name: "name", project: "name", project_name: "name", projectname: "name",
  title: "name", project_title: "name",
  // client
  client: "client", client_name: "client", company: "client", customer: "client",
  organization: "client", organisation: "client", brand: "client",
  // contact
  contact: "contact_person", contact_person: "contact_person", contact_name: "contact_person",
  // comms
  phone: "phone", phone_number: "phone", mobile: "phone", tel: "phone",
  email: "email", email_address: "email",
  // categorization
  product_line: "product_line", productline: "product_line", line: "product_line",
  service: "service", service_type: "service", category: "service", type: "service",
  stage: "stage", status: "stage", pipeline_stage: "stage", project_status: "stage",
  // financial
  value: "value", amount: "value", price: "value", total: "value", quote: "value", budget: "value",
  paid: "paid", amount_paid: "paid", paidamount: "paid", paid_amount: "paid",
  deposit: "paid", advance: "paid", received: "paid", collected: "paid",
  amount_received: "paid", amountreceived: "paid",
  // dates
  shoot_date: "shoot_date", shoot: "shoot_date", date: "shoot_date", production_date: "shoot_date",
  deadline: "deadline", due_date: "deadline", due: "deadline", delivery_date: "deadline",
  // misc
  location: "location", venue: "location", address: "location", city: "location",
  owner: "owner", assigned_to: "owner", lead: "owner", manager: "owner",
  notes: "notes", description: "notes", details: "notes", remarks: "notes",
  budget_range: "budget_range",
  objective: "objective", goal: "objective",
  deliverables: "deliverables", scope: "deliverables",
};

export function rowsToObjects(rows: string[][]): Record<string, string>[] {
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => {
    const norm = normHeader(h);
    return HEADER_ALIASES[norm] || norm;
  });
  return rows.slice(1).map(r => {
    const o: Record<string, string> = {};
    headers.forEach((h, i) => { o[h] = (r[i] ?? "").trim(); });
    return o;
  });
}
