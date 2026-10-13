import {
  Bot,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileCheck2,
  FileJson,
  Flag,
  GitBranch,
  Hand,
  HelpCircle,
  Layers3,
  LockKeyhole,
  Network,
  PenLine,
  PlayCircle,
  RefreshCw,
  Route,
  Scale,
  ServerCog,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Locale } from "@/lib/i18n";

export type ActiveView = "canvas" | "checks" | "matrix" | "alternatives" | "prompts" | "report";
export type Complexity = "simple" | "moderate" | "complex";
export type Sensitivity = "public" | "internal" | "sensitive";
export type AutomationLevel = "assistive" | "reviewed" | "automated";
export type TeamCapacity = "solo" | "small-team" | "technical-team";
export type StackPatternId =
  | "fast-prototype"
  | "no-code"
  | "local-first"
  | "self-hosted"
  | "api-product"
  | "rag-documents"
  | "agent-workflow"
  | "team-workflow"
  | "canvas-knowledge";
export type NodeKind =
  | "human"
  | "ai"
  | "review"
  | "gate"
  | "decision"
  | "data"
  | "tool"
  | "escalation"
  | "audit"
  | "output";
export type EdgeType = "sequence" | "feedback" | "escalation" | "data" | "approval" | "rejection";

export type CanvasNode = {
  id: string;
  kind: NodeKind;
  title: string;
  detail: string;
  owner: string;
  dataApproval?: "unreviewed" | "approved" | "rejected";
  explicitStop?: boolean;
  x: number;
  y: number;
};

export type CanvasEdge = {
  id: string;
  from: string;
  to: string;
  type: EdgeType;
  label?: string;
};

export type WarningStatus = "resolved" | "exception";

export type WarningResolution = {
  id: string;
  status: WarningStatus;
  note: string;
  updatedAt: string;
};

export type OwnershipItem = {
  id: string;
  area: string;
  humanOwner: string;
  aiRole: string;
  approval: string;
};

export type GateItem = {
  id: string;
  label: string;
  description: string;
  required: boolean;
  owner: string;
};

export type AlternativeKind = "privacy" | "review" | "small-team";

export type BlueprintAlternative = {
  id: string;
  kind: AlternativeKind | "snapshot";
  title: string;
  summary: string;
  rationale: string[];
  changes: string[];
  createdAt: string;
  snapshot: {
    sensitivity: Sensitivity;
    complexity: Complexity;
    automationLevel: AutomationLevel;
    teamCapacity: TeamCapacity;
    selectedPattern: StackPatternId | "";
    ownership: OwnershipItem[];
    gates: GateItem[];
    nodes: CanvasNode[];
    edges: CanvasEdge[];
    warningResolutions: WarningResolution[];
  };
};

export type BlueprintFile = {
  projectName: string;
  audience: string;
  projectGoal: string;
  aiAssistance: string;
  humanControl: string;
  sourceMaterial: string;
  successMeasures: string;
  scopeIn: string;
  scopeOut: string;
  sensitivity: Sensitivity;
  complexity: Complexity;
  automationLevel: AutomationLevel;
  teamCapacity: TeamCapacity;
  selectedPattern: StackPatternId | "";
  ownership: OwnershipItem[];
  gates: GateItem[];
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  warningResolutions: WarningResolution[];
  alternatives: BlueprintAlternative[];
};

export const stepItems = [
  { id: "context", label: "Define Context", detail: "Project & people", icon: ClipboardCheck },
  { id: "workflow", label: "Map Workflow", detail: "Canvas steps", icon: Route },
  { id: "ownership", label: "Assign Ownership", detail: "Humans & AI", icon: Users },
  { id: "governance", label: "Set Governance", detail: "Gates & policies", icon: ShieldCheck },
  { id: "stress", label: "Validate & Stress-Test", detail: "Risks & review", icon: Scale },
  { id: "export", label: "Document & Export", detail: "Report handoff", icon: FileCheck2 },
] satisfies Array<{ id: string; label: string; detail: string; icon: LucideIcon }>;

export const nodeKinds: Array<{ id: NodeKind; label: string; description: string; icon: LucideIcon }> = [
  { id: "human", label: "Human action", description: "Input, judgment, or accountable work", icon: Hand },
  { id: "ai", label: "AI assistance", description: "Draft, classify, summarize, or suggest", icon: Bot },
  { id: "review", label: "Review", description: "Quality, risk, or evidence check", icon: CheckCircle2 },
  { id: "gate", label: "Approval gate", description: "Required human approval point", icon: ShieldCheck },
  { id: "decision", label: "Decision", description: "Branch based on explicit criteria", icon: HelpCircle },
  { id: "data", label: "Data or source", description: "Approved context or source material", icon: Database },
  { id: "tool", label: "Tool or system", description: "Service, model, or operational system", icon: ServerCog },
  { id: "escalation", label: "Escalation", description: "Route uncertainty to a human owner", icon: TriangleAlert },
  { id: "audit", label: "Audit event", description: "Record an action, decision, or artifact", icon: FileJson },
  { id: "output", label: "Output", description: "Handoff, publication, or explicit stop", icon: Flag },
];

export const edgeTypes: Array<{ id: EdgeType; label: string; description: string }> = [
  { id: "sequence", label: "Sequence", description: "Normal workflow progression" },
  { id: "feedback", label: "Feedback loop", description: "Return for review or improvement" },
  { id: "escalation", label: "Escalation", description: "Route to an accountable human" },
  { id: "data", label: "Data flow", description: "Move approved context or records" },
  { id: "approval", label: "Approval branch", description: "Continue after approval" },
  { id: "rejection", label: "Revision branch", description: "Reject, revise, or retry" },
];

