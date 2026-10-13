import { describe, expect, it } from "vitest";
import { demoBlueprint, type BlueprintFile, type CanvasNode } from "@/lib/blueprint-data";
import { applyBlueprintAlternative, buildPromptPack, buildReport, createBlueprintAlternative, formatPromptPackAsMarkdown, formatReportAsMarkdown, generateDraftWorkflow, runHitmChecks } from "@/lib/blueprint-engine";
import { parseBlueprintBackup } from "@/lib/blueprint-schema";
import { personaBlueprint, personaScenarios } from "../fixtures/personas";

function mapped(patch: Partial<BlueprintFile> = {}) {
  const blueprint = { ...structuredClone(demoBlueprint), ...patch };
  return { ...blueprint, ...generateDraftWorkflow(blueprint) };
}
const warnings = (blueprint: BlueprintFile) => runHitmChecks(blueprint).map((item) => item.id);
const add = (blueprint: BlueprintFile, id: string, kind: CanvasNode["kind"], owner = "Human lead") => {
  blueprint.nodes.push({ id, kind, owner, title: id, detail: "", x: 2000, y: 2000 });
};

describe("remaining HITM checks", () => {
  it("does not misclassify human AI leads and trainers as an AI system", () => {
    const blueprint = mapped();
    blueprint.nodes.find((item) => item.kind === "decision")!.owner = "AI lead";
    blueprint.ownership.find((item) => item.id === "decisions")!.humanOwner = "KI-Trainerin";
    expect(warnings(blueprint).filter((id) => id.startsWith("ai-final"))).toEqual([]);
  });
  it("does not treat AI-owned review/approval as human control", () => {
    const blueprint = mapped();
    for (const node of blueprint.nodes) if (["review", "gate", "decision"].includes(node.kind)) node.owner = "KI-System";
    expect(warnings(blueprint)).toContain("ai-output-generated-ai-draft");
    expect(warnings(blueprint)).toContain("ai-final-node-generated-decision");
    expect(warnings(blueprint)).toContain("output-approval-generated-output");
    blueprint.ownership.find((item) => item.id === "decisions")!.humanOwner = "ChatGPT";
    expect(warnings(blueprint)).toContain("ai-final-owner-decisions");
  });
  it("requires human owners at consequential nodes", () => {
    const blueprint = mapped();
    blueprint.nodes.find((item) => item.kind === "gate")!.owner = " ";
    expect(warnings(blueprint)).toContain("missing-human-owner-generated-approval");
  });
  it("keeps sensitive data unapproved until an explicit human review is recorded", () => {
    const blueprint = mapped({ sensitivity: "sensitive" });
    expect(warnings(blueprint)).toContain("sensitive-tool-generated-ai-draft");
    blueprint.nodes.find((item) => item.kind === "ai")!.dataApproval = "rejected";
    expect(warnings(blueprint)).toContain("sensitive-tool-generated-ai-draft");
    blueprint.nodes.find((item) => item.kind === "ai")!.dataApproval = "approved";
    expect(warnings(blueprint)).not.toContain("sensitive-tool-generated-ai-draft");
    expect(parseBlueprintBackup(blueprint)).toEqual(blueprint);
  });
  it("rejects a data-use approval value outside the supported states", () => {
    const blueprint = mapped();
    const invalid = { ...blueprint, nodes: blueprint.nodes.map((item) => ({ ...item, dataApproval: "automatic" })) };
    expect(() => parseBlueprintBackup(invalid)).toThrow();
  });
  it("a disconnected gate does not protect an automated tool", () => {
    const blueprint = mapped({ automationLevel: "automated" });
    add(blueprint, "service", "tool");
    blueprint.edges.push({ id: "direct", from: "generated-context", to: "service", type: "sequence" });
    expect(warnings(blueprint)).toContain("automation-gate-service");
    blueprint.edges.push({ id: "gated", from: "generated-approval", to: "service", type: "approval" });
    expect(warnings(blueprint)).toContain("automation-gate-service"); // bypass still exists
    blueprint.edges = blueprint.edges.filter((item) => item.id !== "direct");
    expect(warnings(blueprint)).not.toContain("automation-gate-service");
  });
  it("requires a model/tool change gate on the tool's own path", () => {
    const blueprint = mapped();
    add(blueprint, "service", "tool");
    expect(warnings(blueprint)).toContain("tool-change-path-service");
    blueprint.edges.push({ id: "change-control", from: "generated-change-gate", to: "service", type: "approval" });
    expect(warnings(blueprint)).not.toContain("tool-change-path-service");
    blueprint.gates.find((item) => item.id === "model-tool-changes")!.required = false;
    expect(warnings(blueprint)).toContain("tool-change-governance");
  });
  it("requires reachable escalation, not just an escalation node elsewhere", () => {
    const blueprint = mapped({ complexity: "complex" });
    blueprint.edges = blueprint.edges.filter((item) => item.to !== "generated-escalation");
    expect(warnings(blueprint)).toContain("risk-escalation-generated-ai-draft");
    expect(warnings(blueprint)).toContain("disconnected-generated-escalation");
    blueprint.edges.push({ id: "restore", from: "generated-decision", to: "generated-escalation", type: "escalation" });
    expect(warnings(blueprint)).not.toContain("risk-escalation-generated-ai-draft");
  });
  it("requires a connected audit trail for each consequential decision", () => {
    const blueprint = mapped();
    blueprint.edges = blueprint.edges.filter((item) => item.to !== "generated-audit");
    expect(warnings(blueprint)).toContain("decision-audit-generated-decision");
    blueprint.edges.push({ id: "restore-audit", from: "generated-output", to: "generated-audit", type: "data" });
    expect(warnings(blueprint)).not.toContain("decision-audit-generated-decision");
  });
  it("recognizes an intentional human stopping point and finds loops without exits", () => {
    const blueprint = mapped();
    add(blueprint, "manual-stop", "human");
    blueprint.edges.push({ id: "branch", from: "generated-decision", to: "manual-stop", type: "rejection" });
    expect(warnings(blueprint)).toContain("branch-end-manual-stop");
    blueprint.nodes.find((item) => item.id === "manual-stop")!.explicitStop = true;
    expect(warnings(blueprint)).not.toContain("branch-end-manual-stop");
    blueprint.nodes.find((item) => item.id === "manual-stop")!.owner = "AI";
    expect(warnings(blueprint)).toContain("missing-human-owner-manual-stop");
    const loop = mapped();
    loop.nodes = loop.nodes.filter((item) => ["ai", "review"].includes(item.kind));
    loop.edges = [{ id: "a", from: "generated-ai-draft", to: "generated-review", type: "sequence" }, { id: "b", from: "generated-review", to: "generated-ai-draft", type: "feedback" }];
    expect(warnings(loop)).toContain("branch-no-exit-generated-ai-draft");
  });
  it("localizes all warning fields while retaining stable IDs", () => {
    const blueprint = mapped({ sensitivity: "sensitive", complexity: "complex", automationLevel: "automated" });
    add(blueprint, "Werkzeug", "tool", "KI");
    const en = runHitmChecks(blueprint, "en");
    const de = runHitmChecks(blueprint, "de");
    expect(de.map((item) => item.id)).toEqual(en.map((item) => item.id));
    for (const [index, warning] of de.entries()) for (const key of ["title", "trigger", "missingControl", "recommendation"] as const) expect(warning[key]).not.toBe(en[index][key]);
  });
});

