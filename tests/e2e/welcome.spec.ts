import { expect } from "@playwright/test";
import { test } from "./runtime-fixture";
import { createBlankBlueprint, storageKey } from "../../src/lib/blueprint-engine";
import { welcomeStorageKey } from "../../src/lib/welcome";

test.use({ skipWelcome: false });
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/blueprintstudio";

test("first visit is bilingual, accessible and remembers dismissal without changing work", async ({ page }, testInfo) => {
  await page.goto("./");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toHaveAccessibleName("Plan AI support. Keep people in charge.");
  const start = dialog.getByRole("button", { name: "Explore Studio", exact: true });
  await expect(dialog.getByRole("button", { name: "Close welcome", exact: true })).toBeFocused();
  const artwork = dialog.getByRole("img", { name: "Blueprint Studio", exact: true });
  await expect(artwork).toHaveAttribute("src", `${basePath}/brand/BlueprintStudio_hires.png`);
  await expect.poll(() => artwork.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBe(1312);
  await page.screenshot({ path: testInfo.outputPath("welcome-en.png") });
  const before = await page.evaluate((key) => localStorage.getItem(key), storageKey);
  await page.keyboard.press("Delete");
  await page.keyboard.press("Control+z");
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(before);
  expect(await page.locator(".studio-topbar").evaluate((el) => (el as HTMLElement).inert)).toBe(true);
  await start.press("Tab");
  await expect(dialog.getByRole("button", { name: "Show the quick guide", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "Close welcome", exact: true })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("button", { name: "Show the quick guide", exact: true })).toBeFocused();
  await dialog.getByRole("button", { name: "Deutsch", exact: true }).click();
  await expect(dialog).toHaveAccessibleName("KI-Unterstützung planen. Verantwortung behalten.");
  await expect(dialog).toContainText("keine angebundene KI");
  await expect(dialog).toContainText("nicht verschlüsselt");
  await dialog.getByRole("button", { name: "English", exact: true }).click();
  await expect(dialog).toContainText("not a connected AI");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  const mark = page.locator(".brand-mark img");
  await expect(mark).toHaveAttribute("src", `${basePath}/brand/BlueprintStudio_lores.png`);
  await expect.poll(() => mark.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBe(1254);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", `${basePath}/brand/BlueprintStudio_lores.png`);
  expect(await mark.evaluate((el) => el.getBoundingClientRect().width)).toBeLessThanOrEqual(48);
  await expect(page.getByRole("button", { name: "More", exact: true })).toBeFocused();
  expect(await page.evaluate((key) => localStorage.getItem(key), welcomeStorageKey)).toBe("dismissed");
  await page.reload();
  await expect(page.getByText("Saved locally", { exact: true })).toBeVisible();
  await expect(dialog).toHaveCount(0);
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(before);
  await page.getByRole("button", { name: "More", exact: true }).click();
  await page.getByRole("button", { name: "Welcome to Studio", exact: true }).click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Show the quick guide", exact: true }).click();
  await expect(dialog).toHaveAccessibleName("Build a human-owned AI workflow");
  await dialog.getByRole("button", { name: "Welcome to Studio", exact: true }).click();
  await expect(dialog).toHaveAccessibleName("Plan AI support. Keep people in charge.");
  await dialog.getByRole("button", { name: "Explore Studio", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(before);
});

test("German preference and a short narrow viewport keep all welcome content accessible", async ({ page }, testInfo) => {
  await page.addInitScript(() => localStorage.setItem("hitm-blueprint-locale-v1", "de"));
  await page.setViewportSize({ width: 375, height: 440 });
  await page.goto("./");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toHaveAccessibleName("KI-Unterstützung planen. Verantwortung behalten.");
  await expect(dialog.getByRole("button", { name: "Deutsch", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(dialog.getByRole("button", { name: "Willkommensdialog schließen", exact: true })).toBeFocused();
  await expect.poll(() => dialog.locator(".welcome-artwork").evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBe(1312);
  expect(await dialog.locator(".welcome-artwork").evaluate((el) => el.getBoundingClientRect().right <= el.parentElement!.getBoundingClientRect().right)).toBe(true);
  await expect(dialog.locator(".welcome-intro")).toBeInViewport({ ratio: 0.5 });
  await page.screenshot({ path: testInfo.outputPath("welcome-de-narrow.png") });
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await dialog.getByRole("button", { name: "Studio erkunden", exact: true }).scrollIntoViewIfNeeded();
  await expect(dialog.getByRole("button", { name: "Studio erkunden", exact: true })).toBeInViewport();
  await page.mouse.click(4, 4);
  await expect(dialog).toHaveCount(0);
  expect(await page.evaluate((key) => localStorage.getItem(key), welcomeStorageKey)).toBe("dismissed");
});

for (const key of [storageKey, "hitm-blueprint-file-v5"]) {
  test(`a returning draft at ${key} is not interrupted or replaced`, async ({ page }) => {
    const project = { ...createBlankBlueprint(), projectName: "Fictional returning draft" };
    await page.addInitScript(({ key, project }) => localStorage.setItem(key, JSON.stringify(project)), { key, project });
    await page.goto("./");
    await expect(page.getByText("Saved locally", { exact: true })).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator(".project-switcher strong")).toHaveText(project.projectName);
    const before = await page.evaluate((key) => localStorage.getItem(key), storageKey);
    await page.getByRole("button", { name: "More", exact: true }).click();
    await page.getByRole("button", { name: "How to use Studio", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Welcome to Studio", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Close welcome", exact: true }).click();
    expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(before);
  });
}

test("corrupt storage is preserved and its warning is not covered by the introduction", async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, "corrupt fictional draft"), storageKey);
  await page.goto("./");
  await expect(page.getByText(/Could not load local draft/)).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe("corrupt fictional draft");
});

test("unavailable storage still allows manually opening and dismissing welcome", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error("unavailable"); };
    Storage.prototype.setItem = () => { throw new Error("unavailable"); };
  });
  await page.goto("./");
  await expect(page.getByText(/Could not load local draft/)).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "More", exact: true }).click();
  await page.getByRole("button", { name: "Welcome to Studio", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Explore Studio", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
