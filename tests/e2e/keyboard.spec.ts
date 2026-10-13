import { expect } from "@playwright/test";
import { test } from "./runtime-fixture";
import { createBlankBlueprint, generateDraftWorkflow } from "../../src/lib/blueprint-engine";

for (const locale of ["en", "de"] as const) {
  test.describe(`${locale} keyboard`, () => {
  const names = locale === "en" ? {
    more: "More", guide: "How to use Studio", close: "Close quick guide", blank: "Start blank", cancel: "Cancel",
    templates: "Templates", checks: "Checks", exception: "Document exception", exceptions: "Exceptions", reopen: "Reopen", report: "Report",
  } : {
    more: "Mehr", guide: "Studio-Anleitung", close: "Kurzanleitung schließen", blank: "Leer starten", cancel: "Abbrechen",
    templates: "Vorlagen", checks: "Prüfungen", exception: "Ausnahme dokumentieren", exceptions: "Ausnahmen", reopen: "Wieder öffnen", report: "Bericht",
  };
  test.beforeEach(async ({ page }) => {
    await page.goto("./");
    await expect(page.getByText("Saved locally", { exact: true })).toBeVisible();
    if (locale === "de") await page.getByRole("button", { name: "DE", exact: true }).click();
  });

  test(`${locale}: disclosure keys, dismissal, and template selection`, async ({ page, browserName }) => {
    const more = page.getByRole("button", { name: names.more, exact: true });
    await more.focus();
    await more.press("Enter");
    await expect(more).toHaveAttribute("aria-expanded", "true");
    await more.press("ArrowDown");
    await expect(page.locator(".top-menu-panel button").first()).toBeFocused();
    await page.keyboard.press("End");
    await expect(page.locator(".top-menu-panel a").last()).toBeFocused();
    await page.keyboard.press("Home");
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("button", { name: names.blank, exact: true })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(more).toHaveAttribute("aria-expanded", "false");
    await expect(more).toBeFocused();
    await more.press("ArrowUp");
    await expect(page.locator(".top-menu-panel a").last()).toBeFocused();
    await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
    await expect(more).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator(".top-actions > .primary-button")).toBeFocused();
    await more.press("Enter");
    await page.getByRole("button", { name: locale.toUpperCase(), exact: true }).click();
    await expect(more).toHaveAttribute("aria-expanded", "false");

    const templates = page.getByRole("button", { name: names.templates, exact: true });
    await templates.focus();
    await templates.press("ArrowDown");
    await expect(page.locator(".template-menu-head button")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(page.locator(".template-option").first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(templates).toBeFocused();
    await expect(templates).toHaveAttribute("aria-expanded", "false");
    await templates.press("ArrowDown");
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    await expect(templates).toHaveAttribute("aria-expanded", "false");
    await expect(templates).toBeFocused();
    await expect(page.locator(".canvas-node")).not.toHaveCount(0);
  });

  test(`${locale}: dialogs contain focus, protect the draft, and return to their opener`, async ({ page }) => {
    const before = await page.evaluate(() => localStorage.getItem("hitm-blueprint-file-v6"));
    const more = page.getByRole("button", { name: names.more, exact: true });
    await more.focus();
    await more.press("Enter");
    const guideAction = page.getByRole("button", { name: names.guide, exact: true });
    await guideAction.focus();
    await guideAction.press("Enter");
    const dialog = page.getByRole("dialog");
    const close = dialog.getByRole("button", { name: names.close, exact: true });
    await expect(close).toBeFocused();
    await close.press("Shift+Tab");
    await expect(dialog.locator(".guide-steps button").last()).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(close).toBeFocused();
    expect(await page.locator(".studio-topbar").evaluate((el) => (el as HTMLElement).inert)).toBe(true);
    await page.keyboard.press("Delete");
    await page.keyboard.press("Control+z");
    expect(await page.evaluate(() => localStorage.getItem("hitm-blueprint-file-v6"))).toBe(before);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(more).toBeFocused();
    expect(await page.locator(".studio-topbar").evaluate((el) => (el as HTMLElement).inert)).toBe(false);

    await more.press("Enter");
    await page.getByRole("button", { name: names.blank, exact: true }).focus();
    await page.keyboard.press("Enter");
    const cancel = dialog.getByRole("button", { name: names.cancel, exact: true });
    await expect(cancel).toBeFocused(); // destructive replacement is not the default action
    await cancel.press("Shift+Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(dialog.getByRole("button", { name: names.blank, exact: true })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(more).toBeFocused();
    expect(await page.evaluate(() => localStorage.getItem("hitm-blueprint-file-v6"))).toBe(before);
    await more.press("Enter");
    await page.getByRole("button", { name: names.blank, exact: true }).focus();
    await page.keyboard.press("Enter");
    await cancel.press("Enter");
    await expect(more).toBeFocused();
    expect(await page.evaluate(() => localStorage.getItem("hitm-blueprint-file-v6"))).toBe(before);
  });

  test(`${locale}: a justified exception persists, stays disclosed, and can be reopened`, async ({ page, browserName }) => {
    const blueprint = createBlankBlueprint();
    const draft = generateDraftWorkflow({ ...blueprint, projectName: "Fictional exception exercise" }, locale);
    const input = { ...blueprint, projectName: "Fictional exception exercise", ...draft };
    input.nodes = [{ id: "exercise-ai", kind: "ai", title: "Isolated training draft", detail: "No operational output", owner: "AI system", x: 2800, y: 2000 }];
    input.edges = [];
    await page.locator("input[type=file]").setInputFiles({ name: "fictional.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(input)) });
    await page.getByRole("tab", { name: new RegExp(`^${names.checks}(?: |$)`) }).focus();
    await page.keyboard.press("Enter");
    const warning = page.locator(".warning-card").first();
    const warningTitle = await warning.locator("h3").textContent();
    const exception = warning.getByRole("button", { name: names.exception, exact: true });
    await expect(exception).toBeDisabled();
    const note = warning.locator("textarea");
    await note.focus();
    await note.pressSequentially("   ");
    await expect(exception).toBeDisabled();
    const justification = "Fictional classroom exercise; no real data or external output. Reviewed by facilitator.";
    await note.fill(justification);
    const tab = browserName === "webkit" ? "Alt+Tab" : "Tab";
    await note.press(tab); // resolve
    await page.keyboard.press(tab); // exception
    await expect(exception).toBeFocused();
    await page.keyboard.press("Enter");
    const openFilter = page.getByRole("tab", { name: locale === "en" ? /^Open / : /^Offen / });
    await expect(openFilter).toBeFocused();
    await openFilter.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: new RegExp(`^${names.exceptions} 1$`) })).toBeFocused();
    const read = () => page.evaluate(() => JSON.parse(localStorage.getItem("hitm-blueprint-file-v6")!));
    await expect.poll(async () => (await read()).warningResolutions.length).toBe(1);
    const record = (await read()).warningResolutions[0];
    expect(record.status).toBe("exception");
    expect(record.note).toBe(justification);
    expect(record.updatedAt).toBeTruthy();
    await page.reload();
    await page.getByRole("tab", { name: new RegExp(`^${names.checks}(?: |$)`) }).click();
    const filter = page.getByRole("tab", { name: new RegExp(`^${names.exceptions} 1$`) });
    await filter.focus();
    await filter.press("Enter");
    await expect(page.locator(".warning-card textarea")).toHaveValue(justification);
    await page.getByRole("tab", { name: names.report, exact: true }).click();
    await expect(page.locator(".report-document")).toContainText(justification);
    await page.getByRole("button", { name: names.more, exact: true }).click();
    const downloading = page.waitForEvent("download");
    await page.locator(".top-menu-panel").getByRole("button", { name: locale === "en" ? "Export backup (JSON)" : "Sicherung exportieren (JSON)", exact: true }).click();
    const backup = await (await downloading).path();
    await page.locator("input[type=file]").setInputFiles(backup!);
    expect((await read()).warningResolutions[0]).toEqual(record);
    await page.getByRole("tab", { name: new RegExp(`^${names.checks}(?: |$)`) }).click();
    await filter.click();
    await page.getByRole("button", { name: names.reopen, exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect.poll(async () => (await read()).warningResolutions.length).toBe(0);
    await page.getByRole("tab", { name: locale === "en" ? /^Open / : /^Offen / }).click();
    await expect(page.locator(".warning-card").first().locator("h3")).toHaveText(warningTitle!);
  });
  });
}
