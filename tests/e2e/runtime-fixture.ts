import { test as base, expect } from "@playwright/test";

export const test = base.extend<{ runtimeChecks: void; skipWelcome: boolean }>({
  // Existing workflow suites represent returning visitors. Dedicated welcome tests opt out.
  skipWelcome: [true, { option: true }],
  runtimeChecks: [async ({ page, baseURL, skipWelcome }, use) => {
    if (skipWelcome) await page.addInitScript(() => {
      try { localStorage.setItem("hitm-blueprint-welcome-v1", "dismissed"); } catch {}
    });
    const errors: string[] = [];
    const unexpectedRequests: string[] = [];
    const origin = new URL(baseURL!).origin;
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (entry) => { if (entry.type() === "error") errors.push(entry.text()); });
    page.on("requestfailed", (request) => errors.push(`${request.url()}: ${request.failure()?.errorText}`));
    page.on("response", (response) => { if (response.status() >= 400) errors.push(`${response.status()}: ${response.url()}`); });
    page.on("request", (request) => {
      if (new URL(request.url()).origin !== origin || !["GET", "HEAD"].includes(request.method())) {
        unexpectedRequests.push(`${request.method()}: ${request.url()}`);
      }
    });
    await use();
    expect(errors, "No browser, hydration, console or network failures").toEqual([]);
    expect(unexpectedRequests, "Only same-origin static GET/HEAD requests").toEqual([]);
  }, { auto: true }],
});
