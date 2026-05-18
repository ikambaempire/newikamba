// iKAMBA Media OS — mock data. Each entity mirrors the future Supabase schema.
// TODO: replace these arrays with `supabase.from(...).select()` calls.

export const PRODUCT_LINES = [
  "iKAMBA Media",
  "iKAMBA Weddings",
  "iKAMBA Studio",
  "iKAMBA Edits",
  "Resona Africa",
  "Ibigwi",
] as const;

export const SERVICE_CATEGORIES = [
  "Event Coverage",
  "Documentary",
  "Studio Photoshoot",
  "Corporate Video",
  "Interview",
  "Campaign Content",
  "Wedding",
  "Editing",
  "Podcast Production",
  "Other",
] as const;

export const PIPELINE_STAGES = [
  "New Request",
  "Discovery / Meeting",
  "Scope Confirmed",
  "Quotation Sent",
  "Approved",
  "Contract / Agreement",
  "Advance Pending",
  "Scheduled",
  "Production",
  "Editing",
  "Client Review",
  "Revision",
  "Delivered",
  "Invoice Sent",
  "Payment Pending",
  "Paid",
  "Closed",
] as const;

export type PipelineStage = typeof PIPELINE_STAGES[number];
export type PaymentStatus = "Paid" | "Pending" | "Overdue" | "Partially Paid";

export const COST_CATEGORIES = [
  "Crew fees", "Transport", "Meals", "Equipment rental", "Studio cost",
  "Accommodation", "Internet/data", "Printing/branding", "Software", "Miscellaneous",
];

export interface OSProject {
  id: string;
  client: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  name: string;
  product_line: string;
  service: string;
  objective?: string;
  brief?: string;
  deliverables?: string;
  shoot_date?: string;
  location?: string;
  deadline?: string;
  budget_range?: string;
  payment_terms?: string;
  owner: string;
  assigned_to_user_id?: string;
  assigned_to_name?: string;
  notes?: string;
  references?: string;
  stage: PipelineStage;
  value: number;       // RWF
  paid: number;
  costs_total: number;
  next_action?: string;
  payment_status: PaymentStatus;
}

export interface OSCost {
  id: string; project_id: string; date: string; category: string;
  description: string; amount: number; paid_to: string;
  status: "Paid" | "Pending"; approved_by?: string; notes?: string;
}

export interface OSPayment {
  id: string; project_id: string; date: string; amount: number;
  method: string; reference?: string; type: "Advance" | "Balance" | "Full";
}

export interface OSQuotation {
  id: string; project_id?: string; client: string; project_name: string;
  package: string; deliverables: string; timeline: string; price: number;
  payment_terms: string; notes?: string;
  status: "Draft" | "Sent" | "Approved" | "Rejected"; created_at: string;
}

export interface OSScheduleEvent {
  id: string; project_id: string; title: string; type: string;
  date: string; time?: string; location?: string; notes?: string;
}

export interface OSTask {
  id: string; project_id: string; title: string; done: boolean;
}

export interface OSTeamMember {
  id: string; name: string; role: string; email: string;
}

export const TEAM: OSTeamMember[] = [
  { id: "t1", name: "Fiston Ikamba", role: "CEO / Admin", email: "fiston.ikamba1@gmail.com" },
  { id: "t2", name: "iKAMBA Empire", role: "Super Admin", email: "ikambaempireltd@gmail.com" },
  { id: "t3", name: "Aline Uwase", role: "Operations Manager", email: "aline@ikamba.africa" },
  { id: "t4", name: "Eric Niyonsaba", role: "Production Manager", email: "eric@ikamba.africa" },
  { id: "t5", name: "Diane Mukamana", role: "Finance / Admin", email: "diane@ikamba.africa" },
  { id: "t6", name: "Patrick Habineza", role: "Lead Editor", email: "patrick@ikamba.africa" },
  { id: "t7", name: "Jean-Luc Bizimana", role: "Photographer / Videographer", email: "jeanluc@ikamba.africa" },
];

