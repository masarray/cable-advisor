// IEC 60364-5-52 reference data (simplified, common installation methods).
// Ampacities in Amps for single-core or multi-core PVC/XLPE in air or conduit at 30°C ambient.
// Values approximate IEC tables — sufficient for engineering estimation, not contract design.

export type Conductor = "copper" | "aluminium";
export type Insulation = "PVC" | "XLPE";
export type Phase = 1 | 3;
export type InstallMethod = "A1" | "B1" | "C" | "E" | "F";

export interface CableSize {
  /** mm² */
  size: number;
  /** Resistance Ω/km @ 20°C */
  rCu20: number;
  rAl20: number;
  /** Reactance Ω/km (typical multi-core LV) */
  x: number;
  /** Ampacity A — copper, 2 loaded, PVC */
  iz_cu_pvc: number;
  /** Ampacity A — copper, 3 loaded, PVC */
  iz_cu_pvc_3: number;
  /** Ampacity A — copper, XLPE, 3 loaded */
  iz_cu_xlpe_3: number;
  /** Ampacity A — aluminium, XLPE, 3 loaded */
  iz_al_xlpe_3: number;
  /** Short-circuit withstand 1s — k·S where k = 115 Cu/PVC, 143 Cu/XLPE, 76 Al/PVC, 94 Al/XLPE */
}

// Standard IEC sizes. Ampacity values from IEC 60364-5-52 Method C (in conduit on wall).
export const CABLE_TABLE: CableSize[] = [
  { size: 1.5,  rCu20: 12.10, rAl20: 19.50, x: 0.115, iz_cu_pvc: 19.5, iz_cu_pvc_3: 17.5, iz_cu_xlpe_3: 23,  iz_al_xlpe_3: 0 },
  { size: 2.5,  rCu20: 7.41,  rAl20: 12.10, x: 0.110, iz_cu_pvc: 27,   iz_cu_pvc_3: 24,   iz_cu_xlpe_3: 31,  iz_al_xlpe_3: 0 },
  { size: 4,    rCu20: 4.61,  rAl20: 7.41,  x: 0.107, iz_cu_pvc: 36,   iz_cu_pvc_3: 32,   iz_cu_xlpe_3: 42,  iz_al_xlpe_3: 0 },
  { size: 6,    rCu20: 3.08,  rAl20: 4.61,  x: 0.100, iz_cu_pvc: 46,   iz_cu_pvc_3: 41,   iz_cu_xlpe_3: 54,  iz_al_xlpe_3: 0 },
  { size: 10,   rCu20: 1.83,  rAl20: 3.08,  x: 0.094, iz_cu_pvc: 63,   iz_cu_pvc_3: 57,   iz_cu_xlpe_3: 75,  iz_al_xlpe_3: 58 },
  { size: 16,   rCu20: 1.15,  rAl20: 1.91,  x: 0.090, iz_cu_pvc: 85,   iz_cu_pvc_3: 76,   iz_cu_xlpe_3: 100, iz_al_xlpe_3: 77 },
  { size: 25,   rCu20: 0.727, rAl20: 1.20,  x: 0.086, iz_cu_pvc: 112,  iz_cu_pvc_3: 96,   iz_cu_xlpe_3: 133, iz_al_xlpe_3: 102 },
  { size: 35,   rCu20: 0.524, rAl20: 0.868, x: 0.083, iz_cu_pvc: 138,  iz_cu_pvc_3: 119,  iz_cu_xlpe_3: 164, iz_al_xlpe_3: 125 },
  { size: 50,   rCu20: 0.387, rAl20: 0.641, x: 0.082, iz_cu_pvc: 168,  iz_cu_pvc_3: 144,  iz_cu_xlpe_3: 198, iz_al_xlpe_3: 151 },
  { size: 70,   rCu20: 0.268, rAl20: 0.443, x: 0.080, iz_cu_pvc: 213,  iz_cu_pvc_3: 184,  iz_cu_xlpe_3: 253, iz_al_xlpe_3: 192 },
  { size: 95,   rCu20: 0.193, rAl20: 0.320, x: 0.079, iz_cu_pvc: 258,  iz_cu_pvc_3: 223,  iz_cu_xlpe_3: 306, iz_al_xlpe_3: 232 },
  { size: 120,  rCu20: 0.153, rAl20: 0.253, x: 0.078, iz_cu_pvc: 299,  iz_cu_pvc_3: 259,  iz_cu_xlpe_3: 354, iz_al_xlpe_3: 269 },
  { size: 150,  rCu20: 0.124, rAl20: 0.206, x: 0.078, iz_cu_pvc: 344,  iz_cu_pvc_3: 299,  iz_cu_xlpe_3: 408, iz_al_xlpe_3: 309 },
  { size: 185,  rCu20: 0.0991, rAl20: 0.164, x: 0.077, iz_cu_pvc: 392, iz_cu_pvc_3: 341,  iz_cu_xlpe_3: 464, iz_al_xlpe_3: 353 },
  { size: 240,  rCu20: 0.0754, rAl20: 0.125, x: 0.077, iz_cu_pvc: 461, iz_cu_pvc_3: 403,  iz_cu_xlpe_3: 546, iz_al_xlpe_3: 415 },
  { size: 300,  rCu20: 0.0601, rAl20: 0.100, x: 0.077, iz_cu_pvc: 530, iz_cu_pvc_3: 464,  iz_cu_xlpe_3: 628, iz_al_xlpe_3: 477 },
  { size: 400,  rCu20: 0.0470, rAl20: 0.0778, x: 0.076, iz_cu_pvc: 634, iz_cu_pvc_3: 557, iz_cu_xlpe_3: 751, iz_al_xlpe_3: 571 },
];

