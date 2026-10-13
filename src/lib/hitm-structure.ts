import type { BlueprintFile, CanvasNode } from "@/lib/blueprint-data";
import type { HitmWarning } from "@/lib/blueprint-engine";
import type { Locale } from "@/lib/i18n";

export function isAiOwner(owner: string) {
  const label = owner.trim();
  return /^(?:ai|ki|a\.?i\.?|künstliche intelligenz|artificial intelligence)$/i.test(label)
    || /^(?:ai|ki)[\s\-:/]+(?:system|assistant|assistent|assistenz|agent|assists|model|modell|unterstützt|bot)\b/i.test(label)
    || /^(?:chatgpt|claude|llm|bot|gpt-?\d+)(?:$|[\-:/])/i.test(label);
}

export function isHumanOwner(owner: string) {
  return !!owner.trim() && !isAiOwner(owner) && !/^(?:none|n\/a|tbd|unassigned|unknown|keine?r?|offen|unbekannt|nicht zugeordnet|[-—?]+)$/i.test(owner.trim());
}

export function isHumanControl(node: CanvasNode | undefined) {
  return !!node && ["review", "gate", "decision", "escalation"].includes(node.kind) && isHumanOwner(node.owner);
}

// Traversal is bounded by visited IDs and works for branches and cycles.
function reachable(blueprint: BlueprintFile, from: string, predicate: (node: CanvasNode) => boolean, reverse = false, forwardOnly = false) {
  const queue = [from];
  const visited = new Set<string>();
  while (queue.length) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const node = blueprint.nodes.find((item) => item.id === id);
    if (node && predicate(node)) return true;
    for (const edge of blueprint.edges) {
      if (forwardOnly && ["feedback", "rejection"].includes(edge.type)) continue;
      if (reverse ? edge.to === id : edge.from === id) queue.push(reverse ? edge.from : edge.to);
    }
  }
  return false;
}

function hasUngatedEntryPath(blueprint: BlueprintFile, target: string) {
  const queue = [target];
  const visited = new Set<string>();
  while (queue.length) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const node = blueprint.nodes.find((item) => item.id === id);
    if (node?.kind === "gate" && isHumanOwner(node.owner)) continue;
    const incoming = blueprint.edges.filter((edge) => edge.to === id && !["feedback", "rejection"].includes(edge.type));
    if (!incoming.length) return true;
    queue.push(...incoming.map((edge) => edge.from));
  }
  return false;
}

