import {
  blankBlueprint,
  demoBlueprint,
  getStackPatterns,
  getNodeKinds,
  getEdgeTypes,
  type BlueprintFile,
  type BlueprintAlternative,
  type AlternativeKind,
  type CanvasEdge,
  type CanvasNode,
  type EdgeType,
  type GateItem,
  type NodeKind,
  type OwnershipItem,
  type StackPatternId,
  type WarningResolution,
  type WarningStatus,
} from "@/lib/blueprint-data";
import { t, type Locale } from "@/lib/i18n";
import { parseBlueprintBackup } from "@/lib/blueprint-schema";
import { additionalHitmChecks, isHumanControl, isHumanOwner } from "@/lib/hitm-structure";
import { blueprintForOutput, germanPromptItems, localizeDefaultRole, localizeDemoIntake } from "@/lib/blueprint-localization";

export const storageKey = "hitm-blueprint-file-v6";
const legacyStorageKeys = ["hitm-blueprint-file-v5", "hitm-blueprint-file-v4", "hitm-blueprint-file-v3"];

export type CanvasSnapshot = Pick<BlueprintFile, "nodes" | "edges">;

export type HitmWarningSeverity = "high" | "medium" | "low";

export type HitmWarning = {
  id: string;
  severity: HitmWarningSeverity;
  title: string;
  trigger: string;
  missingControl: string;
  recommendation: string;
  relatedNodeIds: string[];
  relatedEdgeIds: string[];
  status: "open" | WarningStatus;
  note: string;
};

export type PromptCheckStatus = "pass" | "warning";

export type PromptQualityCheck = {
  id: string;
  label: string;
  status: PromptCheckStatus;
  detail: string;
};

export type PromptPackItem = {
  id: string;
  title: string;
  purpose: string;
  owner: string;
  whenToUse: string;
  inputs: string[];
  output: string;
  checks: PromptQualityCheck[];
  prompt: string;
};

export function readStoredBlueprintState(): { blueprint: BlueprintFile; failed: boolean } {
  if (typeof window === "undefined") return { blueprint: demoBlueprint, failed: false };
  try {
    const raw =
      window.localStorage.getItem(storageKey) ??
      legacyStorageKeys.map((key) => window.localStorage.getItem(key)).find(Boolean);
    if (!raw) return { blueprint: structuredClone(demoBlueprint), failed: false };
    return { blueprint: parseBlueprintBackup(JSON.parse(raw)), failed: false };
  } catch {
    return { blueprint: structuredClone(demoBlueprint), failed: true };
  }
}

export function readStoredBlueprint(): BlueprintFile {
  return readStoredBlueprintState().blueprint;
}

export function normalizeBlueprint(blueprint: BlueprintFile): BlueprintFile {
  const normalizedEdges: CanvasEdge[] = Array.isArray(blueprint.edges)
    ? blueprint.edges.map((edge) => ({
        id: edge.id,
        from: edge.from,
        to: edge.to,
        type:
          edge.type ??
          ((edge as CanvasEdge & { dashed?: boolean }).dashed ? "feedback" : "sequence"),
        label: edge.label,
      }))
    : demoBlueprint.edges;

  return {
    ...demoBlueprint,
    ...blueprint,
    ownership: blueprint.ownership?.length ? blueprint.ownership : demoBlueprint.ownership,
    gates: blueprint.gates?.length ? blueprint.gates : demoBlueprint.gates,
    nodes: Array.isArray(blueprint.nodes) ? blueprint.nodes : demoBlueprint.nodes,
    edges: normalizedEdges,
    warningResolutions: Array.isArray(blueprint.warningResolutions) ? blueprint.warningResolutions : [],
    alternatives: Array.isArray(blueprint.alternatives) ? blueprint.alternatives : [],
  };
}

export function createBlankBlueprint(): BlueprintFile {
  return {
    ...blankBlueprint,
    ownership: blankBlueprint.ownership.map((item) => ({ ...item })),
    gates: blankBlueprint.gates.map((gate) => ({ ...gate })),
    nodes: blankBlueprint.nodes.map((node) => ({ ...node })),
    edges: blankBlueprint.edges.map((edge) => ({ ...edge })),
    warningResolutions: [],
    alternatives: [],
  };
}

function cloneAlternativeSnapshot(source: BlueprintAlternative["snapshot"]): BlueprintAlternative["snapshot"] {
  return {
    sensitivity: source.sensitivity,
    complexity: source.complexity,
    automationLevel: source.automationLevel,
    teamCapacity: source.teamCapacity,
    selectedPattern: source.selectedPattern,
    ownership: source.ownership.map((item) => ({ ...item })),
    gates: source.gates.map((item) => ({ ...item })),
    nodes: source.nodes.map((item) => ({ ...item })),
    edges: source.edges.map((item) => ({ ...item })),
    warningResolutions: source.warningResolutions.map((item) => ({ ...item })),
  };
}

function localizedAlternativeCopy(kind: AlternativeKind, locale: Locale) {
  const copy = locale === "de"
    ? {
        privacy: {
          title: "Datenschutzorientierte Alternative",
          summary: "Verschärft Daten- und Freigabegrenzen, bevor Informationen ein Werkzeug oder einen externen Schritt erreichen.",
          rationale: ["Die aktuelle Sensibilität oder Quellenlage erfordert eine klarere Datenbegrenzung.", "Lokale oder kontrollierte Verarbeitung wird gegenüber Komfort priorisiert."],
          changes: ["Sensibilität auf sensibel setzen", "Lokalen Datenschutz-Pfad auswählen", "Freigaben für Daten-, Nutzer- und Automatisierungsgrenzen verlangen"],
        },
        review: {
          title: "Alternative mit stärkerer menschlicher Prüfung",
          summary: "Ersetzt riskante Automatisierung durch sichtbare menschliche Prüfung, Freigabe und Eskalation.",
          rationale: ["Automatisierung, Komplexität oder Auswirkungen benötigen zusätzliche menschliche Kontrolle.", "Finale Entscheidungen und externe Ergebnisse bleiben ausdrücklich beim Menschen."],
          changes: ["Automatisierung auf ‚mit Prüfung‘ begrenzen", "Prüf- und Freigabepunkte im Workflow hinzufügen", "Eskalationsweg für Unklarheit oder Risiko sichtbar machen"],
        },
        "small-team": {
          title: "Alternative für kleine Teams",
          summary: "Reduziert laufende Komplexität und hält die Verantwortung in einem überschaubaren, prüfbaren Ablauf.",
          rationale: ["Die gewählte Teamkapazität verlangt einen leichter wartbaren Ablauf.", "Weniger bewegliche Teile erleichtern klare Verantwortung und wiederholbare Prüfung."],
          changes: ["Kapazität auf kleines Team setzen", "Automatisierung auf ‚mit Prüfung‘ begrenzen", "Einen einfachen, lokalen oder No-Code-Pfad bevorzugen"],
        },
      }
    : {
        privacy: {
          title: "Privacy-first alternative",
          summary: "Tightens data and approval boundaries before information reaches a tool or external step.",
          rationale: ["The current sensitivity or source context needs a clearer data boundary.", "Local or controlled processing is prioritised over convenience."],
          changes: ["Set sensitivity to sensitive", "Select the local-first privacy path", "Require gates around data, user, and automation boundaries"],
        },
        review: {
          title: "Stronger human-review alternative",
          summary: "Replaces risky automation with visible human review, approval, and escalation.",
          rationale: ["Automation, complexity, or impact needs more explicit human control.", "Final decisions and external outputs remain clearly human-owned."],
          changes: ["Limit automation to reviewed", "Add review and approval points to the workflow", "Make an escalation route visible for uncertainty or risk"],
        },
        "small-team": {
          title: "Small-team alternative",
          summary: "Reduces ongoing complexity and keeps accountability in a manageable, reviewable workflow.",
          rationale: ["The selected team capacity calls for a lighter operational path.", "Fewer moving parts make ownership and repeatable review easier."],
          changes: ["Set capacity to small team", "Limit automation to reviewed", "Prefer a simple local-first or no-code path"],
        },
      };
  return copy[kind];
}

