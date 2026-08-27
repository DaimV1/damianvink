import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  emptyProject,
  gateBlockers,
  itemRef,
  nextAction,
  parseProject,
  parseWorkspace,
  phaseChecks,
  sampleProject,
} from "./model.ts";
import { isBlankProject, isStockSample, pruneWorkspace } from "./workspace-ops.ts";

describe("pm workspace model", () => {
  it("migrates a v1 project object into a workspace", () => {
    const ws = parseWorkspace({ name: "Lijn B", phase: "definitie", sponsor: "Plant" });
    assert.equal(ws.version, 2);
    const project = ws.projects[ws.activeId];
    assert.equal(project.name, "Lijn B");
    assert.equal(project.phase, "definitie");
    assert.equal(project.sponsor, "Plant");
    assert.ok(project.id);
  });

  it("keeps a v2 workspace intact", () => {
    const a = emptyProject({ name: "A" });
    const b = emptyProject({ name: "B" });
    const ws = parseWorkspace({ version: 2, activeId: b.id, projects: { [a.id]: a, [b.id]: b } });
    assert.equal(ws.activeId, b.id);
    assert.equal(Object.keys(ws.projects).length, 2);
  });

  it("parses broken input as empty project", () => {
    const p = parseProject(null);
    assert.equal(p.phase, "orientatie");
    assert.deepEqual(p.activities, []);
  });

  it("gives stable item refs", () => {
    const items = [{ id: "x" }, { id: "y" }];
    assert.equal(itemRef("R", items, "y"), "R-02");
  });

  it("blocks a go without name and sponsor", () => {
    const p = emptyProject();
    assert.ok(gateBlockers(p).length >= 2);
    const ready = emptyProject({ name: "X", sponsor: "Y", accepted: true, phase: "afsluiting" });
    assert.deepEqual(gateBlockers(ready), []);
  });

  it("points next action at the first missing check", () => {
    const p = emptyProject({ name: "X", sponsor: "Y" });
    assert.equal(nextAction(p), phaseChecks(p).find((c) => !c.done)?.label);
  });

  it("builds a usable sample", () => {
    const s = sampleProject();
    assert.ok(s.name);
    assert.ok(s.risks.length);
    assert.ok(s.activities.length);
  });
});

describe("workspace prune", () => {
  it("collapses extra blank projects to one", () => {
    const a = emptyProject();
    const b = emptyProject();
    const named = emptyProject({ name: "Perscel" });
    const ws = pruneWorkspace({
      version: 2,
      activeId: b.id,
      projects: { [a.id]: a, [b.id]: b, [named.id]: named },
    });
    assert.equal(Object.keys(ws.projects).length, 2);
    assert.ok(ws.projects[named.id]);
    assert.ok(ws.projects[b.id]);
    assert.equal(ws.activeId, b.id);
  });

  it("keeps one stock sample", () => {
    const s1 = sampleProject();
    const s2 = sampleProject();
    assert.ok(isStockSample(s1) && isStockSample(s2));
    const ws = pruneWorkspace({
      version: 2,
      activeId: s2.id,
      projects: { [s1.id]: s1, [s2.id]: s2 },
    });
    assert.equal(Object.keys(ws.projects).length, 1);
    assert.equal(ws.activeId, s2.id);
  });

  it("treats a filled project as not blank", () => {
    assert.equal(isBlankProject(emptyProject({ name: "X" })), false);
    assert.equal(isBlankProject(emptyProject()), true);
  });
});
