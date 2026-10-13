import Image from "next/image";
import { manualScreenshots } from "@/lib/manual-gallery";
import { releaseLinks, releaseVersion } from "@/lib/public-release";
import type { Locale } from "@/lib/i18n";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

function ManualGallery({ locale }: { locale: Locale }) {
  return <div className="manual-gallery">
    <h3>{locale === "en" ? "A fictional example, step by step" : "Ein erfundenes Beispiel, Schritt für Schritt"}</h3>
    <p>{locale === "en" ? "Actual Studio screenshots from isolated test browsers. Open an image for full size. The example uses invented training material, not a real team’s records." : "Echte Studio-Screenshots aus isolierten Testbrowsern. Öffnen Sie ein Bild in voller Größe. Das Beispiel nutzt erfundene Schulungsunterlagen, keine Daten eines echten Teams."}</p>
    {manualScreenshots(locale).map((shot) => <figure className={`manual-shot shot-${shot.id}`} key={shot.id}>
      <h4>{shot.title}</h4>
      <a href={`${basePath}/${shot.file}`} target="_blank" rel="noopener noreferrer" aria-label={locale === "en" ? `Open full-size screenshot: ${shot.title}` : `Screenshot in voller Größe öffnen: ${shot.title}`}>
        <Image src={`${basePath}/${shot.file}`} alt={shot.alt} width={shot.width} height={shot.height} unoptimized />
      </a>
      <figcaption>{shot.caption}</figcaption>
    </figure>)}
  </div>;
}

function ReleaseDetails({ locale }: { locale: Locale }) {
  const en = locale === "en";
  return <section id={`${locale}-release`} lang={locale} className="release-details">
    <h2>{en ? "About this beta, source & feedback" : "Über diese Beta, Quellcode & Rückmeldung"}</h2>
    <p>{en ? "Beta preview" : "Beta-Vorschau"} · {releaseVersion} · MIT · © 2026 Arthur Schmidt-Pabst</p>
    <p>{en ? "Free, deterministic and local-first. Hosted beta rollout is being prepared; no account, connected AI service, analytics or project-upload endpoint is added." : "Kostenlos, deterministisch und lokal im Browser. Die gehostete Beta wird vorbereitet; ohne Konto, angebundenen KI-Dienst, Analysewerkzeuge oder Projektdaten-Upload."}</p>
    {releaseLinks.sourceUrl ? <p><a href={releaseLinks.sourceUrl} target="_blank" rel="noopener noreferrer">{en ? "Source code" : "Quellcode"}</a></p> : <p className="release-source-pending">{en ? "The public repository link is not configured yet. The source release is being prepared; no placeholder repository is presented as live." : "Der öffentliche Repository-Link ist noch nicht eingerichtet. Die Quellcode-Veröffentlichung wird vorbereitet; ein Platzhalter wird nicht als live ausgegeben."}</p>}
    {releaseLinks.feedbackUrl ? <p><a href={releaseLinks.feedbackUrl} target="_blank" rel="noopener noreferrer">{en ? "Send beta feedback" : "Beta-Rückmeldung senden"}</a></p> : <p className="release-feedback-pending">{en ? "The feedback destination is not configured yet. You can prepare a report using the template below; nothing is sent automatically." : "Die Meldestelle für Rückmeldungen ist noch nicht eingerichtet. Nutzen Sie die Vorlage unten zur Vorbereitung; nichts wird automatisch versendet."}</p>}
    <p>{en ? "Share a fictional reproduction, browser, language and version. Never post a private project export, confidential screenshot or exploitable security issue in public feedback. No project details are attached to these links." : "Nennen Sie ein erfundenes Beispiel zum Nachstellen sowie Browser, Sprache und Version. Keine privaten Projektexporte, vertraulichen Screenshots oder ausnutzbaren Sicherheitsprobleme öffentlich melden. Diese Links hängen keine Projektdetails an."}</p>
    {process.env.BLUEPRINT_STATIC_EXPORT === "1" ? <nav aria-label={en ? "Beta release documents" : "Beta-Unterlagen"}>
      <a href={`${basePath}/doc/feedback.${locale}.md`}>{en ? "Feedback template (Markdown)" : "Rückmeldevorlage (Markdown)"}</a>
      <a href={`${basePath}/LICENSE`}>{en ? "MIT license" : "MIT-Lizenz"}</a>
      <a href={`${basePath}/THIRD_PARTY_NOTICES.md`}>{en ? "Third-party notices" : "Hinweise zu Drittsoftware"}</a>
      <a href={`${basePath}/SECURITY.md`}>{en ? "Security reporting preparation" : "Vorbereitung privater Sicherheitsmeldungen"}</a>
    </nav> : null}
  </section>;
}

