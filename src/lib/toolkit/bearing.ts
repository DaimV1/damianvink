import { BANDS, HOLE, SHAFT, bandIndex } from "./iso286.ts";

/** Housing classes in SKF-style chart order: clearance → interference. */
export const HOUSING_CHART = [
  "F8",
  "G7",
  "H8",
  "H7",
  "H6",
  "JS7",
  "J7",
  "K7",
  "M7",
  "N7",
] as const;

/** Shaft classes in SKF-style chart order: clearance → interference. */
export const SHAFT_CHART = [
  "f7",
  "g6",
  "h6",
  "js5",
  "j5",
  "j6",
  "k5",
  "k6",
  "n6",
  "p6",
] as const;

export function pickBearing(d: number, rot: string, load: string) {
  let shaft: string;
  let hole: string;
  let holeAlt: string | null = null;
  let note: string;
  let noteEn: string;

  if (rot === "binnen") {
    if (load === "licht") {
      shaft = d <= 17 ? "js5" : "j6";
      hole = "H7";
      holeAlt = "J7";
      note = "Lichte last (P ≤ 0,05 C): overgang op de as, huis verschuifbaar.";
      noteEn = "Light load (P ≤ 0.05 C): transition fit on the shaft, housing slidable.";
    } else {
      if (d <= 10) shaft = "js5";
      else if (d <= 17) shaft = "j5";
      else shaft = "k5";
      hole = "H7";
      holeAlt = "K7";
      note =
        "Normale tot hoge last (P > 0,05 C): vastere as. Huis H7 als de buitenring moet kunnen schuiven; K7 als dat niet nodig is.";
      noteEn =
        "Normal to high load (P > 0.05 C): tighter shaft fit. Housing H7 if the outer ring must be able to slide; K7 if not needed.";
    }
  } else if (rot === "buiten") {
    shaft = "g6";
    if (load === "licht") {
      hole = "M7";
      note = "Buitenring draait, lichte last: vaste huispassing (M7), as los (g6).";
      noteEn = "Outer ring rotates, light load: fixed housing fit (M7), shaft loose (g6).";
    } else {
      hole = "N7";
      note = "Buitenring draait, normale tot hoge last: vaste huispassing (N7), as los (g6).";
      noteEn = "Outer ring rotates, normal to high load: fixed housing fit (N7), shaft loose (g6).";
    }
  } else {
    shaft = "g6";
    hole = "H7";
    note =
      "Stilstaande binnenring, axiale verschuiving gewenst: as g6. SKF: h6 als verschuiving op de as niet nodig is.";
    noteEn =
      "Stationary inner ring, axial shift desired: shaft g6. SKF: h6 if no shift on the shaft is needed.";
  }

  return { shaft, hole, holeAlt, note, noteEn };
}

export function computeBearing(d: number, rot: string, load: string) {
  const i = bandIndex(d);
  if (i < 0) return null;
  const rec = pickBearing(d, rot, load);
  return {
    ...rec,
    band: BANDS[i],
    shaftDev: SHAFT[rec.shaft],
    holeDev: HOLE[rec.hole],
    holeAltDev: rec.holeAlt ? HOLE[rec.holeAlt] : null,
    h6: SHAFT.h6,
    i,
  };
}
