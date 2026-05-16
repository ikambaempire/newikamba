import { useState } from "react";
import { OSButton, Field, Input, Select, Textarea } from "@/os/components/ui";
import { upsertProfile, pickAvatarColor, DEFAULT_TOOLS, ADMIN_TOOLS, ALL_TOOLS, type OSToolKey } from "@/os/access";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

interface Props {
  userId: string;
  email: string;
  isAdmin: boolean;
  initialName?: string;
  onComplete: () => void;
}

const ROLES = ["Founder", "Producer", "Project Manager", "Editor", "Designer", "Writer", "Marketing", "Finance", "Operations", "Other"];
const DEPTS = ["Leadership", "Production", "Post-Production", "Creative", "Marketing", "Finance & Ops", "Sales"];

const SetupWizard = ({ userId, email, isAdmin, initialName, onComplete }: Props) => {
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState(initialName || "");
  const [role, setRole] = useState("Producer");
  const [department, setDepartment] = useState("Production");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [tools, setTools] = useState<OSToolKey[]>(isAdmin ? ADMIN_TOOLS : DEFAULT_TOOLS);

  const toggleTool = (k: OSToolKey) =>
    setTools((t) => (t.includes(k) ? t.filter((x) => x !== k) : [...t, k]));

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const finish = () => {
    const now = new Date().toISOString();
    upsertProfile({
      userId, email, fullName: fullName.trim() || email.split("@")[0],
      role, department, phone: phone.trim() || undefined, bio: bio.trim() || undefined,
      avatarColor: pickAvatarColor(userId),
      setupComplete: true,
      allowedTools: isAdmin ? ADMIN_TOOLS : tools,
      createdAt: now, updatedAt: now,
    });
    onComplete();
  };

  const steps = ["Welcome", "Profile", "Role", isAdmin ? "Confirm" : "Tools"];

  return (
    <div className="os-theme fixed inset-0 z-50 bg-[hsl(var(--os-navy-deep))] flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl os-card rounded-2xl p-6 sm:p-8 my-8">
        <div className="flex gap-1.5 mb-6">
          {steps.map((_, i) => (
            <span key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-os-gold" : "bg-white/10"}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="text-center py-4">
            <div className="h-14 w-14 rounded-full bg-os-gold mx-auto flex items-center justify-center mb-4">
              <Sparkles className="text-[hsl(var(--os-navy-deep))]" size={26} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to iKAMBA Media OS</h2>
            <p className="text-os-muted text-sm mb-6">Let's set up your personalized workspace in under a minute.</p>
            <OSButton variant="primary" onClick={next} className="mx-auto">Get started <ArrowRight size={16} /></OSButton>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Your profile</h2>
            <p className="text-os-muted text-sm mb-5">How should we show your name across the OS?</p>
            <div className="space-y-3">
              <Field label="Full name" required><Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" /></Field>
              <Field label="Phone / WhatsApp"><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+250 ..." /></Field>
              <Field label="Short bio"><Textarea rows={2} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="One line about what you do" /></Field>
            </div>
            <div className="flex justify-between mt-6">
              <OSButton variant="ghost" onClick={back}>Back</OSButton>
              <OSButton variant="primary" onClick={next} disabled={!fullName.trim()}>Next <ArrowRight size={16} /></OSButton>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Your role</h2>
            <p className="text-os-muted text-sm mb-5">Helps the admin assign the right tools.</p>
            <div className="space-y-3">
              <Field label="Role" required>
                <Select value={role} onChange={(e) => setRole(e.target.value)}>
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </Select>
              </Field>
              <Field label="Department" required>
                <Select value={department} onChange={(e) => setDepartment(e.target.value)}>
                  {DEPTS.map((d) => <option key={d}>{d}</option>)}
                </Select>
              </Field>
            </div>
            <div className="flex justify-between mt-6">
              <OSButton variant="ghost" onClick={back}>Back</OSButton>
              <OSButton variant="primary" onClick={next}>Next <ArrowRight size={16} /></OSButton>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-1">{isAdmin ? "You're all set" : "Pick tools you'd like access to"}</h2>
            <p className="text-os-muted text-sm mb-5">
              {isAdmin
                ? "As an admin you have access to every tool. You can manage other team members' access from the User Access page."
                : "Choose the tools you'd like to use. An admin will confirm your access shortly. Dashboard and To-Dos are always available."}
            </p>
            {!isAdmin && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {ALL_TOOLS.filter((t) => t.key !== "/os/access" && t.key !== "/os/settings").map((t) => {
                  const active = tools.includes(t.key);
                  const locked = t.key === "/os" || t.key === "/os/todos";
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => !locked && toggleTool(t.key)}
                      disabled={locked}
                      className={`text-left rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                        active ? "border-[hsl(var(--os-gold))] bg-os-gold/10 text-white" : "border-os text-os-muted hover:text-white"
                      } ${locked ? "opacity-70" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{t.label}</span>
                        {active && <CheckCircle2 size={14} className="text-os-gold" />}
                      </div>
                      {locked && <div className="text-[10px] text-os-muted mt-0.5">Always available</div>}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="flex justify-between mt-6">
              <OSButton variant="ghost" onClick={back}>Back</OSButton>
              <OSButton variant="primary" onClick={finish}>Finish setup <CheckCircle2 size={16} /></OSButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupWizard;
