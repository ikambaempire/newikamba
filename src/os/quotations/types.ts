// Quotation Builder data models — match Supabase os_quotations tables.
export type QStatus = "draft" | "sent" | "approved" | "rejected" | "revised" | "expired" | "converted";

export const Q_STATUS_LABEL: Record<QStatus, string> = {
  draft: "Draft", sent: "Sent", approved: "Approved", rejected: "Rejected",
  revised: "Revised", expired: "Expired", converted: "Converted to Project",
};

export const Q_STATUS_TONE: Record<QStatus, "default" | "gold" | "green" | "red" | "amber" | "blue"> = {
  draft: "default", sent: "blue", approved: "green", rejected: "red",
  revised: "amber", expired: "red", converted: "gold",
};

export const CLIENT_TYPES = ["Corporate", "NGO", "Government", "Individual", "Faith-based", "Startup", "Other"];

export const DEFAULT_DELIVERABLES = [
  "Documentary Video", "Photography Coverage", "Highlight Video", "Social Media Reels",
  "Full Event Video", "Studio Photoshoot", "Editing Package", "Podcast Episode Production", "Livestream Coverage",
];

export const DEFAULT_ADDONS = [
  "Drone Coverage", "Extra Revision Round", "Express Delivery", "Additional Shoot Day",
  "Extra Photographer", "Extra Videographer", "Raw Footage Delivery", "Subtitles",
  "Motion Graphics", "Livestream", "Photo Album / Printing",
];

export const COST_CATEGORIES = [
  "Crew", "Transport", "Equipment rental", "Meals", "Editing",
  "Printing/album", "Studio", "Software/subscription", "Miscellaneous",
];

export const DEFAULT_TERMS = `• 50% advance payment is required before production begins.
• Remaining balance is due before final delivery.
• Quotation is valid until the stated validity date.
• Project timeline begins after confirmation of payment, scope and required client materials.
• Quotation includes two revision rounds unless otherwise stated.
• Additional revisions are billed separately.
• Raw footage / files are not included unless specified in the quotation.
• Cancellation after production begins may result in non-refundable production costs.
• iKAMBA may use selected final outputs for portfolio purposes unless otherwise agreed in writing.`;

export interface QItem {
  id?: string;
  kind: "deliverable" | "addon";
  position: number;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  amount: number;
  included: boolean;
}

export interface QCost {
  id?: string;
  category: string;
  description?: string;
  amount: number;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  status: QStatus;
  company_name: string;
  company_address?: string;
  company_email?: string;
  company_phone?: string;
  company_tin?: string;
  prepared_by_name?: string;
  prepared_by_user_id?: string;
  client_name: string;
  client_contact_person?: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
  client_type?: string;
  project_name?: string;
  product_line?: string;
  service_category?: string;
  project_objective?: string;
  location?: string;
  shoot_date?: string;
  delivery_timeline?: string;
  quotation_date: string;
  valid_until?: string;
  currency: string;
  subtotal: number;
  discount_type: "none" | "fixed" | "percent";
  discount_value: number;
  discount_amount: number;
  tax_percent: number;
  tax_amount: number;
  total_amount: number;
  advance_percent: number;
  advance_amount: number;
  balance_amount: number;
  amount_in_words?: string;
  total_cost_estimate: number;
  estimated_profit: number;
  profit_margin: number;
  terms?: string;
  notes?: string;
  show_internal_costs_on_pdf: boolean;
  converted_project_id?: string;
  converted_legacy_project_id?: string;
  created_at: string;
  updated_at: string;
}

export const recalcTotals = (
  items: QItem[],
  discount_type: "none" | "fixed" | "percent",
  discount_value: number,
  tax_percent: number,
  advance_percent: number,
  costs: QCost[],
) => {
  const subtotal = items.filter(i => i.included).reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const discount_amount =
    discount_type === "fixed" ? Math.min(discount_value, subtotal)
    : discount_type === "percent" ? (subtotal * discount_value) / 100
    : 0;
  const taxable = subtotal - discount_amount;
  const tax_amount = (taxable * (tax_percent || 0)) / 100;
  const total_amount = taxable + tax_amount;
  const advance_amount = (total_amount * (advance_percent || 0)) / 100;
  const balance_amount = total_amount - advance_amount;
  const total_cost_estimate = costs.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const estimated_profit = total_amount - total_cost_estimate;
  const profit_margin = total_amount > 0 ? (estimated_profit / total_amount) * 100 : 0;
  return { subtotal, discount_amount, tax_amount, total_amount, advance_amount, balance_amount, total_cost_estimate, estimated_profit, profit_margin };
};

export const numberToWords = (n: number): string => {
  // Compact RWF -> words. Good enough for quotations.
  if (!isFinite(n)) return "";
  n = Math.round(n);
  if (n === 0) return "Zero";
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const inner = (num: number): string => {
    if (num < 20) return a[num];
    if (num < 100) return b[Math.floor(num / 10)] + (num % 10 ? " " + a[num % 10] : "");
    if (num < 1000) return a[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + inner(num % 100) : "");
    return "";
  };
  const parts: string[] = [];
  const billions = Math.floor(n / 1_000_000_000); n %= 1_000_000_000;
  const millions = Math.floor(n / 1_000_000); n %= 1_000_000;
  const thousands = Math.floor(n / 1_000); n %= 1_000;
  if (billions) parts.push(inner(billions) + " Billion");
  if (millions) parts.push(inner(millions) + " Million");
  if (thousands) parts.push(inner(thousands) + " Thousand");
  if (n) parts.push(inner(n));
  return parts.join(" ").trim();
};