export const PROJECTS: OSProject[] = [
  {
    id: "p1", client: "Bank of Kigali", contact_person: "Rebecca M.", phone: "+250 788 111 222", email: "rebecca@bk.rw",
    name: "BK Annual Conference 2026", product_line: "iKAMBA Media", service: "Event Coverage",
    objective: "Capture multi-camera coverage and edited highlight reel for the annual investor conference.",
    deliverables: "Full event recording, 3-min highlight reel, 50 edited photos, social cutdowns x5",
    shoot_date: "2026-06-12", location: "Kigali Convention Centre", deadline: "2026-06-20",
    budget_range: "RWF 4M – 6M", payment_terms: "50% advance, 50% on delivery",
    owner: "Eric Niyonsaba", stage: "Production", value: 5500000, paid: 2750000, costs_total: 1450000,
    next_action: "Confirm second camera operator", payment_status: "Partially Paid",
  },
  {
    id: "p2", client: "UNHCR Rwanda", contact_person: "Marie Claire", phone: "+250 788 333 444", email: "mc@unhcr.org",
    name: "Refugee Resilience Documentary", product_line: "iKAMBA Media", service: "Documentary",
    objective: "30-minute documentary highlighting refugee entrepreneurship in Mahama camp.",
    deliverables: "30-min documentary, 5 short cutdowns, 30 stills",
    shoot_date: "2026-05-22", location: "Mahama Refugee Camp", deadline: "2026-07-30",
    budget_range: "RWF 12M – 18M", payment_terms: "40 / 40 / 20",
    owner: "Aline Uwase", stage: "Editing", value: 16000000, paid: 12800000, costs_total: 6200000,
    next_action: "Submit first cut to client", payment_status: "Partially Paid",
  },
  {
    id: "p3", client: "Inzozi Couture", contact_person: "Sandrine I.", phone: "+250 788 555 666", email: "sandrine@inzozi.rw",
    name: "Inzozi SS26 Campaign Shoot", product_line: "iKAMBA Studio", service: "Studio Photoshoot",
    objective: "Hero campaign visuals for spring/summer collection launch.",
    deliverables: "40 retouched hero shots, 15 lifestyle shots, behind-the-scenes reel",
    shoot_date: "2026-05-18", location: "iKAMBA Studio, Kigali", deadline: "2026-06-01",
    budget_range: "RWF 2.5M – 3.5M", payment_terms: "Full advance",
    owner: "Jean-Luc Bizimana", stage: "Scheduled", value: 3200000, paid: 3200000, costs_total: 850000,
    next_action: "Confirm wardrobe call-time", payment_status: "Paid",
  },
  {
    id: "p4", client: "Manzi & Keza Wedding", contact_person: "Manzi K.", phone: "+250 788 777 888", email: "manzi.k@gmail.com",
    name: "Manzi × Keza Wedding Coverage", product_line: "iKAMBA Weddings", service: "Wedding",
    objective: "Full-day cinematic wedding film + photo album.",
    deliverables: "8-min cinematic film, 1-min teaser, 300 edited photos, printed album",
    shoot_date: "2026-07-05", location: "Serena Hotel Kigali", deadline: "2026-08-10",
    budget_range: "RWF 3.5M – 4.5M", payment_terms: "30 / 70",
    owner: "Patrick Habineza", stage: "Advance Pending", value: 4200000, paid: 0, costs_total: 0,
    next_action: "Follow up on advance invoice", payment_status: "Pending",
  },
  {
    id: "p5", client: "MTN Rwanda", contact_person: "David K.", phone: "+250 788 999 000", email: "david.k@mtn.com",
    name: "MTN MoMo Brand Edit Pack", product_line: "iKAMBA Edits", service: "Editing",
    objective: "Re-edit existing footage into 6 platform-native social videos.",
    deliverables: "6 vertical edits, 3 horizontal edits, captions burned-in",
    deadline: "2026-05-30", budget_range: "RWF 1.8M", payment_terms: "On delivery",
    owner: "Patrick Habineza", stage: "Invoice Sent", value: 1800000, paid: 0, costs_total: 200000,
    next_action: "Follow up on invoice #INV-2026-014", payment_status: "Pending",
  },
  {
    id: "p6", client: "Resona Africa", contact_person: "Internal", phone: "—", email: "studio@resona.africa",
    name: "Voices of Kigali — Podcast S2", product_line: "Resona Africa", service: "Podcast Production",
    objective: "Produce season 2 of flagship podcast — 10 episodes.",
    deliverables: "10 audio episodes, 10 video versions, 30 social clips",
    shoot_date: "2026-06-01", location: "Resona Studio", deadline: "2026-09-01",
    budget_range: "Internal", payment_terms: "Internal",
    owner: "Fiston Ikamba", stage: "Scope Confirmed", value: 7500000, paid: 0, costs_total: 0,
    next_action: "Lock guest list for episodes 1-4", payment_status: "Pending",
  },
  {
    id: "p7", client: "Equity Bank", contact_person: "Joan U.", phone: "+250 788 121 212", email: "joan@equity.rw",
    name: "Equity Women in Business Series", product_line: "iKAMBA Media", service: "Corporate Video",
    objective: "5-part interview series profiling women entrepreneurs.",
    deliverables: "5 x 4-min films, social cutdowns, stills",
    shoot_date: "2026-06-20", deadline: "2026-08-15", budget_range: "RWF 8M – 10M",
    payment_terms: "50 / 50", owner: "Aline Uwase", stage: "Quotation Sent",
    value: 9200000, paid: 0, costs_total: 0,
    next_action: "Client expected to revert by Friday", payment_status: "Pending",
  },
  {
    id: "p8", client: "Ministry of ICT", contact_person: "Eric R.", phone: "+250 788 343 434", email: "eric.r@minict.gov.rw",
    name: "Digital Rwanda Vision Film", product_line: "iKAMBA Media", service: "Documentary",
    objective: "15-min hero film for international audience.",
    deliverables: "15-min film + 3 cutdowns",
    deadline: "2026-04-10", budget_range: "RWF 14M", payment_terms: "30 / 40 / 30",
    owner: "Eric Niyonsaba", stage: "Paid", value: 14000000, paid: 14000000, costs_total: 7800000,
    next_action: "Archive files", payment_status: "Paid",
  },
];