const germanNodeKinds: Record<NodeKind, { label: string; description: string }> = {
  human: { label: "Menschliche Aufgabe", description: "Eingabe, Urteil oder verantwortliche Arbeit" },
  ai: { label: "KI-Unterstützung", description: "Entwerfen, klassifizieren, zusammenfassen oder vorschlagen" },
  review: { label: "Prüfung", description: "Qualitäts-, Risiko- oder Evidenzprüfung" },
  gate: { label: "Freigabepunkt", description: "Erforderlicher menschlicher Freigabepunkt" },
  decision: { label: "Entscheidung", description: "Verzweigung anhand expliziter Kriterien" },
  data: { label: "Daten oder Quelle", description: "Freigegebener Kontext oder Quellenmaterial" },
  tool: { label: "Werkzeug oder System", description: "Dienst, Modell oder Betriebssystem" },
  escalation: { label: "Eskalation", description: "Unsicherheit an eine verantwortliche Person weiterleiten" },
  audit: { label: "Audit-Ereignis", description: "Aktion, Entscheidung oder Artefakt festhalten" },
  output: { label: "Ergebnis", description: "Übergabe, Veröffentlichung oder expliziter Abschluss" },
};

const germanEdgeTypes: Record<EdgeType, { label: string; description: string }> = {
  sequence: { label: "Abfolge", description: "Normaler Workflow-Fortschritt" },
  feedback: { label: "Rückkopplung", description: "Zur Prüfung oder Verbesserung zurückführen" },
  escalation: { label: "Eskalation", description: "An eine verantwortliche Person weiterleiten" },
  data: { label: "Datenfluss", description: "Freigegebenen Kontext oder Datensätze übertragen" },
  approval: { label: "Freigabezweig", description: "Nach Freigabe fortsetzen" },
  rejection: { label: "Überarbeitungszweig", description: "Ablehnen, überarbeiten oder erneut versuchen" },
};

export function getNodeKinds(locale: Locale = "en") {
  return locale === "de" ? nodeKinds.map((item) => ({ ...item, ...germanNodeKinds[item.id] })) : nodeKinds;
}

export function getEdgeTypes(locale: Locale = "en") {
  return locale === "de" ? edgeTypes.map((item) => ({ ...item, ...germanEdgeTypes[item.id] })) : edgeTypes;
}

export const stackPatterns: Array<{
  id: StackPatternId;
  title: string;
  icon: LucideIcon;
  fit: string;
  gives: string;
  tradeoff: string;
  review: string;
  avoid: string;
}> = [
  {
    id: "fast-prototype",
    title: "Fast prototype path",
    icon: PlayCircle,
    fit: "Testing a workflow quickly with low-risk inputs.",
    gives: "Speed, learning, and something users can react to.",
    tradeoff: "Weak governance unless gates are written down early.",
    review: "Human review before any real user or client-facing output.",
    avoid: "Treating the prototype stack as production architecture.",
  },
  {
    id: "no-code",
    title: "Simple no-code path",
    icon: Layers3,
    fit: "Small teams that need an internal workflow before custom software.",
    gives: "Fast assembly, editable steps, and low maintenance.",
    tradeoff: "Platform limits and export constraints can appear later.",
    review: "Owner approval before automations move data between tools.",
    avoid: "Hidden chains of tools nobody can audit.",
  },
  {
    id: "local-first",
    title: "Local-first privacy path",
    icon: LockKeyhole,
    fit: "Sensitive material, early-stage analysis, or trust-first work.",
    gives: "Data control and strong user confidence.",
    tradeoff: "More setup friction and weaker collaboration by default.",
    review: "Human approval before data leaves the local boundary.",
    avoid: "Promising privacy without documenting data movement.",
  },
  {
    id: "self-hosted",
    title: "Self-hosted sovereignty path",
    icon: ServerCog,
    fit: "Technical teams that need control over deployment and updates.",
    gives: "Infrastructure control, auditability, and exit options.",
    tradeoff: "Operational burden: backups, security, monitoring, updates.",
    review: "Change gate for every model, tool, dependency, and prompt update.",
    avoid: "Self-hosting without named maintenance ownership.",
  },
  {
    id: "api-product",
    title: "API-based product path",
    icon: Network,
    fit: "Software products that need reliable model capabilities now.",
    gives: "Quality, scale, and access to maintained model APIs.",
    tradeoff: "Vendor dependency, data-processing concerns, and cost exposure.",
    review: "Human approval before user data, automated sends, or provider changes.",
    avoid: "Letting API convenience erase the HITM boundary.",
  },
  {
    id: "rag-documents",
    title: "RAG/document workflow path",
    icon: Database,
    fit: "Projects grounded in policies, knowledge bases, manuals, or documents.",
    gives: "Source-grounded answers and repeatable review material.",
    tradeoff: "Retrieval quality, document hygiene, and citation checks matter.",
    review: "Human review of sources, omissions, and unsupported claims.",
    avoid: "Calling retrieval grounded when sources are stale or unclear.",
  },
  {
    id: "agent-workflow",
    title: "Agent workflow path",
    icon: BrainCircuit,
    fit: "Multi-step work where AI drafts, checks, routes, or critiques.",
    gives: "Richer assistance across roles and repeated decisions.",
    tradeoff: "More failure modes, harder debugging, stronger gate requirements.",
    review: "Escalation gate before autonomous action or external communication.",
    avoid: "Giving agents authority before the review model is proven.",
  },
  {
    id: "team-workflow",
    title: "Team workflow path",
    icon: Users,
    fit: "Internal operations with multiple human owners and handoffs.",
    gives: "Clear accountability, shared process, and audit trail.",
    tradeoff: "Requires adoption discipline and role clarity.",
    review: "Named owner signs off every critical handoff.",
    avoid: "A shared AI process without shared ownership.",
  },
  {
    id: "canvas-knowledge",
    title: "Canvas/knowledge workflow path",
    icon: GitBranch,
    fit: "Planning, research, complex reasoning, and evolving knowledge maps.",
    gives: "A visible shared model of the project and review structure.",
    tradeoff: "Needs pruning so the map does not become a dumping ground.",
    review: "Human approves map-to-report conclusions.",
    avoid: "Confusing a beautiful map with an approved process.",
  },
];

