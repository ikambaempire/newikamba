import { ReactNode } from "react";

export const PageHeader = ({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{title}</h1>
      {subtitle && <p className="text-os-muted text-sm mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
  </div>
);

export const KPICard = ({ label, value, hint, accent }: { label: string; value: string | number; hint?: string; accent?: boolean }) => (
  <div className={`os-card rounded-xl p-4 sm:p-5 ${accent ? "ring-1 ring-[hsl(var(--os-gold))]/40" : ""}`}>
    <div className="text-[11px] uppercase tracking-wider text-os-muted font-medium">{label}</div>
    <div className="mt-1.5 text-xl sm:text-2xl font-bold text-white">{value}</div>
    {hint && <div className="text-xs text-os-muted mt-1">{hint}</div>}
  </div>
);

export const Badge = ({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "gold" | "green" | "red" | "amber" | "blue" }) => {
  const toneMap: Record<string, string> = {
    default: "bg-white/10 text-white",
    gold: "bg-[hsl(var(--os-gold))]/20 text-[hsl(var(--os-gold))]",
    green: "bg-emerald-500/15 text-emerald-300",
    red: "bg-rose-500/15 text-rose-300",
    amber: "bg-amber-500/15 text-amber-300",
    blue: "bg-sky-500/15 text-sky-300",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${toneMap[tone]}`}>{children}</span>;
};

export const PaymentBadge = ({ status }: { status: string }) => {
  const tone = status === "Paid" ? "green" : status === "Overdue" ? "red" : status === "Partially Paid" ? "amber" : "blue";
  return <Badge tone={tone as any}>{status}</Badge>;
};

export const OSButton = ({
  children, variant = "primary", onClick, type = "button", className = "", disabled,
}: {
  children: ReactNode; variant?: "primary" | "ghost" | "outline"; onClick?: () => void;
  type?: "button" | "submit"; className?: string; disabled?: boolean;
}) => {
  const styles =
    variant === "primary"
      ? "bg-os-gold text-[hsl(var(--os-navy-deep))] hover:opacity-90"
      : variant === "outline"
      ? "border border-os text-white hover:bg-white/5"
      : "text-os-muted hover:text-white hover:bg-white/5";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  );
};

export const Field = ({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) => (
  <label className="block">
    <span className="text-xs font-semibold text-os-muted mb-1 block">{label}{required && <span className="text-rose-400 ml-0.5">*</span>}</span>
    {children}
  </label>
);

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full bg-[hsl(var(--os-surface-2))] border border-os rounded-lg px-3 py-2 text-sm text-white placeholder:text-os-muted focus:outline-none focus:ring-2 ring-os-gold ${props.className || ""}`}
  />
);

export const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`w-full bg-[hsl(var(--os-surface-2))] border border-os rounded-lg px-3 py-2 text-sm text-white placeholder:text-os-muted focus:outline-none focus:ring-2 ring-os-gold ${props.className || ""}`}
  />
);

export const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={`w-full bg-[hsl(var(--os-surface-2))] border border-os rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 ring-os-gold ${props.className || ""}`}
  />
);

export const Modal = ({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-[hsl(var(--os-surface))] border border-os rounded-t-2xl sm:rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-os-muted hover:text-white text-2xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
};