describe("German generated content", () => {
  it("localizes prompts, quality checks, reports, and Markdown without changing user data", () => {
    const blueprint = mapped();
    blueprint.projectName = "Eigener Projekttitel";
    blueprint.projectGoal = "Mein eigener Text bleibt exakt so erhalten.";
    const before = structuredClone(blueprint);
    const prompts = buildPromptPack(blueprint, "de");
    expect(prompts).toHaveLength(7);
    expect(prompts[0].title).toBe("Rollenbeschreibung");
    expect(prompts.every((item) => item.prompt.includes("Die KI darf keine finalen Entscheidungen"))).toBe(true);
    expect(prompts.every((item) => item.checks.find((check) => check.id === "decision-boundary")?.status === "pass")).toBe(true);
    expect(formatPromptPackAsMarkdown(blueprint, undefined, "de")).toContain("Erwartetes Ergebnis:");
    const report = buildReport(blueprint, "de");
    expect(report.summary).toBe(before.projectGoal);
    expect(report.ownershipDetails[0].area).toBe("Ziel");
    expect(report.gateDetails[0].label).toBe("Vor der Generierung");
    expect(report.promptDetails[0].title).toBe("Rollenbeschreibung");
    expect(formatReportAsMarkdown(blueprint, report)).toContain("## Verantwortungsmatrix");
    expect(formatReportAsMarkdown(blueprint, report)).not.toContain("## Ownership Matrix");
    expect(blueprint).toEqual(before);
    expect(buildPromptPack(blueprint, "en")[0].title).toBe("Role definition");
  });
  it("localizes default demo content and empty fallbacks", () => {
    expect(buildReport(demoBlueprint, "de").projectName).toBe("Assistenz für Kunden-Onboarding");
    const blank = mapped({ projectName: "", audience: "", selectedPattern: "", projectGoal: "", sourceMaterial: "" });
    expect(buildReport(blank, "de").projectName).toBe("Unbenanntes HITM-Projekt");
    expect(buildReport(blank, "de").stackFit).toContain("Wählen Sie");
  });
});

describe("scripted persona simulations (not real-user UX evidence)", () => {
  it.each(personaScenarios)("$id: complete a recoverable German blueprint, investigate an unsafe edit, and restore", (scenario) => {
    const blueprint = personaBlueprint(scenario);
    const initial = runHitmChecks(blueprint).filter((item) => item.status === "open");
    expect(initial.map((item) => item.id)).toEqual(scenario.sensitivity === "sensitive" ? ["sensitive-tool-generated-ai-draft"] : []);
    if (scenario.sensitivity === "sensitive") blueprint.nodes.find((item) => item.kind === "ai")!.dataApproval = "approved";
    expect(runHitmChecks(blueprint).filter((item) => item.status === "open")).toEqual([]);
    const before = structuredClone(blueprint);
    blueprint.edges.push({ id: "unsafe", from: "generated-ai-draft", to: "generated-output", type: "sequence" });
    expect(warnings(blueprint)).toContain("ai-output-generated-ai-draft");
    blueprint.edges = blueprint.edges.filter((item) => item.id !== "unsafe");
    const option = createBlueprintAlternative(blueprint, "privacy", "de");
    blueprint.alternatives.push(option);
    const adopted = applyBlueprintAlternative(blueprint, option, "de");
    expect(warnings(adopted)).toContain("sensitive-tool-generated-ai-draft"); // approval is not inherited into a new draft
    const restored = applyBlueprintAlternative(adopted, adopted.alternatives.find((item) => item.kind === "snapshot")!, "de");
    expect(restored.nodes).toEqual(before.nodes);
    expect(parseBlueprintBackup(restored)).toEqual(restored);
    expect(formatReportAsMarkdown(restored, buildReport(restored, "de"))).toContain(scenario.goal);
  });
});
