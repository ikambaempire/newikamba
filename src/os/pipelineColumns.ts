// Pipeline column configuration — shared across team, admin-managed.
// Stored in os_platform_settings under setting_key='pipeline_columns' as JSON-encoded items.
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export type PipelineColumnType = "text" | "date" | "number";

export interface PipelineColumn {
  key: string;            // identifier (e.g. "name", or for custom "cf_meeting_date")
  label: string;          // header label (admin-renamable)
  builtin: boolean;       // true for hardcoded columns; false for custom JSONB fields
  visible: boolean;
  type?: PipelineColumnType; // for custom columns only
}

// Built-in columns rendered by Pipeline table — order matters.
export const BUILTIN_COLUMNS: PipelineColumn[] = [
  { key: "name",           label: "Project",  builtin: true, visible: true },
  { key: "client",         label: "Client",   builtin: true, visible: true },
  { key: "service",        label: "Service",  builtin: true, visible: true },
  { key: "owner",          label: "Owner",    builtin: true, visible: true },
  { key: "stage",          label: "Status",   builtin: true, visible: true },
  { key: "value",          label: "Value",    builtin: true, visible: true },
  { key: "paid",           label: "Paid",     builtin: true, visible: true },
  { key: "payment_status", label: "Payment",  builtin: true, visible: true },
  { key: "deadline",       label: "Deadline", builtin: true, visible: true },
];

const SETTING_KEY = "pipeline_columns";

export async function loadPipelineColumns(): Promise<PipelineColumn[]> {
  const { data, error } = await supabase
    .from("os_platform_settings")
    .select("items")
    .eq("setting_key", SETTING_KEY)
    .maybeSingle();
  if (error || !data?.items?.length) return BUILTIN_COLUMNS;
  try {
    const parsed = (data.items as string[]).map((s) => JSON.parse(s) as PipelineColumn);
    // Merge in any new built-ins added since this config was saved.
    const known = new Set(parsed.map((c) => c.key));
    for (const b of BUILTIN_COLUMNS) if (!known.has(b.key)) parsed.push(b);
    return parsed;
  } catch {
    return BUILTIN_COLUMNS;
  }
}

export async function savePipelineColumns(cols: PipelineColumn[]): Promise<{ ok: boolean; error?: string }> {
  const items = cols.map((c) => JSON.stringify(c));
  const { error } = await supabase
    .from("os_platform_settings")
    .upsert({ setting_key: SETTING_KEY, items }, { onConflict: "setting_key" });
  return { ok: !error, error: error?.message };
}

export function usePipelineColumns() {
  const [cols, setCols] = useState<PipelineColumn[]>(BUILTIN_COLUMNS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadPipelineColumns().then((c) => { setCols(c); setLoaded(true); });
    const ch = supabase
      .channel("os_pipeline_columns_changes")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "os_platform_settings", filter: `setting_key=eq.${SETTING_KEY}` },
        () => { loadPipelineColumns().then(setCols); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return { cols, setCols, loaded };
}
