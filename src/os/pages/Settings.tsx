import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Badge, OSButton, Input } from "@/os/components/ui";
import { PRODUCT_LINES, SERVICE_CATEGORIES, PIPELINE_STAGES, COST_CATEGORIES } from "@/os/mock/data";
import { hasAdminRole } from "@/os/access";
import { Plus, X, Shield, Lock } from "lucide-react";
import { toast } from "sonner";

const STORE_KEY = "ikamba.os.settings.v1";

type SettingsState = {
  product_lines: string[];
  service_categories: string[];
  pipeline_stages: string[];
  cost_categories: string[];
  payment_status: string[];
  notification_prefs: string[];
};

const DEFAULTS: SettingsState = {
  product_lines: [...PRODUCT_LINES],
  service_categories: [...SERVICE_CATEGORIES],
  pipeline_stages: [...PIPELINE_STAGES],
  cost_categories: [...COST_CATEGORIES],
  payment_status: ["Paid", "Pending", "Overdue", "Partially Paid"],
  notification_prefs: ["Email", "WhatsApp", "In-app"],
};

const readStore = (): SettingsState => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { return DEFAULTS; }
};
const writeStore = (s: SettingsState) => {
  localStorage.setItem(STORE_KEY, JSON.stringify(s));
  try { window.dispatchEvent(new CustomEvent("ikamba:settings-changed")); } catch {}
};

const readRemoteSettings = async (): Promise<SettingsState> => {
  const { data, error } = await (supabase as any).from("os_platform_settings").select("setting_key, items");
  if (error || !data) return readStore();
  const next = { ...DEFAULTS };
  data.forEach((row: any) => {
    if (row.setting_key in next) next[row.setting_key as keyof SettingsState] = row.items || [];
  });
  writeStore(next);
  return next;
};

const writeRemoteSettings = async (s: SettingsState, userId?: string) => {
  writeStore(s);
  const rows = Object.entries(s).map(([setting_key, items]) => ({ setting_key, items, updated_by: userId ?? null }));
  const { error } = await (supabase as any).from("os_platform_settings").upsert(rows, { onConflict: "setting_key" });
  if (error) throw error;
};

const SettingsBlock = ({
  title, items, canEdit, onAdd, onRemove,
}: {
  title: string; items: string[]; canEdit: boolean;
  onAdd: (v: string) => void; onRemove: (v: string) => void;
}) => {
  const [draft, setDraft] = useState("");
  const submit = () => {
    const v = draft.trim();
    if (!v) return;
    if (items.includes(v)) { toast.error("Already in the list"); return; }
    onAdd(v); setDraft("");
  };
  return (
    <section className="os-card rounded-xl p-5">
      <h3 className="text-white font-bold mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        {items.map((i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-white/5 border border-os rounded-full px-2.5 py-1 text-xs text-white">
            {i}
            {canEdit && (
              <button onClick={() => onRemove(i)} className="text-os-muted hover:text-red-400" aria-label={`Remove ${i}`}>
                <X size={12} />
              </button>
            )}
          </span>
        ))}
        {items.length === 0 && <span className="text-xs text-os-muted">No items yet.</span>}
      </div>
      {canEdit ? (
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }}
            placeholder={`Add to ${title.toLowerCase()}…`}
          />
          <OSButton variant="primary" onClick={submit}><Plus size={14} /> Add</OSButton>
        </div>
      ) : (
        <p className="text-[11px] text-os-muted flex items-center gap-1.5"><Lock size={11} /> Only the admin can edit these.</p>
      )}
    </section>
  );
};

const Settings = () => {
  const { roles, user } = useAuth();
  const canEdit = hasAdminRole(roles);
  const [state, setState] = useState<SettingsState>(() => readStore());

  useEffect(() => {
    readRemoteSettings().then(setState);
    const h = () => setState(readStore());
    window.addEventListener("ikamba:settings-changed", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("ikamba:settings-changed", h);
      window.removeEventListener("storage", h);
    };
  }, []);

  const update = async (key: keyof SettingsState, items: string[]) => {
    const next = { ...state, [key]: items };
    setState(next);
    try { await writeRemoteSettings(next, user?.id); toast.success("Settings saved"); }
    catch (e: any) { toast.error(e?.message || "Could not save settings"); }
  };
  const add = (key: keyof SettingsState) => (v: string) => update(key, [...state[key], v]);
  const remove = (key: keyof SettingsState) => (v: string) => update(key, state[key].filter((x) => x !== v));

  const reset = () => {
    if (!confirm("Reset all configuration to defaults?")) return;
    setState(DEFAULTS);
    writeRemoteSettings(DEFAULTS, user?.id).then(() => toast.success("Settings reset to defaults")).catch((e) => toast.error(e?.message || "Could not reset settings"));
  };

  const blocks = useMemo(() => ([
    { key: "product_lines" as const, title: "Product lines" },
    { key: "service_categories" as const, title: "Service categories" },
    { key: "pipeline_stages" as const, title: "Pipeline stages" },
    { key: "cost_categories" as const, title: "Cost categories" },
    { key: "payment_status" as const, title: "Payment status" },
    { key: "notification_prefs" as const, title: "Notification preferences" },
  ]), []);

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Configure the platform vocabulary used across all projects."
        actions={
          <>
            {canEdit ? (
              <>
                <Badge tone="gold"><Shield size={10} className="inline mr-1" /> Admin edit mode</Badge>
                <OSButton variant="ghost" onClick={reset}>Reset to defaults</OSButton>
              </>
            ) : (
              <Badge><Lock size={10} className="inline mr-1" /> Read-only</Badge>
            )}
          </>
        }
      />
      <div className="grid lg:grid-cols-2 gap-4">
        {blocks.map((b) => (
          <SettingsBlock
            key={b.key}
            title={b.title}
            items={state[b.key]}
            canEdit={canEdit}
            onAdd={add(b.key)}
            onRemove={remove(b.key)}
          />
        ))}
      </div>
    </div>
  );
};

export default Settings;