export default function HelpPage() {
  return (
    <main className="help-document">
      <a href={`${basePath}/`}>← Blueprint Studio</a>
      <h1>Manual / Handbuch</h1>
      <p>Public beta preparation · Vorbereitung der öffentlichen Beta</p>
      <nav aria-label="Help language"><a href="#english">English</a><a href="#deutsch">Deutsch</a></nav>
      {process.env.BLUEPRINT_STATIC_EXPORT === "1" ? <p><a href={`${basePath}/hosting/`}>Operator, privacy & imprint / Betreiber, Datenschutz & Impressum</a></p> : null}
      {process.env.BLUEPRINT_STATIC_EXPORT === "1" ? <nav aria-label="Full manuals"><a href={`${basePath}/doc/manual.en.md`}>Full English manual (Markdown)</a><a href={`${basePath}/doc/manual.de.md`}>Deutsches Handbuch (Markdown)</a><a href={`${basePath}/PRIVACY.md`}>Privacy / Datenschutz</a></nav> : null}
      <section id="english" lang="en">
        <h2>Your first blueprint</h2>
        <ol>
          <li>Open <strong>Project brief → Project</strong>. Enter a project name, audience, and concrete outcome. Under Operating details, describe AI assistance, human control, sources, and risk settings.</li>
          <li>Generate from intake or choose a template. Review the proposed workflow, select nodes to edit them, and replace owner placeholders. Generation/templates replace the canvas; export a backup of custom work first.</li>
          <li>Use the stage bar to assign ownership and required gates. Matrix and canvas owners are separate records; review both. Use Connect to create directed approval, revision, data, or escalation paths.</li>
          <li>Open Checks, read the trigger and missing control, and repair the workflow. Exceptions need a reason. Marking resolved records your assertion; passing implemented checks does not certify safety or real-world approval.</li>
          <li>Compare Alternatives. Each generates a fresh draft from intake; custom steps are not carried over. Adoption saves a restorable previous workflow/settings snapshot. Project intake text remains current.</li>
          <li>Review Prompts and Report. Export a JSON backup for editable recovery; Markdown/copy/print are handoff formats. Open Report before printing.</li>
        </ol>
        <h3>Canvas and saving</h3>
        <p>Drag nodes to arrange them; drag the background to pan; use wheel/zoom and Fit workflow. Add node opens the library in Project brief. Canvas undo/redo: ⌘Z/Ctrl+Z, with Shift for redo. On phones expand Canvas controls. Resize the desktop inspector by dragging its left edge or using the arrow keys, Home, or End while focused.</p>
        <p>One project is stored per browser/origin. Export backup (JSON) before a reset, import, or device/browser change. Invalid imports leave current work intact. A local-save failure is shown in the header. Clearing browser site data can erase work.</p>
        <h3>Language and limits</h3>
        <p>EN/DE changes the interface, new templates, generated prompts/reports, and Markdown exports. Your own text stays as entered. Recognized built-in defaults are localized for output. This is a planning tool; it does not run AI, execute workflows, or connect databases.</p>
        <p>Sensitive AI/tool data use starts as Not reviewed. Record Data-use approval after human review of the permitted material, step/tool, and data owner. Intentional stopping point explicitly ends a branch with human ownership. Checks also inspect disconnected sub-flows and whether audit, escalation, and gates protect the affected path.</p>
        <h3>Privacy</h3>
        <p>The app uses browser local storage and bundled fonts. It sends no project content to AI services or a project-storage server, and adds no analytics or accounts. A hosted site receives normal requests for its files and may keep access logs. Browser data is not encrypted by the app; other scripts on the same origin may access it. Exports/clipboard/print contain your entries. Use fictional examples or descriptions rather than confidential records.</p>
        <ManualGallery locale="en" />
      </section>
      <section id="deutsch" lang="de">
        <h2>Ihr erster Blueprint</h2>
        <ol>
          <li>Öffnen Sie <strong>Projektübersicht → Projekt</strong>. Beschreiben Sie Projektname, Zielgruppe und ein konkretes Ergebnis. Unter Rahmenbedingungen ergänzen Sie KI-Unterstützung, menschliche Kontrolle, Quellen und Risikoeinstellungen.</li>
          <li>Erstellen Sie einen Entwurf oder wählen Sie eine Vorlage. Bearbeiten Sie Knoten und ersetzen Sie Rollenplatzhalter. Generierung und Vorlagen ersetzen die Fläche; sichern Sie manuelle Arbeit vorher als JSON.</li>
          <li>Ordnen Sie über die Schrittleiste Verantwortung und Freigaben zu. Matrix und Knoten sind separate Einträge; prüfen Sie beide. Verbinden Sie Schritte mit Freigabe-, Überarbeitungs-, Daten- oder Eskalationspfaden.</li>
          <li>Lesen Sie unter Prüfungen Auslöser und fehlende Kontrolle und reparieren Sie den Workflow. Ausnahmen brauchen eine Begründung. Ein gelöster Hinweis dokumentiert Ihre Feststellung; bestandene Prüfungen bescheinigen keine Sicherheit oder reale Freigabe.</li>
          <li>Vergleichen Sie Alternativen. Diese erzeugen einen neuen Entwurf; manuelle Schritte werden nicht übernommen. Eine Übernahme speichert den vorherigen Workflow und seine Einstellungen zur Wiederherstellung. Aufnahme-Texte bleiben aktuell.</li>
          <li>Prüfen Sie Prompts und Bericht. JSON sichert das bearbeitbare Projekt; Markdown, Kopieren und Drucken dienen der Übergabe. Öffnen Sie den Bericht vor dem Drucken.</li>
        </ol>
        <h3>Fläche und Speicherung</h3>
        <p>Knoten und Hintergrund lassen sich ziehen. Zoomen Sie per Mausrad/Tasten oder passen Sie den Workflow ein. Knoten hinzufügen öffnet die Bibliothek in der Projektübersicht. ⌘Z/Strg+Z macht Arbeitsflächen-Aktionen rückgängig, zusätzlich Umschalt wiederholt sie. Auf Mobilgeräten öffnen Sie Arbeitsflächen-Steuerung. Die linke Inspektorkante unterstützt Ziehen sowie Links/Rechts, Pos1 und Ende bei Tastaturfokus.</p>
        <p>Pro Browser/Origin gibt es ein Projekt. Exportieren Sie vor Neustart, Import und Geräte- oder Browserwechsel eine JSON-Sicherung. Ungültige Importe verändern den aktuellen Stand nicht. Speicherfehler werden angezeigt. Das Löschen von Website-Daten kann Ihre Arbeit entfernen.</p>
        <h3>Sprache und Grenzen</h3>
        <p>EN/DE verändert Oberfläche, neue Vorlagen, generierte Prompts/Berichte und Markdown-Exporte. Eigene Eingaben bleiben erhalten. Bekannte Standardtexte werden für die Ausgabe übersetzt. Das Werkzeug plant Prozesse; es führt keine KI, Workflows oder Datenbankverbindungen aus.</p>
        <p>Sensible Datennutzung durch KI/Werkzeuge beginnt als Ungeprüft. Dokumentieren Sie die Freigabe der Datennutzung nach menschlicher Prüfung von Material, Schritt/Werkzeug und Datenverantwortung. Beabsichtigter Stopp beendet einen Zweig unter menschlicher Verantwortung. Prüfungen untersuchen außerdem getrennte Teilabläufe sowie die Erreichbarkeit von Audit, Eskalation und Freigaben auf dem betroffenen Pfad.</p>
        <h3>Datenschutz</h3>
        <p>Die Anwendung nutzt lokalen Browserspeicher und mitgelieferte Schriftarten. Sie sendet keine Projektinhalte an KI-Dienste oder Projektspeicher-Server und verwendet keine Konten oder Analysewerkzeuge. Der Host erhält gewöhnliche Datei-Anfragen und kann Zugriffsprotokolle führen. Browserspeicher ist nicht durch die App verschlüsselt und kann für andere Skripte derselben Origin zugänglich sein. Exporte, Zwischenablage und Druck enthalten Ihre Eingaben. Nutzen Sie Beschreibungen oder erfundene Daten statt vertraulicher Originaldatensätze.</p>
        <ManualGallery locale="de" />
      </section>
      <ReleaseDetails locale="en" />
      <ReleaseDetails locale="de" />
      <p>MIT · © 2026 <a href="https://schmidtpabst.com">Arthur Schmidt-Pabst</a></p>
    </main>
  );
}
