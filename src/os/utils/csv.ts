// Tiny CSV parser/serializer + Google Sheets URL → CSV helper.
// Handles quoted fields, commas, escaped quotes, CRLF.

export function parseCSV(text: string): string[][] {
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
      else if (c === ",") { row.push(cur); cur = ""; }
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

// Convert a Google Sheets share link to a CSV export URL.
// Accepts: https://docs.google.com/spreadsheets/d/<ID>/edit#gid=<GID>
//          https://docs.google.com/spreadsheets/d/<ID>/edit?usp=sharing
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
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not fetch sheet. Make sure it's shared as 'Anyone with the link can view'.");
  return await res.text();
}

// Map a CSV row + headers to a generic object using fuzzy header matching.
export function rowsToObjects(rows: string[][]): Record<string, string>[] {
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return rows.slice(1).map(r => {
    const o: Record<string, string> = {};
    headers.forEach((h, i) => { o[h] = (r[i] ?? "").trim(); });
    return o;
  });
}
