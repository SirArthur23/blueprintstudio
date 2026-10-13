import { defaultGates, defaultOwnership, demoBlueprint, getWorkflowTemplates, type BlueprintFile } from "@/lib/blueprint-data";
import type { Locale } from "@/lib/i18n";
import type { PromptPackItem } from "@/lib/blueprint-engine";

const roles: Record<string, string> = {
  "Project owner": "Projektverantwortung", "Workflow lead": "Workflow-Verantwortung", "Data owner": "Datenverantwortung", "Review lead": "Prüfungsverantwortung", "Ops owner": "Betriebsverantwortung", "Accountable decision-maker": "Verantwortliche Entscheidungsperson", "Accountable owner": "Verantwortliche Person", "Technical owner": "Technische Verantwortung", "Human owner": "Menschliche Verantwortung", "Human reviewer": "Menschlich prüfende Person", "Reviewer": "Prüfende Person", "Risk reviewer": "Risikoprüfung", "Business owner": "Geschäftsverantwortung", "Onboarding lead": "Onboarding-Verantwortung", "AI system": "KI-System", "AI assists": "KI unterstützt", "Compliance": "Compliance",
};
export function localizeDefaultRole(value: string, locale: Locale) { return locale === "de" ? roles[value] ?? value : value; }

const generatedTitles: Record<string, string> = {
  "Human Context Intake": "Menschliche Kontextaufnahme", "Approved Source Material": "Freigegebenes Quellenmaterial", "AI Assistance Draft": "Entwurf mit KI-Unterstützung", "Human Review": "Menschliche Prüfung", "Approval Gate": "Freigabepunkt", "Decision Criteria": "Entscheidungskriterien", "Approved Output": "Freigegebenes Ergebnis", "Audit Trail": "Audit-Trail", "Escalation Route": "Eskalationsweg", "Model / Tool Change Gate": "Freigabe für Modell-/Werkzeugänderungen",
};
const generatedDetails: Record<string, string> = {
  "Define goal, audience, source boundaries, and non-goals": "Ziel, Zielgruppe, Quellengrenzen und Nicht-Ziele festlegen",
  "Name approved data, documents, policies, and forbidden sources": "Freigegebene Daten, Dokumente, Richtlinien und verbotene Quellen benennen",
  "Draft, classify, summarize, or suggest without final authority": "Ohne finale Autorität entwerfen, klassifizieren, zusammenfassen oder vorschlagen",
  "Check sources, assumptions, scope, risks, and unsupported claims": "Quellen, Annahmen, Umfang, Risiken und unbelegte Aussagen prüfen",
  "Human signs off final decision, release, exception, and changes": "Menschen geben finale Entscheidung, Veröffentlichung, Ausnahme und Änderungen frei",
  "Do not choose silently: branch using explicit human-owned criteria": "Nicht stillschweigend entscheiden: anhand expliziter, menschlich verantworteter Kriterien verzweigen",
  "Use only after approval; include limitations and next steps": "Nur nach Freigabe verwenden; Grenzen und nächste Schritte enthalten",
  "Log sources, reviewer, decision, exception, and prompt/model changes": "Quellen, prüfende Person, Entscheidung, Ausnahme sowie Prompt-/Modelländerungen protokollieren",
  "Stop and route ambiguity, high impact, sensitive data, or unsupported claims": "Unklarheit, hohe Auswirkungen, sensible Daten oder unbelegte Aussagen anhalten und weiterleiten",
  "Approve model, prompt, provider, retrieval, or automation changes before use": "Modell-, Prompt-, Anbieter-, Abruf- oder Automatisierungsänderungen vor der Nutzung freigeben",
};
const generatedLabels: Record<string, string> = { "Approved": "Freigegeben", "Approved context": "Freigegebener Kontext", "Meets criteria": "Kriterien erfüllt", "Revise": "Überarbeiten", "Unclear or risky": "Unklar oder riskant", "Change needed": "Änderung erforderlich", "Approved change": "Freigegebene Änderung", "Log change approval": "Änderungsfreigabe protokollieren" };