export const COSTS: OSCost[] = [
  { id: "c1", project_id: "p1", date: "2026-05-02", category: "Equipment rental", description: "Sony FX6 + lenses (3 days)", amount: 750000, paid_to: "Lumen Rentals", status: "Paid" },
  { id: "c2", project_id: "p1", date: "2026-05-04", category: "Crew fees", description: "Second cam op", amount: 400000, paid_to: "Alain N.", status: "Pending" },
  { id: "c3", project_id: "p1", date: "2026-05-05", category: "Transport", description: "Crew transport", amount: 120000, paid_to: "Yego", status: "Paid" },
  { id: "c4", project_id: "p2", date: "2026-05-20", category: "Accommodation", description: "Mahama 5 nights x 4 crew", amount: 1800000, paid_to: "Mahama Lodge", status: "Paid" },
  { id: "c5", project_id: "p2", date: "2026-05-21", category: "Meals", description: "Field meals", amount: 600000, paid_to: "Local catering", status: "Paid" },
  { id: "c6", project_id: "p2", date: "2026-05-25", category: "Crew fees", description: "DOP + sound + producer", amount: 3200000, paid_to: "Crew", status: "Paid" },
  { id: "c7", project_id: "p3", date: "2026-05-10", category: "Studio cost", description: "Studio prep", amount: 350000, paid_to: "iKAMBA Studio", status: "Paid" },
  { id: "c8", project_id: "p3", date: "2026-05-12", category: "Crew fees", description: "Stylist + MUA", amount: 500000, paid_to: "Glow Team", status: "Pending" },
  { id: "c9", project_id: "p5", date: "2026-05-01", category: "Software", description: "Project plugins", amount: 200000, paid_to: "Adobe", status: "Paid" },
  { id: "c10", project_id: "p8", date: "2026-03-15", category: "Crew fees", description: "Full crew", amount: 5200000, paid_to: "Crew", status: "Paid" },
  { id: "c11", project_id: "p8", date: "2026-03-20", category: "Transport", description: "Logistics", amount: 1400000, paid_to: "Various", status: "Paid" },
  { id: "c12", project_id: "p8", date: "2026-03-22", category: "Equipment rental", description: "Drone + gimbal", amount: 1200000, paid_to: "Lumen Rentals", status: "Paid" },
];

