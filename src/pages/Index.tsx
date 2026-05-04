import { useMemo, useState } from "react";
import { Cable, Github } from "lucide-react";
import { InputForm } from "@/components/cable/InputForm";
import { ResultsPanel } from "@/components/cable/ResultsPanel";
import { ThemeToggle } from "@/components/cable/ThemeToggle";
import { recommend, type CalcInput } from "@/lib/cable-calc";

const DEFAULT_INPUT: CalcInput = {
  phase: 3,
  voltage: 400,
  current: 80,
  pf: 0.85,
  length: 60,
  conductor: "copper",
  insulation: "XLPE",
  ambientC: 30,
  groupedCircuits: 1,
  vdLimitPct: 3,
  scCurrent: 10,
  scTime: 0.2,
  motor: { enabled: false, startMultiple: 6, startPf: 0.3, vdLimitPct: 10 },
};

const Index = () => {
  const [input, setInput] = useState<CalcInput>(DEFAULT_INPUT);
  const [tab, setTab] = useState<"input" | "results">("input");

  const { results, recommendedSize } = useMemo(() => recommend(input), [input]);

  return (
    <div className="min-h-screen pb-28">
      {/* App bar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="container flex items-center justify-between py-3 max-w-3xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground elev-2">
              <Cable className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">Cable Sizing</h1>
              <p className="text-[11px] text-muted-foreground leading-tight">IEC 60364 · PWA</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com"
              target="_blank" rel="noreferrer"
              aria-label="Source"
              className="ripple flex h-11 w-11 items-center justify-center rounded-full surface-2 elev-1 hover:surface-3"
            >
              <Github className="h-5 w-5" />
            </a>
            <ThemeToggle />
          </div>
        </div>

        {/* Tab switcher (mobile thumb-friendly) */}
        <div className="container max-w-3xl pb-3">
          <div className="grid grid-cols-2 rounded-full surface-2 p-1 elev-1">
            {(["input", "results"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`ripple h-10 rounded-full text-sm font-medium capitalize transition-all ${
                  tab === t ? "bg-card text-foreground elev-1" : "text-muted-foreground"
                }`}
              >
                {t === "input" ? "Inputs" : "Results"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="container max-w-3xl py-5">
        {/* Mobile single-tab, desktop side-by-side */}
        <div className="lg:hidden">
          {tab === "input" ? (
            <InputForm value={input} onChange={setInput} />
          ) : (
            <ResultsPanel results={results} recommendedSize={recommendedSize} />
          )}
        </div>
        <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-6">
          <InputForm value={input} onChange={setInput} />
          <ResultsPanel results={results} recommendedSize={recommendedSize} />
        </div>
      </main>

      {/* Mobile FAB to flip to results */}
      <div className="lg:hidden fixed bottom-5 left-0 right-0 z-40 px-4 pointer-events-none">
        <div className="container max-w-3xl pointer-events-auto">
          <button
            onClick={() => setTab(tab === "input" ? "results" : "input")}
            className="ripple w-full h-14 rounded-full text-base font-semibold elev-3 text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            {tab === "input" ? "View Results →" : "← Edit Inputs"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
