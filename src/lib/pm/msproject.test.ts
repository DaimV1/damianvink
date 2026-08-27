import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emptyProject } from "./model.ts";
import { buildMsProjectXml } from "./msproject.ts";

describe("MS Project export", () => {
  it("chains FS predecessors in WBS order", () => {
    const p = emptyProject({
      name: "Lijn",
      activities: [
        { id: "b", wbs: "1.1", name: "Scope", kind: "activiteit", owner: "", start: "2026-01-02", end: "2026-01-10", pct: 0 },
        { id: "a", wbs: "1", name: "Kick-off", kind: "mijlpaal", owner: "", start: "2026-01-01", end: "2026-01-01", pct: 100 },
      ],
    });
    const xml = buildMsProjectXml(p);
    assert.match(xml, /PredecessorUID>1</);
    assert.match(xml, /<Type>1<\/Type>/);
  });
});