const germanStackPatterns: Record<StackPatternId, Pick<(typeof stackPatterns)[number], "title" | "fit" | "gives" | "tradeoff" | "review" | "avoid">> = {
  "fast-prototype": { title: "Schneller Prototyp", fit: "Zum schnellen Erproben eines Workflows mit risikoarmen Eingaben.", gives: "Geschwindigkeit, Lernen und etwas, worauf Nutzende reagieren können.", tradeoff: "Schwache Governance, wenn Freigaben nicht früh festgehalten werden.", review: "Menschliche Prüfung vor jeder realen Ausgabe für Nutzende oder Kundschaft.", avoid: "Den Prototypen als Produktionsarchitektur zu behandeln." },
  "no-code": { title: "Einfacher No-Code-Pfad", fit: "Für kleine Teams, die vor eigener Software einen internen Workflow benötigen.", gives: "Schnellen Aufbau, bearbeitbare Schritte und wenig Wartung.", tradeoff: "Plattformgrenzen und Exportbeschränkungen können später auftreten.", review: "Freigabe durch Verantwortliche, bevor Automatisierungen Daten zwischen Werkzeugen bewegen.", avoid: "Versteckte Werkzeugketten, die niemand auditieren kann." },
  "local-first": { title: "Lokaler Datenschutz-Pfad", fit: "Für sensibles Material, frühe Analyse oder vertrauensbasiertes Arbeiten.", gives: "Datenkontrolle und hohes Nutzervertrauen.", tradeoff: "Mehr Einrichtungsaufwand und standardmäßig schwächere Zusammenarbeit.", review: "Menschliche Freigabe, bevor Daten die lokale Grenze verlassen.", avoid: "Datenschutz zu versprechen, ohne Datenbewegungen zu dokumentieren." },
  "self-hosted": { title: "Selbst gehosteter Souveränitäts-Pfad", fit: "Für technische Teams, die Kontrolle über Betrieb und Updates benötigen.", gives: "Infrastrukturkontrolle, Auditierbarkeit und Wechselmöglichkeiten.", tradeoff: "Betriebsaufwand für Sicherungen, Sicherheit, Monitoring und Updates.", review: "Freigabepunkt für jede Modell-, Werkzeug-, Abhängigkeits- und Prompt-Änderung.", avoid: "Selbsthosting ohne benannte Wartungsverantwortung." },
  "api-product": { title: "API-basierter Produktpfad", fit: "Für Softwareprodukte, die jetzt zuverlässige Modellfähigkeiten benötigen.", gives: "Qualität, Skalierung und Zugang zu gepflegten Modell-APIs.", tradeoff: "Anbieterabhängigkeit, Bedenken bei Datenverarbeitung und Kostenrisiko.", review: "Menschliche Freigabe vor Nutzerdaten, automatischem Versand oder Anbieterwechsel.", avoid: "Dass API-Komfort die HITM-Grenze verwischt." },
  "rag-documents": { title: "RAG-/Dokumenten-Workflow", fit: "Für Projekte mit Richtlinien, Wissensdatenbanken, Handbüchern oder Dokumenten als Grundlage.", gives: "Quellengebundene Antworten und wiederholbares Prüfmaterial.", tradeoff: "Abrufqualität, Dokumentenhygiene und Zitationsprüfungen sind entscheidend.", review: "Menschliche Prüfung von Quellen, Auslassungen und unbelegten Aussagen.", avoid: "Abruf als fundiert zu bezeichnen, wenn Quellen veraltet oder unklar sind." },
  "agent-workflow": { title: "Agenten-Workflow", fit: "Für mehrstufige Arbeit, bei der KI entwirft, prüft, weiterleitet oder kritisiert.", gives: "Umfassendere Unterstützung über Rollen und wiederkehrende Entscheidungen hinweg.", tradeoff: "Mehr Fehlermöglichkeiten, schwierigere Fehlersuche und stärkere Freigabeanforderungen.", review: "Eskalationsfreigabe vor autonomen Aktionen oder externer Kommunikation.", avoid: "Agenten Autorität zu geben, bevor das Prüfmodell erprobt ist." },
  "team-workflow": { title: "Team-Workflow", fit: "Für interne Abläufe mit mehreren menschlichen Verantwortlichen und Übergaben.", gives: "Klare Rechenschaft, gemeinsamen Prozess und Audit-Trail.", tradeoff: "Erfordert Nutzungsdisziplin und klare Rollen.", review: "Eine benannte Person gibt jede kritische Übergabe frei.", avoid: "Einen gemeinsamen KI-Prozess ohne gemeinsame Verantwortung." },
  "canvas-knowledge": { title: "Arbeitsflächen-/Wissens-Workflow", fit: "Für Planung, Recherche, komplexes Denken und sich entwickelnde Wissenskarten.", gives: "Ein sichtbares gemeinsames Modell des Projekts und seiner Prüfstruktur.", tradeoff: "Muss bereinigt werden, damit die Karte nicht zur Ablage wird.", review: "Eine Person gibt Schlussfolgerungen der Karte für den Bericht frei.", avoid: "Eine schöne Karte mit einem freigegebenen Prozess zu verwechseln." },
};

export function getStackPatterns(locale: Locale = "en") {
  return locale === "de" ? stackPatterns.map((item) => ({ ...item, ...germanStackPatterns[item.id] })) : stackPatterns;
}

export const defaultOwnership: OwnershipItem[] = [
  {
    id: "goal",
    area: "Goal",
    humanOwner: "Project owner",
    aiRole: "Suggest refinements and clarify assumptions",
    approval: "Human defines final goal",
  },
  {
    id: "prompts",
    area: "Prompts",
    humanOwner: "Workflow lead",
    aiRole: "Draft prompt variants",
    approval: "Human approves prompt changes",
  },
  {
    id: "data",
    area: "Data",
    humanOwner: "Data owner",
    aiRole: "Classify and summarize permitted material",
    approval: "Human approves data boundary",
  },
  {
    id: "review",
    area: "Review process",
    humanOwner: "Review lead",
    aiRole: "Flag gaps, risks, and contradictions",
    approval: "Human signs off outputs",
  },
  {
    id: "deployment",
    area: "Deployment",
    humanOwner: "Ops owner",
    aiRole: "Prepare checklist drafts",
    approval: "Human approves release",
  },
  {
    id: "decisions",
    area: "Final decisions",
    humanOwner: "Accountable decision-maker",
    aiRole: "Provide structured options",
    approval: "AI never owns final decision",
  },
];