export function createBlueprintAlternative(blueprint: BlueprintFile, kind: AlternativeKind, locale: Locale = "en"): BlueprintAlternative {
  const copy = localizedAlternativeCopy(kind, locale);
  const base = {
    sensitivity: blueprint.sensitivity,
    complexity: blueprint.complexity,
    automationLevel: blueprint.automationLevel,
    teamCapacity: blueprint.teamCapacity,
    selectedPattern: blueprint.selectedPattern,
    ownership: blueprint.ownership.map((item) => ({ ...item })),
    gates: blueprint.gates.map((item) => ({ ...item })),
    nodes: blueprint.nodes.map((item) => ({ ...item })),
    edges: blueprint.edges.map((item) => ({ ...item })),
    warningResolutions: [],
  } satisfies BlueprintAlternative["snapshot"];

  if (kind === "privacy") {
    base.sensitivity = "sensitive";
    base.automationLevel = blueprint.automationLevel === "automated" ? "reviewed" : blueprint.automationLevel;
    base.selectedPattern = "local-first";
    base.gates = base.gates.map((gate) => ({ ...gate, required: true }));
  }

  if (kind === "review") {
    base.automationLevel = blueprint.automationLevel === "automated" ? "reviewed" : blueprint.automationLevel;
    base.gates = base.gates.map((gate) => ({ ...gate, required: true }));
  }

  if (kind === "small-team") {
    base.teamCapacity = "small-team";
    base.automationLevel = blueprint.automationLevel === "automated" ? "reviewed" : blueprint.automationLevel;
    base.selectedPattern = blueprint.sensitivity === "sensitive" ? "local-first" : "no-code";
  }

  const generated = generateDraftWorkflow({ ...blueprint, ...base, alternatives: [] }, locale);
  base.nodes = generated.nodes;
  base.edges = generated.edges;
  if (kind === "review" && !base.nodes.some((node) => node.kind === "escalation")) {
    base.nodes.push({ id: "alternative-escalation", kind: "escalation", title: locale === "de" ? "Eskalationsweg" : "Escalation route", detail: locale === "de" ? "Unsicherheit an eine verantwortliche Person weiterleiten" : "Route uncertainty to an accountable human", owner: ownerFor(blueprint, "review", "Review lead"), x: 3160, y: 2130 });
    base.edges.push({ id: "alternative-escalation-edge", from: "generated-decision", to: "alternative-escalation", type: "escalation", label: locale === "de" ? "Unklar oder riskant" : "Unclear or risky" });
  }
  const de = locale === "de";
  const changes = [
    de ? `Workflow als neuen Entwurf aus der Projektaufnahme aufbauen (${base.nodes.length} Knoten). Manuelle Schritte werden nicht übernommen.` : `Rebuild the workflow as a new draft from intake (${base.nodes.length} nodes). Custom steps are not carried over.`,
  ];
  if (base.sensitivity !== blueprint.sensitivity) changes.push(de ? `Sensibilität: ${t(locale, blueprint.sensitivity)} → ${t(locale, base.sensitivity)}` : `Sensitivity: ${blueprint.sensitivity} → ${base.sensitivity}`);
  if (base.automationLevel !== blueprint.automationLevel) changes.push(de ? "Automatisierte Arbeit auf menschlich geprüfte Arbeit begrenzen." : "Limit automated work to human-reviewed work.");
  if (base.selectedPattern !== blueprint.selectedPattern) changes.push(`${de ? "Technologiepfad" : "Stack pattern"}: ${getPatternById(blueprint.selectedPattern, locale)?.title || "—"} → ${getPatternById(base.selectedPattern, locale)?.title}`);
  if (base.teamCapacity !== blueprint.teamCapacity) changes.push(de ? "Kapazität auf kleines Team setzen." : "Set capacity to small team.");
  const enabled = base.gates.filter((gate) => gate.required && !blueprint.gates.find((item) => item.id === gate.id)?.required);
  if (enabled.length) changes.push(`${de ? "Zusätzlich erforderliche Freigaben" : "Additional required gates"}: ${enabled.map((gate) => gate.label).join(", ")}`);
  if (kind === "review") changes.push(de ? "Menschliche Prüfung, Freigabe und Eskalation sichtbar machen." : "Make human review, approval, and escalation visible.");
  changes.push(de ? "Prüfhinweise neu bewerten; frühere Lösungen und Ausnahmen werden nicht übernommen." : "Re-evaluate checks; previous resolutions and exceptions are not carried over.");

  return {
    id: `alternative-${kind}-${crypto.randomUUID()}`,
    kind,
    title: copy.title,
    summary: copy.summary,
    rationale: [
      de ? `Ausgangspunkt: Sensibilität ${t(locale, blueprint.sensitivity)}, Automatisierung ${t(locale, blueprint.automationLevel)}, Kapazität ${t(locale, blueprint.teamCapacity === "solo" ? "solo" : blueprint.teamCapacity === "small-team" ? "smallTeam" : "technicalTeam")}.` : `Starting point: sensitivity ${blueprint.sensitivity}, automation ${blueprint.automationLevel}, capacity ${blueprint.teamCapacity}.`,
      kind === "privacy" ? (de ? "Dieses Szenario nimmt sensible Daten an und priorisiert lokale Verarbeitung. Es bewertet Ihre Quellen nicht automatisch." : "This scenario assumes sensitive data and prioritises local processing. It does not automatically classify your sources.") : copy.rationale[1],
    ],
    changes,
    createdAt: new Date().toISOString(),
    snapshot: cloneAlternativeSnapshot(base),
  };
}

export function applyBlueprintAlternative(blueprint: BlueprintFile, alternative: BlueprintAlternative, locale: Locale = "en"): BlueprintFile {
  const previous: BlueprintAlternative = {
    id: `snapshot-${crypto.randomUUID()}`, kind: "snapshot",
    title: locale === "de" ? "Vorheriger aktueller Blueprint" : "Previous current blueprint",
    summary: locale === "de" ? "Vor der Übernahme gespeichert; hier können Sie den vorherigen Stand wiederherstellen." : "Saved before adoption; adopt this snapshot to restore your previous work.",
    rationale: [locale === "de" ? "Übernahme einer Alternative durch die nutzende Person." : "The user adopted an alternative."],
    changes: [locale === "de" ? "Gespeicherter Stand ohne neue Generierung." : "Saved state without draft regeneration."],
    createdAt: new Date().toISOString(), snapshot: cloneAlternativeSnapshot(blueprint),
  };
  return {
    ...blueprint,
    ...cloneAlternativeSnapshot(alternative.snapshot),
    alternatives: [...blueprint.alternatives.map((item) => ({ ...item, snapshot: cloneAlternativeSnapshot(item.snapshot) })), previous],
  };
}

function ownerFor(blueprint: BlueprintFile, ownershipId: string, fallback: string) {
  return blueprint.ownership.find((item) => item.id === ownershipId)?.humanOwner || fallback;
}

function trimForDetail(value: string, fallback: string) {
  const clean = value.trim();
  if (!clean) return fallback;
  return clean.length > 86 ? `${clean.slice(0, 83)}...` : clean;
}

