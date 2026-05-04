import { useState } from "react";
import type { CalcResult } from "@/lib/cable-calc";
import { StatusPill } from "./StatusPill";
import { Sparkles, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  results: CalcResult[];
  recommendedSize: number | null;
}

export function ResultsPanel({ results, recommendedSize }: Props) {
  const recommended = results.find((r) => r.size === recommendedSize) ?? null;

  return (
    <div className="space-y-5">
      {/* Recommendation hero */}
      <section className="relative overflow-hidden rounded-2xl elev-3 p-6 text-white"
        style={{ background: "var(--gradient-primary)" }}>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest opacity-90">
            <Sparkles className="h-4 w-4" /> Recommended size
          </div>
          {recommended ? (
            <>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono-num text-6xl font-bold leading-none">{recommended.size}</span>
                <span className="text-2xl font-medium opacity-90">mm²</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-white/20 px-3 py-1 font-mono-num">Iz' {recommended.iz.toFixed(0)} A</span>
                <span className="rounded-full bg-white/20 px-3 py-1 font-mono-num">ΔU {recommended.vdPct.toFixed(2)} %</span>
                <span className="rounded-full bg-white/20 px-3 py-1 font-mono-num">Isc 1s {recommended.scWithstandKA.toFixed(1)} kA</span>
              </div>
            </>
          ) : (
            <div className="mt-2 text-lg font-semibold">No size satisfies all checks. Increase size or revise parameters.</div>
          )}
        </div>
      </section>

      {/* Selected detail */}
      {recommended && <DetailCard result={recommended} highlight />}

      {/* All sizes table */}
      <section className="rounded-2xl surface-1 elev-1 overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">All sizes</h3>
          <span className="text-xs text-muted-foreground">tap to expand</span>
        </header>
        <ul className="divide-y divide-border">
          {results.map((r) => (
            <SizeRow key={r.size} result={r} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function DetailCard({ result, highlight }: { result: CalcResult; highlight?: boolean }) {
  return (
    <section className={cn(
      "rounded-2xl surface-1 elev-2 p-5 space-y-3 animate-fade-up",
      highlight && "ring-2 ring-primary/30",
    )}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Detailed checks</div>
          <div className="font-mono-num text-2xl font-bold">{result.size} mm²</div>
        </div>
        <StatusPill status={result.overallStatus} size="lg" />
      </div>
      <div className="space-y-2">
        {result.checks.map((c) => (
          <div key={c.label} className="rounded-xl surface-2 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{c.label}</span>
              <StatusPill status={c.status} size="sm" />
            </div>
            <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-2 font-mono-num text-sm">
              <span className="text-foreground">{c.value}</span>
              <span className="text-muted-foreground">{c.limit}</span>
            </div>
            {c.detail && <div className="mt-1 text-xs text-muted-foreground">{c.detail}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

function SizeRow({ result }: { result: CalcResult }) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button
        onClick={() => setOpen((o) => !o)}
        className="ripple flex w-full items-center justify-between gap-3 p-4 text-left hover:surface-2 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          {result.recommended && <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />}
          <span className="font-mono-num text-base font-bold w-14">{result.size}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">mm²</span>
        </div>
        <div className="flex items-center gap-3 font-mono-num text-xs text-muted-foreground">
          <span className="hidden xs:inline">Iz' {result.iz.toFixed(0)}A</span>
          <span>ΔU {result.vdPct.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={result.overallStatus} size="sm" />
          <ChevronDown className={cn("h-4 w-4 transition-transform text-muted-foreground", open && "rotate-180")} />
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 animate-fade-up">
          <div className="space-y-1.5">
            {result.checks.map((c) => (
              <div key={c.label} className="flex items-center justify-between gap-2 rounded-lg surface-2 px-3 py-2 text-xs">
                <span className="font-medium">{c.label}</span>
                <div className="flex items-center gap-2 font-mono-num">
                  <span>{c.value}</span>
                  <StatusPill status={c.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </li>
  );
}
