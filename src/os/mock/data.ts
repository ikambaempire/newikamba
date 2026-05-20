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

// Seed data cleared — the team starts with an empty workspace.
export const PROJECTS: OSProject[] = [];
export const COSTS: OSCost[] = [];
export const PAYMENTS: OSPayment[] = [];
export const QUOTATIONS: OSQuotation[] = [];
export const SCHEDULE: OSScheduleEvent[] = [];

export const DEFAULT_TASKS = [
  "Client request captured", "Scope confirmed", "Quotation sent", "Advance payment requested",
  "Contract/agreement confirmed", "Shoot scheduled", "Team assigned", "Equipment confirmed",
  "Production completed", "Editing brief submitted", "First draft uploaded", "Client feedback received",
  "Revisions completed", "Final files delivered", "Invoice sent", "Payment received", "Files archived",
];

export const fmtRWF = (n: number) =>
  "RWF " + new Intl.NumberFormat("en-RW").format(Math.round(n));
