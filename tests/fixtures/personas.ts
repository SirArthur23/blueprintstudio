import { createBlankBlueprint, generateDraftWorkflow } from "@/lib/blueprint-engine";
import type { BlueprintFile } from "@/lib/blueprint-data";

// Fictional scenarios for scripted persona simulations, not interview findings.
export const personaScenarios = [
  { id: "team-lead", goal: "Schulungsunterlagen für ein fünfköpfiges Team prüfen und freigeben.", sources: "Freigegebene interne Schulungsdokumente.", sensitivity: "internal", complexity: "simple", automationLevel: "assistive", teamCapacity: "small-team", pattern: "team-workflow" },
  { id: "consultant", goal: "Für einen Beratungsauftrag Optionen zur vertraulichen Dokumentenprüfung vergleichen.", sources: "Beschreibungen vertraulicher Kundenunterlagen; keine Originaldatensätze.", sensitivity: "sensitive", complexity: "moderate", automationLevel: "reviewed", teamCapacity: "solo", pattern: "local-first" },
  { id: "educator", goal: "In einer Übung mit erfundenen Dokumenten menschliche Freigabe demonstrieren.", sources: "Öffentliche fiktive Beispieldokumente für einen Workshop.", sensitivity: "public", complexity: "simple", automationLevel: "assistive", teamCapacity: "small-team", pattern: "canvas-knowledge" },
  { id: "product-builder", goal: "Einen mehrstufigen Wissensassistenten vor der technischen Umsetzung planen.", sources: "Interne Richtlinien, Versionsstände und freigegebene Wissensquellen.", sensitivity: "internal", complexity: "complex", automationLevel: "automated", teamCapacity: "technical-team", pattern: "rag-documents" },
  { id: "privacy-lead", goal: "Datenzugriff, Freigaben und Audit für die Onboarding-Planung festlegen.", sources: "Beschreibungen sensibler Datenfelder und erfundene Onboarding-Beispiele.", sensitivity: "sensitive", complexity: "complex", automationLevel: "reviewed", teamCapacity: "small-team", pattern: "local-first" },
] as const;

export function personaBlueprint(scenario: (typeof personaScenarios)[number]): BlueprintFile {
  const blueprint = createBlankBlueprint();
  Object.assign(blueprint, {
    projectName: `Simulation: ${scenario.id}`, audience: "Fiktives Projektteam", projectGoal: scenario.goal,
    sourceMaterial: scenario.sources, aiAssistance: "Einen quellengebundenen Entwurf mit gekennzeichneten Annahmen erstellen.",
    humanControl: "Quellenauswahl, finale Entscheidungen, Freigaben, Ausnahmen und Änderungen bleiben bei Menschen.",
    successMeasures: "Vollständige Verantwortungszuordnung und nachvollziehbare Freigaben.", scopeIn: "Entwurf, Prüfung und freigegebene Übergabe.", scopeOut: "Autonome finale Entscheidungen und unfreigegebene Datennutzung.",
    sensitivity: scenario.sensitivity, complexity: scenario.complexity, automationLevel: scenario.automationLevel, teamCapacity: scenario.teamCapacity, selectedPattern: scenario.pattern,
  });
  blueprint.ownership = blueprint.ownership.map((item) => ({ ...item, humanOwner: item.id === "data" ? "Datenverantwortliche Person" : item.id === "review" ? "Prüfende Teamleitung" : "Projektleitung" }));
  Object.assign(blueprint, generateDraftWorkflow(blueprint, "de"));
  return blueprint;
}