// Translate known app-supplied defaults in output projections only. Custom text
// and the stored editable project are never rewritten on a language switch.
export function blueprintForOutput(blueprint: BlueprintFile, locale: Locale): BlueprintFile {
  if (locale !== "de") return blueprint;
  const areas = ["Ziel", "Prompts", "Daten", "Prüfprozess", "Bereitstellung", "Finale Entscheidungen"];
  const aiRoles = ["Präzisierungen vorschlagen und Annahmen klären", "Prompt-Varianten entwerfen", "Erlaubtes Material klassifizieren und zusammenfassen", "Lücken, Risiken und Widersprüche markieren", "Checklisten entwerfen", "Strukturierte Optionen bereitstellen"];
  const approvals = ["Mensch legt das finale Ziel fest", "Mensch gibt Prompt-Änderungen frei", "Mensch gibt die Datengrenze frei", "Mensch gibt Ergebnisse frei", "Mensch gibt die Veröffentlichung frei", "KI verantwortet niemals die finale Entscheidung"];
  const gates = [
    ["Vor der Generierung", "Ziel, Quellen, Zielgruppe und verbotene Entscheidungen sind definiert."],
    ["Vor der Veröffentlichung", "Ein Mensch prüft Wahrheitsgehalt, Ton, Quellen und Risiko."],
    ["Vor der Weitergabe an Nutzende", "Auswirkungen, Eskalationsweg und Unterstützung werden geprüft."],
    ["Vor der Automatisierung", "Ein manueller Durchlauf gelingt, bevor automatische Schritte aktiviert werden."],
    ["Vor Modell-/Werkzeugänderungen", "Prompt-, Modell-, Anbieter- und Werkzeugänderungen werden geprüft."],
  ];
  const templatePairs = getWorkflowTemplates("en").flatMap((template) => {
    const translated = getWorkflowTemplates("de").find((item) => item.id === template.id)!;
    return template.nodes.map((node, index) => ({ en: node, de: translated.nodes[index] }));
  });
  return {
    ...blueprint,
    ownership: blueprint.ownership.map((item) => {
      const index = defaultOwnership.findIndex((base) => base.id === item.id);
      const base = defaultOwnership[index];
      return { ...item, humanOwner: localizeDefaultRole(item.humanOwner, locale), area: base?.area === item.area ? areas[index] : item.area, aiRole: base?.aiRole === item.aiRole ? aiRoles[index] : item.aiRole, approval: base?.approval === item.approval ? approvals[index] : item.approval };
    }),
    gates: blueprint.gates.map((item) => {
      const index = defaultGates.findIndex((base) => base.id === item.id);
      const base = defaultGates[index];
      return { ...item, owner: localizeDefaultRole(item.owner, locale), label: base?.label === item.label ? gates[index][0] : item.label, description: base?.description === item.description ? gates[index][1] : item.description };
    }),
    nodes: blueprint.nodes.map((node) => {
      const pair = templatePairs.find((pair) => pair.en.id === node.id && pair.en.kind === node.kind);
      let detail = pair?.en.detail === node.detail ? pair.de.detail : node.id.startsWith("generated-") ? generatedDetails[node.detail] ?? node.detail : node.detail;
      if (node.id.startsWith("generated-")) {
        for (const key of Object.keys(germanDemoIntake) as Array<keyof BlueprintFile>) {
          const original = demoBlueprint[key];
          const translated = germanDemoIntake[key];
          if (typeof original === "string" && typeof translated === "string") {
            const short = (value: string) => value.length > 86 ? `${value.slice(0, 83)}...` : value;
            if (node.detail === short(original)) detail = short(translated);
          }
        }
      }
      return { ...node, owner: pair?.en.owner === node.owner ? pair.de.owner : localizeDefaultRole(node.owner, locale), title: pair?.en.title === node.title ? pair.de.title : node.id.startsWith("generated-") ? generatedTitles[node.title] ?? node.title : node.title, detail };
    }),
    edges: blueprint.edges.map((edge) => {
      const template = getWorkflowTemplates("en").find((template) => template.edges.some((item) => item.id === edge.id && item.label === edge.label));
      const translated = template && getWorkflowTemplates("de").find((item) => item.id === template.id)?.edges.find((item) => item.id === edge.id);
      return { ...edge, label: translated?.label ?? (edge.id.startsWith("generated-") && edge.label ? generatedLabels[edge.label] ?? edge.label : edge.label) };
    }),
  };
}

