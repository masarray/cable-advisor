import { useState } from "react";
import type { CalcInput } from "@/lib/cable-calc";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: CalcInput;
  onChange: (v: CalcInput) => void;
}

function Field({ label, suffix, children }: { label: string; suffix?: string; children: React.ReactNode }) {
  return (
    <div className="m3-field">
      <label>{label}{suffix && <span className="ml-1 text-muted-foreground/70 normal-case">({suffix})</span>}</label>
      {children}
    </div>
  );
}

export function InputForm({ value, onChange }: Props) {
  const [motorOpen, setMotorOpen] = useState(value.motor.enabled);

  const set = <K extends keyof CalcInput>(k: K, v: CalcInput[K]) => onChange({ ...value, [k]: v });
  const setMotor = <K extends keyof CalcInput["motor"]>(k: K, v: CalcInput["motor"][K]) =>
    onChange({ ...value, motor: { ...value.motor, [k]: v } });

  const num = (s: string, fb: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : fb;
  };

  return (
    <div className="space-y-5">
      {/* System */}
      <section className="rounded-2xl surface-1 elev-1 p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">System</h2>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Phase">
            <select value={value.phase} onChange={(e) => set("phase", Number(e.target.value) as 1 | 3)}>
              <option value={1}>1-phase</option>
              <option value={3}>3-phase</option>
            </select>
          </Field>
          <Field label="Voltage" suffix="V">
            <input inputMode="decimal" value={value.voltage} onChange={(e) => set("voltage", num(e.target.value, value.voltage))} />
          </Field>
          <Field label="Load current" suffix="A">
            <input inputMode="decimal" value={value.current} onChange={(e) => set("current", num(e.target.value, value.current))} />
          </Field>
          <Field label="Power factor">
            <input inputMode="decimal" step="0.01" value={value.pf} onChange={(e) => set("pf", num(e.target.value, value.pf))} />
          </Field>
          <Field label="Length" suffix="m">
            <input inputMode="decimal" value={value.length} onChange={(e) => set("length", num(e.target.value, value.length))} />
          </Field>
          <Field label="VD limit" suffix="%">
            <input inputMode="decimal" value={value.vdLimitPct} onChange={(e) => set("vdLimitPct", num(e.target.value, value.vdLimitPct))} />
          </Field>
        </div>
      </section>

      {/* Cable */}
      <section className="rounded-2xl surface-1 elev-1 p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Cable & Installation</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Conductor">
            <select value={value.conductor} onChange={(e) => set("conductor", e.target.value as CalcInput["conductor"])}>
              <option value="copper">Copper (Cu)</option>
              <option value="aluminium">Aluminium (Al)</option>
            </select>
          </Field>
          <Field label="Insulation">
            <select value={value.insulation} onChange={(e) => set("insulation", e.target.value as CalcInput["insulation"])}>
              <option value="PVC">PVC (70°C)</option>
              <option value="XLPE">XLPE (90°C)</option>
            </select>
          </Field>
          <Field label="Ambient" suffix="°C">
            <input inputMode="decimal" value={value.ambientC} onChange={(e) => set("ambientC", num(e.target.value, value.ambientC))} />
          </Field>
          <Field label="Grouped circuits">
            <input inputMode="numeric" value={value.groupedCircuits} onChange={(e) => set("groupedCircuits", num(e.target.value, value.groupedCircuits))} />
          </Field>
        </div>
      </section>

      {/* Short circuit */}
      <section className="rounded-2xl surface-1 elev-1 p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Short Circuit</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Isc prospective" suffix="kA">
            <input inputMode="decimal" value={value.scCurrent} onChange={(e) => set("scCurrent", num(e.target.value, value.scCurrent))} />
          </Field>
          <Field label="Clearing time" suffix="s">
            <input inputMode="decimal" step="0.01" value={value.scTime} onChange={(e) => set("scTime", num(e.target.value, value.scTime))} />
          </Field>
        </div>
      </section>

      {/* Motor */}
      <section className="rounded-2xl surface-1 elev-1 overflow-hidden">
        <button
          type="button"
          onClick={() => { setMotorOpen((o) => !o); setMotor("enabled", !value.motor.enabled); }}
          className="ripple flex w-full items-center justify-between p-5"
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-5 w-9 rounded-full transition-colors relative",
              value.motor.enabled ? "bg-primary" : "bg-muted",
            )}>
              <div className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full bg-card elev-1 transition-all",
                value.motor.enabled ? "left-[18px]" : "left-0.5",
              )} />
            </div>
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Motor Starting</span>
          </div>
          <ChevronDown className={cn("h-5 w-5 transition-transform", motorOpen && "rotate-180")} />
        </button>
        {motorOpen && value.motor.enabled && (
          <div className="grid grid-cols-2 gap-3 p-5 pt-0 animate-fade-up">
            <Field label="I_start / I_full">
              <input inputMode="decimal" step="0.1" value={value.motor.startMultiple}
                onChange={(e) => setMotor("startMultiple", num(e.target.value, value.motor.startMultiple))} />
            </Field>
            <Field label="Start pf">
              <input inputMode="decimal" step="0.05" value={value.motor.startPf}
                onChange={(e) => setMotor("startPf", num(e.target.value, value.motor.startPf))} />
            </Field>
            <Field label="Start VD limit" suffix="%">
              <input inputMode="decimal" value={value.motor.vdLimitPct}
                onChange={(e) => setMotor("vdLimitPct", num(e.target.value, value.motor.vdLimitPct))} />
            </Field>
          </div>
        )}
      </section>
    </div>
  );
}