export function generateDraftWorkflow(blueprint: BlueprintFile, locale: Locale = "en"): CanvasSnapshot {
  blueprint = localizeDemoIntake(blueprintForOutput(blueprint, locale), locale);
  const copy = locale === "de"
    ? {
        contextTitle: "Menschliche Kontextaufnahme", contextDetail: "Ziel, Zielgruppe, Quellengrenzen und Nicht-Ziele festlegen",
        sourcesTitle: "Freigegebenes Quellenmaterial", sourcesDetail: "Freigegebene Daten, Dokumente, Richtlinien und verbotene Quellen benennen",
        draftTitle: "Entwurf mit KI-Unterstützung", draftDetail: "Ohne finale Autorität entwerfen, klassifizieren, zusammenfassen oder vorschlagen",
        reviewTitle: "Menschliche Prüfung", reviewDetail: "Quellen, Annahmen, Umfang, Risiken und unbelegte Aussagen prüfen",
        approvalTitle: "Freigabepunkt", approvalDetail: "Menschen geben finale Entscheidung, Veröffentlichung, Ausnahme und Änderungen frei",
        decisionTitle: "Entscheidungskriterien", decisionDetail: "Nicht stillschweigend entscheiden: anhand expliziter, menschlich verantworteter Kriterien verzweigen",
        outputTitle: "Freigegebenes Ergebnis", outputDetail: "Nur nach Freigabe verwenden; Grenzen und nächste Schritte enthalten",
        auditTitle: "Audit-Trail", auditDetail: "Quellen, prüfende Person, Entscheidung, Ausnahme sowie Prompt-/Modelländerungen protokollieren",
        escalationTitle: "Eskalationsweg", escalationDetail: "Unklarheit, hohe Auswirkungen, sensible Daten oder unbelegte Aussagen anhalten und weiterleiten",
        changeTitle: "Freigabe für Modell-/Werkzeugänderungen", changeDetail: "Modell-, Prompt-, Anbieter-, Abruf- oder Automatisierungsänderungen vor der Nutzung freigeben",
        approved: "Freigegeben", meetsCriteria: "Kriterien erfüllt", revise: "Überarbeiten", unclear: "Unklar oder riskant", changeNeeded: "Änderung erforderlich", approvedChange: "Freigegebene Änderung", aiAssists: "KI unterstützt", compliance: "Compliance",
      }
    : {
        contextTitle: "Human Context Intake", contextDetail: "Define goal, audience, source boundaries, and non-goals",
        sourcesTitle: "Approved Source Material", sourcesDetail: "Name approved data, documents, policies, and forbidden sources",
        draftTitle: "AI Assistance Draft", draftDetail: "Draft, classify, summarize, or suggest without final authority",
        reviewTitle: "Human Review", reviewDetail: "Check sources, assumptions, scope, risks, and unsupported claims",
        approvalTitle: "Approval Gate", approvalDetail: "Human signs off final decision, release, exception, and changes",
        decisionTitle: "Decision Criteria", decisionDetail: "Do not choose silently: branch using explicit human-owned criteria",
        outputTitle: "Approved Output", outputDetail: "Use only after approval; include limitations and next steps",
        auditTitle: "Audit Trail", auditDetail: "Log sources, reviewer, decision, exception, and prompt/model changes",
        escalationTitle: "Escalation Route", escalationDetail: "Stop and route ambiguity, high impact, sensitive data, or unsupported claims",
        changeTitle: "Model / Tool Change Gate", changeDetail: "Approve model, prompt, provider, retrieval, or automation changes before use",
        approved: "Approved", meetsCriteria: "Meets criteria", revise: "Revise", unclear: "Unclear or risky", changeNeeded: "Change needed", approvedChange: "Approved change", aiAssists: "AI assists", compliance: "Compliance",
      };
  const projectOwner = ownerFor(blueprint, "goal", localizeDefaultRole("Project owner", locale));
  const dataOwner = ownerFor(blueprint, "data", localizeDefaultRole("Data owner", locale));
  const reviewOwner = ownerFor(blueprint, "review", localizeDefaultRole("Review lead", locale));
  const deploymentOwner = ownerFor(blueprint, "deployment", localizeDefaultRole("Ops owner", locale));
  const decisionOwner = ownerFor(blueprint, "decisions", localizeDefaultRole("Accountable decision-maker", locale));
  const needsToolStep =
    blueprint.automationLevel !== "assistive" ||
    ["agent-workflow", "api-product", "self-hosted", "rag-documents"].includes(blueprint.selectedPattern);
  const needsEscalation =
    blueprint.sensitivity !== "public" || blueprint.complexity !== "simple" || blueprint.automationLevel === "automated";

  const nodes: CanvasNode[] = [
    {
      id: "generated-context",
      kind: "human",
      title: copy.contextTitle,
      detail: trimForDetail(blueprint.projectGoal, copy.contextDetail),
      owner: projectOwner,
      x: 2460,
      y: 1450,
    },
    {
      id: "generated-sources",
      kind: "data",
      title: copy.sourcesTitle,
      detail: trimForDetail(blueprint.sourceMaterial, copy.sourcesDetail),
      owner: dataOwner,
      x: 2760,
      y: 1450,
    },
    {
      id: "generated-ai-draft",
      kind: "ai",
      title: copy.draftTitle,
      detail: trimForDetail(blueprint.aiAssistance, copy.draftDetail),
      owner: copy.aiAssists,
      x: 2760,
      y: 1690,
    },
    {
      id: "generated-review",
      kind: "review",
      title: copy.reviewTitle,
      detail: copy.reviewDetail,
      owner: reviewOwner,
      x: 2760,
      y: 1930,
    },
    {
      id: "generated-approval",
      kind: "gate",
      title: copy.approvalTitle,
      detail: trimForDetail(blueprint.humanControl, copy.approvalDetail),
      owner: decisionOwner,
      x: 2760,
      y: 2170,
    },
    {
      id: "generated-decision",
      kind: "decision",
      title: copy.decisionTitle,
      detail: copy.decisionDetail,
      owner: decisionOwner,
      x: 3040,
      y: 2170,
    },
    {
      id: "generated-output",
      kind: "output",
      title: copy.outputTitle,
      detail: copy.outputDetail,
      owner: projectOwner,
      x: 3040,
      y: 2410,
    },
    {
      id: "generated-audit",
      kind: "audit",
      title: copy.auditTitle,
      detail: copy.auditDetail,
      owner: copy.compliance,
      x: 2760,
      y: 2650,
    },
  ];

  const edges: CanvasEdge[] = [
    { id: "generated-e1", from: "generated-context", to: "generated-ai-draft", type: "sequence" },
    { id: "generated-e2", from: "generated-sources", to: "generated-ai-draft", type: "data", label: locale === "de" ? "Freigegebener Kontext" : "Approved context" },
    { id: "generated-e3", from: "generated-ai-draft", to: "generated-review", type: "sequence" },
    { id: "generated-e4", from: "generated-review", to: "generated-approval", type: "sequence" },
    { id: "generated-e5", from: "generated-approval", to: "generated-decision", type: "approval", label: copy.approved },
    { id: "generated-e6", from: "generated-decision", to: "generated-output", type: "approval", label: copy.meetsCriteria },
    { id: "generated-e7", from: "generated-decision", to: "generated-ai-draft", type: "rejection", label: copy.revise },
    { id: "generated-e8", from: "generated-output", to: "generated-audit", type: "sequence" },
  ];

  if (needsEscalation) {
    nodes.push({
      id: "generated-escalation",
      kind: "escalation",
      title: copy.escalationTitle,
      detail: copy.escalationDetail,
      owner: reviewOwner,
      x: 2460,
      y: 2410,
    });
    edges.push({ id: "generated-e9", from: "generated-decision", to: "generated-escalation", type: "escalation", label: copy.unclear });
  }

  if (needsToolStep) {
    nodes.push({
      id: "generated-change-gate",
      kind: "gate",
      title: copy.changeTitle,
      detail: copy.changeDetail,
      owner: deploymentOwner,
      x: 2460,
      y: 2170,
    });
    edges.push(
      { id: "generated-e10", from: "generated-approval", to: "generated-change-gate", type: "rejection", label: copy.changeNeeded },
      { id: "generated-e11", from: "generated-change-gate", to: "generated-ai-draft", type: "feedback", label: copy.approvedChange },
      { id: "generated-e12", from: "generated-change-gate", to: "generated-audit", type: "data", label: locale === "de" ? "Änderungsfreigabe protokollieren" : "Log change approval" },
    );
  }

  return { nodes, edges };
}

export function getCompletionScore(blueprint: BlueprintFile) {
  const checks = [
    blueprint.projectName.trim().length > 0,
    blueprint.audience.trim().length > 0,
    blueprint.projectGoal.trim().length > 24,
    blueprint.aiAssistance.trim().length > 20,
    blueprint.humanControl.trim().length > 20,
    blueprint.sourceMaterial.trim().length > 10,
    blueprint.scopeIn.trim().length > 10,
    blueprint.scopeOut.trim().length > 10,
    Boolean(blueprint.selectedPattern),
    blueprint.gates.filter((gate) => gate.required).length >= 4,
    blueprint.nodes.length >= 5,
  ];

  const complete = checks.filter(Boolean).length;
  return Math.round((complete / checks.length) * 100);
}

export function recommendStackPatterns(blueprint: BlueprintFile): StackPatternId[] {
  const result: StackPatternId[] = [];

  if (blueprint.sourceMaterial.length > 50 || /document|manual|policy|pdf|knowledge|dokument|handbuch|richtlinie|wissen|quelle/i.test(blueprint.sourceMaterial)) {
    result.push("rag-documents");
  }

  if (blueprint.sensitivity === "sensitive") {
    result.push(blueprint.teamCapacity === "technical-team" ? "self-hosted" : "local-first");
  }

  if (blueprint.automationLevel === "automated") {
    result.push(blueprint.complexity === "complex" ? "agent-workflow" : "team-workflow");
  }

  if (blueprint.teamCapacity === "solo" && blueprint.complexity === "simple") {
    result.push("fast-prototype", "no-code");
  }

  if (blueprint.teamCapacity === "technical-team" && blueprint.sensitivity !== "sensitive") {
    result.push("api-product");
  }

  result.push("canvas-knowledge");
  return Array.from(new Set(result)).slice(0, 4);
}

export function getPatternById(id: StackPatternId | "", locale: Locale = "en") {
  return getStackPatterns(locale).find((pattern) => pattern.id === id);
}

export function completionMessage(blueprint: BlueprintFile, locale: Locale = "en") {
  if (locale === "de") {
    if (!blueprint.projectGoal.trim()) return "Definieren Sie vor der Architekturwahl das Projektziel.";
    if (!blueprint.humanControl.trim()) return "Benennen Sie vor der Automatisierung die menschliche Kontrollgrenze.";
    if (!blueprint.sourceMaterial.trim()) return "Ergänzen Sie Quellen und Datenkontext für sinnvolle Technologieabwägungen.";
    if (!blueprint.selectedPattern) return "Wählen Sie nach Prüfung der Vorschläge einen Technologiepfad.";
    return "Der Blueprint ist bereit für die Berichtsprüfung.";
  }
  if (!blueprint.projectGoal.trim()) return "Define the project goal before choosing architecture.";
  if (!blueprint.humanControl.trim()) return "Name what humans keep control over before mapping automation.";
  if (!blueprint.sourceMaterial.trim()) return "Add source material or data context so stack tradeoffs are meaningful.";
  if (!blueprint.selectedPattern) return "Choose a stack pattern after reviewing the deterministic suggestions.";
  return "Blueprint is ready for report review.";
}

export function updateOwnership(
  items: OwnershipItem[],
  id: string,
  key: keyof OwnershipItem,
  value: string,
): OwnershipItem[] {
  return items.map((item) => (item.id === id ? { ...item, [key]: value } : item));
}

export function updateGate(items: GateItem[], id: string, key: keyof GateItem, value: string | boolean): GateItem[] {
  return items.map((item) => (item.id === id ? { ...item, [key]: value } : item));
}

export function updateWarningResolution(
  items: WarningResolution[],
  warningId: string,
  status: WarningStatus,
  note: string,
): WarningResolution[] {
  const updatedAt = new Date().toISOString().slice(0, 10);
  const next = { id: warningId, status, note, updatedAt };
  const exists = items.some((item) => item.id === warningId);
  return exists ? items.map((item) => (item.id === warningId ? next : item)) : [...items, next];
}

export function clearWarningResolution(items: WarningResolution[], warningId: string): WarningResolution[] {
  return items.filter((item) => item.id !== warningId);
}

function getNode(blueprint: BlueprintFile, id: string) {
  return blueprint.nodes.find((node) => node.id === id);
}

function outgoingEdges(blueprint: BlueprintFile, nodeId: string) {
  return blueprint.edges.filter((edge) => edge.from === nodeId);
}

function incomingEdges(blueprint: BlueprintFile, nodeId: string) {
  return blueprint.edges.filter((edge) => edge.to === nodeId);
}