// Ambient temperature derating (IEC 60364-5-52 Table B.52.14) — PVC/XLPE
export const AMBIENT_DERATING: Record<number, { pvc: number; xlpe: number }> = {
  10: { pvc: 1.22, xlpe: 1.15 },
  15: { pvc: 1.17, xlpe: 1.12 },
  20: { pvc: 1.12, xlpe: 1.08 },
  25: { pvc: 1.06, xlpe: 1.04 },
  30: { pvc: 1.00, xlpe: 1.00 },
  35: { pvc: 0.94, xlpe: 0.96 },
  40: { pvc: 0.87, xlpe: 0.91 },
  45: { pvc: 0.79, xlpe: 0.87 },
  50: { pvc: 0.71, xlpe: 0.82 },
  55: { pvc: 0.61, xlpe: 0.76 },
  60: { pvc: 0.50, xlpe: 0.71 },
};

// Grouping derating (IEC Table B.52.17) — circuits in same conduit/tray
export const GROUPING_DERATING: Record<number, number> = {
  1: 1.00, 2: 0.80, 3: 0.70, 4: 0.65, 5: 0.60, 6: 0.57, 7: 0.54, 8: 0.52, 9: 0.50, 10: 0.48,
};

// Short-circuit constant k (IEC 60364-4-43)
export const K_FACTOR: Record<Conductor, Record<Insulation, number>> = {
  copper: { PVC: 115, XLPE: 143 },
  aluminium: { PVC: 76, XLPE: 94 },
};

export function getAmbientFactor(temp: number, ins: Insulation): number {
  const keys = Object.keys(AMBIENT_DERATING).map(Number).sort((a, b) => a - b);
  const lo = keys.filter((k) => k <= temp).pop() ?? keys[0];
  const hi = keys.find((k) => k >= temp) ?? keys[keys.length - 1];
  const fLo = AMBIENT_DERATING[lo][ins === "XLPE" ? "xlpe" : "pvc"];
  const fHi = AMBIENT_DERATING[hi][ins === "XLPE" ? "xlpe" : "pvc"];
  if (lo === hi) return fLo;
  return fLo + ((temp - lo) / (hi - lo)) * (fHi - fLo);
}

export function getGroupingFactor(circuits: number): number {
  if (circuits <= 1) return 1;
  if (circuits >= 10) return GROUPING_DERATING[10];
  return GROUPING_DERATING[circuits] ?? 1;
}
