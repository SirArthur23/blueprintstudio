import { afterEach, describe, expect, it, vi } from "vitest";
import { demoBlueprint, getWorkflowTemplates, type BlueprintFile, type CanvasNode } from "@/lib/blueprint-data";
import { applyBlueprintAlternative, buildPromptPack, buildReport, clearWarningResolution, createBlankBlueprint, createBlueprintAlternative, formatReportAsMarkdown, generateDraftWorkflow, readStoredBlueprintState, runHitmChecks, storageKey, updateWarningResolution } from "@/lib/blueprint-engine";
import { parseBlueprintBackup } from "@/lib/blueprint-schema";

afterEach(() => vi.unstubAllGlobals());
const project = (): BlueprintFile => structuredClone(demoBlueprint);
const settings = (["public", "internal", "sensitive"] as const).flatMap((sensitivity) =>
  (["simple", "moderate", "complex"] as const).flatMap((complexity) =>
    (["assistive", "reviewed", "automated"] as const).flatMap((automationLevel) =>
      (["solo", "small-team", "technical-team"] as const).flatMap((teamCapacity) =>
        (["en", "de"] as const).map((locale) => ({ sensitivity, complexity, automationLevel, teamCapacity, locale }))))));

describe("deterministic workflow generation", () => {
  it.each(settings)("keeps explicit control and valid connections: $sensitivity/$complexity/$automationLevel/$teamCapacity/$locale", ({ locale, ...setting }) => {
    const input = { ...project(), ...setting };
    const before = structuredClone(input);
    const workflow = generateDraftWorkflow(input, locale);
    expect(workflow).toEqual(generateDraftWorkflow(input, locale));
    expect(input).toEqual(before);
    const ids = new Set(workflow.nodes.map((node) => node.id));
    expect(ids.size).toBe(workflow.nodes.length);
    expect(workflow.edges.every((edge) => ids.has(edge.from) && ids.has(edge.to))).toBe(true);
    const mapped = { ...input, ...workflow };
    const open = runHitmChecks(mapped).filter((warning) => warning.status === "open");
    expect(open.map((warning) => warning.id)).toEqual(setting.sensitivity === "sensitive" ? ["sensitive-tool-generated-ai-draft"] : []);
    if (setting.sensitivity === "sensitive") {
      mapped.nodes = mapped.nodes.map((node) => node.kind === "ai" ? { ...node, dataApproval: "approved" as const } : node);
      expect(runHitmChecks(mapped).filter((warning) => warning.status === "open")).toEqual([]);
    }
    expect(workflow.nodes.some((node) => node.kind === "review")).toBe(true);
    expect(workflow.nodes.some((node) => node.kind === "gate")).toBe(true);
    if (setting.sensitivity !== "public" || setting.complexity !== "simple" || setting.automationLevel === "automated") {
      expect(workflow.nodes.some((node) => node.kind === "escalation")).toBe(true);
    }
  });

  it("starts blank with no workflow and independent editable arrays", () => {
    const blank = createBlankBlueprint();
    expect(blank.nodes).toEqual([]);
    expect(blank.edges).toEqual([]);
    expect(blank.alternatives).toEqual([]);
    blank.gates[0].owner = "Changed";
    expect(createBlankBlueprint().gates[0].owner).not.toBe("Changed");
  });

  it("localizes template content without mutating the English template", () => {
    for (const de of getWorkflowTemplates("de")) {
      const en = getWorkflowTemplates("en").find((item) => item.id === de.id)!;
      expect(de.title).not.toBe(en.title);
      expect(de.nodes.map((node) => node.id)).toEqual(en.nodes.map((node) => node.id));
      expect(de.edges.map((edge) => [edge.from, edge.to, edge.type])).toEqual(en.edges.map((edge) => [edge.from, edge.to, edge.type]));
      expect(de.nodes.some((node, index) => node.title !== en.nodes[index].title)).toBe(true);
    }
  });
});

describe("HITM warnings", () => {
  const node = (id: string, kind: CanvasNode["kind"]): CanvasNode => ({ id, kind, title: id, detail: "", owner: "Team owner", x: 0, y: 0 });
  it("finds an unsafe output path even when another path has review", () => {
    const input = { ...project(), nodes: [node("ai", "ai"), node("review", "review"), node("tool", "tool"), node("output", "output")], edges: [
      { id: "safe", from: "ai", to: "review", type: "sequence" as const },
      { id: "bypass", from: "ai", to: "tool", type: "sequence" as const },
      { id: "out", from: "tool", to: "output", type: "sequence" as const },
      { id: "loop", from: "tool", to: "ai", type: "feedback" as const },
    ] };
    expect(runHitmChecks(input).find((item) => item.id === "ai-output-ai")?.severity).toBe("high");
  });
  it("records a documented exception, reopens it, and includes it in the report", () => {
    const input = { ...project(), nodes: [node("ai", "ai")], edges: [] };
    const warning = runHitmChecks(input).find((item) => item.id === "ai-control-ai")!;
    input.warningResolutions = updateWarningResolution([], warning.id, "exception", "Internal exercise with no operational output.");
    expect(runHitmChecks(input).find((item) => item.id === warning.id)?.status).toBe("exception");
    expect(formatReportAsMarkdown(input)).toContain("Internal exercise");
    input.warningResolutions = clearWarningResolution(input.warningResolutions, warning.id);
    expect(runHitmChecks(input).find((item) => item.id === warning.id)?.status).toBe("open");
  });
  it("carries project boundaries and human-owned decisions into every starter prompt", () => {
    const input = project();
    const prompts = buildPromptPack(input);
    expect(prompts).toHaveLength(7);
    expect(prompts.every((item) => item.owner.trim() && item.prompt.includes(input.projectName))).toBe(true);
    expect(prompts.every((item) => item.checks.find((check) => check.id === "decision-boundary")?.status === "pass")).toBe(true);
    expect(buildReport(input).canvasNodeDetails).toHaveLength(input.nodes.length);
  });
});

