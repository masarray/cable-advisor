import {
  CABLE_TABLE, K_FACTOR, getAmbientFactor, getGroupingFactor,
  type CableSize, type Conductor, type Insulation, type Phase,
} from "./cable-data";

export interface CalcInput {
  phase: Phase;
  voltage: number;          // line-to-line for 3ph, line-to-neutral for 1ph (V)
  current: number;          // load current (A)
  pf: number;               // power factor 0..1
  length: number;           // one-way length (m)
  conductor: Conductor;
  insulation: Insulation;
  ambientC: number;         // °C
  groupedCircuits: number;  // n
  vdLimitPct: number;       // % e.g. 3 or 5
  scCurrent: number;        // prospective SC current (kA) at cable start
  scTime: number;           // protection clearing time (s)
  motor: {
    enabled: boolean;
    startMultiple: number;  // I_start / I_full (e.g. 6)
    startPf: number;        // typically 0.3
    vdLimitPct: number;     // typically 10–15%
  };
  /** Optional: pre-selected size (mm²). If undefined, auto-select. */
  selectedSize?: number;
}

export type Status = "PASS" | "CHECK" | "FAIL";

export interface CheckResult {
  label: string;
  status: Status;
  value: string;
  limit: string;
  detail?: string;
}

export interface CalcResult {
  size: number;
  iz: number;            // derated ampacity
  izBase: number;        // table ampacity
  ka: number;            // ambient factor
  kg: number;            // grouping factor
  vdVolts: number;
  vdPct: number;
  scWithstandKA: number; // 1s withstand
  scAdequate: boolean;
  motorVdPct: number;
  checks: CheckResult[];
  overallStatus: Status;
  recommended: boolean;
}

function ampacityFor(c: CableSize, conductor: Conductor, ins: Insulation, phase: Phase): number {
  if (conductor === "aluminium") {
    // Only XLPE Al table populated; approximate PVC Al = 0.78 × XLPE Cu equivalent if missing
    if (ins === "XLPE" && c.iz_al_xlpe_3 > 0) return c.iz_al_xlpe_3;
    return c.iz_al_xlpe_3 > 0 ? c.iz_al_xlpe_3 * (ins === "PVC" ? 0.82 : 1) : c.iz_cu_xlpe_3 * 0.78;
  }
  if (ins === "XLPE") return c.iz_cu_xlpe_3;
  return phase === 1 ? c.iz_cu_pvc : c.iz_cu_pvc_3;
}

function resistanceAt(c: CableSize, conductor: Conductor, tempC = 70): number {
  // R(t) = R20 * (1 + α(t-20)) ; α_cu = 0.00393, α_al = 0.00403
  const r20 = conductor === "copper" ? c.rCu20 : c.rAl20;
  const alpha = conductor === "copper" ? 0.00393 : 0.00403;
  return r20 * (1 + alpha * (tempC - 20));
}

function voltageDrop(
  c: CableSize, input: CalcInput, current: number, pf: number,
): { volts: number; pct: number } {
  const r = resistanceAt(c, input.conductor, 70); // Ω/km @ 70°C operating
  const x = c.x;
  const lengthKm = input.length / 1000;
  const sinPhi = Math.sqrt(Math.max(0, 1 - pf * pf));
  const factor = input.phase === 3 ? Math.sqrt(3) : 2; // 1ph = 2× one-way
  const volts = factor * current * (r * pf + x * sinPhi) * lengthKm;
  // Reference voltage for % — use line voltage for 3ph, phase voltage for 1ph
  const vRef = input.voltage;
  const pct = (volts / vRef) * 100;
  return { volts, pct };
}

function shortCircuitWithstand(c: CableSize, conductor: Conductor, ins: Insulation, time: number): number {
  // I²t = (k·S)² → I_withstand (kA) = k·S / sqrt(t) / 1000
  const k = K_FACTOR[conductor][ins];
  return (k * c.size) / Math.sqrt(time) / 1000;
}

function statusFor(value: number, limit: number, marginPct = 10): Status {
  if (value > limit) return "FAIL";
  if (value > limit * (1 - marginPct / 100)) return "CHECK";
  return "PASS";
}

function worstStatus(...s: Status[]): Status {
  if (s.includes("FAIL")) return "FAIL";
  if (s.includes("CHECK")) return "CHECK";
  return "PASS";
}

export function evaluateSize(c: CableSize, input: CalcInput): CalcResult {
  const ka = getAmbientFactor(input.ambientC, input.insulation);
  const kg = getGroupingFactor(input.groupedCircuits);
  const izBase = ampacityFor(c, input.conductor, input.insulation, input.phase);
  const iz = izBase * ka * kg;

  const vd = voltageDrop(c, input, input.current, input.pf);
  const scW = shortCircuitWithstand(c, input.conductor, input.insulation, input.scTime);
  const scAdequate = scW >= input.scCurrent;

  const motorVd = input.motor.enabled
    ? voltageDrop(c, input, input.current * input.motor.startMultiple, input.motor.startPf).pct
    : 0;

  const checks: CheckResult[] = [
    {
      label: "Ampacity (Iz ≥ Ib)",
      status: statusFor(input.current, iz),
      value: `Ib = ${input.current.toFixed(1)} A`,
      limit: `Iz' = ${iz.toFixed(1)} A`,
      detail: `Iz_table ${izBase.toFixed(0)} A × ka ${ka.toFixed(2)} × kg ${kg.toFixed(2)}`,
    },
    {
      label: "Voltage drop",
      status: statusFor(vd.pct, input.vdLimitPct, 15),
      value: `${vd.pct.toFixed(2)} %`,
      limit: `≤ ${input.vdLimitPct} %`,
      detail: `ΔU = ${vd.volts.toFixed(2)} V at ${input.length} m`,
    },
    {
      label: "Short-circuit withstand (1s eq.)",
      status: scAdequate
        ? (scW < input.scCurrent * 1.15 ? "CHECK" : "PASS")
        : "FAIL",
      value: `${scW.toFixed(2)} kA`,
      limit: `≥ ${input.scCurrent} kA @ ${input.scTime}s`,
      detail: `k·S/√t  (k = ${K_FACTOR[input.conductor][input.insulation]})`,
    },
  ];

  if (input.motor.enabled) {
    checks.push({
      label: "Motor starting voltage drop",
      status: statusFor(motorVd, input.motor.vdLimitPct, 15),
      value: `${motorVd.toFixed(2)} %`,
      limit: `≤ ${input.motor.vdLimitPct} %`,
      detail: `Istart = ${(input.current * input.motor.startMultiple).toFixed(0)} A, pf = ${input.motor.startPf}`,
    });
  }

  const overall = worstStatus(...checks.map((c) => c.status));

  return {
    size: c.size,
    iz, izBase, ka, kg,
    vdVolts: vd.volts, vdPct: vd.pct,
    scWithstandKA: scW, scAdequate,
    motorVdPct: motorVd,
    checks,
    overallStatus: overall,
    recommended: false,
  };
}

export function recommend(input: CalcInput): { results: CalcResult[]; recommendedSize: number | null } {
  const results = CABLE_TABLE.map((c) => evaluateSize(c, input));
  const firstPass = results.find((r) => r.overallStatus === "PASS");
  if (firstPass) firstPass.recommended = true;
  return { results, recommendedSize: firstPass?.size ?? null };
}
