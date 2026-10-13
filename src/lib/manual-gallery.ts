import imageMetadata from "../../public/manual/screenshots.json";
import type { Locale } from "./i18n";

type Shot = { id: string; file: string; width: number; height: number };
const captions: Record<Locale, Record<string, { title: string; caption: string; alt: string }>> = {
  en: {
    brief: { title: "Describe the task", caption: "Fictional team-training example. Describe sources and human limits; do not paste confidential records.", alt: "English project brief for a fictional team-training review, with project name, audience and intended outcome." },
    workflow: { title: "Review the draft workflow", caption: "Generated steps are a proposal. Select a card, name its human owner, and inspect the connected review path.", alt: "English workflow canvas with human input, AI drafting, human review and approval steps for the fictional training project." },
    checks: { title: "Investigate a warning", caption: "Deliberate mistake: final decisions assigned to AI. Correct the owner in Matrix; do not treat a resolution note as proof of repair.", alt: "English HITM check explaining the deliberately incorrect AI-owned final decision and the missing human control." },
    alternatives: { title: "Compare before adopting", caption: "A privacy-first option with its rationale and changes. The current blueprint has not been replaced.", alt: "English Alternatives inspector comparing a privacy-first draft with the current fictional workflow, with an explicit adoption button." },
    report: { title: "Review the handoff", caption: "The report collects the plan and its limitations. Markdown and print are handoff formats, not editable backups.", alt: "English report inspector showing the fictional training project's summary and human-owned planning information." },
    backup: { title: "Keep an editable backup", caption: "More → Export backup (JSON) preserves the editable project. Import replaces the current draft; back it up first.", alt: "English More menu with editable JSON backup export and import actions." },
  },
  de: {
    brief: { title: "Die Aufgabe beschreiben", caption: "Erfundenes Schulungsprojekt. Beschreiben Sie Quellen und menschliche Grenzen; fügen Sie keine vertraulichen Originaldaten ein.", alt: "Deutsche Projektübersicht eines erfundenen Schulungsprojekts mit Projektname, Zielgruppe und beabsichtigtem Ergebnis." },
    workflow: { title: "Den Workflow-Entwurf prüfen", caption: "Generierte Schritte sind ein Vorschlag. Wählen Sie einen Knoten, benennen Sie menschliche Verantwortung und prüfen Sie den verbundenen Prüfpfad.", alt: "Deutsche Workflow-Fläche mit menschlicher Eingabe, KI-Entwurf, menschlicher Prüfung und Freigabe für das erfundene Schulungsprojekt." },
    checks: { title: "Einen Hinweis untersuchen", caption: "Absichtlicher Fehler: Finale Entscheidungen liegen bei der KI. Korrigieren Sie die Verantwortung in der Matrix; eine Lösungsnotiz beweist keine Reparatur.", alt: "Deutscher HITM-Prüfhinweis zur absichtlich falsch zugeordneten KI-Verantwortung für finale Entscheidungen und zur fehlenden menschlichen Kontrolle." },
    alternatives: { title: "Vor der Übernahme vergleichen", caption: "Datenschutzorientierte Option mit Gründen und Änderungen. Der aktuelle Blueprint wurde noch nicht ersetzt.", alt: "Deutscher Alternativen-Inspektor mit Vergleich einer datenschutzorientierten Option und einer ausdrücklichen Übernahme-Schaltfläche." },
    report: { title: "Die Übergabe prüfen", caption: "Der Bericht fasst Planung und Grenzen zusammen. Markdown und Druck dienen der Übergabe, nicht der bearbeitbaren Sicherung.", alt: "Deutscher Berichts-Inspektor mit Zusammenfassung und menschlicher Verantwortung für das erfundene Schulungsprojekt." },
    backup: { title: "Bearbeitbar sichern", caption: "Mehr → Sicherung exportieren (JSON) erhält das bearbeitbare Projekt. Ein Import ersetzt den aktuellen Stand; sichern Sie ihn vorher.", alt: "Deutsches Mehr-Menü mit bearbeitbarer JSON-Sicherung und Import." },
  },
};

export function manualScreenshots(locale: Locale) {
  return (imageMetadata[locale] as Shot[]).map((shot) => ({ ...shot, ...captions[locale][shot.id] }));
}
