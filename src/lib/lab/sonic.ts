export type Instrument = "bass" | "melody" | "drum";
export type SonicNote = {
  id: number;
  instrument: Instrument;
  step: number;
  row: number;
  size: number;
};
export const STEPS = 16;
export const ROWS = 8;
export const MAX_NOTES = 48;
const SCALE = [0, 2, 4, 7, 9, 12, 14, 16];
export function frequency(note: SonicNote) {
  const midi = (note.instrument === "bass" ? 36 : 60) + SCALE[ROWS - 1 - note.row];
  return 440 * Math.pow(2, (midi - 69) / 12);
}
export function stepDuration(bpm: number) {
  return 60 / bpm / 4;
}
export function starterNotes(): SonicNote[] {
  const notes: Omit<SonicNote, "id">[] = [
    ...[0, 4, 8, 12].map((step, i) => ({
      instrument: "bass" as const,
      step,
      row: [7, 5, 4, 5][i],
      size: 70,
    })),
    ...[0, 3, 6, 8, 11, 14].map((step, i) => ({
      instrument: "melody" as const,
      step,
      row: [3, 2, 1, 3, 2, 1][i],
      size: 55,
    })),
    ...[0, 8].map((step) => ({ instrument: "drum" as const, step, row: 6, size: 65 })),
    ...[4, 12].map((step) => ({ instrument: "drum" as const, step, row: 4, size: 45 })),
    ...[2, 6, 10, 14].map((step) => ({ instrument: "drum" as const, step, row: 0, size: 30 })),
  ];
  return notes.map((note, id) => ({ ...note, id }));
}
/** Keep the pulse and bass intact; vary a bounded subset of melodic notes. */
export function varyNotes(notes: SonicNote[], random: () => number = Math.random): SonicNote[] {
  let changed = false;
  const occupied = new Set(notes.map((note) => `${note.step}:${note.row}`));
  return notes.map((note) => {
    if (note.instrument !== "melody" || (changed && random() > 0.45)) return { ...note };
    const direction = random() < 0.5 ? -1 : 1;
    for (const delta of [direction, -direction]) {
      const row = note.row + delta;
      if (row < 0 || row >= ROWS || occupied.has(`${note.step}:${row}`)) continue;
      occupied.delete(`${note.step}:${note.row}`);
      occupied.add(`${note.step}:${row}`);
      changed = true;
      return { ...note, row };
    }
    return { ...note };
  });
}