function nodeTitle(blueprint: BlueprintFile, nodeId: string) {
  return getNode(blueprint, nodeId)?.title ?? nodeId;
}

function sentenceList(items: string[], fallback: string) {
  const clean = items.map((item) => item.trim()).filter(Boolean);
  return clean.length ? clean.join("; ") : fallback;
}

function requiredGateSummary(blueprint: BlueprintFile, locale: Locale = "en") {
  return sentenceList(
    blueprint.gates
      .filter((gate) => gate.required)
      .map((gate) => `${gate.label} (${gate.owner})`),
    locale === "de" ? "Noch keine erforderlichen Governance-Freigaben ausgewählt." : "No required governance gates have been selected yet.",
  );
}

function ownershipSummary(blueprint: BlueprintFile, locale: Locale = "en") {
  return sentenceList(
    blueprint.ownership.map((item) => locale === "de" ? `${item.area}: menschliche Verantwortung ${item.humanOwner}; KI-Rolle ${item.aiRole}; Freigaberegel ${item.approval}` : `${item.area}: human owner ${item.humanOwner}; AI role ${item.aiRole}; approval rule ${item.approval}`),
    locale === "de" ? "Noch keine Verantwortungsmatrix definiert." : "No ownership matrix has been defined yet.",
  );
}

function workflowSummary(blueprint: BlueprintFile, locale: Locale = "en") {
  return blueprint.nodes.length
    ? blueprint.nodes.map((node) => `${node.title} (${getNodeKinds(locale).find((item) => item.id === node.kind)?.label}, ${locale === "de" ? "verantwortlich" : "owner"}: ${node.owner})`).join(" → ")
    : locale === "de" ? "Noch keine Workflow-Knoten abgebildet." : "No workflow nodes have been mapped yet.";
}

function warningSummary(blueprint: BlueprintFile, locale: Locale = "en") {
  const warnings = runHitmChecks(blueprint, locale);
  const openWarnings = warnings.filter((warning) => warning.status === "open");
  const exceptions = warnings.filter((warning) => warning.status === "exception");
  return {
    open: openWarnings.length ? openWarnings.map((warning) => warning.title).join("; ") : locale === "de" ? "keine" : "none",
    exceptions: exceptions.length
      ? exceptions.map((warning) => `${warning.title}${warning.note ? ` (${warning.note})` : ""}`).join("; ")
      : locale === "de" ? "keine" : "none",
  };
}

function buildPromptChecks(prompt: string, context: { hasOwner: boolean; hasSources: boolean; hasApproval: boolean; hasEscalation: boolean; requiresEscalation: boolean }, locale: Locale = "en"): PromptQualityCheck[] {
  if (locale === "de") {
    const controls = [
      { id: "human-ownership", label: "Menschliche Verantwortung", pass: /mensch/i.test(prompt) && /verantwort/i.test(prompt), detail: "Der Prompt muss menschliche Verantwortung benennen." },
      { id: "decision-boundary", label: "Entscheidungsgrenze", pass: /darf keine finalen Entscheidungen/i.test(prompt), detail: "Der Prompt muss finale KI-Entscheidungen ausschließen." },
      { id: "source-boundary", label: "Quellengrenze", pass: /quelle|quellen|kontext|daten/i.test(prompt), detail: "Der Prompt muss erlaubte Quellen oder Datengrenzen benennen." },
      { id: "approval-boundary", label: "Freigabegrenze", pass: context.hasApproval && /freig[a-zä]*|freigeben/i.test(prompt), detail: "Der Blueprint und Prompt müssen menschliche Freigabe vorsehen." },
      ...(context.requiresEscalation ? [{ id: "escalation-boundary", label: "Eskalationsgrenze", pass: context.hasEscalation && /eskal/i.test(prompt), detail: "Der Workflow muss einen Eskalationsweg enthalten und der Prompt darauf verweisen." }] : []),
      ...(!context.hasOwner ? [{ id: "missing-owner-data", label: "Verantwortungsdaten", pass: false, detail: "Die Matrix benötigt menschliche Verantwortliche." }] : []),
      ...(!context.hasSources ? [{ id: "missing-source-data", label: "Quellendaten", pass: false, detail: "Die Projektaufnahme benötigt freigegebenes Quellenmaterial." }] : []),
    ];
    return controls.map(({ id, label, pass, detail }) => ({ id, label, status: pass ? "pass" : "warning", detail: pass ? `${label} ist im Prompt berücksichtigt.` : detail }));
  }
  const lower = prompt.toLowerCase();
  const checks: PromptQualityCheck[] = [
    {
      id: "human-ownership",
      label: "Human ownership",
      status: lower.includes("human") && lower.includes("owner") ? "pass" : "warning",
      detail: lower.includes("human") && lower.includes("owner")
        ? "Prompt names human ownership or human-owned review."
        : "Prompt should explicitly name the human owner or human-owned review point.",
    },
    {
      id: "decision-boundary",
      label: "Decision boundary",
      status: /do not|never|must not|cannot/.test(lower) && /final decision|decision-maker|authority|approve/.test(lower) ? "pass" : "warning",
      detail: /do not|never|must not|cannot/.test(lower) && /final decision|decision-maker|authority|approve/.test(lower)
        ? "Prompt prevents AI from owning final decisions."
        : "Prompt should explicitly prevent AI from owning final decisions.",
    },
    {
      id: "source-boundary",
      label: "Source boundary",
      status: lower.includes("source") || lower.includes("approved context") || lower.includes("approved material") ? "pass" : "warning",
      detail: lower.includes("source") || lower.includes("approved context") || lower.includes("approved material")
        ? "Prompt references approved source or context boundaries."
        : "Prompt should reference approved sources or context boundaries.",
    },
    {
      id: "approval-boundary",
      label: "Approval boundary",
      status: context.hasApproval && lower.includes("approv") ? "pass" : "warning",
      detail: context.hasApproval && lower.includes("approv")
        ? "Prompt includes approval language tied to the blueprint."
        : "Prompt should mention approval when the workflow relies on governance gates.",
    },
  ];

  if (context.requiresEscalation) {
    checks.push({
      id: "escalation-boundary",
      label: "Escalation boundary",
      status: context.hasEscalation && lower.includes("escalat") ? "pass" : "warning",
      detail: context.hasEscalation && lower.includes("escalat")
        ? "Prompt includes an escalation path for uncertainty or risk."
        : "Prompt should include escalation language for uncertainty, high impact, or sensitive data.",
    });
  }

  if (!context.hasOwner) {
    checks.push({
      id: "missing-owner-data",
      label: "Blueprint owner data",
      status: "warning",
      detail: "The ownership matrix still needs named human owners for stronger prompt grounding.",
    });
  }

  if (!context.hasSources) {
    checks.push({
      id: "missing-source-data",
      label: "Blueprint source data",
      status: "warning",
      detail: "The project intake needs source material so prompts can constrain grounding.",
    });
  }

  return checks;
}

function withResolution(blueprint: BlueprintFile, warning: Omit<HitmWarning, "status" | "note">): HitmWarning {
  const resolution = blueprint.warningResolutions.find((item) => item.id === warning.id);
  return {
    ...warning,
    status: resolution?.status ?? "open",
    note: resolution?.note ?? "",
  };
}

function hasNodeKind(blueprint: BlueprintFile, kind: NodeKind) {
  return blueprint.nodes.some((node) => node.kind === kind);
}

function hasEdgeType(blueprint: BlueprintFile, type: EdgeType) {
  return blueprint.edges.some((edge) => edge.type === type);
}

function hasReachableOutputWithoutControl(blueprint: BlueprintFile, startId: string) {
  const queue: Array<{ nodeId: string; hasControl: boolean; path: string[] }> = [
    { nodeId: startId, hasControl: false, path: [startId] },
  ];
  const visited = new Set<string>();

  while (queue.length) {
    const current = queue.shift();
    if (!current) break;
    const node = getNode(blueprint, current.nodeId);
    if (!node) continue;
    const hasControl = current.hasControl || isHumanControl(node);
    const visitKey = `${current.nodeId}:${hasControl ? "controlled" : "uncontrolled"}`;
    if (visited.has(visitKey)) continue;
    visited.add(visitKey);
    if (node.kind === "output" && !hasControl) return current.path;

    outgoingEdges(blueprint, current.nodeId).forEach((edge) => {
      queue.push({ nodeId: edge.to, hasControl, path: [...current.path, edge.to] });
    });
  }

  return null;
}

