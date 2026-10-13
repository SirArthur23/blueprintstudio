import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { collectLicenseInventory } from "../../scripts/audit-licenses.mjs";

describe("installed license evidence", () => {
  const inventory = collectLicenseInventory();
  it("inventories exact direct versions and distinct transitive name/version pairs", () => {
    const project = JSON.parse(readFileSync("package.json", "utf8"));
    for (const [name, version] of Object.entries(project.dependencies)) {
      const item = inventory.packages.find((row) => row.name === name && row.version === version);
      expect(item?.scopes).toContain("production");
      expect(item?.files.length).toBeGreaterThan(0);
    }
    expect(new Set(inventory.packages.map((item) => `${item.name}@${item.version}`)).size).toBe(inventory.packages.length);
    expect(inventory.packages.every((item) => item.license !== "UNKNOWN")).toBe(true);
  });
  it("retains Next compiled notices and README-supplied terms rather than inventing substitutes", () => {
    expect(inventory.packages.find((item) => item.name === "next")?.files.some((file) => file.startsWith("dist/compiled/"))).toBe(true);
    for (const name of ["esrecurse", "imurmurhash"]) expect(inventory.packages.find((item) => item.name === name)?.readmes.length).toBeGreaterThan(0);
    expect(inventory.packages.find((item) => item.name === "client-only")?.files).toEqual([]);
  });
  it("retains supplemental README terms even when a separate license exists", () => {
    const sharp = inventory.packages.find((item) => item.name === "sharp");
    expect(sharp?.files.length).toBeGreaterThan(0);
    expect(sharp?.readmes.length).toBeGreaterThan(0);
    for (const item of inventory.packages.filter((row) => row.name.startsWith("@img/sharp-") && row.license.includes(" AND "))) {
      expect(item.readmes.length).toBeGreaterThan(0);
    }
  });
});
