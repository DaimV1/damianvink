import assert from "node:assert/strict";
import test from "node:test";
import { frequency, starterNotes, stepDuration, varyNotes } from "./sonic.ts";

test("starter pattern has distinct cells, stable IDs and all three voices", () => {
  const notes = starterNotes();
  assert.equal(new Set(notes.map((n) => n.id)).size, notes.length);
  assert.equal(new Set(notes.map((n) => `${n.step}:${n.row}`)).size, notes.length);
  assert.equal(new Set(notes.map((n) => n.instrument)).size, 3);
  assert.ok(notes.every((n) => n.row >= 0 && n.row < 8 && n.step >= 0 && n.step < 16));
});
test("higher positions raise pitch and bass sits two octaves below melody", () => {
  const note = starterNotes()[0];
  assert.ok(frequency({ ...note, row: 0 }) > frequency({ ...note, row: 7 }));
  assert.equal(
    frequency({ ...note, instrument: "melody" }) / frequency({ ...note, instrument: "bass" }),
    4,
  );
  assert.equal(stepDuration(120) * 16, 2);
});
test("repeated variations preserve rhythm section, identity, bounds and distinct cells", () => {
  let notes = starterNotes();
  const original = structuredClone(notes);
  for (let i = 0; i < 100; i++) {
    notes = varyNotes(notes, () => (i % 2 ? 0.2 : 0.8));
    assert.deepEqual(
      notes.filter((n) => n.instrument !== "melody"),
      original.filter((n) => n.instrument !== "melody"),
    );
    assert.deepEqual(
      notes.map((n) => n.id),
      original.map((n) => n.id),
    );
    assert.equal(new Set(notes.map((n) => `${n.step}:${n.row}`)).size, notes.length);
    assert.ok(notes.every((n) => n.row >= 0 && n.row < 8));
  }
  assert.notDeepEqual(
    varyNotes(original, () => 0.2),
    original,
  );
  assert.deepEqual(starterNotes(), original);
});