export function germanPromptItems(context: {
  project: string; audience: string; control: string; sources: string; gates: string; ownership: string; workflow: string;
  warnings: { open: string; exceptions: string }; projectOwner: string; reviewOwner: string; dataOwner: string; decisionOwner: string;
}): Array<Omit<PromptPackItem, "checks">> {
  const c = context;
  const boundary = "Die KI darf keine finalen Entscheidungen treffen, Ergebnisse freigeben oder Freigabepunkte umgehen. Menschliche Verantwortung bleibt bestehen. Bei Unsicherheit stoppen und an eine verantwortliche Person eskalieren.";
  const meta: Array<[string, string, string, string, string, string[], string, string]> = [
    ["role-definition", "Rollenbeschreibung", "Die begrenzte Rolle der Assistenz vor Arbeitsbeginn festlegen.", c.projectOwner, "Zu Beginn eines Projekts, Gesprächs oder wiederverwendbaren Workflows.", ["Projektaufnahme", "Zielgruppe", "Menschliche Kontrollgrenze", "Verantwortungsmatrix"], "Eine klar begrenzte Assistenzrolle.", `Sie unterstützen ${c.project} für ${c.audience}. Sie dürfen entwerfen, ordnen, prüfen, zusammenfassen, Rückfragen stellen und Optionen vorschlagen. Menschen kontrollieren ${c.control}. Verantwortungsmatrix: ${c.ownership}. Verwenden Sie nur freigegebenen Kontext oder kennzeichnen Sie Annahmen.`],
    ["context-gathering", "Kontextaufnahme", "Fehlenden Kontext vor Vorschlägen oder Umsetzung sammeln.", c.projectOwner, "Vor Workflow-, Architektur-, Inhalts- oder Umsetzungsentwürfen.", ["Projektaufnahme", "Quellenmaterial", "Projektumfang", "Governance-Freigaben"], "Eine kurze Liste konkreter Rückfragen.", `Klären Sie vor Lösungsvorschlägen für ${c.project} Ziel, Zielgruppe, Umfang, Quellengrenzen, Datensensibilität, Erfolgsmaßstäbe, menschliche Verantwortung, Prüfverantwortung, Freigaben und Eskalationswege. Freigegebene Quellen: ${c.sources}. Erforderliche Freigaben: ${c.gates}. Behandeln Sie offene Governance-Entscheidungen als offen.`],
    ["review-criteria", "Prüfkriterien", "KI-unterstützte Ergebnisse an HITM-Kontrollen messen.", c.reviewOwner, "Vor Freigabe, Veröffentlichung, Auswirkungen auf Nutzende oder operativem Einsatz.", ["Workflow", "Freigaben", "Quellenmaterial", "Offene Prüfhinweise"], "Eine strukturierte Prüfliste mit menschlichen Aufgaben.", `Prüfen Sie ein Ergebnis für ${c.project}: menschliche Kontrollgrenze (${c.control}), freigegebene Quellen (${c.sources}), unbelegte Aussagen, Annahmen und Projektumfang. Workflow: ${c.workflow}. Freigaben: ${c.gates}. Offene Hinweise: ${c.warnings.open}. Dokumentieren Sie Ausnahmen und benennen Sie, was ein Mensch vor Nutzung freigeben muss.`],
    ["critique", "Kritische Prüfung", "Schwächen erkennen, bevor der Workflow umgesetzt wird.", c.reviewOwner, "Nach einem ersten Workflow-, Prompt- oder Architekturentwurf.", ["Verantwortungsmatrix", "Workflow", "Freigaben", "Hinweisstatus"], "Priorisierte Kritik mit konkreten Verbesserungen.", `Kritisieren Sie den Workflow für ${c.project}. Suchen Sie unklare Verantwortung, schwache Freigaben, versteckte Automatisierung, fehlende Datengrenzen, fehlende Audit-Ereignisse, unbelegte Aussagen und nicht verantwortete Ausnahmen. Verantwortung: ${c.ownership}. Workflow: ${c.workflow}. Ausnahmen: ${c.warnings.exceptions}. Benennen Sie für jede Verbesserung die zuständige menschliche Verantwortung und nötige Freigabe.`],
    ["red-team", "Red-Team-Prüfung", "Risiken, Missbrauch und unbegründetes Vertrauen untersuchen.", c.reviewOwner, "Vor Freigabe, Start oder Erweiterung der Automatisierung.", ["Risikoeinstellungen", "Workflow", "Offene Hinweise", "Ausnahmen"], "Fehlerszenarien und menschlich verantwortete Gegenmaßnahmen.", `Prüfen Sie ${c.project} auf Missbrauch, Datenschutzrisiken, Automatisierungsfehler, Quellenprobleme, unklare Übergaben, Prompt-Injection und ungeprüftes Vertrauen in KI-Ergebnisse. Workflow: ${c.workflow}. Hinweise: ${c.warnings.open}. Ausnahmen: ${c.warnings.exceptions}. Ordnen Sie jedem Risiko eine fehlende Kontrolle und eine Person zu, die Gegenmaßnahmen freigeben muss.`],
    ["escalation", "Eskalation", "Unsicherheit und folgenreiche Aktionen an Menschen weiterleiten.", c.reviewOwner, "Bei fehlenden Belegen, Befugnissen oder Regeln.", ["Menschliche Kontrollgrenze", "Eskalationsweg", "Sensibilität", "Prüfhinweise"], "Eine klare Anweisung zum Stoppen und Weiterleiten.", `Für ${c.project}: Stoppen und eskalieren Sie bei fehlenden Belegen, widersprüchlichen Quellen, Überschreitung des Umfangs, sensiblen Daten, möglichen Auswirkungen auf Nutzende oder Modell-/Werkzeug-/Prompt-Änderungen. Grenze: ${c.control}. Datenverantwortung: ${c.dataOwner}. Prüfung: ${c.reviewOwner}. Entscheidungen: ${c.decisionOwner}. Freigaben: ${c.gates}. Melden Sie eine Eskalation erst als erledigt, wenn ein Mensch entschieden hat.`],
    ["final-approval", "Finale Freigabe", "Eine menschlich verantwortete Freigabeliste vorbereiten.", c.decisionOwner, "Vor Übergabe, Veröffentlichung oder operativem Einsatz.", ["Projektaufnahme", "Verantwortungsmatrix", "Freigaben", "Hinweise und Ausnahmen", "Workflow"], "Eine Freigabeliste mit offenen Punkten und zuständigen Personen.", `Bereiten Sie für ${c.project} eine finale Freigabeliste vor. Trennen Sie fertige Punkte, offene Annahmen, Hinweise (${c.warnings.open}), Ausnahmen (${c.warnings.exceptions}), nötige Freigaben (${c.gates}), Quellen-/Datengrenzen (${c.sources}), Workflow (${c.workflow}) und Audit-Anforderungen. Verantwortung: ${c.ownership}. Menschen entscheiden über Workflow, Ausnahmen, Veröffentlichung, Bereitstellung und Governance-Änderungen.`],
  ];
  return meta.map(([id, title, purpose, owner, whenToUse, inputs, output, prompt]) => ({ id, title, purpose, owner, whenToUse, inputs, output, prompt: `${prompt} ${boundary}` }));
}