export const PAYMENTS: OSPayment[] = [
  { id: "pay1", project_id: "p1", date: "2026-04-25", amount: 2750000, method: "Bank transfer", reference: "BK-ADV-001", type: "Advance" },
  { id: "pay2", project_id: "p2", date: "2026-05-10", amount: 6400000, method: "Bank transfer", reference: "UN-001", type: "Advance" },
  { id: "pay3", project_id: "p2", date: "2026-06-02", amount: 6400000, method: "Bank transfer", reference: "UN-002", type: "Balance" },
  { id: "pay4", project_id: "p3", date: "2026-05-08", amount: 3200000, method: "MoMo", reference: "MM-9912", type: "Full" },
  { id: "pay5", project_id: "p8", date: "2026-04-12", amount: 14000000, method: "Bank transfer", reference: "MINICT-FIN", type: "Full" },
];

export const QUOTATIONS: OSQuotation[] = [
  { id: "q1", project_id: "p7", client: "Equity Bank", project_name: "Women in Business Series", package: "Premium Series", deliverables: "5 x 4-min films + cutdowns", timeline: "8 weeks", price: 9200000, payment_terms: "50 / 50", status: "Sent", created_at: "2026-05-05" },
  { id: "q2", project_id: "p4", client: "Manzi & Keza", project_name: "Wedding Coverage", package: "Cinematic Gold", deliverables: "Film + 300 photos + album", timeline: "5 weeks", price: 4200000, payment_terms: "30 / 70", status: "Approved", created_at: "2026-04-28" },
  { id: "q3", client: "RwandAir", project_name: "Inflight Brand Film", package: "Premium Documentary", deliverables: "8-min film + edits", timeline: "10 weeks", price: 12500000, payment_terms: "40 / 40 / 20", status: "Draft", created_at: "2026-05-14" },
];

export const SCHEDULE: OSScheduleEvent[] = [
  { id: "s1", project_id: "p1", title: "BK Conference shoot day", type: "Shoot day", date: "2026-06-12", time: "08:00", location: "Kigali Convention Centre" },
  { id: "s2", project_id: "p2", title: "Mahama editing deadline", type: "Editing deadline", date: "2026-06-25" },
  { id: "s3", project_id: "p3", title: "Inzozi studio shoot", type: "Shoot day", date: "2026-05-18", time: "10:00", location: "iKAMBA Studio" },
  { id: "s4", project_id: "p4", title: "Manzi × Keza wedding", type: "Shoot day", date: "2026-07-05", time: "07:00", location: "Serena Hotel" },
  { id: "s5", project_id: "p7", title: "Equity discovery meeting", type: "Discovery meeting", date: "2026-05-20", time: "14:00" },
];

export const DEFAULT_TASKS = [
  "Client request captured", "Scope confirmed", "Quotation sent", "Advance payment requested",
  "Contract/agreement confirmed", "Shoot scheduled", "Team assigned", "Equipment confirmed",
  "Production completed", "Editing brief submitted", "First draft uploaded", "Client feedback received",
  "Revisions completed", "Final files delivered", "Invoice sent", "Payment received", "Files archived",
];

export const fmtRWF = (n: number) =>
  "RWF " + new Intl.NumberFormat("en-RW").format(Math.round(n));
