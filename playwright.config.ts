import { defineConfig, devices } from "@playwright/test";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/blueprintstudio";
const baseURL = process.env.BLUEPRINT_E2E_BASE_URL ?? `http://127.0.0.1:${process.env.BLUEPRINT_PREVIEW_PORT ?? "3031"}${basePath}/`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 2,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL, trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } },
  ],
  ...(process.env.BLUEPRINT_E2E_BASE_URL ? {} : {
    webServer: { command: "pnpm preview:release", url: baseURL, reuseExistingServer: false, timeout: 30_000 },
  }),
});
