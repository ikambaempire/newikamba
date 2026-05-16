import { useOSStore } from "@/os/store";
import { PageHeader, Badge } from "@/os/components/ui";
import { TEAM, fmtRWF } from "@/os/mock/data";

const Team = () => {
  const { projects } = useOSStore();
  return (
    <div>
      <PageHeader title="Team" subtitle="Members and their current workload." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEAM.map((m) => {
          const owned = projects.filter((p) => p.owner.toLowerCase().includes(m.name.split(" ")[0].toLowerCase()));
          return (
            <div key={m.id} className="os-card rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-os-gold flex items-center justify-center text-[hsl(var(--os-navy-deep))] font-bold">
                  {m.name.split(" ").map((s) => s[0]).slice(0,2).join("")}
                </div>
                <div>
                  <div className="text-white font-semibold">{m.name}</div>
                  <div className="text-xs text-os-muted">{m.role}</div>
                </div>
              </div>
              <div className="text-xs text-os-muted mt-3">{m.email}</div>
              <div className="mt-4 pt-4 border-t border-os flex items-center justify-between">
                <span className="text-xs text-os-muted">Active projects</span>
                <Badge tone="gold">{owned.length}</Badge>
              </div>
              {owned.length > 0 && (
                <ul className="mt-2 text-xs text-os-muted space-y-1">
                  {owned.slice(0, 3).map((p) => <li key={p.id}>· {p.name} <span className="text-white">{fmtRWF(p.value)}</span></li>)}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Team;