export function additionalHitmChecks(blueprint: BlueprintFile, locale: Locale): Array<Omit<HitmWarning, "status" | "note">> {
  const warnings: Array<Omit<HitmWarning, "status" | "note">> = [];
  const de = locale === "de";
  const add = (id: string, nodes: string[], en: [string, string, string, string], german: [string, string, string, string], severity: HitmWarning["severity"] = "high") => {
    const [title, trigger, missingControl, recommendation] = de ? german : en;
    warnings.push({ id, title, trigger, missingControl, recommendation, severity, relatedNodeIds: nodes, relatedEdgeIds: blueprint.edges.filter((edge) => nodes.includes(edge.from) && nodes.includes(edge.to)).map((edge) => edge.id) });
  };
  const highRisk = blueprint.sensitivity === "sensitive" || blueprint.automationLevel === "automated" || blueprint.complexity === "complex";
  const terminal = (node: CanvasNode) => ["output", "audit", "escalation"].includes(node.kind) || node.explicitStop === true;

  for (const item of blueprint.ownership) {
    if (item.id === "decisions" && isAiOwner(item.humanOwner)) add(`ai-final-owner-${item.id}`, [],
      ["Final decisions are assigned to AI", `The final-decision owner is ${item.humanOwner}.`, "A human must be accountable for final decisions.", "Assign a human decision owner in the ownership matrix."],
      ["Finale Entscheidungen sind der KI zugeordnet", `Die Verantwortung für finale Entscheidungen liegt bei ${item.humanOwner}.`, "Für finale Entscheidungen muss ein Mensch verantwortlich sein.", "Ordnen Sie in der Matrix eine menschliche Entscheidungsverantwortung zu."]);
    else if (!isHumanOwner(item.humanOwner)) add(`matrix-owner-${item.id}`, [],
      ["Ownership area has no accountable human", `${item.area} is assigned to ${item.humanOwner || "nobody"}.`, "Each ownership area requires a human person or role.", "Assign a human owner in the matrix."],
      ["Verantwortungsbereich hat keine menschliche Zuordnung", `${item.area} ist ${item.humanOwner || "niemandem"} zugeordnet.`, "Jeder Verantwortungsbereich benötigt eine menschliche Person oder Rolle.", "Ordnen Sie in der Matrix eine menschliche Verantwortung zu."]);
  }
  for (const node of blueprint.nodes) {
    if (node.kind === "tool" && !reachable(blueprint, node.id, (item) => item.kind === "gate" && isHumanOwner(item.owner) && /change|änder/i.test(`${item.title} ${item.detail}`) && /model|tool|prompt|provider|modell|werkzeug/i.test(`${item.title} ${item.detail}`), true)) add(`tool-change-path-${node.id}`, [node.id],
      ["Tool changes have no approval point on this path", `${node.title} has no reachable upstream human-owned model/tool-change gate.`, "A required list entry alone does not place change approval in the workflow.", "Connect an explicit model/tool-change approval gate before this tool."],
      ["Werkzeugänderungen haben auf diesem Pfad keinen Freigabepunkt", `${node.title} hat keinen erreichbaren vorgeschalteten menschlichen Freigabepunkt für Modell-/Werkzeugänderungen.`, "Ein erforderlicher Listeneintrag platziert die Änderungsfreigabe noch nicht im Workflow.", "Verbinden Sie vor diesem Werkzeug einen ausdrücklichen Freigabepunkt für Modell-/Werkzeugänderungen."]);
    if (["decision", "gate", "output"].includes(node.kind) && isAiOwner(node.owner)) add(`ai-final-node-${node.id}`, [node.id],
      ["AI owns a consequential decision or release", `${node.title} is owned by ${node.owner}.`, "An AI-owned node cannot provide human approval.", "Assign an accountable human to the node."],
      ["KI verantwortet eine folgenreiche Entscheidung oder Freigabe", `${node.title} wird von ${node.owner} verantwortet.`, "Ein KI-verantworteter Knoten bietet keine menschliche Freigabe.", "Ordnen Sie dem Knoten eine verantwortliche Person zu."]);
    if ((node.kind !== "ai" || node.explicitStop) && !isHumanOwner(node.owner)) add(`missing-human-owner-${node.id}`, [node.id],
      ["Step has no accountable human owner", `${node.title} has no usable human owner.`, "The step needs an accountable person or human role.", "Enter a human owner in the inspector."],
      ["Schritt hat keine menschliche Verantwortung", `${node.title} hat keine nutzbare menschliche Verantwortungszuordnung.`, "Der Schritt benötigt eine verantwortliche Person oder menschliche Rolle.", "Tragen Sie im Inspektor eine menschliche Verantwortung ein."]);
    if (blueprint.sensitivity === "sensitive" && ["ai", "tool"].includes(node.kind) && reachable(blueprint, node.id, (item) => item.kind === "data", true) && node.dataApproval !== "approved") add(`sensitive-tool-${node.id}`, [node.id],
      ["Sensitive data reaches an unapproved AI step or tool", `${node.title} receives data from a source path; its data-use approval is ${node.dataApproval ?? "unreviewed"}.`, "A human must explicitly approve this data boundary.", "Review the permitted data, tool, and human owner, then record approval in the inspector, or remove the data path."],
      ["Sensible Daten erreichen einen nicht freigegebenen KI-Schritt oder ein Werkzeug", `${node.title} erhält Daten über einen Quellenpfad; die Datennutzung ist ${node.dataApproval === "rejected" ? "abgelehnt" : "ungeprüft"}.`, "Ein Mensch muss diese Datengrenze ausdrücklich freigeben.", "Prüfen Sie erlaubte Daten, Werkzeug und Verantwortung. Dokumentieren Sie die Freigabe im Inspektor oder entfernen Sie den Datenpfad."]);
    if (blueprint.automationLevel === "automated" && ["tool", "output"].includes(node.kind) && (!reachable(blueprint, node.id, (item) => item.kind === "gate" && isHumanOwner(item.owner), true, true) || hasUngatedEntryPath(blueprint, node.id))) add(`automation-gate-${node.id}`, [node.id],
      ["Automated action lacks a human gate on its path", `${node.title} has no upstream human-owned approval gate.`, "A gate elsewhere in the map does not govern this action.", "Place a human-owned approval gate before this action."],
      ["Automatisierter Aktion fehlt ein menschlicher Freigabepunkt auf ihrem Pfad", `${node.title} hat keinen vorgeschalteten menschlich verantworteten Freigabepunkt.`, "Eine Freigabe an anderer Stelle steuert diese Aktion nicht.", "Platzieren Sie vor dieser Aktion einen menschlich verantworteten Freigabepunkt."]);
    if (highRisk && ["ai", "decision", "tool"].includes(node.kind) && !reachable(blueprint, node.id, (item) => item.kind === "escalation" && isHumanOwner(item.owner), false, true)) add(`risk-escalation-${node.id}`, [node.id],
      ["High-risk path has no human escalation route", `${node.title} cannot reach a human-owned escalation step on its forward path.`, "Risk or uncertainty needs a reachable human fallback.", "Connect an escalation route to this path and assign a human owner."],
      ["Risikoreicher Pfad hat keinen menschlichen Eskalationsweg", `${node.title} erreicht auf seinem Vorwärtspfad keinen menschlich verantworteten Eskalationsschritt.`, "Risiko oder Unsicherheit benötigt einen erreichbaren menschlichen Ausweichweg.", "Verbinden Sie diesen Pfad mit einer Eskalation und ordnen Sie eine Person zu."]);
    if (["decision", "gate"].includes(node.kind) && !reachable(blueprint, node.id, (item) => item.kind === "audit" && isHumanOwner(item.owner), false, true)) add(`decision-audit-${node.id}`, [node.id],
      ["Decision has no audit event on its path", `${node.title} cannot reach a human-owned audit event without following a revision loop.`, "Consequential decisions need recorded evidence.", "Connect an audit event after the decision or its approved output."],
      ["Entscheidung hat kein Audit-Ereignis auf ihrem Pfad", `${node.title} erreicht ohne Überarbeitungsschleife kein menschlich verantwortetes Audit-Ereignis.`, "Folgenreiche Entscheidungen benötigen dokumentierte Belege.", "Verbinden Sie ein Audit-Ereignis mit der Entscheidung oder dem freigegebenen Ergebnis."], "medium");
    if (!terminal(node) && !blueprint.edges.some((edge) => edge.from === node.id)) add(`branch-end-${node.id}`, [node.id],
      ["Branch ends without a handoff or explicit stop", `${node.title} has no outgoing connection and is not an output, audit, escalation, or explicit stop.`, "The end of this branch is ambiguous.", "Connect an output/handoff or mark an intentional stop in the inspector."],
      ["Zweig endet ohne Übergabe oder ausdrücklichen Stopp", `${node.title} hat keine ausgehende Verbindung und ist weder Ergebnis, Audit, Eskalation noch ausdrücklicher Stopp.`, "Das Ende dieses Zweigs ist unklar.", "Verbinden Sie ein Ergebnis oder markieren Sie einen beabsichtigten Stopp im Inspektor."], "medium");
    if (["human", "ai"].includes(node.kind) && !reachable(blueprint, node.id, terminal)) add(`branch-no-exit-${node.id}`, [node.id],
      ["Workflow path has no completion", `${node.title} cannot reach an output, audit, escalation, or explicit stop, even through its loops.`, "The path has no defined completion.", "Add a reachable handoff or intentional stopping point."],
      ["Workflow-Pfad hat keinen Abschluss", `${node.title} erreicht auch über Schleifen weder Ergebnis, Audit, Eskalation noch ausdrücklichen Stopp.`, "Der Pfad hat keinen definierten Abschluss.", "Fügen Sie eine erreichbare Übergabe oder einen beabsichtigten Stopp hinzu."], "medium");
  }
  // Use weak components for separate sub-flows; data paths count as connections.
  const remaining = new Set(blueprint.nodes.map((node) => node.id));
  const components: string[][] = [];
  while (remaining.size) {
    const queue = [remaining.values().next().value!];
    const component: string[] = [];
    while (queue.length) {
      const id = queue.shift()!;
      if (!remaining.delete(id)) continue;
      component.push(id);
      for (const edge of blueprint.edges) {
        if (edge.from === id) queue.push(edge.to);
        if (edge.to === id) queue.push(edge.from);
      }
    }
    components.push(component.sort());
  }
  components.sort((a, b) => b.length - a.length || a[0].localeCompare(b[0]));
  for (const component of components.slice(1)) add(`disconnected-${component[0]}`, component,
    ["Sub-flow is disconnected from the main workflow", `Separate component: ${component.map((id) => blueprint.nodes.find((node) => node.id === id)?.title).join(", ")}.`, "Its relationship to the main process is not defined.", "Connect the sub-flow or document why it is intentionally separate."],
    ["Teilablauf ist vom Hauptworkflow getrennt", `Separater Teil: ${component.map((id) => blueprint.nodes.find((node) => node.id === id)?.title).join(", ")}.`, "Die Beziehung zum Hauptprozess ist nicht definiert.", "Verbinden Sie den Teilablauf oder dokumentieren Sie die beabsichtigte Trennung."], "medium");
  return warnings;
}