describe("explainable alternatives", () => {
  it.each(["privacy", "review", "small-team"] as const)("creates %s separately and preserves previous work on adoption", (kind) => {
    const input = project();
    input.nodes[0].title = "Custom team step";
    input.warningResolutions = [{ id: "old", status: "exception", note: "old exception", updatedAt: "2026-10-13" }];
    const before = structuredClone(input);
    const option = createBlueprintAlternative(input, kind);
    expect(input).toEqual(before);
    expect(option.changes.join(" ")).toContain("Custom steps are not carried over");
    input.alternatives.push(option);
    const adopted = applyBlueprintAlternative(input, option);
    expect(adopted.warningResolutions).toEqual([]);
    const previous = adopted.alternatives.find((item) => item.kind === "snapshot")!;
    expect(previous.snapshot.nodes).toEqual(before.nodes);
    expect(previous.snapshot.warningResolutions).toEqual(before.warningResolutions);
    expect(previous.snapshot).not.toHaveProperty("alternatives");
    const restored = applyBlueprintAlternative(adopted, previous);
    expect(restored.nodes).toEqual(before.nodes);
    expect(restored.gates).toEqual(before.gates);
    expect(restored.warningResolutions).toEqual(before.warningResolutions);
    adopted.nodes[0].title = "edited";
    expect(option.snapshot.nodes[0].title).not.toBe("edited");
    expect(parseBlueprintBackup(JSON.parse(JSON.stringify(adopted)))).toEqual(adopted);
  });
  it.each(["privacy", "review", "small-team"] as const)("does not increase assistive automation for %s", (kind) => {
    const input = { ...project(), automationLevel: "assistive" as const };
    expect(createBlueprintAlternative(input, kind).snapshot.automationLevel).toBe("assistive");
  });
  it("provides escalation for a stronger-review option even for a simple public project", () => {
    const input = { ...project(), sensitivity: "public" as const, complexity: "simple" as const, automationLevel: "assistive" as const };
    const option = createBlueprintAlternative(input, "review", "de");
    expect(option.snapshot.nodes.some((item) => item.kind === "escalation")).toBe(true);
    expect(runHitmChecks({ ...input, ...option.snapshot }).filter((item) => item.status === "open")).toEqual([]);
  });
});

describe("backup and local continuity", () => {
  it("roundtrips wrapped and direct backups without changing local content", () => {
    const input = project();
    input.nodes[0].title = "Freigabeverantwortlichkeitsüberprüfung";
    expect(parseBlueprintBackup(JSON.parse(JSON.stringify({ blueprint: input, report: buildReport(input) })))).toEqual(input);
    expect(parseBlueprintBackup(input)).toEqual(input);
  });
  it.each([null, [], {}, { projectName: 2 }, { projectName: "x", sensitivity: "unknown" }, { projectName: "x", nodes: [null] }, { projectName: "x", gates: [{}] }, { projectName: "x", alternatives: [{}] }, { projectName: "x", nodes: [] }, { projectName: "x", ownership: "invalid" }])("rejects malformed backup %j", (input) => {
    expect(() => parseBlueprintBackup(input)).toThrow();
  });
  it("rejects duplicate IDs and orphaned edges", () => {
    const input = project();
    input.nodes.push({ ...input.nodes[0] });
    expect(() => parseBlueprintBackup(input)).toThrow(/duplicate/);
    const orphan = project();
    orphan.edges[0].to = "missing";
    expect(() => parseBlueprintBackup(orphan)).toThrow(/missing node/);
  });
  it("rejects incomplete alternative snapshots instead of inventing a workflow", () => {
    const input = project();
    const option = createBlueprintAlternative(input, "privacy");
    const broken = { ...input, alternatives: [{ ...option, snapshot: {} }] };
    expect(() => parseBlueprintBackup(broken)).toThrow(/Incomplete alternative/);
  });
  it.each(["hitm-blueprint-file-v3", "hitm-blueprint-file-v4", "hitm-blueprint-file-v5"])("migrates %s without writing or discarding blank state", (key) => {
    const input = createBlankBlueprint();
    const old: Record<string, unknown> = { ...input };
    delete old.alternatives;
    delete old.warningResolutions;
    const localStorage = { getItem: vi.fn((name) => name === key ? JSON.stringify(old) : null), setItem: vi.fn() };
    vi.stubGlobal("window", { localStorage });
    const state = readStoredBlueprintState();
    expect(state.failed).toBe(false);
    expect(state.blueprint.nodes).toEqual([]);
    expect(state.blueprint.alternatives).toEqual([]);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
  it("migrates legacy dashed connections", () => {
    const input = project();
    const legacy = { ...input, edges: input.edges.map(({ type, ...edge }) => ({ ...edge, dashed: type === "feedback" })) };
    expect(parseBlueprintBackup(legacy).edges.find((edge) => edge.id === "e6")?.type).toBe("feedback");
  });
  it("signals corrupt or unavailable storage without overwriting it", () => {
    const localStorage = { getItem: vi.fn((key) => key === storageKey ? "{bad json" : null), setItem: vi.fn() };
    vi.stubGlobal("window", { localStorage });
    expect(readStoredBlueprintState().failed).toBe(true);
    expect(localStorage.setItem).not.toHaveBeenCalled();
    localStorage.getItem.mockImplementation(() => { throw new Error("Storage disabled"); });
    expect(readStoredBlueprintState().failed).toBe(true);
  });
});