function localizeWarning(blueprint: BlueprintFile, locale: Locale, warning: Omit<HitmWarning, "status" | "note">): Omit<HitmWarning, "status" | "note"> {
  if (locale !== "de") return warning;

  if (warning.id === "canvas-empty") {
    return { ...warning, title: "Workflow-Arbeitsfläche ist leer", trigger: "Der Blueprint enthält keine Workflow-Knoten.", missingControl: "Es gibt noch keine sichtbare menschliche Verantwortung, Prüfung, Freigabe, Datengrenze oder Audit-Struktur.", recommendation: "Erstellen Sie einen Entwurf aus der Projektaufnahme, wenden Sie eine Vorlage an oder fügen Sie vor der Berichtsfreigabe manuell Knoten hinzu." };
  }
  if (warning.id.startsWith("ai-control-")) {
    return { ...warning, title: "KI-Schritt benötigt einen sichtbaren Kontrollpunkt", trigger: `${warning.relatedNodeIds[0] ? nodeTitle(blueprint, warning.relatedNodeIds[0]) : "Der KI-Schritt"} ist nicht direkt mit einem Prüf-, Freigabe-, Entscheidungs- oder Eskalationsknoten verbunden.`, missingControl: "KI-Unterstützung benötigt einen expliziten nächsten Schritt menschlicher Kontrolle.", recommendation: "Verbinden Sie den KI-Knoten mit einer menschlichen Prüfung, einem Freigabepunkt, Entscheidungskriterien oder einem Eskalationsweg." };
  }
  if (warning.id.startsWith("ai-output-")) return { ...warning, title: "KI kann ein Ergebnis ohne menschliche Kontrolle erreichen", trigger: `${nodeTitle(blueprint, warning.relatedNodeIds[0])} erreicht ${nodeTitle(blueprint, warning.relatedNodeIds.at(-1) ?? "")} ohne gültigen menschlichen Kontrollpunkt.`, missingControl: "Eine kundenbezogene, finale oder operative Ausgabe darf nicht ausschließlich über KI- oder Werkzeugschritte erreichbar sein.", recommendation: "Fügen Sie vor dem Ergebnis eine Prüfung oder Freigabe ein und verbinden Sie anschließend Freigabe- und Überarbeitungszweige." };
  if (warning.id.startsWith("output-approval-")) return { ...warning, title: "Ergebnis hat keinen Freigabeweg", trigger: `${nodeTitle(blueprint, warning.relatedNodeIds[0])} hat keinen gültigen menschlich verantworteten Freigabevorgänger.`, missingControl: "Für ein finales Ergebnis ist eine explizite Freigabebeziehung erforderlich.", recommendation: "Verbinden Sie einen Freigabepunkt über eine Freigabe-Verbindung mit dem Ergebnis oder kennzeichnen Sie den vorherigen Schritt als Freigabepunkt." };
  if (warning.id.startsWith("decision-branch-")) return { ...warning, title: "Entscheidungsknoten benötigt einen Ausweichzweig", trigger: `${nodeTitle(blueprint, warning.relatedNodeIds[0])} hat keinen Ablehnungs- oder Eskalationszweig.`, missingControl: "Entscheidungskriterien benötigen einen dokumentierten Weg für Unsicherheit, Fehler oder Überarbeitung.", recommendation: "Fügen Sie vom Entscheidungsknoten eine Ablehnungs- oder Eskalationsverbindung hinzu." };
  if (warning.id === "automation-no-approval") return { ...warning, title: "Automatisierter Workflow hat keinen Freigabezweig", trigger: "Die Automatisierung ist auf Automatisiert gesetzt, aber die Arbeitsfläche enthält keine Freigabeverbindung.", missingControl: "Automatisierte Aktionen benötigen vor dem operativen Einsatz einen benannten menschlichen Freigabezweig.", recommendation: "Fügen Sie vor jeder Werkzeugaktion, externen Kommunikation oder finalen Ausgabe einen Freigabepunkt und eine Freigabeverbindung hinzu." };
  if (warning.id === "sensitive-data-boundary") return { ...warning, title: "Sensibler/interner Workflow benötigt Datengrenze und Audit-Trail", trigger: "Der Workflow verwendet interne oder sensible Daten, aber Datenknoten oder Audit-Ereignis fehlen.", missingControl: "Datenverarbeitung und Prüfbelege benötigen sichtbare Verantwortung.", recommendation: "Fügen Sie einen Daten-/Quellenknoten und einen mit dem Workflow verbundenen Audit-Knoten hinzu." };
  if (warning.id === "required-gates-not-on-canvas") return { ...warning, title: "Erforderliche Governance-Freigaben sind nicht auf der Arbeitsfläche dargestellt", trigger: "Die Governance-Liste enthält erforderliche Freigaben, die Arbeitsfläche jedoch keinen Freigabeknoten.", missingControl: "Governance-Entscheidungen benötigen eine sichtbare Platzierung im Workflow.", recommendation: "Fügen Sie Knoten für die erforderlichen Freigabepunkte hinzu oder erstellen Sie einen Entwurf aus der Projektaufnahme." };
  if (warning.id === "tool-change-governance") return { ...warning, title: "Werkzeug-/Modelländerungen benötigen Governance", trigger: "Der Workflow enthält ein Werkzeug, aber keine erforderliche menschlich verantwortete Änderungsfreigabe in der Governance-Liste.", missingControl: "Operative Änderungen benötigen einen benannten Freigabepunkt.", recommendation: "Fügen Sie eine erforderliche Governance-Freigabe für Modell-, Werkzeug- oder Prompt-Änderungen hinzu." };
  if (warning.id === "missing-audit-trail") return { ...warning, title: "Workflow enthält keinen Audit-Trail", trigger: "Die Arbeitsfläche enthält Workflow-Schritte, aber keinen Audit-Ereignisknoten.", missingControl: "Prüfentscheidungen, Ausnahmen und Freigaben werden nicht festgehalten.", recommendation: "Fügen Sie nach Freigabe oder Ergebnis einen Audit-Ereignisknoten hinzu." };
  return warning;
}

export function runHitmChecks(blueprint: BlueprintFile, locale: Locale = "en"): HitmWarning[] {
  const warnings: Array<Omit<HitmWarning, "status" | "note">> = [];

  if (blueprint.nodes.length === 0) {
    warnings.push({
      id: "canvas-empty",
      severity: "medium",
      title: "Workflow canvas is empty",
      trigger: "The blueprint has no workflow nodes.",
      missingControl: "No visible human ownership, review, approval, data boundary, or audit structure exists yet.",
      recommendation: "Use Generate from intake, apply a template, or add nodes manually before report approval.",
      relatedNodeIds: [],
      relatedEdgeIds: [],
    });
  }

  blueprint.nodes
    .filter((node) => node.kind === "ai")
    .forEach((node) => {
      const outgoing = outgoingEdges(blueprint, node.id);
      const hasImmediateHumanControl = outgoing.some((edge) => {
        return isHumanControl(getNode(blueprint, edge.to));
      });

      if (!hasImmediateHumanControl) {
        warnings.push({
          id: `ai-control-${node.id}`,
          severity: blueprint.automationLevel === "automated" ? "high" : "medium",
          title: `AI step needs a visible control point`,
          trigger: `${node.title} does not connect directly to a review, gate, decision, or escalation node.`,
          missingControl: "AI assistance needs an explicit next human-control step.",
          recommendation: "Connect the AI node to a human review, approval gate, decision criteria node, or escalation route.",
          relatedNodeIds: [node.id, ...outgoing.map((edge) => edge.to)],
          relatedEdgeIds: outgoing.map((edge) => edge.id),
        });
      }

      const uncontrolledPath = hasReachableOutputWithoutControl(blueprint, node.id);
      if (uncontrolledPath) {
        warnings.push({
          id: `ai-output-${node.id}`,
          severity: "high",
          title: "AI can reach an output without human control",
          trigger: `${node.title} has a path to ${nodeTitle(blueprint, uncontrolledPath.at(-1) ?? "")} before a review, gate, decision, or escalation node appears.`,
          missingControl: "A customer-facing, final, or operational output cannot be reached solely through AI/tool steps.",
          recommendation: "Insert a review or approval gate before the output, then connect approval/revision branches.",
          relatedNodeIds: uncontrolledPath,
          relatedEdgeIds: blueprint.edges.filter((edge) => uncontrolledPath.includes(edge.from) && uncontrolledPath.includes(edge.to)).map((edge) => edge.id),
        });
      }
    });

  blueprint.nodes
    .filter((node) => node.kind === "output")
    .forEach((node) => {
      const incoming = incomingEdges(blueprint, node.id);
      const approvedIncoming = incoming.some((edge) => isHumanControl(getNode(blueprint, edge.from)) && (edge.type === "approval" || getNode(blueprint, edge.from)?.kind === "gate"));
      if (!approvedIncoming) {
        warnings.push({
          id: `output-approval-${node.id}`,
          severity: "high",
          title: "Output lacks an approval path",
          trigger: `${node.title} has no incoming approval connection or gate-owned predecessor.`,
          missingControl: "Final output needs an explicit approval relationship.",
          recommendation: "Connect a gate to the output with an approval edge, or label the predecessor as the approval gate.",
          relatedNodeIds: [node.id, ...incoming.map((edge) => edge.from)],
          relatedEdgeIds: incoming.map((edge) => edge.id),
        });
      }
    });

  blueprint.nodes
    .filter((node) => node.kind === "decision")
    .forEach((node) => {
      const outgoing = outgoingEdges(blueprint, node.id);
      const hasNegativeOrEscalation = outgoing.some((edge) => edge.type === "rejection" || edge.type === "escalation");
      if (!hasNegativeOrEscalation) {
        warnings.push({
          id: `decision-branch-${node.id}`,
          severity: "medium",
          title: "Decision node needs a fallback branch",
          trigger: `${node.title} has no rejection or escalation branch.`,
          missingControl: "Decision criteria need a documented path for uncertainty, failure, or revision.",
          recommendation: "Add a rejection, feedback, or escalation edge from the decision node.",
          relatedNodeIds: [node.id],
          relatedEdgeIds: outgoing.map((edge) => edge.id),
        });
      }
    });

  if (blueprint.automationLevel === "automated" && !hasEdgeType(blueprint, "approval")) {
    warnings.push({
      id: "automation-no-approval",
      severity: "high",
      title: "Automated workflow has no approval branch",
      trigger: "Automation level is set to Automated, but the canvas has no approval connection.",
      missingControl: "Automated actions need a named human approval branch before operational use.",
      recommendation: "Add a gate and approval edge before any tool action, external communication, or final output.",
      relatedNodeIds: blueprint.nodes.filter((node) => node.kind === "tool" || node.kind === "output").map((node) => node.id),
      relatedEdgeIds: [],
    });
  }

  if (blueprint.sensitivity !== "public" && (!hasNodeKind(blueprint, "data") || !hasNodeKind(blueprint, "audit"))) {
    warnings.push({
      id: "sensitive-data-boundary",
      severity: "high",
      title: "Sensitive/internal workflow needs data boundary and audit trail",
      trigger: `Sensitivity is set to ${blueprint.sensitivity}, but the canvas lacks a data node or audit node.`,
      missingControl: "Data handling and review evidence need visible ownership.",
      recommendation: "Add a data/source node and an audit event node connected to the workflow.",
      relatedNodeIds: blueprint.nodes.filter((node) => node.kind === "data" || node.kind === "audit").map((node) => node.id),
      relatedEdgeIds: blueprint.edges.filter((edge) => edge.type === "data").map((edge) => edge.id),
    });
  }

  if (blueprint.gates.some((gate) => gate.required) && !hasNodeKind(blueprint, "gate")) {
    warnings.push({
      id: "required-gates-not-on-canvas",
      severity: "medium",
      title: "Required governance gates are not represented on the canvas",
      trigger: "The governance list has required gates, but the canvas has no gate node.",
      missingControl: "Governance choices need visible workflow placement.",
      recommendation: "Add gate nodes for the required approval points or generate from intake.",
      relatedNodeIds: [],
      relatedEdgeIds: [],
    });
  }

  if (hasNodeKind(blueprint, "tool") && !blueprint.gates.some((gate) => gate.required && isHumanOwner(gate.owner) && (gate.id === "model-tool-changes" || /tool|model|prompt|provider|change|werkzeug|modell|änder/i.test(gate.label)))) {
    warnings.push({
      id: "tool-change-governance",
      severity: "medium",
      title: "Tool/model changes need governance",
      trigger: "The canvas includes a tool/system node, but governance gates do not mention tool, model, prompt, provider, or change approval.",
      missingControl: "Operational changes need a named approval point.",
      recommendation: "Add or rename a governance gate for model/tool/prompt changes.",
      relatedNodeIds: blueprint.nodes.filter((node) => node.kind === "tool").map((node) => node.id),
      relatedEdgeIds: [],
    });
  }

  if (!hasNodeKind(blueprint, "audit") && blueprint.nodes.length > 0) {
    warnings.push({
      id: "missing-audit-trail",
      severity: "medium",
      title: "Workflow has no audit trail",
      trigger: "The canvas has workflow steps but no audit event node.",
      missingControl: "Review decisions, exceptions, and approvals are not recorded.",
      recommendation: "Add an audit event node after approval or output.",
      relatedNodeIds: [],
      relatedEdgeIds: [],
    });
  }

  return [...warnings, ...additionalHitmChecks(blueprint, locale)].map((warning) => withResolution(blueprint, localizeWarning(blueprint, locale, warning)));
}