export const defaultGates: GateItem[] = [
  {
    id: "before-generation",
    label: "Before generation",
    description: "Goal, sources, audience, and forbidden decisions are defined.",
    required: true,
    owner: "Project owner",
  },
  {
    id: "before-publishing",
    label: "Before publishing",
    description: "Human reviews truthfulness, tone, sources, and risk.",
    required: true,
    owner: "Review lead",
  },
  {
    id: "before-users",
    label: "Before sending to users",
    description: "User impact, escalation path, and support route are checked.",
    required: true,
    owner: "Accountable owner",
  },
  {
    id: "before-automation",
    label: "Before automation",
    description: "Manual run succeeds before any automatic step is enabled.",
    required: true,
    owner: "Ops owner",
  },
  {
    id: "model-tool-changes",
    label: "Before model/tool changes",
    description: "Prompt, model, provider, or tool changes are reviewed.",
    required: true,
    owner: "Technical owner",
  },
];

export const demoBlueprint: BlueprintFile = {
  projectName: "Customer Onboarding Assistant",
  audience: "Customer success team and new customers",
  projectGoal:
    "Streamline customer onboarding with AI-assisted document review and decision support while ensuring human oversight at key risk points.",
  aiAssistance:
    "Extract onboarding data, draft a setup summary, suggest missing documents, and prepare a review checklist.",
  humanControl:
    "Final approval, legal judgment, customer communication, tool changes, and any exception handling.",
  sourceMaterial: "KYC documents, customer emails, product setup forms, policy checklist, support notes.",
  successMeasures: "Cycle time reduction, review quality score, escalation rate, audit findings.",
  scopeIn: "KYC document review, risk triage, decision recommendation, case notes.",
  scopeOut: "Final approval, legal judgment, exceptions policy, direct customer commitments.",
  sensitivity: "internal",
  complexity: "moderate",
  automationLevel: "reviewed",
  teamCapacity: "small-team",
  selectedPattern: "rag-documents",
  ownership: defaultOwnership,
  gates: defaultGates,
  warningResolutions: [],
  alternatives: [],
  nodes: [
    {
      id: "human-input",
      kind: "human",
      title: "Human Input",
      detail: "Collect customer info and documents",
      owner: "Onboarding lead",
      x: 2770,
      y: 1450,
    },
    {
      id: "ai-draft",
      kind: "ai",
      title: "AI Draft",
      detail: "Extract data and create onboarding draft",
      owner: "AI system",
      x: 2770,
      y: 1680,
    },
    {
      id: "review-gate",
      kind: "gate",
      title: "Review Gate",
      detail: "Human review and quality check",
      owner: "Human reviewer",
      x: 2770,
      y: 1910,
    },
    {
      id: "red-team",
      kind: "review",
      title: "Red-Team Check",
      detail: "Adversarial review and risk probing",
      owner: "Risk reviewer",
      x: 3060,
      y: 1690,
    },
    {
      id: "tool-change",
      kind: "gate",
      title: "Tool Change Gate",
      detail: "Approve model, prompt, or parameter changes",
      owner: "Ops owner",
      x: 2500,
      y: 2200,
    },
    {
      id: "publish",
      kind: "output",
      title: "Publish Decision",
      detail: "Approve and move to next systems",
      owner: "Business owner",
      x: 2980,
      y: 2200,
    },
    {
      id: "audit",
      kind: "audit",
      title: "Audit Trail",
      detail: "Log actions, decisions, and artifacts",
      owner: "Compliance",
      x: 2680,
      y: 2480,
    },
    {
      id: "data-boundary",
      kind: "data",
      title: "Data Boundary",
      detail: "Store and transfer with policy controls",
      owner: "Data owner",
      x: 3060,
      y: 2480,
    },
  ],
  edges: [
    { id: "e1", from: "human-input", to: "ai-draft", type: "sequence" },
    { id: "e2", from: "ai-draft", to: "review-gate", type: "sequence" },
    { id: "e3", from: "review-gate", to: "publish", type: "approval", label: "Approved" },
    { id: "e4", from: "review-gate", to: "tool-change", type: "rejection", label: "Needs revision" },
    { id: "e5", from: "ai-draft", to: "red-team", type: "sequence" },
    { id: "e6", from: "red-team", to: "review-gate", type: "feedback", label: "Findings" },
    { id: "e7", from: "publish", to: "audit", type: "sequence" },
    { id: "e8", from: "publish", to: "data-boundary", type: "data" },
    { id: "e9", from: "data-boundary", to: "audit", type: "data" },
    { id: "e10", from: "tool-change", to: "ai-draft", type: "feedback", label: "Approved change" },
    { id: "e11", from: "tool-change", to: "audit", type: "data", label: "Change approval record" },
  ],
};

export const blankBlueprint: BlueprintFile = {
  ...demoBlueprint,
  projectName: "",
  audience: "",
  projectGoal: "",
  aiAssistance: "",
  humanControl: "",
  sourceMaterial: "",
  successMeasures: "",
  scopeIn: "",
  scopeOut: "",
  sensitivity: "internal",
  complexity: "simple",
  automationLevel: "assistive",
  teamCapacity: "solo",
  selectedPattern: "",
  warningResolutions: [],
  alternatives: [],
  nodes: [],
  edges: [],
};

