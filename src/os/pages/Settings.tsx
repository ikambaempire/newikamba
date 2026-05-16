import { PageHeader, Badge } from "@/os/components/ui";
import { PRODUCT_LINES, SERVICE_CATEGORIES, PIPELINE_STAGES, COST_CATEGORIES } from "@/os/mock/data";

const SettingsBlock = ({ title, items }: { title: string; items: readonly string[] | string[] }) => (
  <section className="os-card rounded-xl p-5">
    <h3 className="text-white font-bold mb-3">{title}</h3>
    <div className="flex flex-wrap gap-2">
      {items.map((i) => <Badge key={i} tone="default">{i}</Badge>)}
    </div>
    <p className="text-xs text-os-muted mt-3">Editing coming soon. These will be admin-configurable.</p>
  </section>
);

const Settings = () => (
  <div>
    <PageHeader title="Settings" subtitle="Configure the platform vocabulary used across all projects." />
    <div className="grid lg:grid-cols-2 gap-4">
      <SettingsBlock title="Product lines" items={[...PRODUCT_LINES]} />
      <SettingsBlock title="Service categories" items={[...SERVICE_CATEGORIES]} />
      <SettingsBlock title="Pipeline stages" items={[...PIPELINE_STAGES]} />
      <SettingsBlock title="Cost categories" items={COST_CATEGORIES} />
      <SettingsBlock title="Payment status" items={["Paid","Pending","Overdue","Partially Paid"]} />
      <SettingsBlock title="Notification preferences" items={["Email","WhatsApp (coming soon)","In-app"]} />
    </div>
  </div>
);

export default Settings;
