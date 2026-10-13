import { expect } from "@playwright/test";
import { test } from "./runtime-fixture";
import { manualScreenshots } from "../../src/lib/manual-gallery";
import { releaseLinks, releaseVersion } from "../../src/lib/public-release";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/blueprintstudio";
test("beta version and bilingual source-feedback routes are explicit and local", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByText("Saved locally", { exact: true })).toBeVisible();
  await expect(page.locator(".beta-label")).toHaveText(`Beta preview · ${releaseVersion}`);
  await page.getByRole("button", { name: "More", exact: true }).click();
  const source = page.getByRole("link", { name: "Source & feedback", exact: true });
  await expect(source).toHaveAttribute("href", `${basePath}/help/#en-release`);
  await expect(source).toHaveAttribute("rel", "noopener noreferrer");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "DE", exact: true }).click();
  await expect(page.locator(".beta-label")).toHaveText(`Beta-Vorschau · ${releaseVersion}`);
  await page.getByRole("button", { name: "Mehr", exact: true }).click();
  await expect(page.getByRole("link", { name: "Handbuch & Datenschutz", exact: true })).toHaveAttribute("href", `${basePath}/help/#deutsch`);
  await expect(page.getByRole("link", { name: "Quellcode & Rückmeldung", exact: true })).toHaveAttribute("href", `${basePath}/help/#de-release`);
});

test("illustrated bilingual help and feedback documents work under the deployment path", async ({ page, request }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("help/");
  await expect(page.locator(".manual-shot")).toHaveCount(12);
  await expect(page.locator("#en-release")).toContainText(releaseVersion);
  await expect(page.locator("#de-release")).toContainText("MIT");
  if (releaseLinks.sourceUrl) await expect(page.locator("#en-release").getByRole("link", { name: "Source code", exact: true })).toHaveAttribute("href", releaseLinks.sourceUrl);
  if (releaseLinks.feedbackUrl) {
    await expect(page.locator("#en-release").getByRole("link", { name: "Send beta feedback", exact: true })).toHaveAttribute("href", releaseLinks.feedbackUrl);
    await expect(page.locator("#de-release").getByRole("link", { name: "Beta-Rückmeldung senden", exact: true })).toHaveAttribute("href", releaseLinks.feedbackUrl);
  }
  for (const locale of ["en", "de"] as const) {
    for (const shot of manualScreenshots(locale)) {
      const image = page.locator(`img[alt=${JSON.stringify(shot.alt)}]`);
      await expect(image).toHaveAttribute("src", `${basePath}/${shot.file}`);
      const response = await request.get(shot.file);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toBe("image/png");
      const bytes = await response.body();
      expect(bytes.readUInt32BE(16)).toBe(shot.width);
      expect(bytes.readUInt32BE(20)).toBe(shot.height);
    }
    const manual = await (await request.get(`doc/manual.${locale}.md`)).text();
    expect(manual).toContain(`../manual/${locale}/workflow.png`);
    expect(manual).not.toContain("../public/manual/");
    expect((await request.get(`doc/feedback.${locale}.md`)).status()).toBe(200);
  }
  expect((await request.get("SECURITY.md")).status()).toBe(200);
  await page.locator("#de-release").scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  // Until chosen, show honest pending text, not enabled placeholder links.
  const pending = page.locator(".release-source-pending");
  if (await pending.count()) {
    await expect(pending).toHaveCount(2);
    await expect(page.getByRole("link", { name: "Source code", exact: true })).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});
