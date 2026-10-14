import { test, expect } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { manualExample } from "../fixtures/manual-example";

const ids = ["brief", "workflow", "checks", "alternatives", "report", "backup"];
const captured = new Set<string>();
for (const locale of ["en", "de"] as const) {
  test(`capture fictional ${locale} manual`, async ({ page }) => {
    const blueprint = manualExample(locale);
    const folder = path.resolve(`public/manual/${locale}`);
    await mkdir(folder, { recursive: true });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() => localStorage.setItem("hitm-blueprint-welcome-v1", "dismissed"));
    await page.goto("./");
    await expect(page.getByText("Saved locally", { exact: true })).toBeVisible();
    if (locale === "de") await page.getByRole("button", { name: "DE", exact: true }).click();
    await page.locator("input[type=file]").setInputFiles({ name: "fictional-training.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(blueprint)) });
    await expect(page.locator(".project-switcher strong")).toHaveText(blueprint.projectName);
    await page.evaluate(() => document.fonts.ready);
    const capture = async (id: string, panel?: string) => {
      const options = { path: path.join(folder, `${id}.png`), animations: "disabled" as const, caret: "hide" as const };
      if (panel) await page.locator(panel).screenshot(options);
      else await page.screenshot(options);
    };
    await page.locator(".top-actions").getByRole("button", { name: locale === "en" ? "Project brief" : "Projektübersicht", exact: true }).click();
    await page.getByRole("tab", { name: locale === "en" ? "Project" : "Projekt", exact: true }).click();
    await capture("brief", ".intake-panel");
    await page.locator(".top-actions").getByRole("button", { name: locale === "en" ? "Project brief" : "Projektübersicht", exact: true }).click();
    const separator = page.getByRole("separator");
    await separator.focus();
    for (let index = 0; index < 9; index++) await separator.press("ArrowLeft");
    await page.getByRole("button", { name: locale === "en" ? "Fit workflow" : "Workflow einpassen", exact: true }).click();
    await capture("workflow");
    await page.getByRole("tab", { name: "Matrix", exact: true }).click();
    const owner = page.getByLabel(locale === "en" ? "Final decisions: Human owner" : "Finale Entscheidungen: Menschlich verantwortlich", { exact: true });
    await owner.fill(locale === "en" ? "AI" : "KI");
    await page.getByRole("tab", { name: locale === "en" ? /^Checks/ : /^Prüfungen/ }).click();
    await expect(page.getByText(locale === "en" ? "Final decisions are assigned to AI" : "Finale Entscheidungen sind der KI zugeordnet", { exact: true })).toBeVisible();
    await capture("checks", ".inspector-panel");
    await page.getByRole("tab", { name: "Matrix", exact: true }).click();
    await owner.fill(locale === "en" ? "Team facilitator" : "Teammoderation");
    await page.getByRole("tab", { name: locale === "en" ? /^Checks/ : /^Prüfungen/ }).click();
    await expect(page.getByText(locale === "en" ? "All deterministic HITM checks pass." : "Alle deterministischen HITM-Prüfungen sind bestanden.", { exact: true })).toBeVisible();
    await page.getByRole("tab", { name: locale === "en" ? "Alternatives" : "Alternativen", exact: true }).click();
    await page.getByRole("button", { name: locale === "en" ? "Privacy-first" : "Datenschutzorientiert", exact: true }).click();
    await expect(page.locator(".alternative-card")).toHaveCount(1);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("hitm-blueprint-file-v6")!).nodes)).toEqual(blueprint.nodes);
    await capture("alternatives", ".inspector-panel");
    await page.getByRole("tab", { name: locale === "en" ? "Report" : "Bericht", exact: true }).click();
    await expect(page.locator(".report-head h2")).toHaveText(blueprint.projectName);
    // Capture the report's top summary/boundaries, not half a horizontally scrollable table.
    const inspector = (await page.locator(".inspector-panel").boundingBox())!;
    const boundaries = (await page.locator(".report-document > .report-block").nth(1).boundingBox())!;
    await page.screenshot({ path: path.join(folder, "report.png"), clip: { ...inspector, height: boundaries.y + boundaries.height - inspector.y }, animations: "disabled", caret: "hide" });
    await page.getByRole("button", { name: locale === "en" ? "More" : "Mehr", exact: true }).click();
    await expect(page.getByRole("button", { name: locale === "en" ? "Export backup (JSON)" : "Sicherung exportieren (JSON)", exact: true })).toBeVisible();
    await capture("backup", ".top-menu-panel");
    expect(errors).toEqual([]);
    captured.add(locale);
  });
}

test.afterAll(async () => {
  if (captured.size !== 2) return;
  const metadata: Record<string, Array<{ id: string; file: string; width: number; height: number }>> = {};
  for (const locale of ["en", "de"]) {
    metadata[locale] = [];
    for (const id of ids) {
      const file = `manual/${locale}/${id}.png`;
      const png = await readFile(`public/${file}`);
      expect(png.subarray(1, 4).toString()).toBe("PNG");
      metadata[locale].push({ id, file, width: png.readUInt32BE(16), height: png.readUInt32BE(20) });
    }
  }
  await writeFile("public/manual/screenshots.json", `${JSON.stringify(metadata, null, 2)}\n`);
});