export function buildPromptPack(blueprint: BlueprintFile, locale: Locale = "en"): PromptPackItem[] {
  blueprint = localizeDemoIntake(blueprintForOutput(blueprint, locale), locale);
  const project = blueprint.projectName || "this project";
  const audience = blueprint.audience || "the intended users";
  const control = blueprint.humanControl || "final decisions, approvals, and changes";
  const sources = blueprint.sourceMaterial || "approved project context and source material";
  const gates = requiredGateSummary(blueprint, locale);
  const ownership = ownershipSummary(blueprint, locale);
  const workflow = workflowSummary(blueprint, locale);
  const warnings = warningSummary(blueprint, locale);
  const reviewOwner = ownerFor(blueprint, "review", "Review lead");
  const projectOwner = ownerFor(blueprint, "goal", "Project owner");
  const dataOwner = ownerFor(blueprint, "data", "Data owner");
  const decisionOwner = ownerFor(blueprint, "decisions", "Accountable decision-maker");
  const hasEscalation = blueprint.nodes.some((node) => node.kind === "escalation") || blueprint.edges.some((edge) => edge.type === "escalation");
  const requiresEscalation = blueprint.sensitivity !== "public" || blueprint.complexity === "complex" || blueprint.automationLevel === "automated";
  const checkContext = {
    hasOwner: blueprint.ownership.length > 0 && blueprint.ownership.every((item) => isHumanOwner(item.humanOwner)),
    hasSources: blueprint.sourceMaterial.trim().length > 0,
    hasApproval: blueprint.gates.some((gate) => gate.required) || blueprint.nodes.some((node) => node.kind === "gate"),
    hasEscalation,
    requiresEscalation,
  };

  const prompts = [
    {
      id: "role-definition",
      title: "Role definition",
      purpose: "Establish the assistant's bounded role before work starts.",
      owner: projectOwner,
      whenToUse: "At the start of a project, thread, agent, or reusable workflow.",
      inputs: ["Project intake", "Audience", "Human-control boundary", "Ownership matrix"],
      output: "A clear bounded assistant role.",
      prompt: `You are assisting with ${project} for ${audience}. Your role is to support human owners, not replace them. You may draft, organize, critique, summarize, ask clarifying questions, and suggest options. Human owners retain control over ${control}. Ownership map: ${ownership}. Use only approved context or clearly label assumptions. Do not make final decisions, approve outputs, bypass gates, or present yourself as the accountable owner.`,
    },
    {
      id: "context-gathering",
      title: "Context gathering",
      purpose: "Collect missing project context before suggestions or implementation.",
      owner: projectOwner,
      whenToUse: "Before drafting workflow, architecture, content, or implementation plans.",
      inputs: ["Project intake", "Source material", "Scope in/out", "Governance gates"],
      output: "A compact list of missing context questions.",
      prompt: `Before suggesting solutions for ${project}, ask for missing context in this order: goal, audience, scope in/out, source boundary, data sensitivity, success measures, human owner, review owner, approval gate, escalation path, and what AI must not decide. Use only these approved sources unless marked otherwise: ${sources}. Required gates: ${gates}. Do not proceed as if missing governance decisions are already made by AI.`,
    },
    {
      id: "review-criteria",
      title: "Review criteria",
      purpose: "Evaluate an AI-assisted output against HITM controls.",
      owner: reviewOwner,
      whenToUse: "Before a draft moves to approval, publication, user impact, or operational use.",
      inputs: ["Workflow canvas", "Governance gates", "Source material", "Open warnings"],
      output: "A structured review checklist with required human actions.",
      prompt: `Review this output for ${project}. Check whether it follows the human control boundary (${control}), uses approved sources (${sources}), avoids unsupported claims, names assumptions, respects scope, and identifies what a human owner must approve before use. Current workflow: ${workflow}. Required gates: ${gates}. Open deterministic HITM warnings: ${warnings.open}. Document any exception instead of silently accepting it. AI must not make the final decision.`,
    },
    {
      id: "critique",
      title: "Critique",
      purpose: "Find weak spots in the workflow before it becomes policy or software.",
      owner: reviewOwner,
      whenToUse: "After a first workflow, prompt, or architecture draft exists.",
      inputs: ["Ownership matrix", "Workflow canvas", "Gate list", "Warning status"],
      output: "Prioritized critique with fix recommendations.",
      prompt: `Critique the proposed workflow for ${project}. Find unclear human ownership, weak approval gates, hidden automation, missing data boundaries, missing audit events, unsupported claims, unowned exceptions, and places where AI is treated as a decision-maker instead of an assistant. Ownership map: ${ownership}. Workflow: ${workflow}. Current warning exceptions: ${warnings.exceptions}. Recommend concrete changes, and state which human owner should approve each change.`,
    },
    {
      id: "red-team",
      title: "Red-team check",
      purpose: "Stress-test risks, misuse, trust failures, and hidden automation.",
      owner: reviewOwner,
      whenToUse: "Before approval, launch, user testing, or expansion of automation.",
      inputs: ["Risk posture", "Workflow canvas", "Open warnings", "Exception notes"],
      output: "Failure modes and mitigations tied to human controls.",
      prompt: `Stress-test this HITM blueprint for ${project}. List misuse cases, failure modes, privacy risks, automation risks, source-quality risks, confusing handoffs, prompt-injection risks, and ways a user could mistakenly trust AI output without proper review. Current workflow: ${workflow}. Open deterministic warnings: ${warnings.open}. Documented exceptions: ${warnings.exceptions}. For each risk, name the missing or weak human control and the owner who must approve mitigation. AI must not approve its own mitigations.`,
    },
    {
      id: "escalation",
      title: "Escalation",
      purpose: "Route uncertainty, high-impact actions, and unsupported claims to a human owner.",
      owner: reviewOwner,
      whenToUse: "When the assistant lacks evidence, confidence, authority, or policy coverage.",
      inputs: ["Human-control boundary", "Escalation route", "Sensitivity", "Workflow warnings"],
      output: "A clear stop/route/escalate instruction.",
      prompt: `Use this escalation rule for ${project}: stop and route to a human owner when evidence is missing, sources conflict, the request exceeds scope, sensitive data is involved, customer/user impact is possible, a tool/model/prompt change is needed, or any required approval gate is unclear. Human control boundary: ${control}. Data owner: ${dataOwner}. Review owner: ${reviewOwner}. Decision owner: ${decisionOwner}. Required gates: ${gates}. Do not improvise approval, do not continue silently, and do not present an escalation as resolved until the named human owner decides.`,
    },
    {
      id: "final-approval",
      title: "Final approval",
      purpose: "Prepare a human-owned approval checklist before report or launch.",
      owner: decisionOwner,
      whenToUse: "At the final handoff before report inclusion, publishing, launch, or operational use.",
      inputs: ["All intake fields", "Ownership matrix", "Governance gates", "Warnings/exceptions", "Workflow canvas"],
      output: "A final approval checklist with blockers and sign-off owners.",
      prompt: `Prepare a final human approval checklist for ${project}. Separate: ready items, unresolved assumptions, open HITM warnings (${warnings.open}), documented exceptions (${warnings.exceptions}), required gate sign-offs (${gates}), source/data boundaries (${sources}), workflow steps (${workflow}), and audit-log requirements. Name the human owner for each approval using this ownership map: ${ownership}. State clearly that AI is starter support only and cannot approve the workflow, final decisions, exceptions, publication, deployment, or governance changes.`,
    },
  ] satisfies Array<Omit<PromptPackItem, "checks">>;

  const items = locale === "de" ? germanPromptItems({ project: blueprint.projectName || "dieses Projekt", audience: blueprint.audience || "die vorgesehene Zielgruppe", control: blueprint.humanControl || "finale Entscheidungen, Freigaben und Änderungen", sources: blueprint.sourceMaterial || "freigegebenen Projektkontext und Quellenmaterial", gates, ownership, workflow, warnings, reviewOwner: localizeDefaultRole(reviewOwner, locale), projectOwner: localizeDefaultRole(projectOwner, locale), dataOwner: localizeDefaultRole(dataOwner, locale), decisionOwner: localizeDefaultRole(decisionOwner, locale) }) : prompts;
  return items.map((item) => ({
    ...item,
    checks: buildPromptChecks(item.prompt, checkContext, locale),
  }));
}

