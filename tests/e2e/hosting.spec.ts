import { expect } from "@playwright/test";
import { test } from "./runtime-fixture";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/blueprintstudio";

test("app assets have static MIME types and remain on the selected origin", async ({ page, request, baseURL }) => {
  await page.goto("./");
  await expect(page.getByText("Saved locally", { exact: true })).toBeVisible();
  const assets = await page.locator("script[src],link[rel=stylesheet],link[as=font]").evaluateAll((elements) => elements.map((element) => element.getAttribute("src") || element.getAttribute("href")));
  expect(assets.length).toBeGreaterThan(0);
  for (const path of assets) {
    expect(path).toBeTruthy();
    expect(new URL(path!, baseURL!).origin).toBe(new URL(baseURL!).origin);
    expect(path).toMatch(new RegExp(`^${basePath}/(?:_next|fonts)/`));
    const response = await request.get(path!);
    expect(response.status()).toBe(200);
    const type = response.headers()["content-type"];
    if (path!.endsWith(".js")) expect(type).toMatch(/(?:application|text)\/javascript/);
    else if (path!.endsWith(".css")) expect(type).toMatch(/^text\/css/);
    else if (path!.endsWith(".ttf")) expect(type).toMatch(/^font\/ttf/);
    else if (path!.endsWith(".woff2")) expect(type).toMatch(/^font\/woff2/);
    else throw new Error(`Asset type needs an explicit assertion: ${path}`);
  }
});

test("bilingual operator notice is linked from help and remains readable on narrow screens", async ({ page, request }) => {
  await page.goto("help/");
  await page.getByRole("link", { name: "Operator, privacy & imprint / Betreiber, Datenschutz & Impressum", exact: true }).click();
  await expect(page.locator("#english")).toContainText("Arthur Schmidt-Pabst");
  await expect(page.locator("#english")).toContainText("fourteen daily archives");
  await expect(page.locator("#deutsch")).toContainText("vierzehn tägliche Archive");
  await expect(page.locator("#deutsch")).toContainText("verschlüsselt ihn aber nicht");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  for (const file of ["LICENSE", "PRIVACY.md", "doc/manual.en.md", "doc/manual.de.md", "THIRD_PARTY_NOTICES.md"]) {
    const response = await request.get(file);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/^text\/plain/);
  }
});

test("genuinely unknown routes return 404 instead of the app", async ({ request }) => {
  for (const path of ["unknown-blueprint-route-7a03/", "_next/static/missing-7a03.js"]) {
    const response = await request.get(path);
    expect(response.status()).toBe(404);
  }
});