export type WorkflowTemplate = {
  id: string;
  title: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
};

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "hitm-reference",
    title: "HITM reference workflow",
    description: "A complete human-reviewed AI workflow with revision, audit, and data paths.",
    nodes: demoBlueprint.nodes,
    edges: demoBlueprint.edges,
  },
  {
    id: "document-review",
    title: "Document review",
    description: "Source intake, AI summary, citation review, approval, and audit logging.",
    nodes: [
      { id: "doc-source", kind: "data", title: "Approved Documents", detail: "Define source set and data boundary", owner: "Data owner", x: 2500, y: 1450 },
      { id: "doc-request", kind: "human", title: "Review Request", detail: "Human frames question and purpose", owner: "Project owner", x: 2760, y: 1450 },
      { id: "doc-ai-summary", kind: "ai", title: "AI Summary Draft", detail: "Summarize with claims tied to sources", owner: "AI assists", x: 2760, y: 1685 },
      { id: "doc-citation-review", kind: "review", title: "Citation Review", detail: "Check sources, omissions, and unsupported claims", owner: "Reviewer", x: 2760, y: 1920 },
      { id: "doc-approval", kind: "gate", title: "Approval Gate", detail: "Approve or send back for revision", owner: "Review lead", x: 2760, y: 2155 },
      { id: "doc-final", kind: "output", title: "Final Review Note", detail: "Deliver approved summary and next steps", owner: "Business owner", x: 3030, y: 2390 },
      { id: "doc-audit", kind: "audit", title: "Audit Trail", detail: "Log source version, reviewer, decision, and exception", owner: "Compliance", x: 2500, y: 2390 },
    ],
    edges: [
      { id: "doc-e1", from: "doc-source", to: "doc-ai-summary", type: "data", label: "Approved sources" },
      { id: "doc-e2", from: "doc-request", to: "doc-ai-summary", type: "sequence" },
      { id: "doc-e3", from: "doc-ai-summary", to: "doc-citation-review", type: "sequence" },
      { id: "doc-e4", from: "doc-citation-review", to: "doc-approval", type: "sequence" },
      { id: "doc-e5", from: "doc-approval", to: "doc-final", type: "approval", label: "Approved" },
      { id: "doc-e6", from: "doc-approval", to: "doc-ai-summary", type: "rejection", label: "Revise" },
      { id: "doc-e7", from: "doc-final", to: "doc-audit", type: "sequence" },
    ],
  },
  {
    id: "publishing",
    title: "Publishing workflow",
    description: "Draft content, editorial review, publish gate, scheduled release, and audit.",
    nodes: [
      { id: "pub-brief", kind: "human", title: "Editorial Brief", detail: "Define audience, claims, tone, and exclusions", owner: "Editor", x: 2520, y: 1460 },
      { id: "pub-ai-draft", kind: "ai", title: "AI Draft", detail: "Draft article, post, or announcement", owner: "AI assists", x: 2780, y: 1460 },
      { id: "pub-fact-check", kind: "review", title: "Fact Check", detail: "Verify claims, sources, tone, and policy fit", owner: "Reviewer", x: 2780, y: 1700 },
      { id: "pub-risk-gate", kind: "gate", title: "Publish Approval", detail: "Approve before public release", owner: "Publisher", x: 2780, y: 1940 },
      { id: "pub-revision", kind: "decision", title: "Revision Needed?", detail: "Branch by explicit editorial criteria", owner: "Editor", x: 2520, y: 1940 },
      { id: "pub-scheduler", kind: "tool", title: "Publishing Tool", detail: "Schedule only approved content", owner: "Ops owner", x: 3040, y: 2180 },
      { id: "pub-live", kind: "output", title: "Published Output", detail: "Public or stakeholder-facing artifact", owner: "Publisher", x: 3040, y: 2420 },
      { id: "pub-audit", kind: "audit", title: "Publication Log", detail: "Record approvals, sources, and release time", owner: "Compliance", x: 2520, y: 2420 },
    ],
    edges: [
      { id: "pub-e1", from: "pub-brief", to: "pub-ai-draft", type: "sequence" },
      { id: "pub-e2", from: "pub-ai-draft", to: "pub-fact-check", type: "sequence" },
      { id: "pub-e3", from: "pub-fact-check", to: "pub-risk-gate", type: "sequence" },
      { id: "pub-e4", from: "pub-risk-gate", to: "pub-scheduler", type: "approval", label: "Approved" },
      { id: "pub-e5", from: "pub-risk-gate", to: "pub-revision", type: "rejection", label: "Revise" },
      { id: "pub-e6", from: "pub-revision", to: "pub-ai-draft", type: "feedback", label: "Feedback" },
      { id: "pub-e7", from: "pub-scheduler", to: "pub-live", type: "sequence" },
      { id: "pub-e8", from: "pub-live", to: "pub-audit", type: "sequence" },
    ],
  },
  {
    id: "rag-workflow",
    title: "RAG / knowledge workflow",
    description: "Knowledge intake, retrieval, grounded answer drafting, citation review, and final answer gate.",
    nodes: [
      { id: "rag-sources", kind: "data", title: "Knowledge Sources", detail: "Approved documents, policies, or manuals", owner: "Knowledge owner", x: 2470, y: 1450 },
      { id: "rag-question", kind: "human", title: "User Question", detail: "Human asks scoped question with intent", owner: "User or analyst", x: 2750, y: 1450 },
      { id: "rag-retrieval", kind: "tool", title: "Retrieval Step", detail: "Fetch candidate passages and source metadata", owner: "Technical owner", x: 2750, y: 1690 },
      { id: "rag-ai-answer", kind: "ai", title: "Grounded Draft", detail: "Answer only from retrieved source material", owner: "AI assists", x: 2750, y: 1930 },
      { id: "rag-source-review", kind: "review", title: "Source Review", detail: "Check citations, gaps, and unsupported claims", owner: "Review lead", x: 2750, y: 2170 },
      { id: "rag-answer-gate", kind: "gate", title: "Answer Approval", detail: "Human approves final answer or asks for revision", owner: "Accountable owner", x: 3030, y: 2170 },
      { id: "rag-escalate", kind: "escalation", title: "Escalate Uncertainty", detail: "Route insufficient evidence to a human expert", owner: "Subject expert", x: 2470, y: 2410 },
      { id: "rag-output", kind: "output", title: "Approved Answer", detail: "Deliver answer with source notes", owner: "Review lead", x: 3030, y: 2410 },
      { id: "rag-audit", kind: "audit", title: "Answer Log", detail: "Log question, sources, reviewer, and decision", owner: "Compliance", x: 2750, y: 2650 },
    ],
    edges: [
      { id: "rag-e1", from: "rag-sources", to: "rag-retrieval", type: "data", label: "Approved corpus" },
      { id: "rag-e2", from: "rag-question", to: "rag-retrieval", type: "sequence" },
      { id: "rag-e3", from: "rag-retrieval", to: "rag-ai-answer", type: "data", label: "Retrieved context" },
      { id: "rag-e4", from: "rag-ai-answer", to: "rag-source-review", type: "sequence" },
      { id: "rag-e5", from: "rag-source-review", to: "rag-answer-gate", type: "sequence" },
      { id: "rag-e6", from: "rag-answer-gate", to: "rag-output", type: "approval", label: "Approved" },
      { id: "rag-e7", from: "rag-source-review", to: "rag-escalate", type: "escalation", label: "Insufficient evidence" },
      { id: "rag-e8", from: "rag-answer-gate", to: "rag-ai-answer", type: "rejection", label: "Revise" },
      { id: "rag-e9", from: "rag-output", to: "rag-audit", type: "sequence" },
    ],
  },
  {
    id: "agent-workflow",
    title: "Agent workflow",
    description: "Human goal setting, agent planning, tool execution, escalation, approval, and audit.",
    nodes: [
      { id: "agent-goal", kind: "human", title: "Human Goal", detail: "Define goal, permissions, and non-goals", owner: "Project owner", x: 2490, y: 1450 },
      { id: "agent-plan", kind: "ai", title: "Agent Plan", detail: "Draft plan and identify tool actions", owner: "AI assists", x: 2760, y: 1450 },
      { id: "agent-plan-review", kind: "review", title: "Plan Review", detail: "Human checks assumptions and allowed actions", owner: "Workflow lead", x: 2760, y: 1690 },
      { id: "agent-tool", kind: "tool", title: "Tool Action", detail: "Execute only approved low-risk actions", owner: "Ops owner", x: 3030, y: 1930 },
      { id: "agent-escalation", kind: "escalation", title: "Escalation Route", detail: "Stop and ask when risk or ambiguity appears", owner: "Human operator", x: 2490, y: 1930 },
      { id: "agent-approval", kind: "gate", title: "Action Approval", detail: "Approve external action or irreversible change", owner: "Accountable owner", x: 2760, y: 2170 },
      { id: "agent-output", kind: "output", title: "Completed Task", detail: "Return result and human-visible summary", owner: "Project owner", x: 3030, y: 2410 },
      { id: "agent-audit", kind: "audit", title: "Action Log", detail: "Record plan, tool calls, approvals, and outcomes", owner: "Compliance", x: 2760, y: 2650 },
    ],
    edges: [
      { id: "agent-e1", from: "agent-goal", to: "agent-plan", type: "sequence" },
      { id: "agent-e2", from: "agent-plan", to: "agent-plan-review", type: "sequence" },
      { id: "agent-e3", from: "agent-plan-review", to: "agent-tool", type: "approval", label: "Low risk approved" },
      { id: "agent-e4", from: "agent-plan-review", to: "agent-escalation", type: "escalation", label: "Unclear or high risk" },
      { id: "agent-e5", from: "agent-tool", to: "agent-approval", type: "sequence" },
      { id: "agent-e6", from: "agent-approval", to: "agent-output", type: "approval", label: "Approved" },
      { id: "agent-e7", from: "agent-approval", to: "agent-plan", type: "rejection", label: "Revise plan" },
      { id: "agent-e8", from: "agent-output", to: "agent-audit", type: "sequence" },
    ],
  },
  {
    id: "support-triage",
    title: "Support triage",
    description: "Ticket intake, AI classification, human escalation, response approval, and case logging.",
    nodes: [
      { id: "support-ticket", kind: "human", title: "Support Ticket", detail: "Customer or staff submits issue", owner: "Support team", x: 2500, y: 1450 },
      { id: "support-ai-triage", kind: "ai", title: "AI Triage", detail: "Classify issue and draft response options", owner: "AI assists", x: 2760, y: 1450 },
      { id: "support-policy", kind: "data", title: "Support Policy", detail: "Approved help docs and escalation rules", owner: "Support lead", x: 3020, y: 1450 },
      { id: "support-decision", kind: "decision", title: "Safe To Answer?", detail: "Branch by confidence, policy, and customer impact", owner: "Support lead", x: 2760, y: 1690 },
      { id: "support-escalation", kind: "escalation", title: "Escalate Case", detail: "Route billing, legal, safety, or unclear issues", owner: "Senior support", x: 2500, y: 1930 },
      { id: "support-review", kind: "review", title: "Response Review", detail: "Human checks tone, accuracy, and policy fit", owner: "Support reviewer", x: 3020, y: 1930 },
      { id: "support-gate", kind: "gate", title: "Send Approval", detail: "Approve before customer-facing send", owner: "Support lead", x: 3020, y: 2170 },
      { id: "support-output", kind: "output", title: "Customer Response", detail: "Send approved response and next steps", owner: "Support team", x: 3020, y: 2410 },
      { id: "support-audit", kind: "audit", title: "Case Log", detail: "Log classification, owner, approval, and outcome", owner: "Support ops", x: 2760, y: 2650 },
    ],
    edges: [
      { id: "support-e1", from: "support-ticket", to: "support-ai-triage", type: "sequence" },
      { id: "support-e2", from: "support-policy", to: "support-ai-triage", type: "data", label: "Approved policy" },
      { id: "support-e3", from: "support-ai-triage", to: "support-decision", type: "sequence" },
      { id: "support-e4", from: "support-decision", to: "support-review", type: "approval", label: "Safe draft" },
      { id: "support-e5", from: "support-decision", to: "support-escalation", type: "escalation", label: "Needs human" },
      { id: "support-e6", from: "support-review", to: "support-gate", type: "sequence" },
      { id: "support-e7", from: "support-gate", to: "support-output", type: "approval", label: "Approved" },
      { id: "support-e8", from: "support-gate", to: "support-ai-triage", type: "rejection", label: "Revise" },
      { id: "support-e9", from: "support-output", to: "support-audit", type: "sequence" },
    ],
  },
];

