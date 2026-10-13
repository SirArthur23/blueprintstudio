import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { personaBlueprint, personaScenarios } from "../fixtures/personas";

// Scripted role scenarios: these assertions cannot measure real-user cognition.
for (const scenario of personaScenarios) {
  test(`simulated ${scenario.id}: German approval, diagnosis, report and backup`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const blueprint = personaBlueprint(scenario);
    await page.goto("./");
    await expect(page.getByText("Saved locally", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "DE", exact: true }).click();
    await page.locator("input[type=file]").setInputFiles({ name: `${scenario.id}.json`, mimeType: "application/json", buffer: Buffer.from(JSON.stringify(blueprint)) });
    await expect(page.locator(".project-switcher strong")).toHaveText(blueprint.projectName);
    await page.getByRole("tab", { name: /^Prüfungen/ }).click();
    if (scenario.sensitivity === "sensitive") {
      await expect(page.getByText("Sensible Daten erreichen einen nicht freigegebenen KI-Schritt oder ein Werkzeug", { exact: true })).toBeVisible();
      await page.getByRole("tab", { name: "Fläche", exact: true }).click();
      await page.getByRole("button", { name: /^3 Entwurf mit KI-Unterstützung/ }).click();
      await page.getByLabel("Freigabe der Datennutzung", { exact: true }).selectOption("approved");
      await page.getByRole("tab", { name: /^Prüfungen/ }).click();
    }
    await expect(page.getByText("Alle deterministischen HITM-Prüfungen sind bestanden.", { exact: true })).toBeVisible();

    // Simulate a mistaken final-owner assignment and correction through the UI.
    if (scenario.id === "consultant") {
      await page.getByRole("tab", { name: "Alternativen", exact: true }).click();
      await page.getByRole("button", { name: "Datenschutzorientiert", exact: true }).click();
      await page.getByRole("button", { name: "Als aktuellen Blueprint übernehmen", exact: true }).click();
      await page.locator(".alternative-card").filter({ hasText: "Vorheriger aktueller Blueprint" }).getByRole("button", { name: "Als aktuellen Blueprint übernehmen", exact: true }).click();
      await page.getByRole("tab", { name: /^Prüfungen/ }).click();
      await expect(page.getByText("Alle deterministischen HITM-Prüfungen sind bestanden.", { exact: true })).toBeVisible();
    }

    await page.getByRole("tab", { name: "Matrix", exact: true }).click();
    await page.getByLabel("Finale Entscheidungen: Menschlich verantwortlich", { exact: true }).fill("KI");
    await page.getByRole("tab", { name: /^Prüfungen/ }).click();
    await expect(page.getByText("Finale Entscheidungen sind der KI zugeordnet", { exact: true })).toBeVisible();
    await page.getByRole("tab", { name: "Matrix", exact: true }).click();
    await page.getByLabel("Finale Entscheidungen: Menschlich verantwortlich", { exact: true }).fill("Projektleitung");
    await page.getByRole("tab", { name: /^Prüfungen/ }).click();
    await expect(page.getByText("Alle deterministischen HITM-Prüfungen sind bestanden.", { exact: true })).toBeVisible();

    await page.getByRole("tab", { name: "Prompts", exact: true }).click();
    await expect(page.locator(".prompt-card")).toHaveCount(7);
    await expect(page.locator(".prompt-card").first()).toContainText("Rollenbeschreibung");
    await expect(page.locator(".prompt-card").first()).toContainText("Die KI darf keine finalen Entscheidungen");
    await page.getByRole("tab", { name: "Bericht", exact: true }).click();
    await expect(page.locator(".report-head h2")).toHaveText(blueprint.projectName);
    await expect(page.locator(".report-document")).toContainText(scenario.goal);
    await expect(page.locator(".report-document")).not.toContainText("Optional support may be useful");
    const downloading = page.waitForEvent("download");
    await page.getByRole("button", { name: "Markdown exportieren", exact: true }).click();
    const file = await (await downloading).path();
    const markdown = await readFile(file!, "utf8");
    expect(markdown).toContain("# Abschließender HITM-Blueprint-Bericht:");
    expect(markdown).toContain("## Verantwortungsmatrix");
    expect(markdown).toContain("## Nächste Schritte");
    expect(markdown).not.toContain("## Ownership Matrix");

    await page.getByRole("button", { name: "Mehr", exact: true }).click();
    const backingUp = page.waitForEvent("download");
    await page.getByRole("button", { name: "Sicherung exportieren (JSON)", exact: true }).click();
    const backupPath = await (await backingUp).path();
    const backup = JSON.parse(await readFile(backupPath!, "utf8"));
    expect(backup.report.locale).toBe("de");
    expect(backup.prompts[0].title).toBe("Rollenbeschreibung");
    await page.locator("input[type=file]").setInputFiles(backupPath!);
    await page.reload();
    await expect(page.getByText("Lokal gespeichert", { exact: true })).toBeVisible();
    await expect(page.locator(".project-switcher strong")).toHaveText(blueprint.projectName);
    await page.getByRole("tab", { name: /^Prüfungen/ }).click();
    await expect(page.getByText("Alle deterministischen HITM-Prüfungen sind bestanden.", { exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  });
}
