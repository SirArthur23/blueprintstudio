import { test as base, expect, type Page, type Request } from "@playwright/test";
import { brandAssets } from "../../src/lib/brand";
import { isVerifiedImageRevalidationCancellation } from "./runtime-image-check";

const decodedImages = new WeakMap<Page, Set<string>>();

export const test = base.extend<{ runtimeChecks: void; skipWelcome: boolean }>({
  page: async ({ page }, providePage) => {
    const completed = new Set<string>();
    decodedImages.set(page, completed);
    const settle = async () => {
      if (page.url() === "about:blank") return;
      await page.waitForLoadState("networkidle");
      const decoded = await page.locator("img").evaluateAll(async (images) => {
        const sources: string[] = [];
        for (const element of images) {
          const image = element as HTMLImageElement;
          const rect = image.getBoundingClientRect();
          if (rect.width && rect.height && rect.top < innerHeight && rect.bottom > 0) {
            await image.decode();
            if (!image.naturalWidth) throw new Error("Visible image failed to decode: " + image.src);
            sources.push(image.src);
          }
        }
        return sources;
      });
      decoded.forEach(source => completed.add(source));
    };
    const goto = page.goto.bind(page);
    page.goto = async (...args) => { await settle(); const response = await goto(...args); await settle(); return response; };
    const reload = page.reload.bind(page);
    page.reload = async (...args) => { await settle(); const response = await reload(...args); await settle(); return response; };
    await providePage(page);
  },
  // Existing workflow suites represent returning visitors. Dedicated welcome tests opt out.
  skipWelcome: [true, { option: true }],
  runtimeChecks: [async ({ page, baseURL, skipWelcome, browserName }, use, testInfo) => {
    if (skipWelcome) await page.addInitScript(() => {
      try { localStorage.setItem("hitm-blueprint-welcome-v1", "dismissed"); } catch {}
    });
    const errors: string[] = [];
    const unexpectedRequests: string[] = [];
    const origin = new URL(baseURL!).origin;
    const knownImages = new Set([brandAssets.mark.src, brandAssets.artwork.src].map(src => new URL(src, baseURL!).href));
    const responseStatuses = new WeakMap<Request, number>();
    const nativeCancellations: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (entry) => { if (entry.type() === "error") errors.push(entry.text()); });
    page.on("requestfailed", (request) => {
      const code = request.failure()?.errorText;
      // Firefox may abort a redundant 304 validation after using decoded cache bytes.
      // Require the exact known image, successful decoding, native code and 304.
      if (isVerifiedImageRevalidationCancellation({ browserName, code, url: request.url(),
          status: responseStatuses.get(request), knownImages, decodedImages: decodedImages.get(page) })) {
        nativeCancellations.push(`${request.url()}: ${code}`);
      } else errors.push(`${request.url()}: ${code}`);
    });
    page.on("response", (response) => { responseStatuses.set(response.request(), response.status()); if (response.status() >= 400) errors.push(`${response.status()}: ${response.url()}`); });
    page.on("request", (request) => {
      if (new URL(request.url()).origin !== origin || !["GET", "HEAD"].includes(request.method())) {
        unexpectedRequests.push(`${request.method()}: ${request.url()}`);
      }
    });
    await use();
    if (nativeCancellations.length) await testInfo.attach("verified-native-image-revalidation-cancellations", { body: JSON.stringify(nativeCancellations), contentType: "application/json" });
    expect(errors, "No browser, hydration, console or network failures").toEqual([]);
    expect(unexpectedRequests, "Only same-origin static GET/HEAD requests").toEqual([]);
  }, { auto: true }],
});