export function formatPromptPackAsMarkdown(blueprint: BlueprintFile, prompts?: PromptPackItem[], locale: Locale = "en") {
  prompts = prompts ?? buildPromptPack(blueprint, locale);
  blueprint = localizeDemoIntake(blueprintForOutput(blueprint, locale), locale);
  if (locale === "de") return [
    `# HITM-Prompt-Paket: ${blueprint.projectName || "Unbenanntes HITM-Projekt"}`, "",
    `Zielgruppe: ${blueprint.audience || "Noch nicht definiert."}`, `Erstellt: ${new Date().toISOString().slice(0, 10)}`, "",
    "> Start-Prompts. Menschen bleiben für Freigaben, Ausnahmen, Veröffentlichung, Bereitstellung und Governance-Änderungen verantwortlich.", "",
    ...prompts.flatMap((item, index) => [`## ${index + 1}. ${item.title}`, "", `Zweck: ${item.purpose}`, `Verantwortlich: ${item.owner}`, `Wann verwenden: ${item.whenToUse}`, `Erwartetes Ergebnis: ${item.output}`, `Eingaben: ${item.inputs.join(", ")}`, "", item.prompt, "", "Prüfungen:", ...item.checks.map((check) => `- ${check.status === "pass" ? "BESTANDEN" : "HINWEIS"}: ${check.label} — ${check.detail}`), ""]),
  ].join("\n");
  const title = blueprint.projectName || "Untitled HITM project";
  return [
    `# HITM Prompt Pack: ${title}`,
    "",
    `Audience: ${blueprint.audience || "Audience not defined yet."}`,
    `Generated: ${new Date().toISOString().slice(0, 10)}`,
    "",
    "> Starter prompts only. Human owners remain accountable for approvals, exceptions, publication, deployment, and governance changes.",
    "",
    ...prompts.flatMap((item, index) => [
      `## ${index + 1}. ${item.title}`,
      "",
      `Purpose: ${item.purpose}`,
      `Owner: ${item.owner}`,
      `When to use: ${item.whenToUse}`,
      `Expected output: ${item.output}`,
      `Inputs: ${item.inputs.join(", ")}`,
      "",
      item.prompt,
      "",
      "Checks:",
      ...item.checks.map((check) => `- ${check.status.toUpperCase()}: ${check.label} — ${check.detail}`),
      "",
    ]),
  ].join("\n");
}

export function buildReport(blueprint: BlueprintFile, locale: Locale = "en") {
  blueprint = localizeDemoIntake(blueprintForOutput(blueprint, locale), locale);
  const copy = (en: string, de: string) => locale === "de" ? de : en;
  const selectedPattern = getPatternById(blueprint.selectedPattern, locale);
  const warnings = runHitmChecks(blueprint, locale);
  const prompts = buildPromptPack(blueprint, locale);
  const openWarnings = warnings.filter((warning) => warning.status === "open");
  const exceptions = warnings.filter((warning) => warning.status === "exception");
  const requiredGates = blueprint.gates.filter((gate) => gate.required);
  const nextSteps = [
    openWarnings.length
      ? `Resolve or document ${openWarnings.length} open HITM warning${openWarnings.length === 1 ? "" : "s"}.`
      : "Keep deterministic HITM checks clear as the workflow changes.",
    blueprint.nodes.length ? "Review the workflow blueprint with the named human owners." : "Generate or draw the workflow blueprint before external review.",
    requiredGates.length ? "Collect sign-off for required governance gates." : "Decide which governance gates are required before launch.",
    "Treat the prompt pack as starter material and revise it under human ownership.",
    "Export or print the report for project review.",
  ];
  if (locale === "de") nextSteps.splice(0, nextSteps.length,
    openWarnings.length ? `${openWarnings.length} offene HITM-Hinweise beheben oder begründete Ausnahmen dokumentieren.` : "HITM-Prüfungen nach Workflow-Änderungen erneut prüfen.",
    blueprint.nodes.length ? "Den Workflow mit den menschlichen Verantwortlichen prüfen." : "Vor externer Prüfung einen Workflow erstellen.",
    requiredGates.length ? "Menschliche Freigaben für erforderliche Governance-Punkte einholen." : "Vor dem Start erforderliche Freigabepunkte festlegen.",
    "Das Prompt-Paket als Ausgangspunkt unter menschlicher Verantwortung überarbeiten.", "Den Bericht für die Projektprüfung exportieren oder drucken.");

  return {
    locale,
    generatedAt: new Date().toISOString().slice(0, 10),
    projectName: blueprint.projectName || copy("Untitled HITM project", "Unbenanntes HITM-Projekt"),
    summary: blueprint.projectGoal || copy("No project goal has been written yet.", "Noch kein Projektziel definiert."),
    audience: blueprint.audience || copy("Audience not defined yet.", "Zielgruppe noch nicht definiert."),
    aiAssistance: blueprint.aiAssistance || copy("AI assistance has not been defined yet.", "KI-Unterstützung noch nicht definiert."),
    humanControl: blueprint.humanControl || copy("Human-control boundaries have not been defined yet.", "Menschliche Kontrollgrenzen noch nicht definiert."),
    sourceMaterial: blueprint.sourceMaterial || copy("Source material has not been defined yet.", "Quellenmaterial noch nicht definiert."),
    successMeasures: blueprint.successMeasures || copy("Success measures have not been defined yet.", "Erfolgskennzahlen noch nicht definiert."),
    scopeIn: blueprint.scopeIn || copy("Scope-in items have not been defined yet.", "Projektumfang noch nicht definiert."),
    scopeOut: blueprint.scopeOut || copy("Scope-out items have not been defined yet.", "Ausgeschlossene Bereiche noch nicht definiert."),
    sensitivity: locale === "de" ? t(locale, blueprint.sensitivity) : blueprint.sensitivity,
    complexity: locale === "de" ? t(locale, blueprint.complexity) : blueprint.complexity,
    automationLevel: locale === "de" ? t(locale, blueprint.automationLevel) : blueprint.automationLevel,
    teamCapacity: locale === "de" ? t(locale, blueprint.teamCapacity === "solo" ? "solo" : blueprint.teamCapacity === "small-team" ? "smallTeam" : "technicalTeam") : blueprint.teamCapacity,
    selectedPattern: selectedPattern?.title ?? copy("No stack pattern selected yet", "Noch kein Technologiepfad ausgewählt"),
    stackFit: selectedPattern?.fit ?? copy("Select a stack pattern to add fit guidance.", "Wählen Sie einen Technologiepfad für Eignungshinweise."),
    stackGives: selectedPattern?.gives ?? copy("Select a stack pattern to add expected benefits.", "Wählen Sie einen Technologiepfad für erwartete Vorteile."),
    stackTradeoff: selectedPattern?.tradeoff ?? copy("Select a stack pattern to add tradeoffs.", "Wählen Sie einen Technologiepfad für Abwägungen."),
    stackReview: selectedPattern?.review ?? copy("Human review remains required before operational use.", "Menschliche Prüfung bleibt vor operativem Einsatz erforderlich."),
    stackAvoid: selectedPattern?.avoid ?? copy("Do not treat the selected path as automatic approval.", "Behandeln Sie den gewählten Pfad nicht als automatische Freigabe."),
    gates: requiredGates.map((gate) => gate.label),
    gateDetails: blueprint.gates.map((gate) => ({
      label: gate.label,
      description: gate.description,
      required: gate.required,
      owner: gate.owner,
    })),
    ownership: blueprint.ownership.map((item) => `${item.area}: ${item.humanOwner}`),
    ownershipDetails: blueprint.ownership.map((item) => ({
      area: item.area,
      humanOwner: item.humanOwner,
      aiRole: item.aiRole,
      approval: item.approval,
    })),
    canvasNodes: blueprint.nodes.map((node) => `${node.title} (${node.owner})`),
    canvasNodeDetails: blueprint.nodes.map((node) => ({
      title: node.title,
      kind: locale === "de" ? getNodeKinds(locale).find((item) => item.id === node.kind)?.label ?? node.kind : node.kind,
      detail: node.detail,
      owner: node.owner,
      dataApproval: node.dataApproval ? t(locale, node.dataApproval === "approved" ? "approvedData" : node.dataApproval === "rejected" ? "rejectedData" : "unreviewedData") : "",
      explicitStop: node.explicitStop ?? false,
    })),
    canvasEdges: blueprint.edges.map((edge) => `${nodeTitle(blueprint, edge.from)} → ${nodeTitle(blueprint, edge.to)} (${locale === "de" ? getEdgeTypes(locale).find((item) => item.id === edge.type)?.label : edge.type}${edge.label ? `: ${edge.label}` : ""})`),
    canvasEdgeDetails: blueprint.edges.map((edge) => ({
      from: nodeTitle(blueprint, edge.from),
      to: nodeTitle(blueprint, edge.to),
      type: locale === "de" ? getEdgeTypes(locale).find((item) => item.id === edge.type)?.label ?? edge.type : edge.type,
      label: edge.label ?? "",
    })),
    warnings: warnings.map((warning) => `${warning.title}: ${warning.status}${warning.note ? ` — ${warning.note}` : ""}`),
    warningDetails: warnings.map((warning) => ({
      title: warning.title,
      severity: warning.severity,
      status: warning.status,
      trigger: warning.trigger,
      missingControl: warning.missingControl,
      recommendation: warning.recommendation,
      note: warning.note,
    })),
    openWarningCount: openWarnings.length,
    exceptionCount: exceptions.length,
    prompts: prompts.map((item) => `${item.title} (${item.owner})`),
    promptDetails: prompts.map((item) => ({
      title: item.title,
      owner: item.owner,
      purpose: item.purpose,
      whenToUse: item.whenToUse,
      output: item.output,
      checkWarningCount: item.checks.filter((check) => check.status === "warning").length,
    })),
    nextSteps,
    servicesNote:
      copy("Optional support may be useful for workflow design, local-first setup, self-hosting, RAG architecture, agent design, governance, prompt systems, or implementation. This is not required to use the report.", "Optionale Unterstützung kann bei Workflow-Planung, lokalem Betrieb, Selbsthosting, RAG, Agenten, Governance, Prompts oder Umsetzung helfen. Sie ist zur Nutzung des Berichts nicht erforderlich."),
  };
}

