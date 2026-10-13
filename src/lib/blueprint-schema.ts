import { demoBlueprint, edgeTypes, nodeKinds, stackPatterns, type BlueprintFile, type CanvasEdge, type BlueprintAlternative } from "@/lib/blueprint-data";

type JsonObject = Record<string, unknown>;

function object(value: unknown): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected an object in blueprint backup.");
  return value as JsonObject;
}

function string(value: unknown): string {
  if (typeof value !== "string") throw new Error("Expected text in blueprint backup.");
  return value;
}

function choice<T extends string>(value: unknown, choices: readonly T[]): T {
  if (typeof value !== "string" || !choices.includes(value as T)) throw new Error("Unknown blueprint setting.");
  return value as T;
}

function number(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error("Invalid canvas coordinate.");
  return value;
}

function list<T>(value: unknown, parse: (item: JsonObject) => T): T[] {
  if (!Array.isArray(value)) throw new Error("Expected a list in blueprint backup.");
  return value.map((item) => parse(object(item)));
}

function unique(items: Array<{ id: string }>) {
  const ids = new Set<string>();
  for (const item of items) {
    if (!item.id || ids.has(item.id)) throw new Error("Missing or duplicate item ID in blueprint backup.");
    ids.add(item.id);
  }
}

// Parse only known fields. Legacy backups may omit newer fields; supplied invalid
// fields are rejected as a whole rather than silently replacing project work.
function parseProject(value: unknown, snapshot = false): BlueprintFile {
  const input = object(value);
  if (!snapshot && typeof input.projectName !== "string") throw new Error("Not a Blueprint Studio backup.");
  if (snapshot) {
    for (const key of ["sensitivity", "complexity", "automationLevel", "teamCapacity", "selectedPattern", "ownership", "gates", "nodes", "edges", "warningResolutions"]) {
      if (!(key in input)) throw new Error("Incomplete alternative snapshot.");
    }
  }
  const result: BlueprintFile = structuredClone(demoBlueprint);
  result.alternatives = [];
  const textFields = ["projectName", "audience", "projectGoal", "aiAssistance", "humanControl", "sourceMaterial", "successMeasures", "scopeIn", "scopeOut"] as const;
  for (const key of textFields) if (key in input) result[key] = string(input[key]);
  if ("sensitivity" in input) result.sensitivity = choice(input.sensitivity, ["public", "internal", "sensitive"]);
  if ("complexity" in input) result.complexity = choice(input.complexity, ["simple", "moderate", "complex"]);
  if ("automationLevel" in input) result.automationLevel = choice(input.automationLevel, ["assistive", "reviewed", "automated"]);
  if ("teamCapacity" in input) result.teamCapacity = choice(input.teamCapacity, ["solo", "small-team", "technical-team"]);
  if ("selectedPattern" in input) result.selectedPattern = choice(input.selectedPattern, ["", ...stackPatterns.map((item) => item.id)]);
  if ("ownership" in input) result.ownership = list(input.ownership, (item) => ({ id: string(item.id), area: string(item.area), humanOwner: string(item.humanOwner), aiRole: string(item.aiRole), approval: string(item.approval) }));
  if ("gates" in input) result.gates = list(input.gates, (item) => {
    if (typeof item.required !== "boolean") throw new Error("Invalid gate requirement.");
    return { id: string(item.id), label: string(item.label), description: string(item.description), required: item.required, owner: string(item.owner) };
  });
  if ("nodes" in input) result.nodes = list(input.nodes, (item) => {
    if ("explicitStop" in item && typeof item.explicitStop !== "boolean") throw new Error("Invalid explicit stop flag.");
    return { id: string(item.id), kind: choice(item.kind, nodeKinds.map((kind) => kind.id)), title: string(item.title), detail: string(item.detail), owner: string(item.owner), x: number(item.x), y: number(item.y),
      ...(item.dataApproval === undefined ? {} : { dataApproval: choice(item.dataApproval, ["unreviewed", "approved", "rejected"] as const) }),
      ...(item.explicitStop === undefined ? {} : { explicitStop: item.explicitStop as boolean }),
    };
  });
  if ("edges" in input) result.edges = list(input.edges, (item): CanvasEdge => ({
    id: string(item.id), from: string(item.from), to: string(item.to),
    type: item.type === undefined ? (item.dashed === true ? "feedback" : "sequence") : choice(item.type, edgeTypes.map((type) => type.id)),
    ...(item.label === undefined ? {} : { label: string(item.label) }),
  }));
  result.warningResolutions = "warningResolutions" in input ? list(input.warningResolutions, (item) => ({ id: string(item.id), status: choice(item.status, ["resolved", "exception"]), note: string(item.note), updatedAt: string(item.updatedAt) })) : [];
  if (!snapshot && "alternatives" in input) result.alternatives = list(input.alternatives, (item): BlueprintAlternative => {
    const parsed = parseProject(item.snapshot, true);
    const date = string(item.createdAt);
    if (!Number.isFinite(Date.parse(date))) throw new Error("Invalid alternative date.");
    const strings = (value: unknown) => {
      if (!Array.isArray(value)) throw new Error("Invalid alternative explanation.");
      return value.map(string);
    };
    return {
      id: string(item.id), kind: choice(item.kind, ["privacy", "review", "small-team", "snapshot"]), title: string(item.title), summary: string(item.summary),
      createdAt: date, rationale: strings(item.rationale), changes: strings(item.changes),
      snapshot: { sensitivity: parsed.sensitivity, complexity: parsed.complexity, automationLevel: parsed.automationLevel, teamCapacity: parsed.teamCapacity, selectedPattern: parsed.selectedPattern, ownership: parsed.ownership, gates: parsed.gates, nodes: parsed.nodes, edges: parsed.edges, warningResolutions: parsed.warningResolutions },
    };
  });
  for (const items of [result.nodes, result.edges, result.gates, result.ownership, result.warningResolutions, result.alternatives]) unique(items);
  const nodes = new Set(result.nodes.map((node) => node.id));
  if (result.edges.some((edge) => !nodes.has(edge.from) || !nodes.has(edge.to))) throw new Error("A connection points to a missing node.");
  return result;
}

export function parseBlueprintBackup(value: unknown): BlueprintFile {
  const input = object(value);
  return parseProject("blueprint" in input ? input.blueprint : input);
}
