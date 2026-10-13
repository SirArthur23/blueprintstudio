import { createBlankBlueprint, generateDraftWorkflow } from "@/lib/blueprint-engine";
import type { Locale } from "@/lib/i18n";

// Only invented source descriptions; never a captured user's saved project.
export function manualExample(locale: Locale) {
  const en = locale === "en";
  const blueprint = createBlankBlueprint();
  Object.assign(blueprint, {
    projectName: en ? "Fictional team-training review" : "Erfundene Schulungsprüfung",
    audience: en ? "Five fictional colleagues" : "Fünf erfundene Teammitglieder",
    projectGoal: en ? "Summarize approved training documents for a small team, with human review before sharing." : "Freigegebene Schulungsunterlagen für ein kleines Team zusammenfassen und vor der Weitergabe menschlich prüfen.",
    sourceMaterial: en ? "Invented, approved training documents. No personal records or real source files." : "Erfundene, freigegebene Schulungsunterlagen. Keine personenbezogenen Daten oder echten Quelldateien.",
    aiAssistance: en ? "Draft a summary tied to approved sources; mark assumptions and missing context." : "Einen quellengebundenen Entwurf erstellen; Annahmen und fehlenden Kontext kennzeichnen.",
    humanControl: en ? "Source selection, final decisions, approval, exceptions and changes stay with humans." : "Quellenauswahl, finale Entscheidungen, Freigaben, Ausnahmen und Änderungen bleiben bei Menschen.",
    successMeasures: en ? "Named human owners, traceable review and a usable training summary." : "Benannte menschliche Verantwortung, nachvollziehbare Prüfung und nutzbare Schulungszusammenfassung.",
    scopeIn: en ? "Draft, human review and approved handoff." : "Entwurf, menschliche Prüfung und freigegebene Übergabe.",
    scopeOut: en ? "Autonomous decisions and unapproved data use." : "Autonome Entscheidungen und nicht freigegebene Datennutzung.",
    sensitivity: "internal", complexity: "simple", automationLevel: "assistive", teamCapacity: "small-team", selectedPattern: "team-workflow",
  });
  blueprint.ownership = blueprint.ownership.map((item) => ({ ...item, humanOwner: item.id === "data" ? (en ? "Training data steward" : "Schulungsdaten-Verantwortung") : (en ? "Team facilitator" : "Teammoderation") }));
  Object.assign(blueprint, generateDraftWorkflow(blueprint, locale));
  return blueprint;
}