export function formatReportAsMarkdown(blueprint: BlueprintFile, report = buildReport(blueprint)) {
  if (report.locale === "de") return [
    `# Abschließender HITM-Blueprint-Bericht: ${report.projectName}`, "", `Erstellt: ${report.generatedAt}`, "",
    "## Projektzusammenfassung", "", report.summary, "",
    `- Zielgruppe: ${report.audience}`, `- KI-Unterstützung: ${report.aiAssistance}`, `- Menschliche Kontrolle: ${report.humanControl}`, `- Quellenmaterial: ${report.sourceMaterial}`, `- Erfolgskennzahlen: ${report.successMeasures}`, `- Im Umfang: ${report.scopeIn}`, `- Außerhalb des Umfangs: ${report.scopeOut}`, `- Sensibilität: ${report.sensitivity}`, `- Komplexität: ${report.complexity}`, `- Automatisierung: ${report.automationLevel}`, `- Kapazität: ${report.teamCapacity}`, "",
    "## Verantwortungsmatrix", "", ...report.ownershipDetails.map((item) => `- ${item.area}: ${item.humanOwner}. KI-Rolle: ${item.aiRole}. Freigabe: ${item.approval}`), "",
    "## Governance-Freigaben", "", ...report.gateDetails.map((gate) => `- ${gate.required ? "Erforderlich" : "Optional"} — ${gate.label} (${gate.owner}): ${gate.description}`), "",
    "## Workflow-Blueprint", "", ...(report.canvasNodeDetails.length ? report.canvasNodeDetails.map((node, index) => `${index + 1}. ${node.title} — ${node.kind}, verantwortlich: ${node.owner}. ${node.detail}${node.dataApproval ? ` Datennutzung: ${node.dataApproval}.` : ""}${node.explicitStop ? " Beabsichtigter Stopp." : ""}`) : ["Noch keine Workflow-Knoten abgebildet."]), "",
    "### Workflow-Verbindungen", "", ...(report.canvasEdges.length ? report.canvasEdges.map((edge) => `- ${edge}`) : ["Noch keine Workflow-Verbindungen abgebildet."]), "",
    "## Technologiepfad", "", `- Ausgewählt: ${report.selectedPattern}`, `- Geeignet für: ${report.stackFit}`, `- Bietet: ${report.stackGives}`, `- Abwägung: ${report.stackTradeoff}`, `- Prüfung: ${report.stackReview}`, `- Vermeiden: ${report.stackAvoid}`, "",
    "## HITM-Hinweisstatus", "", `${report.openWarningCount} offene Hinweise · ${report.exceptionCount} dokumentierte Ausnahmen`, "", ...(report.warningDetails.length ? report.warningDetails.map((warning) => `- ${warning.title} [${t("de", warning.severity)}, ${t("de", warning.status === "exception" ? "exceptions" : warning.status)}]: ${warning.recommendation}${warning.note ? ` Notiz: ${warning.note}` : ""}`) : ["Aktuell keine deterministischen Hinweise."]), "",
    "## Prompt-Paket", "", ...report.promptDetails.map((item) => `- ${item.title} (${item.owner}): ${item.purpose} Einsatz: ${item.whenToUse} Ergebnis: ${item.output} Prüfhinweise: ${item.checkWarningCount}.`), "",
    "## Nächste Schritte", "", ...report.nextSteps.map((step) => `- ${step}`), "", "## Optionale Unterstützung", "", report.servicesNote,
  ].join("\n");
  return [
    `# Final HITM Blueprint Report: ${report.projectName}`,
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Project Summary",
    "",
    report.summary,
    "",
    `- Audience: ${report.audience}`,
    `- AI assistance: ${report.aiAssistance}`,
    `- Human control: ${report.humanControl}`,
    `- Source material: ${report.sourceMaterial}`,
    `- Success measures: ${report.successMeasures}`,
    `- Scope in: ${report.scopeIn}`,
    `- Scope out: ${report.scopeOut}`,
    `- Sensitivity: ${report.sensitivity}`,
    `- Complexity: ${report.complexity}`,
    `- Automation level: ${report.automationLevel}`,
    `- Team capacity: ${report.teamCapacity}`,
    "",
    "## Ownership Matrix",
    "",
    ...report.ownershipDetails.map((item) => `- ${item.area}: ${item.humanOwner}. AI role: ${item.aiRole}. Approval: ${item.approval}`),
    "",
    "## Governance Gates",
    "",
    ...report.gateDetails.map((gate) => `- ${gate.required ? "Required" : "Optional"} — ${gate.label} (${gate.owner}): ${gate.description}`),
    "",
    "## Workflow Blueprint",
    "",
    ...(
      report.canvasNodeDetails.length
        ? report.canvasNodeDetails.map((node, index) => `${index + 1}. ${node.title} — ${node.kind}, owner: ${node.owner}. ${node.detail}${node.dataApproval ? ` Data-use approval: ${node.dataApproval}.` : ""}${node.explicitStop ? " Intentional stopping point." : ""}`)
        : ["No workflow nodes have been mapped yet."]
    ),
    "",
    "### Workflow Connections",
    "",
    ...(
      report.canvasEdgeDetails.length
        ? report.canvasEdgeDetails.map((edge) => `- ${edge.from} -> ${edge.to} (${edge.type}${edge.label ? `: ${edge.label}` : ""})`)
        : ["No workflow connections have been mapped yet."]
    ),
    "",
    "## Stack Pattern Guide",
    "",
    `- Selected pattern: ${report.selectedPattern}`,
    `- Fit: ${report.stackFit}`,
    `- Provides: ${report.stackGives}`,
    `- Tradeoff: ${report.stackTradeoff}`,
    `- Review: ${report.stackReview}`,
    `- Avoid: ${report.stackAvoid}`,
    "",
    "## HITM Warning Status",
    "",
    `${report.openWarningCount} open warnings · ${report.exceptionCount} documented exceptions`,
    "",
    ...(
      report.warningDetails.length
        ? report.warningDetails.map((warning) => `- ${warning.title} [${warning.severity}, ${warning.status}]: ${warning.recommendation}${warning.note ? ` Exception note: ${warning.note}` : ""}`)
        : ["No deterministic warnings currently trigger."]
    ),
    "",
    "## Prompt Pack",
    "",
    ...report.promptDetails.map((prompt) => `- ${prompt.title} (${prompt.owner}): ${prompt.purpose}. Use: ${prompt.whenToUse}. Output: ${prompt.output}. Check warnings: ${prompt.checkWarningCount}.`),
    "",
    "## Next Steps",
    "",
    ...report.nextSteps.map((step) => `- ${step}`),
    "",
    "## Optional Support",
    "",
    report.servicesNote,
  ].join("\n");
}
