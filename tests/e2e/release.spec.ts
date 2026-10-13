import { test, expect, type Page } from "@playwright/test";

const key = "hitm-blueprint-file-v6";
async function saved(page: Page) {
  await expect(page.getByText("Saved locally", { exact: true })).toBeVisible();
}
async function current(page: Page) {
  return page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)!), key);
}
test.beforeEach(async ({ page }) => {
  await page.goto("./");
  await saved(page);
});

test("guided workflow, report, backup export and import", async ({ page }) => {
  await page.getByRole("button", { name: "More", exact: true }).click();
  await page.getByRole("button", { name: "Start blank", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Start blank", exact: true }).click();
  await expect(page.locator(".canvas-node")).toHaveCount(0);
  await page.locator(".top-actions").getByRole("button", { name: "Project brief", exact: true }).click();
  await page.getByRole("tab", { name: "Project", exact: true }).click();
  await page.getByLabel("Project name", { exact: true }).fill("Team review pilot");
  await page.getByLabel("Audience", { exact: true }).fill("Five colleagues");
  await page.getByLabel("What are you building?", { exact: true }).fill("Review training material before publication.");
  await page.getByText("Operating details", { exact: true }).click();
  await page.getByLabel("What should AI do?", { exact: true }).fill("Draft a source-grounded summary.");
  await page.getByLabel("What must humans control?", { exact: true }).fill("Final approval, source selection, and exceptions.");
  await page.getByLabel("Source material and data", { exact: true }).fill("Approved internal training documents.");
  await page.getByRole("button", { name: /^Generate from intake/ }).click();
  await expect(page.locator(".canvas-node")).not.toHaveCount(0);
  await page.locator(".top-actions .primary-button").click(); // ownership
  await expect(page.getByRole("tab", { name: "Matrix", exact: true })).toHaveAttribute("aria-selected", "true");
  await page.locator(".top-actions .primary-button").click(); // gates
  await page.locator(".top-actions .primary-button").click(); // checks
  await expect(page.getByText("All deterministic HITM checks pass.", { exact: true })).toBeVisible();
  await page.locator(".top-actions .primary-button").click();
  await expect(page.locator(".prompt-card")).toHaveCount(7);
  await page.locator(".top-actions .primary-button").click();
  await expect(page.locator(".report-head h2")).toHaveText("Team review pilot");
  await page.getByRole("button", { name: "More", exact: true }).click();
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export backup (JSON)", exact: true }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe("hitm-blueprint-backup-team-review-pilot.json");
  const file = await download.path();
  const before = await current(page);
  await page.locator("input[type=file]").setInputFiles(file!);
  await expect.poll(() => current(page)).toEqual(before);
  await page.reload();
  await saved(page);
  expect((await current(page)).projectName).toBe("Team review pilot");
});

test("alternatives preserve current work, adopt explicitly, and restore", async ({ page }) => {
  const before = await current(page);
  await page.getByRole("tab", { name: "Alternatives", exact: true }).click();
  await page.getByRole("button", { name: "Privacy-first", exact: true }).click();
  await expect(page.locator(".alternative-card")).toHaveCount(1);
  expect((await current(page)).nodes).toEqual(before.nodes);
  await page.getByRole("button", { name: "Adopt as current", exact: true }).click();
  await expect(page.locator(".alternative-card")).toHaveCount(2);
  await expect(page.getByText("Previous current blueprint", { exact: true })).toBeVisible();
  expect((await current(page)).sensitivity).toBe("sensitive");
  await page.locator(".alternative-card").filter({ hasText: "Previous current blueprint" }).getByRole("button", { name: "Adopt as current", exact: true }).click();
  await expect.poll(async () => (await current(page)).nodes).toEqual(before.nodes);
  await page.reload();
  await saved(page);
  expect((await current(page)).alternatives).toHaveLength(3);
});

test("malformed import leaves project intact", async ({ page }) => {
  const before = await current(page);
  await page.locator("input[type=file]").setInputFiles({ name: "invalid.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ projectName: "Bad", nodes: [null] })) });
  await expect(page.getByText("Could not import that file", { exact: true })).toBeVisible();
  expect(await current(page)).toEqual(before);
});

test("German templates, long words, and inspector stay within the page", async ({ page }) => {
  await page.getByRole("button", { name: "DE", exact: true }).click();
  await page.getByRole("button", { name: "Vorlagen", exact: true }).click();
  await page.getByRole("button", { name: /Dokumentenprüfung/ }).click();
  await page.locator(".canvas-node").filter({ hasText: "KI-Zusammenfassungsentwurf" }).click();
  await page.getByLabel("Knotentitel", { exact: true }).fill("Freigabeverantwortlichkeitsüberprüfungsprozess".repeat(3));
  await page.getByLabel("Verantwortlich", { exact: true }).fill("Datenschutzverantwortlichkeitszuordnung".repeat(3));
  const overflow = await page.evaluate(() => {
    const cards = [...document.querySelectorAll(".canvas-node")];
    return { page: document.documentElement.scrollWidth > innerWidth, bad: cards.some((card) => card.scrollWidth > card.clientWidth || card.scrollHeight > card.clientHeight) };
  });
  expect(overflow).toEqual({ page: false, bad: false });
  await page.reload();
  await expect(page.getByRole("button", { name: "DE", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("keyboard resize and empty undo/redo remain usable", async ({ page, isMobile }) => {
  test.skip(isMobile, "Inspector stacks on mobile and does not use desktop resizing.");
  const separator = page.getByRole("separator");
  const before = Number(await separator.getAttribute("aria-valuenow"));
  await separator.focus();
  await separator.press("ArrowLeft");
  await expect(separator).toHaveAttribute("aria-valuenow", String(before + 24));
  await page.reload();
  await saved(page);
  await expect(separator).toHaveAttribute("aria-valuenow", String(before + 24));
  await expect(page.getByRole("button", { name: "Undo", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Redo", exact: true })).toBeDisabled();
});

test("production assets and help stay under the deployment path, with no runtime errors", async ({ page }) => {
  const errors: string[] = [];
  const badResponses: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (entry) => { if (entry.type() === "error") errors.push(entry.text()); });
  page.on("response", (response) => { if (response.status() >= 400) badResponses.push(response.url()); });
  await page.reload();
  await saved(page);
  await page.getByRole("button", { name: "More", exact: true }).click();
  await expect(page.getByRole("link", { name: "Manual & privacy", exact: true })).toHaveAttribute("href", "/blueprintstudio/help/#english");
  const assetPaths = await page.locator("script[src],link[rel=stylesheet],link[as=font]").evaluateAll((elements) => elements.map((el) => el.getAttribute("src") || el.getAttribute("href")));
  expect(assetPaths.length).toBeGreaterThan(0);
  expect(assetPaths.every((path) => path?.startsWith("/blueprintstudio/"))).toBe(true);
  await page.goto("help/");
  await expect(page.getByRole("heading", { name: "Manual / Handbuch", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
  expect(badResponses).toEqual([]);
});

test("storage failures are visible and corrupt drafts are preserved", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("hitm-blueprint-file-v6", "{invalid json");
  });
  await page.reload();
  await expect(page.getByText(/Could not load local draft/)).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("hitm-blueprint-file-v6"))).toBe("{invalid json");
});

test("failed storage writes never claim success", async ({ page }) => {
  await page.addInitScript(() => {
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "hitm-blueprint-file-v6") throw new DOMException("Storage quota reached", "QuotaExceededError");
      setItem.call(this, key, value);
    };
  });
  await page.reload();
  await expect(page.getByText("Local save failed. Export a JSON backup to keep your work.", { exact: true })).toBeVisible();
  await expect(page.getByText("Saved locally", { exact: true })).toHaveCount(0);
});

test("menu print opens the report before printing", async ({ page }) => {
  await page.addInitScript(() => {
    window.print = () => { document.documentElement.dataset.printedReport = String(!!document.querySelector(".report-document")); };
  });
  await page.reload();
  await saved(page);
  await page.getByRole("button", { name: "More", exact: true }).click();
  await page.getByRole("button", { name: "Print report", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-printed-report", "true");
  await expect(page.getByRole("tab", { name: "Report", exact: true })).toHaveAttribute("aria-selected", "true");
});

test("static distribution includes font and dependency notices", async ({ request }) => {
  for (const file of ["LICENSE", "fonts/OFL.txt", "THIRD_PARTY_NOTICES.md", "doc/dependency-licenses.md", "third-party/THIRD_PARTY_LICENSES.txt", "third-party/inventory.json"]) {
    const response = await request.get(file);
    expect(response.status()).toBe(200);
    expect((await response.body()).length).toBeGreaterThan(100);
  }
  const inventory = await (await request.get("third-party/inventory.json")).json();
  expect(inventory.lockfileSha256).toMatch(/^[a-f0-9]{64}$/);
  expect(inventory.packages.find((item: { name: string }) => item.name === "lucide-react").license).toBe("ISC");
  expect(inventory.packages.find((item: { name: string }) => item.name === "next").evidence.length).toBeGreaterThan(1);
  expect(JSON.stringify(inventory)).not.toMatch(/\/Users\/|node_modules\//);
});
