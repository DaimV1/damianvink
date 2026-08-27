import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { planWeekCount } from "./activity.ts";
import {
  acceptChange,
  applyActivityProgress,
  emptyProject,
  gateBlockers,
  itemRef,
  nextAction,
  overdueIssues,
  parseProject,
  parseWorkspace,
  phaseChecks,
  sampleProject,
} from "./model.ts";
import { isBlankProject, isStockSample, isUntitled, pruneWorkspace, startNamedProject } from "./workspace-ops.ts";

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

  it("blocks a go without name, sponsor and phase checks", () => {
    const p = emptyProject();
    const blockers = gateBlockers(p);
    assert.ok(blockers.some((b) => b.includes("projectnaam")));
    assert.ok(blockers.some((b) => b.includes("opdrachtgever")));
    assert.ok(blockers.some((b) => b.includes("Resultaat")));
    const ready = emptyProject({
      name: "X",
      sponsor: "Y",
      accepted: true,
      phase: "afsluiting",
      handover: "Naar onderhoud",
      lessons: "Layout eerder bevriezen",
    });
    assert.deepEqual(gateBlockers(ready), []);
  });

  it("uses unfinished phase checks as gate blockers", () => {
    const p = emptyProject({
      name: "Perscel",
      sponsor: "Plant",
      phase: "definitie",
      result: "Cel",
      outcome: "Output",
      goal: "Takt",
      why: "Ombouw",
      authority: "5k",
      stakeholders: [{ id: "s", name: "Plant", influence: 5, interest: 5, note: "" }],
      risks: [{
        id: "r", source: "Leverancier", event: "Te laat", effect: "Slip",
        probability: 2, impact: 2, euro: null, owner: "PM", measure: "",
        response: "verkleinen", status: "open",
      }],
    });
    const labels = gateBlockers(p);
    assert.ok(labels.includes("Scope in en uit"));
    assert.ok(labels.includes("Baseline bevroren"));
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

  it("accepts a change onto the live plan", () => {
    const p = emptyProject({
      name: "Lijn",
      endDate: "2026-06-01",
      budget: 10000,
      baselineFrozen: true,
      baselineEndDate: "2026-06-01",
      baselineBudget: 10000,
      scopeIn: "Frame",
      changes: [{
        id: "c1", title: "Extra geleiding", scope: "Tweede rail",
        days: 7, money: 2500, riskNote: "", advice: "go", status: "open",
      }],
    });
    const next = acceptChange(p, "c1");
    assert.equal(next.endDate, "2026-06-08");
    assert.equal(next.budget, 12500);
    assert.match(next.scopeIn, /Tweede rail/);
    assert.equal(next.changes[0].status, "dicht");
    assert.equal(p.endDate, "2026-06-01");
  });

  it("lists overdue open issues", () => {
    const p = emptyProject({
      issues: [
        { id: "a", title: "Layout", owner: "Eng", due: "2026-01-01", status: "open", note: "" },
        { id: "b", title: "Old closed", owner: "Eng", due: "2026-01-01", status: "dicht", note: "" },
        { id: "c", title: "Later", owner: "Eng", due: "2026-12-31", status: "open", note: "" },
      ],
    });
    const late = overdueIssues(p, "2026-06-01");
    assert.deepEqual(late.map((i) => i.id), ["a"]);
  });

  it("rolls activity percent into project percentDone", () => {
    const p = emptyProject({
      activities: [
        { id: "1", wbs: "1", name: "A", kind: "activiteit", owner: "PM", start: "", end: "", pct: 20 },
        { id: "2", wbs: "2", name: "B", kind: "activiteit", owner: "PM", start: "", end: "", pct: 40 },
      ],
    });
    const next = applyActivityProgress(p, "1", 80);
    assert.equal(next.percentDone, 60);
  });
});

describe("workspace prune", () => {
  it("collapses extra untitled projects even when other fields are filled", () => {
    const a = emptyProject({ sponsor: "Plant" });
    const b = emptyProject({ manager: "PM" });
    const named = emptyProject({ name: "Perscel" });
    const ws = pruneWorkspace({
      version: 2,
      activeId: b.id,
      projects: { [a.id]: a, [b.id]: b, [named.id]: named },
    });
    assert.equal(Object.keys(ws.projects).length, 2);
    assert.ok(ws.projects[named.id]);
    assert.ok(ws.projects[b.id]);
    assert.equal(ws.projects[a.id], undefined);
    assert.equal(isUntitled(a), true);
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

  it("starts a named blank and drops leftover untitled", () => {
    const blank = emptyProject();
    const sample = sampleProject();
    const ws = startNamedProject({
      version: 2,
      activeId: blank.id,
      projects: { [blank.id]: blank, [sample.id]: sample },
    }, "Perscel 3");
    const names = Object.values(ws.projects).map((p) => p.name).sort();
    assert.deepEqual(names, ["Montagelijn module B", "Perscel 3"]);
    assert.equal(ws.projects[ws.activeId].name, "Perscel 3");
    assert.equal(isBlankProject(ws.projects[ws.activeId]), false);
  });
});

describe("plan horizon", () => {
  it("follows the live end date instead of a 16-week screenshot", () => {
    assert.equal(planWeekCount("", "", []), 8);
    const ten = planWeekCount("2026-01-05", "2026-03-16", []);
    assert.ok(ten >= 10 && ten <= 12, String(ten));
    const long = planWeekCount("2026-01-01", "2026-12-01", []);
    assert.ok(long > 16);
    assert.ok(long <= 40);
  });
});