export const germanDemoIntake: Partial<BlueprintFile> = {
  projectName: "Assistenz für Kunden-Onboarding", audience: "Customer-Success-Team und neue Kundschaft",
  projectGoal: "Kunden-Onboarding durch KI-unterstützte Dokumentenprüfung und Entscheidungsunterstützung vereinfachen und menschliche Kontrolle an wichtigen Risikopunkten sicherstellen.",
  aiAssistance: "Onboarding-Daten extrahieren, einen Einrichtungsentwurf erstellen, fehlende Dokumente vorschlagen und eine Prüfliste vorbereiten.",
  humanControl: "Finale Freigabe, rechtliche Bewertung, Kundenkommunikation, Werkzeugänderungen und jede Ausnahmebehandlung.",
  sourceMaterial: "KYC-Dokumente, Kunden-E-Mails, Einrichtungsformulare, Richtlinienprüfliste und Support-Notizen.",
  successMeasures: "Kürzere Durchlaufzeit, Prüfqualität, Eskalationsquote und Audit-Erkenntnisse.", scopeIn: "KYC-Dokumentenprüfung, Risikoeinschätzung, Entscheidungsvorschläge und Fallnotizen.", scopeOut: "Finale Freigabe, rechtliche Bewertung, Ausnahmeregeln und verbindliche Kundenzusagen.",
};
export function localizeDemoIntake(blueprint: BlueprintFile, locale: Locale) {
  if (locale !== "de") return blueprint;
  const localized = { ...blueprint };
  for (const key of Object.keys(germanDemoIntake) as Array<keyof typeof germanDemoIntake>) {
    if (blueprint[key] === demoBlueprint[key]) Object.assign(localized, { [key]: germanDemoIntake[key] });
  }
  return localized;
}
