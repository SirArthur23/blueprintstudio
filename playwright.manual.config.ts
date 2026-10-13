import { defineConfig } from "@playwright/test";
import releaseConfig from "./playwright.config";

export default defineConfig({
  ...releaseConfig,
  testDir: "./tests/manual",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  projects: [{ name: "manual-chromium", use: { browserName: "chromium", viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 } }],
});