type TemplateCopy = {
  title: string;
  description: string;
  nodes: Record<string, Pick<CanvasNode, "title" | "detail" | "owner">>;
  edgeLabels: Record<string, string>;
};

const germanWorkflowTemplateCopy: Record<string, TemplateCopy> = {
  "hitm-reference": {
    title: "HITM-Referenzworkflow",
    description: "Ein vollständiger KI-Workflow mit menschlicher Prüfung, Überarbeitung, Audit und Datenwegen.",
    nodes: {
      "human-input": { title: "Menschliche Eingabe", detail: "Kundeninformationen und Dokumente erfassen", owner: "Onboarding-Verantwortliche:r" },
      "ai-draft": { title: "KI-Entwurf", detail: "Daten extrahieren und Onboarding-Entwurf erstellen", owner: "KI-System" },
      "review-gate": { title: "Prüf-Freigabe", detail: "Menschliche Prüfung und Qualitätskontrolle", owner: "Menschliche prüfende Person" },
      "red-team": { title: "Red-Team-Prüfung", detail: "Kritische Prüfung und Risikoanalyse", owner: "Risiko-Prüfung" },
      "tool-change": { title: "Freigabe für Werkzeugänderung", detail: "Modell-, Prompt- oder Parameteränderungen freigeben", owner: "Betriebsverantwortung" },
      publish: { title: "Veröffentlichungsentscheidung", detail: "Freigeben und an nachgelagerte Systeme übergeben", owner: "Geschäftsverantwortung" },
      audit: { title: "Audit-Trail", detail: "Aktionen, Entscheidungen und Artefakte protokollieren", owner: "Compliance" },
      "data-boundary": { title: "Datengrenze", detail: "Speichern und übertragen mit Richtlinienkontrollen", owner: "Datenverantwortung" },
    },
    edgeLabels: { e3: "Freigegeben", e4: "Überarbeitung erforderlich", e6: "Erkenntnisse", e10: "Freigegebene Änderung", e11: "Änderungsfreigabe protokollieren" },
  },
  "document-review": {
    title: "Dokumentenprüfung",
    description: "Quellenaufnahme, KI-Zusammenfassung, Zitationsprüfung, Freigabe und Audit-Protokollierung.",
    nodes: {
      "doc-source": { title: "Freigegebene Dokumente", detail: "Quellenbestand und Datengrenze festlegen", owner: "Datenverantwortung" },
      "doc-request": { title: "Prüfanfrage", detail: "Menschliche Person formuliert Frage und Zweck", owner: "Projektverantwortung" },
      "doc-ai-summary": { title: "KI-Zusammenfassungsentwurf", detail: "Mit quellengebundenen Aussagen zusammenfassen", owner: "KI unterstützt" },
      "doc-citation-review": { title: "Zitationsprüfung", detail: "Quellen, Auslassungen und unbelegte Aussagen prüfen", owner: "Prüfende Person" },
      "doc-approval": { title: "Freigabepunkt", detail: "Freigeben oder zur Überarbeitung zurückgeben", owner: "Prüfungsverantwortung" },
      "doc-final": { title: "Abschließende Prüfnotiz", detail: "Freigegebene Zusammenfassung und nächste Schritte übergeben", owner: "Geschäftsverantwortung" },
      "doc-audit": { title: "Audit-Trail", detail: "Quellenversion, prüfende Person, Entscheidung und Ausnahme protokollieren", owner: "Compliance" },
    },
    edgeLabels: { "doc-e1": "Freigegebene Quellen", "doc-e5": "Freigegeben", "doc-e6": "Überarbeiten" },
  },
  publishing: {
    title: "Veröffentlichungsworkflow",
    description: "Inhaltsentwurf, redaktionelle Prüfung, Veröffentlichungsfreigabe, geplante Veröffentlichung und Audit.",
    nodes: {
      "pub-brief": { title: "Redaktionelles Briefing", detail: "Zielgruppe, Aussagen, Tonalität und Ausschlüsse festlegen", owner: "Redaktion" },
      "pub-ai-draft": { title: "KI-Entwurf", detail: "Artikel, Beitrag oder Ankündigung entwerfen", owner: "KI unterstützt" },
      "pub-fact-check": { title: "Faktenprüfung", detail: "Aussagen, Quellen, Tonalität und Richtlinienkonformität prüfen", owner: "Prüfende Person" },
      "pub-risk-gate": { title: "Veröffentlichungsfreigabe", detail: "Vor öffentlicher Veröffentlichung freigeben", owner: "Herausgabe" },
      "pub-revision": { title: "Überarbeitung erforderlich?", detail: "Anhand expliziter redaktioneller Kriterien verzweigen", owner: "Redaktion" },
      "pub-scheduler": { title: "Veröffentlichungswerkzeug", detail: "Nur freigegebene Inhalte planen", owner: "Betriebsverantwortung" },
      "pub-live": { title: "Veröffentlichtes Ergebnis", detail: "Öffentliches oder Stakeholder-bezogenes Artefakt", owner: "Herausgabe" },
      "pub-audit": { title: "Veröffentlichungsprotokoll", detail: "Freigaben, Quellen und Veröffentlichungszeitpunkt festhalten", owner: "Compliance" },
    },
    edgeLabels: { "pub-e4": "Freigegeben", "pub-e5": "Überarbeiten", "pub-e6": "Rückmeldung" },
  },
  "rag-workflow": {
    title: "RAG-/Wissensworkflow",
    description: "Wissensaufnahme, Abruf, quellengebundener Antwortentwurf, Zitationsprüfung und finale Antwortfreigabe.",
    nodes: {
      "rag-sources": { title: "Wissensquellen", detail: "Freigegebene Dokumente, Richtlinien oder Handbücher", owner: "Wissensverantwortung" },
      "rag-question": { title: "Nutzerfrage", detail: "Menschliche Person stellt eine eingegrenzte Frage mit Kontext", owner: "Nutzende oder Analyse" },
      "rag-retrieval": { title: "Abrufschritt", detail: "Kandidatenpassagen und Quellenmetadaten abrufen", owner: "Technische Verantwortung" },
      "rag-ai-answer": { title: "Quellengebundener Entwurf", detail: "Nur auf Basis abgerufenen Quellenmaterials antworten", owner: "KI unterstützt" },
      "rag-source-review": { title: "Quellenprüfung", detail: "Zitate, Lücken und unbelegte Aussagen prüfen", owner: "Prüfungsverantwortung" },
      "rag-answer-gate": { title: "Antwortfreigabe", detail: "Menschliche Person gibt die finale Antwort frei oder fordert Überarbeitung an", owner: "Verantwortliche Person" },
      "rag-escalate": { title: "Unsicherheit eskalieren", detail: "Unzureichende Evidenz an eine menschliche Fachperson weiterleiten", owner: "Fachperson" },
      "rag-output": { title: "Freigegebene Antwort", detail: "Antwort mit Quellhinweisen übergeben", owner: "Prüfungsverantwortung" },
      "rag-audit": { title: "Antwortprotokoll", detail: "Frage, Quellen, prüfende Person und Entscheidung protokollieren", owner: "Compliance" },
    },
    edgeLabels: { "rag-e1": "Freigegebener Bestand", "rag-e3": "Abgerufener Kontext", "rag-e6": "Freigegeben", "rag-e7": "Unzureichende Evidenz", "rag-e8": "Überarbeiten" },
  },
  "agent-workflow": {
    title: "Agenten-Workflow",
    description: "Menschliche Zielsetzung, Agentenplanung, Werkzeugausführung, Eskalation, Freigabe und Audit.",
    nodes: {
      "agent-goal": { title: "Menschliches Ziel", detail: "Ziel, Berechtigungen und Nicht-Ziele festlegen", owner: "Projektverantwortung" },
      "agent-plan": { title: "Agentenplan", detail: "Plan entwerfen und Werkzeugaktionen identifizieren", owner: "KI unterstützt" },
      "agent-plan-review": { title: "Planprüfung", detail: "Menschliche Person prüft Annahmen und erlaubte Aktionen", owner: "Workflow-Verantwortung" },
      "agent-tool": { title: "Werkzeugaktion", detail: "Nur freigegebene risikoarme Aktionen ausführen", owner: "Betriebsverantwortung" },
      "agent-escalation": { title: "Eskalationsweg", detail: "Bei Risiko oder Unklarheit anhalten und nachfragen", owner: "Menschliche Bedienperson" },
      "agent-approval": { title: "Aktionsfreigabe", detail: "Externe Aktion oder irreversible Änderung freigeben", owner: "Verantwortliche Person" },
      "agent-output": { title: "Abgeschlossene Aufgabe", detail: "Ergebnis und für Menschen verständliche Zusammenfassung zurückgeben", owner: "Projektverantwortung" },
      "agent-audit": { title: "Aktionsprotokoll", detail: "Plan, Werkzeugaufrufe, Freigaben und Ergebnisse protokollieren", owner: "Compliance" },
    },
    edgeLabels: { "agent-e3": "Niedriges Risiko freigegeben", "agent-e4": "Unklar oder hohes Risiko", "agent-e6": "Freigegeben", "agent-e7": "Plan überarbeiten" },
  },
  "support-triage": {
    title: "Support-Triage",
    description: "Ticketaufnahme, KI-Klassifizierung, menschliche Eskalation, Antwortfreigabe und Fallprotokollierung.",
    nodes: {
      "support-ticket": { title: "Support-Ticket", detail: "Kundschaft oder Mitarbeitende melden ein Anliegen", owner: "Support-Team" },
      "support-ai-triage": { title: "KI-Triage", detail: "Anliegen klassifizieren und Antwortoptionen entwerfen", owner: "KI unterstützt" },
      "support-policy": { title: "Support-Richtlinie", detail: "Freigegebene Hilfedokumente und Eskalationsregeln", owner: "Support-Verantwortung" },
      "support-decision": { title: "Sicher zu beantworten?", detail: "Nach Zuversicht, Richtlinie und Kundenauswirkung verzweigen", owner: "Support-Verantwortung" },
      "support-escalation": { title: "Fall eskalieren", detail: "Abrechnungs-, Rechts-, Sicherheits- oder unklare Fälle weiterleiten", owner: "Erfahrener Support" },
      "support-review": { title: "Antwortprüfung", detail: "Menschliche Person prüft Tonalität, Genauigkeit und Richtlinienkonformität", owner: "Support-Prüfung" },
      "support-gate": { title: "Versandfreigabe", detail: "Vor kundenseitigem Versand freigeben", owner: "Support-Verantwortung" },
      "support-output": { title: "Kundenantwort", detail: "Freigegebene Antwort und nächste Schritte senden", owner: "Support-Team" },
      "support-audit": { title: "Fallprotokoll", detail: "Klassifizierung, Verantwortung, Freigabe und Ergebnis protokollieren", owner: "Support-Betrieb" },
    },
    edgeLabels: { "support-e2": "Freigegebene Richtlinie", "support-e4": "Sicherer Entwurf", "support-e5": "Menschliche Prüfung nötig", "support-e7": "Freigegeben", "support-e8": "Überarbeiten" },
  },
};

export function getWorkflowTemplates(locale: Locale = "en"): WorkflowTemplate[] {
  if (locale !== "de") return workflowTemplates;

  return workflowTemplates.map((template) => {
    const copy = germanWorkflowTemplateCopy[template.id];
    if (!copy) return template;

    return {
      ...template,
      title: copy.title,
      description: copy.description,
      nodes: template.nodes.map((node) => ({ ...node, ...copy.nodes[node.id] })),
      edges: template.edges.map((edge) => ({ ...edge, label: copy.edgeLabels[edge.id] ?? edge.label })),
    };
  });
}

export const commandIcons = {
  demo: PlayCircle,
  reset: RefreshCw,
  export: FileJson,
  print: FileCheck2,
  prompt: PenLine,
  sparkle: Sparkles,
};
